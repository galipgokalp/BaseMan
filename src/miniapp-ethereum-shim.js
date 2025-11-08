(() => {
  // Expose the Farcaster/Base Mini App EIP-1193 provider as window.ethereum
  // so third-party wallet UIs can detect an injected provider when needed.

  // Increase tries for mobile environments
  const MAX_TRIES = 300; // ~30s at 100ms (increased for mobile)
  const DELAY = 100;
  let tries = 0;

  // Use unified SDK detection utility (100% compliance with Unified Wallet Integration Model)
  function getMiniAppProvider() {
    try {
      // Priority 1: Use centralized SDK detection utility
      let sdk = null;
      if (typeof window !== 'undefined' && typeof window.resolveSDK === 'function') {
        sdk = window.resolveSDK();
        if (sdk && sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function') {
          return sdk.wallet.getEthereumProvider();
        }
      }
      
      // Priority 2: Emergency fallback (should never reach here in normal operation)
      // This fallback is kept for safety but should not be needed
      // Utility loads early in index.html as type="module" script
      // Minimal fallback - try most common SDK locations
      sdk =
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        (window.MiniKit && (window.MiniKit.sdk || window.MiniKit)) ||
        window.MiniAppSDK ||
        window.sdk ||
        null;
      
      if (!sdk || !sdk.wallet || typeof sdk.wallet.getEthereumProvider !== 'function') return null;
      return sdk.wallet.getEthereumProvider();
    } catch (_) {
      return null;
    }
  }

  async function ensureEthereum() {
    if (window.ethereum) return; // do not override existing providers

    const provider = await getMiniAppProvider();
    if (provider) {
      try {
        // Some providers are Promise-like; await if needed
        const resolved = typeof provider.then === 'function' ? await provider : provider;
        if (resolved && !window.ethereum) {
          window.ethereum = resolved; // expose for libraries expecting injected provider
        }
        return;
      } catch (_) {
        // continue polling
      }
    }

    tries += 1;
    if (tries < MAX_TRIES) {
      setTimeout(ensureEthereum, DELAY);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureEthereum, { once: true });
  } else {
    ensureEthereum();
  }
})();
