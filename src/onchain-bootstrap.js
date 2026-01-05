window.BaseManModuleLoaded = false;
window.__BaseManModuleFailureShown = false;

window.__showModuleFailure = function (message) {
  if (window.__BaseManModuleFailureShown) return;
  window.__BaseManModuleFailureShown = true;

  var warn = document.createElement("div");
  warn.style.position = "fixed";
  warn.style.left = "10px";
  warn.style.right = "10px";
  warn.style.bottom = "10px";
  warn.style.background = "rgba(0,0,0,0.85)";
  warn.style.color = "#FF5555";
  warn.style.padding = "12px";
  warn.style.font = "14px monospace";
  warn.style.zIndex = "99999";
  warn.style.whiteSpace = "pre-wrap";
  warn.textContent =
    "Mini app module failed to load. Please check your connection or contact support.\n" +
    (message || "");

  if (document.body) {
    document.body.appendChild(warn);
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        document.body.appendChild(warn);
      },
      { once: true }
    );
  }
};

window.addEventListener("load", function () {
  // Increased timeout for mobile environments where SDK may load slowly
  // SDK polling can take up to ~90 seconds in worst case (50 attempts with backoff)
  // But we show error earlier to give user feedback
  // Check at 3 seconds (quick feedback), then again at 10 seconds (final check)
  setTimeout(function () {
    if (!window.BaseManModuleLoaded) {
      // First check: Show warning but don't give up yet (SDK might still be loading)
      console.warn("On-chain module not loaded yet (3s check) - SDK may still be initializing...");
    }
  }, 3000);
  
  // Final check: Show error only if still not loaded after reasonable time
  setTimeout(function () {
    if (!window.BaseManModuleLoaded) {
      // Check if we're in a MiniApp environment - if not, this is expected
      const isMiniApp = typeof window !== 'undefined' && (
        (window !== window.parent) || 
        (typeof window.ReactNativeWebView !== 'undefined') ||
        (typeof window.isMiniAppEnvSync === 'function' && window.isMiniAppEnvSync()) ||
        (typeof window.isMiniAppHostSync === 'function' && window.isMiniAppHostSync())
      );
      
      if (isMiniApp) {
        // In MiniApp: Show error (SDK should have loaded by now)
        window.__showModuleFailure("On-chain module did not load. Please refresh the page.");
      } else {
        // In web browser: This is expected (no SDK), don't show error
        console.debug("On-chain module not loaded (web browser - expected)");
      }
    }
  }, 10000); // 10 seconds - reasonable time for SDK to load even on slow mobile connections
});
