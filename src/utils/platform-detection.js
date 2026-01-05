/**
 * Centralized Platform Detection Utility
 * 
 * Uses OFFICIAL method per Base App documentation:
 * - Base App: context.client.clientFid === 309857
 * - Farcaster: context.client.clientFid !== 309857 (typically 9152 for Warpcast)
 * 
 * Reference:
 * - Base App Docs: https://docs.base.org/mini-apps (Base App Client Detection section)
 * - Farcaster Docs: https://miniapps.farcaster.xyz/docs/sdk/context
 */

import { createLogger } from './logger.js';
const log = createLogger('UtilPlatformDetect');

function hasBaseAppSignals() {
  if (typeof window === 'undefined') return false;
  // CRITICAL: Don't check ReactNativeWebView - it exists in both Farcaster and Base App mobile apps
  // Only check Base App-specific signals
  return Boolean(
    window.MiniKit ||
    window.BaseAppSDK ||
    window.MiniApp
    // Removed: window.ReactNativeWebView - not reliable (exists in both platforms)
  );
}

function hasFarcasterSignals() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.fc?.miniapp || window.farcaster?.miniapp);
}

// Platform detection cache
let cachedPlatform = null;
let platformDetectionPromise = null;

/**
 * Gets the current platform identifier using OFFICIAL method (clientFid)
 * This is the recommended method per Base App documentation
 * 
 * @returns {Promise<'farcaster' | 'base' | 'web'>}
 * 
 * Official method per Base App docs:
 * - Base App: context.client.clientFid === 309857
 * - Farcaster: context.client.clientFid !== 309857 (e.g., 9152 for Warpcast)
 */
export async function getPlatform() {
  // Return cached result if available
  if (cachedPlatform !== null) {
    return cachedPlatform;
  }

  // If detection is already in progress, wait for it
  if (platformDetectionPromise !== null) {
    return platformDetectionPromise;
  }

  // Start detection and cache the promise
  platformDetectionPromise = detectPlatformInternal();

  try {
    cachedPlatform = await platformDetectionPromise;
    return cachedPlatform;
  } finally {
    platformDetectionPromise = null;
  }
}

/**
 * Internal platform detection logic
 * @returns {Promise<'farcaster' | 'base' | 'web'>}
 */
async function detectPlatformInternal() {
  try {
    if (typeof window === 'undefined') return 'web';
    
    // Check if SDK context is available (sdk.context is a Promise, not object)
    if (window.sdk && window.sdk.context) {
      try {
        // CRITICAL: Add timeout for mobile environments where SDK may load slowly
        // Without timeout, this can hang indefinitely if SDK never resolves
        const context = await Promise.race([
          window.sdk.context,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Platform detection timeout (5s)')), 5000)
          )
        ]);
        
        // Debug: Log what we got
        const hasClient = !!(context && context.client);
        const clientFid = context?.client?.clientFid;
        // CRITICAL: Always log platform detection details for debugging
        log.info('🔍 Platform detection - SDK context:', { 
          hasClient, 
          clientFid,
          hasUser: !!(context && context.user),
          userFid: context?.user?.fid
        });
        
        if (context && context.client && typeof context.client.clientFid === 'number') {
          const fid = context.client.clientFid;
          
          // OFFICIAL METHOD: Base App clientFid is 309857 (per Base App docs)
          // CRITICAL: clientFid is the authoritative source - don't override with signal checks
          if (fid === 309857) {
            log.info('✅ Platform detected: base-app (clientFid=309857)');
            return 'base';
          }

          // If clientFid exists but is not 309857, it's Farcaster
          // Warpcast clientFid is 9152 (per Farcaster docs example)
          // CRITICAL: Don't check hasBaseAppSignals() here - ReactNativeWebView exists in both
          // Farcaster and Base App mobile apps, so it's not a reliable indicator
          log.info('✅ Platform detected: farcaster (clientFid=' + fid + ', expected 9152 for Warpcast)');
          return 'farcaster';
        }
        
        // Context exists but no clientFid - this is unusual but can happen
        // CRITICAL: Don't use hasBaseAppSignals() here - ReactNativeWebView exists in both platforms
        // Only trust Farcaster signals as they're more specific
        if (context && context.user && context.user.fid) {
          // We have a user with FID, so we're in a mini app
          // But clientFid is missing - this is unusual
          log.warn('⚠️ Platform detection: Context has user but no clientFid - this is unusual', { 
            hasUser: true,
            userFid: context.user.fid 
          });
          
          // Only use Farcaster signals - more reliable
          if (hasFarcasterSignals()) {
            log.info('✅ Platform detected: farcaster (hasFarcasterSignals, no clientFid)');
            return 'farcaster';
          }
          
          // Don't use hasBaseAppSignals() - unreliable (ReactNativeWebView in both)
          // If we have user context but no clientFid and no Farcaster signals, we can't determine platform
          log.warn('⚠️ Platform detection: No clientFid and no clear Farcaster signals - defaulting to web');
          return 'web';
        }
      } catch (err) {
        log.warnOnce('platform-detect-failed', { reason: err?.message || err });
        // If SDK context failed, don't use fallback signals - they're unreliable
        // ReactNativeWebView exists in both platforms, so hasBaseAppSignals() is not reliable
        // Only use fallback if we have clear Farcaster signals
        if (hasFarcasterSignals()) {
          log.info('✅ Platform detected: farcaster (fallback: hasFarcasterSignals, SDK context failed)');
          return 'farcaster';
        }
        // Don't use hasBaseAppSignals() as fallback - it's unreliable (ReactNativeWebView in both)
        log.warn('⚠️ Platform detection: SDK context failed and no clear Farcaster signals - defaulting to web');
        return 'web';
      }
    }
    
    // CRITICAL: Don't use hasBaseAppSignals() as fallback - ReactNativeWebView exists in both platforms
    // Only use Farcaster signals as fallback (more reliable)
    if (hasFarcasterSignals()) {
      log.info('✅ Platform detected: farcaster (fallback: hasFarcasterSignals, no SDK context)');
      return 'farcaster';
    }
    
    // If SDK context is not available and no clear signals, assume web
    log.warn('⚠️ Platform detection: No SDK context and no clear signals - defaulting to web');
    return 'web';
  } catch (err) {
    log.warnOnce('platform-detect-failed', { reason: err?.message || err });
    return 'web';
  }
}

