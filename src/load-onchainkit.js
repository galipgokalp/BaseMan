(() => {
  function isMiniAppEnv() {
    try {
      return Boolean(
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniApp ||
        (window.miniapp && (window.miniapp.default || window.miniapp.sdk))
      );
    } catch (_) {
      return false;
    }
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

