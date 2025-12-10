// Lightweight Quick Auth integration for Farcaster Mini Apps
// - Detects Mini App environment
// - Waits for SDK readiness if available
// - Retrieves a short‑lived Quick Auth token and forwards it to backend for verification

import { createLogger } from './utils/logger.js';
const log = createLogger('UtilMiniappAuth');

(function () {
  // Use centralized platform detection utility (100% compliance with Unified Wallet Integration Model)
  function isMiniAppEnv() {
    try {
      // Priority 1: Use centralized platform detection utility
      if (typeof window !== 'undefined' && typeof window.isMiniAppHost === 'function') {
        return window.isMiniAppHost();
      }
      
      // Priority 2: Emergency fallback (should never reach here in normal operation)
      // This fallback is kept for safety but should not be needed
      // Utility loads early in index.html as type="module" script
      if (typeof window !== 'undefined') {
        // Minimal fallback - try most common indicators
        return Boolean(
          (window.fc && window.fc.miniapp) ||
          (window.farcaster && window.farcaster.miniapp) ||
          window.MiniKit ||
          window.ReactNativeWebView
        );
      }
      return false;
    } catch (_) { 
      return false; 
    }
  }

  // Use unified SDK detection utility (100% compliance with Unified Wallet Integration Model)
  function getSDK() {
    try {
      // Priority 1: Use centralized SDK detection utility
      if (typeof window !== 'undefined' && typeof window.resolveSDK === 'function') {
        const sdk = window.resolveSDK();
        if (sdk) return sdk;
      }
      
      // Also try getSDK for backward compatibility
      if (typeof window !== 'undefined' && typeof window.getSDK === 'function') {
        const sdk = window.getSDK();
        if (sdk) return sdk;
      }
      
      // Priority 2: Emergency fallback (should never reach here in normal operation)
      // This fallback is kept for safety but should not be needed
      // Utility loads early in index.html as type="module" script
      // Minimal fallback - try most common SDK locations
      return (
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        (window.MiniKit && (window.MiniKit.sdk || window.MiniKit)) ||
        window.MiniAppSDK ||
        window.sdk ||
        null
      );
    } catch (_) {
      return null;
    }
  }

  async function waitReady(sdk, ms = 6000) {
    const ready = sdk && sdk.actions && typeof sdk.actions.ready === 'function';
    if (!ready) return;
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('miniapp sdk.ready timeout')), ms));
    try {
      await Promise.race([sdk.actions.ready(), timeout]);
    } catch (error) {
      // Handle SDK ready errors gracefully
      const errorMsg = error?.message || String(error);
      const isRequestError = errorMsg.includes('Request failed') || 
                            error?.name === 'RequestFailedError' ||
                            error?.status === 400 ||
                            errorMsg.includes('timeout');
      
      if (isRequestError) {
        // Log but don't throw - ready() failures are often non-critical
        log.debug(`SDK ready failed (non-critical): ${errorMsg}`);
      }
      // Silently catch other errors - ready() is best-effort
    }
  }

  async function getQuickAuthToken() {
    const sdk = getSDK();
    if (!sdk) return null;
    await waitReady(sdk).catch(() => {});
    const getToken = sdk?.quickAuth && (sdk.quickAuth.getToken || sdk.quickAuth.token);
    if (typeof getToken !== 'function') return null;
    try { 
      const result = await getToken();
      // Handle different response formats safely
      if (typeof result === 'string') return result;
      if (result && typeof result === 'object') {
        // Safely access nested properties - check existence before accessing
        if ('token' in result && result.token) return result.token;
        // Safely check result.result - ensure result exists and has result property
        if (result && 'result' in result && result.result !== null && result.result !== undefined) {
          // If result.result is a string, return it; otherwise try to extract token from it
          if (typeof result.result === 'string') return result.result;
          // Safely access result.result.token - ensure result.result is an object
          if (result.result && typeof result.result === 'object' && result.result.token) {
            return result.result.token;
          }
        }
        if ('value' in result && result.value) return result.value;
      }
      return null;
    } catch (err) { 
      // Prevent unhandled promise rejection by catching and logging
      log.error('miniapp-auth-failed', { step: 'getToken', reason: err?.message || err });
      return null; 
    }
  }

  async function sendToken(token) {
    // Phase 6: Use safeFetchJson for robust error handling
    try {
      const { safeFetchJson } = await import('./lib/safe-fetch.js');
      const result = await safeFetchJson('/api/miniapp-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }, {
        context: 'auth',
        timeoutMs: 5000
      });
      
      if (result.ok) {
        window.__MINIAPP_AUTH__ = { status: 200, response: result.data };
      } else {
        window.__MINIAPP_AUTH__ = { 
          status: result.error.meta?.status || 500, 
          error: result.error.message 
        };
      }
    } catch (e) {
      log.error('miniapp-auth-failed', { step: 'sendToken', reason: e?.message || e });
      window.__MINIAPP_AUTH__ = { error: String(e?.message || e) };
    }
  }

  async function main() {
    try {
      if (!isMiniAppEnv()) return;
      const token = await getQuickAuthToken();
      if (!token || typeof token !== 'string' || token.length < 8) return;
      try { window.__MINIAPP_AUTH_TOKEN__ = token; } catch (_) {}
      await sendToken(token);
    } catch (err) {
      // Prevent unhandled promise rejection
      log.error('miniapp-auth-failed', { step: 'main', reason: err?.message || err });
    }
  }

  // Wrap in try-catch and handle promise rejection
  try { 
    main().catch(err => {
      log.error('miniapp-auth-failed', { step: 'main:promise', reason: err?.message || err });
    });
  } catch (_) {}
})();