/**
 * Detects if the app is running in a Base App environment
 * Uses OFFICIAL method: context.client.clientFid === 309857
 * 
 * @returns {Promise<boolean>}
 */
export async function isBaseApp() {
  const platform = await getPlatform();
  return platform === 'base';
}

/**
 * Detects if the app is running in a Farcaster Mini App environment
 * Uses OFFICIAL method: context.client.clientFid !== 309857
 * 
 * @returns {Promise<boolean>}
 */
export async function isFarcasterMiniApp() {
  const platform = await getPlatform();
  return platform === 'farcaster';
}

/**
 * Detects if the app is running in any Mini App host environment
 * 
 * @returns {Promise<boolean>}
 */
export async function isMiniAppHost() {
  const platform = await getPlatform();
  return platform === 'base' || platform === 'farcaster';
}

/**
 * Detects if the app is running in a Mini App environment (generic check)
 * 
 * @returns {Promise<boolean>}
 */
export async function isMiniAppEnv() {
  const platform = await getPlatform();
  return platform !== 'web';
}

// ============================================================================
// SYNCHRONOUS VERSIONS (use cached value, return false if not yet detected)
// These are safe to call in synchronous contexts like wagmi config
// ============================================================================

/**
 * Synchronously get cached platform (returns 'web' if not yet detected)
 * @returns {'farcaster' | 'base' | 'web'}
 */
export function getPlatformSync() {
  return cachedPlatform ?? 'web';
}

/**
 * Synchronously check if Base App (returns false if not yet detected)
 * @returns {boolean}
 */
export function isBaseAppSync() {
  return cachedPlatform === 'base';
}

/**
 * Synchronously check if Farcaster Mini App (returns false if not yet detected)
 * @returns {boolean}
 */
export function isFarcasterMiniAppSync() {
  return cachedPlatform === 'farcaster';
}

/**
 * Synchronously check if any Mini App host (returns false if not yet detected)
 * @returns {boolean}
 */
export function isMiniAppHostSync() {
  return cachedPlatform === 'base' || cachedPlatform === 'farcaster';
}

/**
 * Synchronously check if Mini App environment (returns false if not yet detected)
 * @returns {boolean}
 */
export function isMiniAppEnvSync() {
  return cachedPlatform !== null && cachedPlatform !== 'web';
}

/**
 * Check if platform detection has completed
 * @returns {boolean}
 */
export function isPlatformDetected() {
  return cachedPlatform !== null;
}

/**
 * Initialize platform detection early (call this at app startup)
 * Returns a promise that resolves when detection is complete
 * @returns {Promise<'farcaster' | 'base' | 'web'>}
 */
export async function initPlatformDetection() {
  return getPlatform();
}

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  // Async versions
  window.getPlatform = getPlatform;
  window.isBaseApp = isBaseApp;
  window.isFarcasterMiniApp = isFarcasterMiniApp;
  window.isMiniAppHost = isMiniAppHost;
  window.isMiniAppEnv = isMiniAppEnv;

  // Sync versions (use these in synchronous contexts)
  window.getPlatformSync = getPlatformSync;
  window.isBaseAppSync = isBaseAppSync;
  window.isFarcasterMiniAppSync = isFarcasterMiniAppSync;
  window.isMiniAppHostSync = isMiniAppHostSync;
  window.isMiniAppEnvSync = isMiniAppEnvSync;
  window.isPlatformDetected = isPlatformDetected;
  window.initPlatformDetection = initPlatformDetection;
}
