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
  return Boolean(
    window.MiniKit ||
    window.BaseAppSDK ||
    window.MiniApp ||
    window.ReactNativeWebView
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
        const context = await window.sdk.context;
        
        // Debug: Log what we got
        const hasClient = !!(context && context.client);
        const clientFid = context?.client?.clientFid;
        log.debug('platform-context', { hasClient, clientFid });
        
        if (context && context.client && typeof context.client.clientFid === 'number') {
          const fid = context.client.clientFid;
          
          // OFFICIAL METHOD: Base App clientFid is 309857 (per Base App docs)
          if (fid === 309857) {
            log.debug('platform-detected', { platform: 'base', method: 'clientFid' });
            return 'base';
          }
          
          // Some Base App contexts may not expose the official clientFid value.
          // Prefer Base App signals when present to avoid mislabeling.
          if (hasBaseAppSignals()) {
            log.debug('platform-detected', { platform: 'base', method: 'base-app-signal', clientFid: fid });
            return 'base';
          }

          // If clientFid exists but is not 309857, it's Farcaster
          // Warpcast clientFid is 9152 (per Farcaster docs example)
          log.debug('platform-detected', { platform: 'farcaster', method: 'clientFid', clientFid: fid });
          return 'farcaster';
        }
        
        // Context exists but no clientFid - check other indicators
        if (context && context.user && context.user.fid) {
          // We have a user with FID, so we're in a mini app
          // Try to detect platform from other signals
          log.debug('platform-context-missing-clientFid', { hasUser: true });
          
          // Check if MiniKit is available (Base App indicator)
          if (hasBaseAppSignals()) {
            log.debug('platform-detected', { platform: 'base', method: 'minikit' });
            return 'base';
          }
          
          // Check for Farcaster indicators
          if (hasFarcasterSignals()) {
            log.debug('platform-detected', { platform: 'farcaster', method: 'sdk-indicator' });
            return 'farcaster';
          }
          
          // Unknown host; avoid mislabeling when clientFid is missing
          log.debug('platform-default', { reason: 'hasUserNoClientFid' });
          return 'web';
        }
      } catch (err) {
        log.warnOnce('platform-detect-failed', { reason: err?.message || err });
      }
    }
    
    // Additional fallback checks even if SDK not available
    if (hasBaseAppSignals()) {
      log.debug('platform-detected', { platform: 'base', method: 'minikit' });
      return 'base';
    }
    
    if (hasFarcasterSignals()) {
      log.debug('platform-detected', { platform: 'farcaster', method: 'sdk-indicator' });
      return 'farcaster';
    }
    
    // If SDK context is not available, assume web
    log.debug('platform-default', { reason: 'no-sdk' });
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
