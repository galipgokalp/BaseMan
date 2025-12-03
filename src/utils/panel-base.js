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

// Export all utilities as a namespace object
export const PanelBase = {
  abbreviateAddress,
  networkLabel,
  networkName,
  getEnv,
  createElement
};

// Attach to window for non-module scripts
if (typeof window !== 'undefined') {
  window.PanelBase = PanelBase;
}
