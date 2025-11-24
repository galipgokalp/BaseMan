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
    
    // Check if SDK context is available
    if (window.sdk && typeof window.sdk.context === 'object') {
      try {
        const context = await window.sdk.context;
        if (context && context.client && typeof context.client.clientFid === 'number') {
          const clientFid = context.client.clientFid;
          
          // OFFICIAL METHOD: Base App clientFid is 309857 (per Base App docs)
          if (clientFid === 309857) {
            console.log('[platform-detection] Base App detected via clientFid (309857) - OFFICIAL METHOD');
            return 'base';
          }
          
          // If clientFid exists but is not 309857, it's Farcaster
          // Warpcast clientFid is 9152 (per Farcaster docs example)
          console.log('[platform-detection] Farcaster detected via clientFid (' + clientFid + ') - OFFICIAL METHOD');
          return 'farcaster';
        }
      } catch (err) {
        console.warn('[platform-detection] Failed to get SDK context:', err?.message || err);
      }
    }
    
    // If SDK context is not available, assume web
    console.log('[platform-detection] SDK context not available, assuming web');
    return 'web';
  } catch (err) {
    console.error('[platform-detection] getPlatform() error:', err);
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
