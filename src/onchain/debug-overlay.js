export function createDebugOverlay() {
  try {
    const enabledByEnv =
      (window.__ENV && String(window.__ENV.NEXT_PUBLIC_DEBUG_OVERLAY) === '1') ||
      new URLSearchParams(window.location.search).has('debug');
    if (!enabledByEnv) {
      return function() {};
    }
  } catch (_) {
    return function() {};
  }

  const containerId = 'baseman-debug';
  const existing = document.getElementById(containerId);
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = containerId;
  container.style.position = 'fixed';
  container.style.left = '8px';
  container.style.right = '8px';
  container.style.bottom = '8px';
  container.style.maxHeight = '45vh';
  container.style.overflowY = 'auto';
  container.style.background = 'rgba(0, 0, 0, 0.75)';
  container.style.color = '#0f0';
  container.style.font = '12px monospace';
  container.style.padding = '6px';
  container.style.zIndex = '9999';
  container.style.pointerEvents = 'none';
  container.style.whiteSpace = 'pre-wrap';
  container.style.display = 'none';

  const buffer = [];
  const flush = () => {
    if (container.parentElement || !document.body) return;
    document.body.appendChild(container);
    if (buffer.length) {
      container.textContent = `${buffer.join('\n')}\n`;
      container.style.display = 'block';
      buffer.length = 0;
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    flush();
  } else {
    document.addEventListener('DOMContentLoaded', flush, { once: true });
  }

  return (message) => {
    const entry = `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${message}`;
    if (container.parentElement && document.body) {
      container.style.display = 'block';
      container.textContent += `${entry}\n`;
    } else {
      buffer.push(entry);
      flush();
    }
  };
}
