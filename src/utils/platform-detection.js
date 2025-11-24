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
    
    // CRITICAL: Check Base App indicators FIRST - if it's Base App, it's NOT Farcaster
    // Base App uses MiniKit (Base App specific)
    if (window.MiniKit) {
      console.log('[platform-detection] MiniKit detected - this is Base App, not Farcaster');
      return false;
    }
    
    // Base App can be detected via clientFid in context
    // Base App clientFid is 309857 (as per Base App docs)
    if (window.sdk && typeof window.sdk.context === 'object') {
      try {
        // Check if context has clientFid (async, but we can check the promise)
        const context = window.sdk.context;
        if (context && typeof context.then === 'function') {
          // It's a promise, we'll check it asynchronously in getPlatform
          // But for now, if MiniKit exists, it's Base App
        } else if (context && context.client && context.client.clientFid === 309857) {
          console.log('[platform-detection] Base App detected via clientFid (309857)');
          return false;
        }
      } catch (_) {
        // Ignore errors
      }
    }
    
    // User agent check for BaseApp (must check BEFORE Farcaster)
    if (window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      if (ua.includes('BaseApp') && 
          !ua.includes('Farcaster') && 
          !ua.includes('Warpcast')) {
        console.log('[platform-detection] Base App detected via User Agent - not Farcaster');
        return false;
      }
    }
    
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
    // BUT: Base App also uses window.sdk, so we must check Base App indicators FIRST
    if (window.sdk) {
      // CRITICAL: If ReactNativeWebView exists but no Farcaster SDK indicators,
      // it's likely Base App, not Farcaster
      if (window.ReactNativeWebView) {
        const hasFarcasterSDK = Boolean(
          (window.fc && window.fc.miniapp) ||
          (window.farcaster && window.farcaster.miniapp) ||
          window.MiniAppSDK ||
          window.FarcasterMiniAppSDK
        );
        if (!hasFarcasterSDK) {
          // ReactNativeWebView + no Farcaster SDK = Base App
          console.log('[platform-detection] ReactNativeWebView + no Farcaster SDK = Base App, not Farcaster');
          return false;
        }
      }
      
      // Check if it's a Farcaster SDK by looking for Farcaster-specific methods
      const sdk = window.sdk;
      const hasFarcasterMethods = Boolean(
        (typeof sdk === 'object' && (
          sdk.context ||
          sdk.user ||
          (sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function')
        ))
      );
      
      // If it has Farcaster methods but NOT MiniKit (already checked above) and NOT ReactNativeWebView without Farcaster SDK, it's likely Farcaster
      if (hasFarcasterMethods) {
        console.log('[platform-detection] Farcaster SDK detected via window.sdk (no MiniKit/BaseApp indicators)');
        return true;
      }
    }
    
    // User agent check (secondary indicator) - PRIORITY: Check this AFTER BaseApp check
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
    
    // PRIMARY: MiniKit is Base App specific (and NOT Farcaster)
    if (window.MiniKit) {
      console.log('[platform-detection] Base App detected via MiniKit');
      return true;
    }
    
    // SECONDARY: User agent check for BaseApp (CRITICAL - most reliable indicator)
    // Base App User Agent typically contains "BaseApp" or similar
    if (window.navigator && window.navigator.userAgent) {
      const ua = window.navigator.userAgent;
      // Check for Base App specific User Agent strings
      if ((ua.includes('BaseApp') || ua.includes('Base/') || ua.toLowerCase().includes('base app')) && 
          !ua.includes('Farcaster') && 
          !ua.includes('Warpcast')) {
        console.log('[platform-detection] Base App detected via User Agent:', ua.substring(0, 100));
        return true;
      }
    }
    
    // TERTIARY: ReactNativeWebView + User Agent combination
    // Base App uses ReactNativeWebView, but so does Farcaster
    // So we need User Agent confirmation
    if (window.ReactNativeWebView) {
      if (window.navigator && window.navigator.userAgent) {
        const ua = window.navigator.userAgent;
        // If User Agent indicates BaseApp, it's Base App
        if ((ua.includes('BaseApp') || ua.includes('Base/') || ua.toLowerCase().includes('base app')) && 
            !ua.includes('Farcaster') && 
            !ua.includes('Warpcast')) {
          console.log('[platform-detection] Base App detected via ReactNativeWebView + BaseApp User Agent');
          return true;
        }
        // If ReactNativeWebView exists but User Agent doesn't clearly indicate BaseApp,
        // and we don't have Farcaster SDK indicators, it might be Base App
        // But be conservative - only if we're sure it's not Farcaster
        const hasFarcasterSDK = Boolean(
          (window.fc && window.fc.miniapp) ||
          (window.farcaster && window.farcaster.miniapp) ||
          window.MiniAppSDK ||
          window.FarcasterMiniAppSDK
        );
        if (!hasFarcasterSDK) {
          // No Farcaster SDK, has ReactNativeWebView - likely Base App
          console.log('[platform-detection] Base App detected via ReactNativeWebView (no Farcaster SDK)');
          return true;
        }
      }
      // If ReactNativeWebView exists but no clear indicators,
      // be conservative and don't assume it's Base App
      console.log('[platform-detection] ReactNativeWebView found but no clear Base App indicators');
      return false;
    }
    
    // QUATERNARY: Check clientFid in SDK context (Base App clientFid is 309857)
    // Note: This is async, so we can only check if context is already resolved
    if (window.sdk && typeof window.sdk.context === 'object') {
      try {
        const context = window.sdk.context;
        // If context is a promise, we can't check it synchronously
        // But if it's already resolved, check it
        if (context && typeof context.then !== 'function') {
          if (context.client && context.client.clientFid === 309857) {
            console.log('[platform-detection] Base App detected via clientFid (309857)');
            return true;
          }
        }
      } catch (_) {
        // Ignore errors
      }
    }
    
    // CRITICAL: Check Farcaster LAST - if it's Farcaster, it's NOT Base App
    // This must be done AFTER checking Base App specific indicators
    // because Farcaster Mini Apps might also use ReactNativeWebView
    if (isFarcasterMiniApp()) {
      console.log('[platform-detection] Farcaster detected, not Base App');
      return false;
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
 * Gets the current platform identifier (synchronous)
 * Uses fallback methods when clientFid is not available
 * @returns {'farcaster' | 'base' | 'web'}
 */
export function getPlatform() {
  // CRITICAL: Check Base App FIRST (priority)
  // Because Base App also uses window.sdk, we must check Base App before Farcaster
  const isBase = isBaseApp();
  if (isBase) {
    console.log('[platform-detection] getPlatform() -> base');
    return 'base';
  }
  
  // Then check Farcaster
  const isFarcaster = isFarcasterMiniApp();
  if (isFarcaster) {
    console.log('[platform-detection] getPlatform() -> farcaster');
    return 'farcaster';
  }
  
  console.log('[platform-detection] getPlatform() -> web');
  return 'web';
}

/**
 * Gets the current platform identifier using clientFid (async, official method)
 * This is the recommended method per Base App documentation
 * @returns {Promise<'farcaster' | 'base' | 'web'>}
 */
export async function getPlatformAsync() {
  try {
    if (typeof window === 'undefined') return 'web';
    
    // Check if SDK context is available
    if (window.sdk && typeof window.sdk.context === 'object') {
      try {
        const context = await window.sdk.context;
        if (context && context.client && typeof context.client.clientFid === 'number') {
          const clientFid = context.client.clientFid;
          
          // Base App clientFid is 309857 (per Base App docs)
          if (clientFid === 309857) {
            console.log('[platform-detection] getPlatformAsync() -> base (via clientFid 309857)');
            return 'base';
          }
          
          // Warpcast clientFid is 9152 (per Farcaster docs)
          // Other Farcaster clients may have different clientFids
          // If it's not Base App (309857), assume it's Farcaster
          if (clientFid === 9152 || clientFid !== 309857) {
            console.log('[platform-detection] getPlatformAsync() -> farcaster (via clientFid ' + clientFid + ')');
            return 'farcaster';
          }
        }
      } catch (err) {
        console.warn('[platform-detection] getPlatformAsync() failed to get context:', err?.message || err);
      }
    }
    
    // Fallback to synchronous detection if async fails
    return getPlatform();
  } catch (err) {
    console.error('[platform-detection] getPlatformAsync() error:', err);
    return getPlatform(); // Fallback to sync method
  }
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
  window.getPlatformAsync = getPlatformAsync;
  window.isMiniAppEnv = isMiniAppEnv;
}

