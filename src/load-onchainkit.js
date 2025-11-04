(() => {
  function isMiniAppEnv() {
    try {
      // Strong signal: SDK with wallet provider available
      if (window.sdk && window.sdk.wallet && typeof window.sdk.wallet.getEthereumProvider === 'function') {
        return true;
      }
      // Farcaster/Warpcast namespaces
      if ((window.fc && window.fc.miniapp) || (window.farcaster && window.farcaster.miniapp)) return true;
      // React Native webview (Base App and similar)
      if (window.ReactNativeWebView) return true;
      // Other known namespaces
      if (window.MiniKit || window.MiniAppSDK || (window.MiniApp && window.MiniApp.sdk) || (window.miniapp && (window.miniapp.default || window.miniapp.sdk))) return true;
    } catch (_) {}
    return false;
  }

  function loadScript(src) {
    const s = document.createElement('script');
    s.defer = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function main() {
    if (isMiniAppEnv()) {
      return; // do not load OnchainKit in miniapp containers
    }
    loadScript('vendor/onchainkit/onchainkit.bundle.js');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main, { once: true });
  } else {
    main();
  }
})();
