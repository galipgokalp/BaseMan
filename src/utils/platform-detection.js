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
const log = createLogger('PlatformDetection');

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
  try {
    if (typeof window === 'undefined') return 'web';
    
    // Check if SDK context is available (sdk.context is a Promise, not object)
    if (window.sdk && window.sdk.context) {
      try {
        const context = await window.sdk.context;
        
        // Debug: Log what we got
        const hasClient = !!(context && context.client);
        const clientFid = context?.client?.clientFid;
        log.debug('Context received - hasClient:', hasClient, 'clientFid:', clientFid);
        
        if (context && context.client && typeof context.client.clientFid === 'number') {
          const fid = context.client.clientFid;
          
          // OFFICIAL METHOD: Base App clientFid is 309857 (per Base App docs)
          if (fid === 309857) {
            log.debug('Base App detected via clientFid (309857) - OFFICIAL METHOD');
            return 'base';
          }
          
          // If clientFid exists but is not 309857, it's Farcaster
          // Warpcast clientFid is 9152 (per Farcaster docs example)
          log.debug('Farcaster detected via clientFid (' + fid + ') - OFFICIAL METHOD');
          return 'farcaster';
        }
        
        // Context exists but no clientFid - check other indicators
        if (context && context.user && context.user.fid) {
          // We have a user with FID, so we're in a mini app
          // Try to detect platform from other signals
          log.debug('Context has user but no clientFid, checking other signals...');
          
          // Check if MiniKit is available (Base App indicator)
          if (window.MiniKit) {
            log.debug('MiniKit detected, assuming Base App');
            return 'base';
          }
          
          // Check for Farcaster indicators
          if (window.fc?.miniapp || window.farcaster?.miniapp) {
            log.debug('Farcaster SDK detected, assuming Farcaster');
            return 'farcaster';
          }
          
          // Default to farcaster if we have user FID but can't determine platform
          log.debug('Has user FID but unknown platform, defaulting to farcaster');
          return 'farcaster';
        }
      } catch (err) {
        log.warn('Failed to get SDK context:', err?.message || err);
      }
    }
    
    // Additional fallback checks even if SDK not available
    if (window.MiniKit) {
      log.debug('MiniKit detected (no SDK), assuming Base App');
      return 'base';
    }
    
    if (window.fc?.miniapp || window.farcaster?.miniapp) {
      log.debug('Farcaster SDK detected (no window.sdk), assuming Farcaster');
      return 'farcaster';
    }
    
    // If SDK context is not available, assume web
    log.debug('SDK context not available, assuming web');
    return 'web';
  } catch (err) {
    log.error('getPlatform() error:', err);
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

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  window.getPlatform = getPlatform;
  window.isBaseApp = isBaseApp;
  window.isFarcasterMiniApp = isFarcasterMiniApp;
  window.isMiniAppHost = isMiniAppHost;
  window.isMiniAppEnv = isMiniAppEnv;
}
