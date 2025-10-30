(() => {
  function isEnabled() {
    try {
      const qs = new URLSearchParams(window.location.search);
      return qs.has('auto');
    } catch (_) { return false; }
  }
  if (!isEnabled()) return;

  function run() {
    try {
      // Provide a fake score if game isn't started
      if (typeof window.getScore !== 'function') {
        window.getScore = () => 1234;
      }
      if (window.BaseManOnchain && typeof window.BaseManOnchain.handleRunStart === 'function') {
        window.BaseManOnchain.handleRunStart();
      }
      setTimeout(() => {
        try {
          if (window.BaseManOnchain && typeof window.BaseManOnchain.submitScore === 'function') {
            window.BaseManOnchain.submitScore();
          }
        } catch (_) {}
      }, 800);
    } catch (_) {}
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    run();
  } else {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  }
})();

