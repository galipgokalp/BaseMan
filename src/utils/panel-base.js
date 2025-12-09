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
  setPanelVisible,
  wirePanelCloseButton,
  wirePanelOverlay
};

// Attach to window for non-module scripts
if (typeof window !== 'undefined') {
  window.PanelBase = PanelBase;
}
