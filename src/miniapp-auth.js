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
      // Priority 1: Use centralized platform detection utility (sync-only)
      if (typeof window !== 'undefined') {
        if (typeof window.isMiniAppHostSync === 'function') {
          return window.isMiniAppHostSync();
        }
        if (typeof window.isMiniAppEnvSync === 'function') {
          return window.isMiniAppEnvSync();
        }
        if (typeof window.isMiniAppHost === 'function') {
          const detected = window.isMiniAppHost();
          if (typeof detected === 'boolean') return detected;
        }
        if (typeof window.isMiniAppEnv === 'function') {
          const detected = window.isMiniAppEnv();
          if (typeof detected === 'boolean') return detected;
        }
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
    } catch { 
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
    } catch {
      return null;
    }
  }

  async function waitReady(sdk, ms = 6000) {
    const ready = sdk && sdk.actions && typeof sdk.actions.ready === 'function';
    if (!ready) return;
    
    // First verify we're in a MiniApp context before calling SDK methods
    let inMiniApp = false;
    if (typeof sdk.isInMiniApp === 'function') {
      try {
        inMiniApp = await sdk.isInMiniApp(1000);
      } catch {
        inMiniApp = false;
      }
    } else {
      // Fallback: check for iframe or webview
      inMiniApp = (typeof window !== 'undefined' && window !== window.parent) || 
                  (typeof window.ReactNativeWebView !== 'undefined');
    }
    
    if (!inMiniApp) {
      log.debug('Not in MiniApp context, skipping sdk.actions.ready()');
      return;
    }
    
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

  const ADD_PROMPT_KEY = 'baseMan:addMiniAppPromptedAt';
  const ADD_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

  async function maybePromptAddMiniApp() {
    const sdk = getSDK();
    if (!sdk?.actions) return;

    const addMiniApp = sdk.actions.addMiniApp;
    if (typeof addMiniApp !== 'function' && !(addMiniApp && typeof addMiniApp.then === 'function')) {
      return;
    }

    try {
      const lastPrompt = Number(localStorage.getItem(ADD_PROMPT_KEY) || 0);
      if (lastPrompt && (Date.now() - lastPrompt) < ADD_PROMPT_COOLDOWN_MS) {
        return;
      }
    } catch (_) {}

    await waitReady(sdk).catch(() => {});

    let alreadyAdded = false;
    try {
      if (sdk.context) {
        const context = await Promise.race([
          sdk.context,
          new Promise((_, reject) => setTimeout(() => reject(new Error('context timeout')), 1500))
        ]);
        alreadyAdded = Boolean(
          context?.client?.added ??
          context?.added ??
          context?.miniapp?.added
        );
      }
    } catch (_) {}

    if (alreadyAdded) {
      return;
    }

    try {
      localStorage.setItem(ADD_PROMPT_KEY, String(Date.now()));
    } catch (_) {}

    try {
      if (typeof addMiniApp === 'function') {
        await addMiniApp();
      } else {
        await addMiniApp;
      }
    } catch (err) {
      log.debug('addMiniApp failed (non-critical):', err?.message || err);
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
      if (token && typeof token === 'string' && token.length >= 8) {
        try { window.__MINIAPP_AUTH_TOKEN__ = token; } catch {}
        await sendToken(token);
      }
      await maybePromptAddMiniApp();
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
  } catch {}
})();
