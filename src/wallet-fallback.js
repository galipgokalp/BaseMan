(() => {
  const btn = document.getElementById('wallet-fallback-btn');
  if (!btn) return;

  function isMiniAppEnv() {
    try {
      if (window.sdk && window.sdk.wallet && typeof window.sdk.wallet.getEthereumProvider === 'function') return true;
      if ((window.fc && window.fc.miniapp) || (window.farcaster && window.farcaster.miniapp)) return true;
      if (window.ReactNativeWebView) return true;
      if (window.MiniKit || window.MiniAppSDK || (window.MiniApp && window.MiniApp.sdk) || (window.miniapp && (window.miniapp.default || window.miniapp.sdk))) return true;
    } catch (_) {}
    return false;
  }

  let connected = false;
  let lastError = null;

  function setVisible(v) {
    btn.style.display = v ? 'inline-block' : 'none';
  }

  function setLabel(text) {
    btn.textContent = text;
  }

  function abbreviate(addr) {
    if (typeof addr !== 'string') return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function updateFromStatus(detail) {
    if (!detail || typeof detail !== 'object') return;
    const { ready, address, error } = detail;
    connected = Boolean(ready && address);
    lastError = error || null;
    if (connected) {
      setLabel(`Connected: ${abbreviate(address)}`);
      setVisible(false);
    } else {
      setLabel('Connect Wallet');
      setVisible(true);
    }
  }

  btn.addEventListener('click', async () => {
    setLabel('Connecting…');
    try {
      if (window.BaseManOnchain && typeof window.BaseManOnchain.ensureWallet === 'function') {
        await window.BaseManOnchain.ensureWallet();
      } else if (window.sdk && window.sdk.actions && typeof window.sdk.actions.signIn === 'function') {
        await window.sdk.actions.signIn({ acceptAuthAddress: true });
      } else {
        setLabel('Connect Wallet');
      }
    } catch (err) {
      setLabel('Connect Wallet');
      try {
        const msg = err?.message || String(err);
        if (window.BaseManOnchain && typeof window.BaseManOnchain.log === 'function') {
          window.BaseManOnchain.log(`fallback connect error: ${msg}`);
        } else {
          console.error('[fallback-wallet]', msg);
        }
      } catch (_) {}
    }
  });

  window.addEventListener('baseman-wallet-status', (evt) => {
    try {
      updateFromStatus(evt?.detail || {});
    } catch (_) {}
  });

  try {
    if (isMiniAppEnv()) {
      // Never show fallback button inside mini‑app containers; host wallet will be used.
      setVisible(false);
      return;
    }
    // In web fallback, only show if a browser wallet is injected
    const hasInjected = Boolean(window.ethereum && typeof window.ethereum.request === 'function');
    if (!hasInjected) {
      setVisible(false);
      return;
    }
    if (window.BaseManOnchain) {
      const ready = typeof window.BaseManOnchain.isWalletReady === 'function' && window.BaseManOnchain.isWalletReady();
      const err = typeof window.BaseManOnchain.getWalletError === 'function' && window.BaseManOnchain.getWalletError();
      updateFromStatus({ ready, error: err, address: null });
    } else {
      setVisible(true);
    }
  } catch (_) {
    setVisible(false);
  }
})();
