// Lightweight Quick Auth integration for Farcaster Mini Apps
// - Detects Mini App environment
// - Waits for SDK readiness if available
// - Retrieves a short‑lived Quick Auth token and forwards it to backend for verification

(function () {
  // Use centralized platform detection if available
  function isMiniAppEnv() {
    try {
      // Use centralized detection if available
      if (typeof window !== 'undefined' && typeof window.isMiniAppHost === 'function') {
        return window.isMiniAppHost();
      }
      // Fallback for when utility is not yet loaded
      return (
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniApp ||
        (window.miniapp && (window.miniapp.default || window.miniapp.sdk)) ||
        window.MiniKit ||
        window.ReactNativeWebView
      );
    } catch (_) { return false; }
  }

  // Use unified SDK detection if available
  function getSDK() {
    try {
      // Use centralized SDK detection if available
      if (typeof window !== 'undefined' && typeof window.getSDK === 'function') {
        const sdk = window.getSDK();
        if (sdk) return sdk;
      }
      
      // Fallback: platform-aware detection
      const isFarcaster = typeof window !== 'undefined' && 
        typeof window.isFarcasterMiniApp === 'function' && 
        window.isFarcasterMiniApp();
      const isBase = typeof window !== 'undefined' && 
        typeof window.isBaseApp === 'function' && 
        window.isBaseApp();
      
      const candidates = [];
      
      // Platform-specific priority
      if (isFarcaster) {
        candidates.push(
          () => window.fc && window.fc.miniapp,
          () => window.farcaster && window.farcaster.miniapp,
          () => window.MiniAppSDK,
          () => window.FarcasterMiniAppSDK
        );
      } else if (isBase) {
        candidates.push(
          () => window.MiniKit && (window.MiniKit.sdk || window.MiniKit),
          () => window.MiniApp && window.MiniApp.sdk
        );
      }
      
      // Generic fallback
      candidates.push(
        () => window.MiniKit && (window.MiniKit.sdk || window.MiniKit),
        () => window.miniapp && (window.miniapp.default || window.miniapp.sdk || window.miniapp),
        () => window.MiniAppSDK,
        () => window.FarcasterMiniAppSDK,
        () => window.MiniApp && window.MiniApp.sdk
      );
      
      for (const f of candidates) {
        const v = f();
        if (v) return v;
      }
    } catch (_) {}
    return null;
  }

  async function waitReady(sdk, ms = 6000) {
    const ready = sdk && sdk.actions && typeof sdk.actions.ready === 'function';
    if (!ready) return;
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('miniapp sdk.ready timeout')), ms));
    await Promise.race([sdk.actions.ready(), timeout]).catch(() => {});
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
        if ('result' in result && result.result !== null && result.result !== undefined) {
          // If result.result is a string, return it; otherwise try to extract token from it
          if (typeof result.result === 'string') return result.result;
          if (typeof result.result === 'object' && result.result.token) return result.result.token;
        }
        if ('value' in result && result.value) return result.value;
      }
      return null;
    } catch (err) { 
      console.warn('[miniapp-auth] getToken failed:', err?.message || err);
      return null; 
    }
  }

  async function sendToken(token) {
    try {
      const res = await fetch('/api/miniapp-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const txt = await res.text();
      let json = null; try { json = JSON.parse(txt); } catch {}
      window.__MINIAPP_AUTH__ = { status: res.status, response: json || txt };
    } catch (e) {
      window.__MINIAPP_AUTH__ = { error: String(e?.message || e) };
    }
  }

  async function main() {
    if (!isMiniAppEnv()) return;
    const token = await getQuickAuthToken();
    if (!token || typeof token !== 'string' || token.length < 8) return;
    try { window.__MINIAPP_AUTH_TOKEN__ = token; } catch (_) {}
    await sendToken(token);
  }

  try { main(); } catch (_) {}
})();
