/**
 * Connect Menu Suppressor
 * 
 * Prevents Connect UI from appearing in mini-app environments (Farcaster, Base App).
 * This ensures the Bottom Navigation Bar and Wallet panel work correctly.
 * 
 * Dependencies:
 * - platform-detection.js (should load before this script)
 * 
 * Usage:
 * - Load this script after platform-detection.js
 * - Script will automatically suppress connect menu in mini-app environments
 */

(function() {
  'use strict';

  /**
   * Check if we're in a mini-app environment
   * Uses platform-detection if available, otherwise falls back to basic checks
   */
  // Use centralized platform detection utility (100% compliance with Unified Wallet Integration Model)
  function isMiniAppEnvironment() {
    try {
      // Priority 1: Use centralized platform detection utility
      if (typeof window !== 'undefined' && typeof window.isMiniAppEnv === 'function') {
        return window.isMiniAppEnv();
      }
      
      // Priority 2: Emergency fallback (should never reach here in normal operation)
      // This fallback is kept for safety but should not be needed
      // Utility loads early in index.html as type="module" script
      if (typeof window !== 'undefined') {
        // Minimal fallback - try most common indicators
        return Boolean(
          window.farcaster ||
          (window.fc && window.fc.miniapp) ||
          window.MiniKit ||
          window.ReactNativeWebView
        );
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /**
   * Initialize connect menu suppression
   */
  function initConnectMenuSuppression() {
    // Only suppress in mini-app environments
    // In web environments, connect menu might be desired
    const shouldSuppress = isMiniAppEnvironment();
    
    if (!shouldSuppress) {
      // In web environment, don't suppress (allow connect menu)
      // But you can change this to always suppress if needed
      return;
    }

    // Log suppression (only in development)
    if (typeof window !== 'undefined' && window.logger) {
      window.logger.log('[ConnectMenuSuppressor] Suppressing connect menu in mini-app environment');
    } else {
      console.log('[BaseMan] Connect UI disabled - wallet functionality via Wallet panel');
    }
    
    // Add CSS to hide any connect menu elements that might appear
    const style = document.createElement('style');
    style.id = 'hide-connect-menu-force';
    style.textContent = `
      #connect-root,
      [id*="connect"],
      [id*="Connect"],
      [class*="connect"],
      [class*="Connect"],
      [class*="connect"][class*="root"],
      div[style*="Wallet config unavailable"],
      div[style*="You're connected"],
      div[style*="Connect"],
      button[style*="Connect"],
      button:contains("Connect"),
      button:contains("Connecting") {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        z-index: -9999 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Periodic cleanup
    let cleanupCount = 0;
    const cleanupInterval = setInterval(function() {
      const connectRoot = document.getElementById('connect-root');
      if (connectRoot) {
        connectRoot.remove();
      }
      
      // Remove any divs or buttons with connect-related content
      // BUT exclude wallet panel and its contents
      const allElements = document.querySelectorAll('div, button, span, a');
      allElements.forEach(function(el) {
        // Skip if element is inside wallet panel
        if (el.closest && el.closest('#baseman-wallet-panel')) {
          return;
        }
        // Skip if element is wallet panel itself
        if (el.id === 'baseman-wallet-panel') {
          return;
        }
        
        const text = (el.textContent || '').toLowerCase();
        const id = (el.id || '').toLowerCase();
        // Safely get className (handle cases where className might not be a string)
        const className = (el && el.className && typeof el.className === 'string') 
          ? el.className.toLowerCase() 
          : (el && el.className && typeof el.className.toString === 'function')
            ? el.className.toString().toLowerCase()
            : '';
        
        // More specific checks - don't match "Connection" in wallet panel
        if (id.includes('connect') && !id.includes('wallet') || 
            (className.includes('connect') && !className.includes('wallet')) ||
            text.includes('wallet config unavailable') || 
            (text.includes("you're connected") && !text.includes('wallet')) ||
            (text === 'connect' || text === 'connecting' || text.startsWith('connect '))) {
          el.remove();
        }
      });
      
      cleanupCount++;
      if (cleanupCount > 40) { // 20 seconds
        clearInterval(cleanupInterval);
      }
    }, 500);
    
    // MutationObserver to catch any dynamically added elements
    // BUT exclude wallet panel and its contents
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              // Skip if element is inside wallet panel
              if (node.closest && node.closest('#baseman-wallet-panel')) {
                return;
              }
              // Skip if element is wallet panel itself
              if (node.id === 'baseman-wallet-panel') {
                return;
              }
              
              const id = (node.id || '').toLowerCase();
              // Safely get className (handle cases where className might not be a string)
              const className = (node && node.className && typeof node.className === 'string') 
                ? node.className.toLowerCase() 
                : (node && node.className && typeof node.className.toString === 'function')
                  ? node.className.toString().toLowerCase()
                  : '';
              const text = (node.textContent || '').toLowerCase();
              
              // More specific checks - don't match "Connection" in wallet panel
              if ((id.includes('connect') && !id.includes('wallet')) || 
                  (className.includes('connect') && !className.includes('wallet')) ||
                  text.includes('wallet config unavailable') ||
                  (text.includes("you're connected") && !text.includes('wallet')) ||
                  (text === 'connect' || text === 'connecting' || text.startsWith('connect '))) {
                node.remove();
              }
            }
          });
        });
      });
      
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        // Wait for body to be available
        document.addEventListener('DOMContentLoaded', function() {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        });
      }
    }
  }

  // Initialize when DOM is ready
  // Use a flag to prevent double initialization
  let initialized = false;
  
  function tryInit() {
    if (initialized) return;
    
    // Wait a bit for platform-detection to be available (it's a module)
    // Platform detection modules are loaded before this script (defer)
    // But we need to wait a bit for the module to expose window.isMiniAppEnv
    if (document.head && (window.isMiniAppEnv || document.readyState !== 'loading')) {
      initialized = true;
      initConnectMenuSuppression();
    }
  }
  
  // Try immediately if head is available
  if (document.head) {
    // Wait a small delay for platform-detection module to initialize
    setTimeout(tryInit, 10);
  }
  
  // Also try on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(tryInit, 10);
    }, { once: true });
  } else {
    // DOM already ready, try after a short delay
    setTimeout(tryInit, 10);
  }
  
  // Fallback: try after a longer delay (in case module loading is slow)
  setTimeout(tryInit, 100);
})();

