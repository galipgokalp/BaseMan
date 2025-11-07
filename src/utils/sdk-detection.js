/**
 * Unified SDK Detection Utility
 * 
 * Provides platform-aware SDK detection with consistent priority ordering.
 * Ensures correct SDK selection for both Farcaster and Base App platforms.
 */

import { isFarcasterMiniApp, isBaseApp } from './platform-detection.js';

/**
 * Resolves the appropriate SDK based on platform detection
 * @returns {Object|null} SDK object or null if not found
 */
export function resolveSDK() {
  try {
    if (typeof window === 'undefined') return null;
    
    // Platform-aware SDK detection with priority ordering
    const candidates = [];
    
    // Priority 1: Platform-specific SDKs (most reliable)
    if (isFarcasterMiniApp()) {
      // Farcaster SDK priority for Farcaster platform
      candidates.push(
        () => window.fc && window.fc.miniapp,
        () => window.farcaster && window.farcaster.miniapp,
        () => window.fc && window.fc.sdk,
        () => window.farcaster && window.farcaster.sdk,
        () => window.MiniAppSDK,
        () => window.FarcasterMiniAppSDK
      );
    } else if (isBaseApp()) {
      // Base App SDK priority for Base App platform
      candidates.push(
        () => window.MiniKit && (window.MiniKit.sdk || window.MiniKit),
        () => window.MiniApp && window.MiniApp.sdk
      );
    }
    
    // Priority 2: Generic SDK namespaces (fallback)
    candidates.push(
      () => window.sdk,
      () => window.miniapp && (window.miniapp.default || window.miniapp.sdk || window.miniapp),
      () => window.MiniAppSDK,
      () => window.FarcasterMiniAppSDK,
      () => window.MiniKit && (window.MiniKit.sdk || window.MiniKit),
      () => window.MiniApp && window.MiniApp.sdk
    );
    
    // Priority 3: GlobalThis namespaces (for module bundlers)
    candidates.push(
      () => window.globalThis && window.globalThis.MiniAppSDK && window.globalThis.MiniAppSDK.default,
      () => window.globalThis && window.globalThis.miniapp && (window.globalThis.miniapp.default || window.globalThis.miniapp.sdk)
    );
    
    // Priority 4: Dynamic import detection (for ESM modules)
    candidates.push(
      () => {
        try {
          if (window.__FARCASTER_SDK__) return window.__FARCASTER_SDK__;
        } catch (_) {}
        return null;
      }
    );
    
    // Try each candidate in order
    for (const getter of candidates) {
      try {
        const value = getter();
        // Verify it's actually an SDK object with required methods
        if (value && typeof value === 'object') {
          // Check for critical SDK methods
          if ((value.actions && typeof value.actions.ready === 'function') ||
              (value.wallet && typeof value.wallet.getEthereumProvider === 'function')) {
            return value;
          }
        }
      } catch (_) {
        // Continue to next candidate
      }
    }
    
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Gets SDK with platform-aware priority (for backward compatibility)
 * @returns {Object|null} SDK object or null if not found
 */
export function getSDK() {
  return resolveSDK();
}

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  window.resolveSDK = resolveSDK;
  window.getSDK = getSDK;
}

