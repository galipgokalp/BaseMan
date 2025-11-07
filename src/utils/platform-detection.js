/**
 * Centralized Platform Detection Utility
 * 
 * Provides unified platform detection functions for Farcaster and Base App.
 * All platform detection logic should use these functions to ensure consistency.
 */

/**
 * Detects if the app is running in a Farcaster Mini App environment
 * @returns {boolean}
 */
export function isFarcasterMiniApp() {
  try {
    if (typeof window === 'undefined') return false;
    
    // Primary indicators for Farcaster
    const hasFarcasterSDK = Boolean(
      (window.fc && window.fc.miniapp) ||
      (window.farcaster && window.farcaster.miniapp) ||
      window.MiniAppSDK ||
      window.FarcasterMiniAppSDK
    );
    
    if (hasFarcasterSDK) return true;
    
    // User agent check (secondary indicator)
    if (window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      if ((ua.includes('Farcaster') || ua.includes('Warpcast')) && 
          !ua.includes('BaseApp')) {
        return true;
      }
    }
    
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Detects if the app is running in a Base App environment
 * @returns {boolean}
 */
export function isBaseApp() {
  try {
    if (typeof window === 'undefined') return false;
    
    // Primary indicators for Base App
    if (window.ReactNativeWebView) {
      // Additional check: if it's ReactNativeWebView but also Farcaster, it's Farcaster
      if (isFarcasterMiniApp()) return false;
      return true;
    }
    
    // MiniKit is Base App specific
    if (window.MiniKit) {
      return true;
    }
    
    // User agent check for BaseApp
    if (window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      if (ua.includes('BaseApp') && 
          !ua.includes('Farcaster') && 
          !ua.includes('Warpcast')) {
        return true;
      }
    }
    
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Detects if the app is running in any Mini App host environment
 * @returns {boolean}
 */
export function isMiniAppHost() {
  return isFarcasterMiniApp() || isBaseApp();
}

/**
 * Gets the current platform identifier
 * @returns {'farcaster' | 'base' | 'web'}
 */
export function getPlatform() {
  if (isFarcasterMiniApp()) return 'farcaster';
  if (isBaseApp()) return 'base';
  return 'web';
}

/**
 * Detects if the app is running in a Mini App environment (generic check)
 * This is a more lenient check that includes SDK presence
 * @returns {boolean}
 */
export function isMiniAppEnv() {
  try {
    if (typeof window === 'undefined') return false;
    
    // Check for Mini App host first
    if (isMiniAppHost()) return true;
    
    // Check for SDK presence (more lenient)
    const hasSDK = Boolean(
      (window.fc && window.fc.miniapp) ||
      (window.farcaster && window.farcaster.miniapp) ||
      window.MiniAppSDK ||
      window.MiniKit ||
      (window.MiniApp && window.MiniApp.sdk) ||
      window.FarcasterMiniAppSDK ||
      window.sdk
    );
    
    if (hasSDK) return true;
    
    // Check for ReactNative WebView (Base App indicator)
    if (window.ReactNativeWebView) return true;
    
    // Check for iframe context (common in mobile webviews)
    try {
      if (window.self !== window.top) {
        return true;
      }
    } catch (_) {
      // If we can't access top, we might be in a cross-origin iframe
      return true;
    }
    
    return false;
  } catch (_) {
    return false;
  }
}

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  window.isFarcasterMiniApp = isFarcasterMiniApp;
  window.isBaseApp = isBaseApp;
  window.isMiniAppHost = isMiniAppHost;
  window.getPlatform = getPlatform;
  window.isMiniAppEnv = isMiniAppEnv;
}

