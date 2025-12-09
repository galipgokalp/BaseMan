/**
 * HTML Escape Utility
 * Safely escapes user/external data to prevent XSS attacks
 * 
 * Escapes: &, <, >, ", '
 */

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for use in HTML
 */
export function escapeHtml(text) {
  if (text == null) return '';
  if (typeof text !== 'string') {
    text = String(text);
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Escape HTML but preserve newlines (for textarea/pre elements)
 * @param {string} text - Text to escape
 * @returns {string} Escaped text with preserved newlines
 */
export function escapeHtmlPreserveNewlines(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

