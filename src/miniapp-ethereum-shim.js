(() => {
  // Expose the Farcaster/Base Mini App EIP-1193 provider as window.ethereum
  // so third-party wallet UIs can detect an injected provider when needed.

  const MAX_TRIES = 200; // ~20s at 100ms
  const DELAY = 100;
  let tries = 0;

  function getMiniAppProvider() {
    try {
      const sdk =
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        (window.MiniKit && (window.MiniKit.sdk || window.MiniKit)) ||
        (window.miniapp && (window.miniapp.default || window.miniapp.sdk)) ||
        window.MiniAppSDK ||
        window.MiniApp?.sdk ||
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
