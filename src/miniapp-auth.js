// Lightweight Quick Auth integration for Farcaster Mini Apps
// - Detects Mini App environment
// - Waits for SDK readiness if available
// - Retrieves a short‑lived Quick Auth token and forwards it to backend for verification

(function () {
  function isMiniAppEnv() {
    try {
      return (
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniApp ||
        (window.miniapp && (window.miniapp.default || window.miniapp.sdk))
      );
    } catch (_) { return false; }
  }

  function getSDK() {
    try {
      const candidates = [
        () => window.MiniKit && (window.MiniKit.sdk || window.MiniKit),
        () => window.miniapp && (window.miniapp.default || window.miniapp.sdk || window.miniapp),
        () => window.MiniAppSDK,
        () => window.FarcasterMiniAppSDK,
        () => window.MiniApp && window.MiniApp.sdk,
      ];
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
      // Handle different response formats
      if (typeof result === 'string') return result;
      if (result && typeof result === 'object') {
        return result.token || result.result || result.value || null;
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
