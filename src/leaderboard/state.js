/**
 * Leaderboard State Module
 * Manages loading state, polling, visibility, and entries
 */

let loading = false;
let timerId = null;
let allEntries = [];
let visible = (() => {
  try {
    const v = window.__ENV && String(window.__ENV.NEXT_PUBLIC_SHOW_LEADERBOARD || '').toLowerCase();
    if (v === '0' || v === 'false') return false;
    return true;
  } catch (_) {
    return true;
  }
})();

/**
 * Get current loading state
 */
export function getLoading() {
  return loading;
}

/**
 * Set loading state
 */
export function setLoading(value) {
  loading = Boolean(value);
}

/**
 * Get all entries (for search)
 */
export function getAllEntries() {
  return allEntries;
}

/**
 * Set all entries
 */
export function setAllEntries(entries) {
  allEntries = Array.isArray(entries) ? entries : [];
}

/**
 * Get visibility state
 */
export function getVisible() {
  return visible;
}

/**
 * Start polling for leaderboard updates
 * @param {Function} loadFn - Function to call on each poll
 */
export function startPolling(loadFn) {
  stopPolling();
  if (!visible) return;
  
  timerId = window.setInterval(() => {
    if (visible && document.visibilityState === 'visible') {
      requestAnimationFrame(() => {
        if (loadFn) loadFn();
      });
    }
  }, 15000);
}

/**
 * Stop polling
 */
export function stopPolling() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

/**
 * Set visibility state
 * @param {boolean} value - New visibility state
 * @param {Object} options - Options
 * @param {boolean} options.reload - Whether to reload data (default: true)
 * @param {boolean} options.force - Force update even if state unchanged
 * @param {Function} options.onChange - Callback when visibility changes
 * @param {Function} options.onShow - Callback when showing
 */
export function setVisible(value, options = {}) {
  const shouldShow = Boolean(value);
  const reload = options.reload !== undefined ? options.reload : true;
  
  // Check if state actually changed
  if (visible === shouldShow && !options.force) {
    return;
  }
  
  visible = shouldShow;
  
  if (options.onChange) {
    options.onChange(visible);
  }
  
  if (!visible) {
    stopPolling();
  } else {
    startPolling(options.onShow);
    if (reload && options.onShow) {
      requestAnimationFrame(() => {
        options.onShow();
      });
    }
  }
}

