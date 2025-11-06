/**
 * Bottom Navigation Bar Handler
 * Manages navigation between PAC-BOARD, Profile, Wallet, and Settings
 */

(function() {
  'use strict';

  const BOTTOM_NAV = {
    LEADERBOARD: 'leaderboard',
    PROFILE: 'profile',
    WALLET: 'wallet',
    SETTINGS: 'settings'
  };

  let currentActive = null;
  let currentOpenPanel = null;

  function init() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) {
      initStarted = false;
      return;
    }

    const items = nav.querySelectorAll('.nav-item');
    if (items.length === 0) {
      initStarted = false;
      return;
    }

    items.forEach((item) => {
      const navType = item.getAttribute('data-nav');
      if (!navType) {
        return;
      }

      // Check if already has listener (avoid duplicates)
      if (item.hasAttribute('data-listener-attached')) {
        return;
      }
      
      item.setAttribute('data-listener-attached', 'true');
      
      // Use both click and touchstart for faster response on mobile
      const handleClick = (e) => {
        if (item.disabled) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Immediate visual feedback
        item.style.opacity = '0.7';
        setTimeout(() => { item.style.opacity = ''; }, 100);
        // Handle click immediately
        handleNavClick(navType, item);
      };
      
      // Add click listener (primary) - use capture phase for faster response
      item.addEventListener('click', handleClick, { passive: false, capture: true });
      // Add touchstart for mobile (faster than click) - use capture phase
      item.addEventListener('touchstart', handleClick, { passive: false, capture: true });
    });

    // Set initial active state based on URL hash or default
    const hash = window.location.hash.substring(1);
    if (hash === 'leaderboard' || hash === 'pac') {
      setActive(BOTTOM_NAV.LEADERBOARD);
    }
  }

  function closeAllPanels() {
    // Close leaderboard
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.hide === 'function') {
      window.BaseManLeaderboard.hide();
    }
    
    // Close profile
    if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.hide === 'function') {
      window.ProfilePanel.hide();
    } else {
      const profilePanel = document.getElementById('baseman-profile-panel');
      if (profilePanel) {
        profilePanel.classList.remove('open');
        profilePanel.setAttribute('aria-hidden', 'true');
      }
    }
    
    // Close wallet
    if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.hide === 'function') {
      window.WalletPanel.hide();
    }
    
    // Close settings
    if (typeof window.SettingsPanel !== 'undefined' && typeof window.SettingsPanel.hide === 'function') {
      window.SettingsPanel.hide();
    }
    
    currentOpenPanel = null;
  }

  // Debounce to prevent rapid clicks
  let lastClickTime = 0;
  const CLICK_DEBOUNCE_MS = 100; // Minimum time between clicks

  function handleNavClick(navType, element) {
    // Debounce rapid clicks
    const now = Date.now();
    if (now - lastClickTime < CLICK_DEBOUNCE_MS) {
      return;
    }
    lastClickTime = now;
    
    // If clicking the same button, toggle (close panel)
    if (currentOpenPanel === navType) {
      closeAllPanels();
      setActive(null);
      return;
    }
    
    // Close all panels first (synchronous, fast)
    closeAllPanels();
    
    // Open the selected panel immediately (synchronous)
    switch(navType) {
      case BOTTOM_NAV.LEADERBOARD:
        openLeaderboard();
        setActive(BOTTOM_NAV.LEADERBOARD);
        currentOpenPanel = BOTTOM_NAV.LEADERBOARD;
        break;
      
      case BOTTOM_NAV.PROFILE:
        openProfile();
        setActive(BOTTOM_NAV.PROFILE);
        currentOpenPanel = BOTTOM_NAV.PROFILE;
        break;
      
      case BOTTOM_NAV.WALLET:
        openWallet();
        setActive(BOTTOM_NAV.WALLET);
        currentOpenPanel = BOTTOM_NAV.WALLET;
        break;
      
      case BOTTOM_NAV.SETTINGS:
        openSettings();
        setActive(BOTTOM_NAV.SETTINGS);
        currentOpenPanel = BOTTOM_NAV.SETTINGS;
        break;
    }
  }

  function setActive(navType) {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    // Remove active class from all items
    const items = nav.querySelectorAll('.nav-item');
    items.forEach(item => item.classList.remove('active'));

    // Add active class to selected item
    const targetItem = nav.querySelector(`[data-nav="${navType}"]`);
    if (targetItem) {
      targetItem.classList.add('active');
      currentActive = navType;
    }
  }

  function openLeaderboard() {
    // Immediate panel opening - no async delays
    const panel = document.getElementById('leaderboard-panel');
    if (!panel) {
      return;
    }

    // Show panel immediately (synchronous)
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.show === 'function') {
      window.BaseManLeaderboard.show();
    } else {
      // Fallback: ensure panel is visible immediately
      panel.hidden = false;
      panel.style.display = 'block';
    }
    
    // Refresh data in background (async, non-blocking)
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.refresh === 'function') {
      // Use requestAnimationFrame for next frame to avoid blocking UI
      requestAnimationFrame(() => {
        window.BaseManLeaderboard.refresh();
      });
    }
  }

  function openProfile() {
    // Immediate panel opening
    if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.show === 'function') {
      window.ProfilePanel.show();
      // Refresh in background (non-blocking)
      requestAnimationFrame(() => {
        if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.refresh === 'function') {
          window.ProfilePanel.refresh();
        }
      });
      return;
    }

    // Fallback: Directly toggle panel immediately
    const panel = document.getElementById('baseman-profile-panel');
    if (panel) {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      panel.style.display = 'block';

      // Trigger wallet connection and refresh in background (non-blocking)
      requestAnimationFrame(() => {
        (async () => {
          try {
            if (window.BaseManOnchain && typeof window.BaseManOnchain.ensureWallet === 'function') {
              await window.BaseManOnchain.ensureWallet();
            } else if (window.sdk && window.sdk.actions && typeof window.sdk.actions.signIn === 'function') {
              await window.sdk.actions.signIn({ acceptAuthAddress: true });
            }
          } catch (err) {}

          // Refresh panel if refresh function exists
          if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.refresh === 'function') {
            window.ProfilePanel.refresh();
          }
        })();
      });
    }
  }

  function openWallet() {
    // Immediate panel opening
    if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.show === 'function') {
      window.WalletPanel.show();
      // Refresh in background
      requestAnimationFrame(() => {
        if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.refresh === 'function') {
          window.WalletPanel.refresh();
        }
      });
      return;
    }

    // Fallback: Try to find connect menu immediately
    let connectRoot = document.getElementById('connect-root');
    
    if (connectRoot) {
      handleConnectMenu(connectRoot);
      dispatchWalletEvent();
    } else {
      // Try to find connect menu quickly (reduced attempts)
      let attempts = 0;
      const maxAttempts = 5; // Reduced from 20 to 5 (1 second max wait)
      const checkInterval = setInterval(() => {
        attempts++;
        connectRoot = document.getElementById('connect-root');
        if (connectRoot) {
          clearInterval(checkInterval);
          handleConnectMenu(connectRoot);
          dispatchWalletEvent();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          dispatchWalletEvent();
        }
      }, 200);
    }
  }
  
  function handleConnectMenu(connectRoot) {
    if (!connectRoot) return;
    
    // Scroll to connect menu if needed
    connectRoot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Try to trigger focus on connect button if visible
    requestAnimationFrame(() => {
      const connectButton = connectRoot.querySelector('button');
      if (connectButton && !connectButton.disabled) {
        connectButton.focus();
      }
    });
  }
  
  function dispatchWalletEvent() {
    const walletEvent = new CustomEvent('baseman-open-wallet', {
      detail: { source: 'bottom-nav' }
    });
    window.dispatchEvent(walletEvent);
  }

  function openSettings() {
    // Immediate panel opening
    if (typeof window.SettingsPanel !== 'undefined' && typeof window.SettingsPanel.show === 'function') {
      window.SettingsPanel.show();
      // Refresh in background
      requestAnimationFrame(() => {
        if (typeof window.SettingsPanel !== 'undefined' && typeof window.SettingsPanel.refresh === 'function') {
          window.SettingsPanel.refresh();
        }
      });
      return;
    }
  }

  // Public API
  window.BottomNav = {
    setActive,
    openLeaderboard,
    openProfile,
    openWallet,
    getCurrentActive: () => currentActive
  };

  // Initialize immediately - don't wait for SDK
  // Event listeners should be attached as soon as DOM is ready
  let initStarted = false;
  let initComplete = false;
  
  function initWhenReady() {
    if (initStarted) {
      return;
    }
    initStarted = true;
    
    function doInit() {
      if (initComplete) {
        return;
      }
      initComplete = true;
      init();
    }
    
    // Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doInit, { once: true });
      // Fallback: init immediately if DOMContentLoaded takes too long
      setTimeout(doInit, 100);
    } else {
      // DOM already ready - init immediately
      doInit();
    }
  }

  // Start initialization immediately
  initWhenReady();
})();

