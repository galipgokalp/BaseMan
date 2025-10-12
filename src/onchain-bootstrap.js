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
    "Mini app modülü yüklenemedi. Lütfen bağlantınızı kontrol edin veya destekle iletişime geçin.\n" +
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
  setTimeout(function () {
    if (!window.BaseManModuleLoaded) {
      window.__showModuleFailure("On-chain modülü yüklenmedi.");
    }
  }, 1500);
});

