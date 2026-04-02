/**
 * Panel Base Utility Module
 * Shared utilities for panel components
 */

/**
 * Abbreviate Ethereum address
 * @param {string} addr - Address to abbreviate
 * @returns {string} Abbreviated address (e.g., "0x1234…5678")
 */
export function abbreviateAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Get network label for chain ID
 * @param {number|string} chainId - Chain ID
 * @returns {string} Network label
 */
export function networkLabel(chainId) {
  return Number(chainId) === 8453 ? 'Base' : (Number(chainId) === 84532 ? 'Base Sepolia' : `Chain ${chainId}`);
}

/**
 * Get network name for chain ID
 * @param {number|string} chainId - Chain ID
 * @returns {string} Network name
 */
export function networkName(chainId) {
  return Number(chainId) === 8453 ? 'Base Mainnet' : (Number(chainId) === 84532 ? 'Base Sepolia' : `Chain ${chainId}`);
}

/**
 * Get environment variables
 * @returns {Object} Environment object
 */
export function getEnv() {
  return (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV : {};
}

/**
 * Create DOM element helper
 * @param {string} tag - HTML tag name
 * @param {string} className - CSS class name (optional)
 * @param {string} text - Text content (optional)
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

/**
 * Find focusable elements within a container
 * @param {HTMLElement} root
 * @returns {HTMLElement[]} focusable elements
 */
export function getFocusableElements(root) {
  if (!root) return [];
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');
  return Array.from(root.querySelectorAll(selector)).filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Focus the first meaningful interactive element inside a container
 * Falls back to the container itself if nothing focusable exists.
 * @param {HTMLElement} root
 * @param {Object} options
 * @param {HTMLElement|null} options.fallback - optional fallback element
 */
export function focusFirstFocusable(root, { fallback = null } = {}) {
  if (!root) return;
  const focusables = getFocusableElements(root);
  const target = focusables[0] || fallback || root;
  // Defer to ensure element is visible and rendered
  requestAnimationFrame(() => {
    try {
      target.focus({ preventScroll: true });
    } catch (_) {
      try { target.focus(); } catch (_) {}
    }
  });
}

/**
 * Set panel visibility
 * @param {HTMLElement} panel - Panel element
 * @param {boolean} visible - Whether panel should be visible
 */
export function setPanelVisible(panel, visible) {
  if (!panel) return;
  panel.classList.toggle('open', visible);
  panel.setAttribute('aria-hidden', String(!visible));
}

/**
 * Create a shared panel lifecycle controller.
 * Standardizes open/close state, Escape handling, focus restore, and trigger tracking.
 *
 * @param {Object} options
 * @param {Function} options.getPanel - returns panel element
 * @param {Function} options.getIsOpen - returns current visibility state
 * @param {Function} options.applyVisibility - applies visibility/state changes
 * @param {Function|null} options.onAfterOpen - optional hook after opening
 * @param {Function|null} options.onAfterClose - optional hook after closing
 * @param {HTMLElement|Function|null} options.focusFallback - optional fallback focus target
 * @returns {Object} lifecycle controller
 */
export function createPanelLifecycle({
  getPanel,
  getIsOpen,
  applyVisibility,
  onAfterOpen = null,
  onAfterClose = null,
  focusFallback = null
}) {
  let triggerEl = null;
  let keydownHandler = null;

  const attachEscHandler = () => {
    if (keydownHandler) return;
    keydownHandler = (e) => {
      if (!getIsOpen()) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        lifecycle.hide();
      }
    };
    document.addEventListener('keydown', keydownHandler);
  };

  const detachEscHandler = () => {
    if (!keydownHandler) return;
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  };

  const lifecycle = {
    setVisible(visible, context = {}) {
      const panel = getPanel();
      if (!panel) return false;

      const nextVisible = Boolean(visible);
      const currentVisible = Boolean(getIsOpen());
      if (currentVisible === nextVisible && !context.force) {
        return false;
      }

      applyVisibility(nextVisible, panel, context);

      if (nextVisible) {
        const fallbackTarget = typeof focusFallback === 'function'
          ? focusFallback(panel)
          : (focusFallback || panel);
        requestAnimationFrame(() => focusFirstFocusable(panel, { fallback: fallbackTarget || panel }));
        attachEscHandler();
        if (typeof onAfterOpen === 'function') {
          onAfterOpen(panel, context);
        }
      } else {
        detachEscHandler();
        if (triggerEl && typeof triggerEl.focus === 'function') {
          requestAnimationFrame(() => triggerEl.focus());
        }
        if (typeof onAfterClose === 'function') {
          onAfterClose(panel, context);
        }
      }

      return true;
    },
    show(context = {}) {
      return lifecycle.setVisible(true, context);
    },
    hide(context = {}) {
      return lifecycle.setVisible(false, context);
    },
    toggle(context = {}) {
      return lifecycle.setVisible(!getIsOpen(), context);
    },
    setTriggerElement(el) {
      if (el instanceof HTMLElement) {
        triggerEl = el;
      }
    },
    isOpen() {
      return Boolean(getIsOpen());
    }
  };

  return lifecycle;
}

/**
 * Wire close button for a panel
 * @param {HTMLElement} panel - Panel element
 * @param {Function} onClose - Callback when close button is clicked
 * @param {WeakSet} wiredElements - WeakSet to track wired elements (optional)
 * @returns {boolean} True if button was wired, false if not found or already wired
 */
export function wirePanelCloseButton(panel, onClose, wiredElements = null) {
  if (!panel) return false;
  
  const closeBtn = panel.querySelector('[data-close]');
  if (!closeBtn) return false;
  
  // Check if already wired (if WeakSet provided)
  if (wiredElements && wiredElements.has(closeBtn)) {
    return false;
  }
  
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose();
    } else {
      setPanelVisible(panel, false);
    }
    // Also update bottom nav state
    if (window.BottomNav) {
      window.BottomNav.setActive(null);
    }
  };
  
  closeBtn.addEventListener('click', handleClose, { passive: false });
  // Touch event for mobile
  closeBtn.addEventListener('touchend', handleClose, { passive: false });
  
  if (wiredElements) {
    wiredElements.add(closeBtn);
  }
  
  return true;
}

/**
 * Wire overlay click to close panel
 * @param {HTMLElement} panel - Panel element
 * @param {Function} onClose - Callback when overlay is clicked (optional)
 * @param {WeakSet} wiredElements - WeakSet to track wired elements (optional)
 * @returns {boolean} True if overlay was wired
 */
export function wirePanelOverlay(panel, onClose, wiredElements = null) {
  if (!panel) return false;
  
  // Check if already wired (if WeakSet provided)
  if (wiredElements && wiredElements.has(panel)) {
    return false;
  }
  
  panel.addEventListener('click', (e) => {
    if (e.target === panel) {
      if (onClose) {
        onClose();
      } else {
        setPanelVisible(panel, false);
      }
    }
  }, { passive: true });
  
  if (wiredElements) {
    wiredElements.add(panel);
  }
  
  return true;
}

// Export all utilities as a namespace object
export const PanelBase = {
  abbreviateAddress,
  networkLabel,
  networkName,
  getEnv,
  createElement,
  createPanelLifecycle,
  setPanelVisible,
  wirePanelCloseButton,
  wirePanelOverlay,
  getFocusableElements,
  focusFirstFocusable
};

// Attach to window for non-module scripts
if (typeof window !== 'undefined') {
  window.PanelBase = PanelBase;
}
