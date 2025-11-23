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
    
    // Primary indicators for Farcaster SDK
    const hasFarcasterSDK = Boolean(
      (window.fc && window.fc.miniapp) ||
      (window.farcaster && window.farcaster.miniapp) ||
      window.MiniAppSDK ||
      window.FarcasterMiniAppSDK
    );
    
    if (hasFarcasterSDK) {
      console.log('[platform-detection] Farcaster SDK detected:', {
        hasFc: !!window.fc?.miniapp,
        hasFarcaster: !!window.farcaster?.miniapp,
        hasMiniAppSDK: !!window.MiniAppSDK,
        hasFarcasterMiniAppSDK: !!window.FarcasterMiniAppSDK
      });
      return true;
    }
    
    // Check for window.sdk (Farcaster SDK might be exposed as window.sdk)
    if (window.sdk) {
      // Check if it's a Farcaster SDK by looking for Farcaster-specific methods
      const sdk = window.sdk;
      const hasFarcasterMethods = Boolean(
        (typeof sdk === 'object' && (
          sdk.context ||
          sdk.user ||
          (sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function')
        ))
      );
      
      // If it has Farcaster methods but NOT MiniKit, it's likely Farcaster
      if (hasFarcasterMethods && !window.MiniKit) {
        console.log('[platform-detection] Farcaster SDK detected via window.sdk (no MiniKit)');
        return true;
      }
    }
    
    // User agent check (secondary indicator) - PRIORITY: Check this BEFORE ReactNativeWebView
    if (window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      if ((ua.includes('Farcaster') || ua.includes('Warpcast')) && 
          !ua.includes('BaseApp')) {
        console.log('[platform-detection] Farcaster detected via User Agent:', ua);
        return true;
      }
    }
    
    return false;
  } catch (err) {
    console.error('[platform-detection] isFarcasterMiniApp error:', err);
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
    
    // CRITICAL: Check Farcaster FIRST - if it's Farcaster, it's NOT Base App
    // This must be done BEFORE checking ReactNativeWebView or MiniKit
    // because Farcaster Mini Apps might also use ReactNativeWebView
    if (isFarcasterMiniApp()) {
      console.log('[platform-detection] Farcaster detected, skipping Base App check');
      return false;
    }
    
    // MiniKit is Base App specific (and NOT Farcaster)
    if (window.MiniKit) {
      console.log('[platform-detection] Base App detected via MiniKit');
      return true;
    }
    
    // ReactNativeWebView can be used by both, but we already checked Farcaster above
    if (window.ReactNativeWebView) {
      // Additional safety check: if User Agent says BaseApp, it's Base App
      if (window.navigator && window.navigator.userAgent) {
        const ua = window.navigator.userAgent;
        if (ua.includes('BaseApp') && 
            !ua.includes('Farcaster') && 
            !ua.includes('Warpcast')) {
          console.log('[platform-detection] Base App detected via ReactNativeWebView + BaseApp User Agent');
          return true;
        }
      }
      // If ReactNativeWebView exists but no Farcaster indicators and no BaseApp in UA,
      // be conservative and don't assume it's Base App
      console.log('[platform-detection] ReactNativeWebView found but no clear Base App indicators');
      return false;
    }
    
    // User agent check for BaseApp (as primary indicator, not secondary)
    if (window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      if (ua.includes('BaseApp') && 
          !ua.includes('Farcaster') && 
          !ua.includes('Warpcast')) {
        console.log('[platform-detection] Base App detected via User Agent:', ua);
        return true;
      }
    }
    
    return false;
  } catch (err) {
    console.error('[platform-detection] isBaseApp error:', err);
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
  // Check Farcaster FIRST (priority)
  const isFarcaster = isFarcasterMiniApp();
  if (isFarcaster) {
    console.log('[platform-detection] getPlatform() -> farcaster');
    return 'farcaster';
  }
  
  // Then check Base App
  const isBase = isBaseApp();
  if (isBase) {
    console.log('[platform-detection] getPlatform() -> base');
    return 'base';
  }
  
  console.log('[platform-detection] getPlatform() -> web');
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

