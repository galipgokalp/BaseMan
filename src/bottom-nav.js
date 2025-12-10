/**
 * Bottom Navigation Bar Handler
 * Manages navigation between PAC-BOARD, Profile, Wallet, and Settings
 */

import { createLogger } from './utils/logger.js';
const log = createLogger('BottomNav');

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
  let walletConnectRequested = false; // avoid spamming wallet connection prompts

  // Guard flag to prevent multiple initializations
  let _initialized = false;

  async function loadProfilePicture() {
    const profileButton = document.querySelector('[data-nav="profile"]');
    if (!profileButton) {
      return;
    }

    const iconSpan = profileButton.querySelector('.nav-icon');
    if (!iconSpan) {
      return;
    }

    try {
      if (window.sdk && window.sdk.context) {
        const context = await window.sdk.context;
        const user = context?.user;
        if (user && user.pfpUrl) {
          // Create or update profile image
          let profileImg = profileButton.querySelector('.nav-profile-img');
          if (!profileImg) {
            profileImg = document.createElement('img');
            profileImg.className = 'nav-profile-img';
            profileImg.alt = 'Profile';
            // Hide emoji icon and label
            iconSpan.style.display = 'none';
            const label = profileButton.querySelector('.nav-label');
            if (label) label.style.display = 'none';
            // Insert image
            profileButton.appendChild(profileImg);
          }
          profileImg.src = user.pfpUrl;
          profileImg.style.display = 'block';
          profileImg.onerror = () => {
            // If image fails to load, show emoji again
            if (profileImg) profileImg.style.display = 'none';
            iconSpan.style.display = '';
            const label = profileButton.querySelector('.nav-label');
            if (label) label.style.display = '';
          };
        } else {
          // No profile picture, ensure emoji is visible
          const profileImg = profileButton.querySelector('.nav-profile-img');
          if (profileImg) profileImg.style.display = 'none';
          iconSpan.style.display = '';
          const label = profileButton.querySelector('.nav-label');
          if (label) label.style.display = '';
        }
      } else {
        // SDK not available, ensure emoji is visible
        const profileImg = profileButton.querySelector('.nav-profile-img');
        if (profileImg) profileImg.style.display = 'none';
        iconSpan.style.display = '';
        const label = profileButton.querySelector('.nav-label');
        if (label) label.style.display = '';
      }
    } catch (err) {
      log.warn('Failed to load profile picture:', err);
      // Fallback: show emoji
      const profileImg = profileButton.querySelector('.nav-profile-img');
      if (profileImg) profileImg.style.display = 'none';
      iconSpan.style.display = '';
      const label = profileButton.querySelector('.nav-label');
      if (label) label.style.display = '';
    }
  }

  function init() {
    // Guard: prevent multiple initializations
    if (_initialized) {
      log.debug('Already initialized, skipping');
      return;
    }

    const nav = document.getElementById('bottom-nav');
    if (!nav) {
      return;
    }

    const items = nav.querySelectorAll('.nav-item');
    if (items.length === 0) {
      return;
    }

    // Mark as initialized
    _initialized = true;

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
        log.debug('Button clicked:', navType, e.type);
        if (item.disabled) {
          log.debug('Button disabled, ignoring');
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

    // Load profile picture (async, non-blocking)
    requestAnimationFrame(() => {
      loadProfilePicture();
    });

    // Also try loading when SDK is ready
    if (window.__basemanSDKReadyFired) {
      requestAnimationFrame(() => {
        loadProfilePicture();
      });
    } else {
      window.addEventListener('baseman-sdk-ready', () => {
        requestAnimationFrame(() => {
          loadProfilePicture();
        });
      }, { once: true });
    }

    // Don't set initial active state - panels should be closed on startup
    // Only open panels when user explicitly clicks
    const hash = window.location.hash.substring(1);
    if (hash === 'leaderboard' || hash === 'pac') {
      // Only open if URL explicitly requests it
      openLeaderboard();
      setActive(BOTTOM_NAV.LEADERBOARD);
      currentOpenPanel = BOTTOM_NAV.LEADERBOARD;
    } else {
      // Ensure all panels are closed on startup
      closeAllPanels();
    }
  }

  function closeAllPanels() {
    // Close leaderboard
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.hide === 'function') {
      window.BaseManLeaderboard.hide();
    } else {
      // Fallback: ensure panel is hidden
      const leaderboardPanel = document.getElementById('leaderboard-panel');
      if (leaderboardPanel) {
        leaderboardPanel.setAttribute('hidden', '');
      }
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
    
    // Reset state
    currentOpenPanel = null;
    setActive(null);
  }

  // Debounce to prevent rapid clicks
  let lastClickTime = 0;
  const CLICK_DEBOUNCE_MS = 100; // Minimum time between clicks

  function handleNavClick(navType, element) {
    log.debug('handleNavClick called:', navType);
    // Debounce rapid clicks
    const now = Date.now();
    if (now - lastClickTime < CLICK_DEBOUNCE_MS) {
      log.debug('Click debounced');
      return;
    }
    lastClickTime = now;
    
    // If clicking the same button, toggle (close panel)
    if (currentOpenPanel === navType) {
      log.debug('Toggling panel closed');
      closeAllPanels();
      setActive(null);
      return;
    }
    
    // Close all panels first (synchronous, fast)
    closeAllPanels();
    
    // Open the selected panel immediately (synchronous)
    switch(navType) {
      case BOTTOM_NAV.LEADERBOARD:
        log.debug('Opening leaderboard');
        if (window.BaseManLeaderboard && typeof window.BaseManLeaderboard.setTriggerElement === 'function') {
          window.BaseManLeaderboard.setTriggerElement(element);
        }
        openLeaderboard();
        setActive(BOTTOM_NAV.LEADERBOARD);
        currentOpenPanel = BOTTOM_NAV.LEADERBOARD;
        break;
      
      case BOTTOM_NAV.PROFILE:
        if (window.ProfilePanel && typeof window.ProfilePanel.setTriggerElement === 'function') {
          window.ProfilePanel.setTriggerElement(element);
        }
        openProfile();
        setActive(BOTTOM_NAV.PROFILE);
        currentOpenPanel = BOTTOM_NAV.PROFILE;
        break;
      
      case BOTTOM_NAV.WALLET:
        if (window.WalletPanel && typeof window.WalletPanel.setTriggerElement === 'function') {
          window.WalletPanel.setTriggerElement(element);
        }
        openWallet();
        setActive(BOTTOM_NAV.WALLET);
        currentOpenPanel = BOTTOM_NAV.WALLET;
        break;
      
      case BOTTOM_NAV.SETTINGS:
        if (window.SettingsPanel && typeof window.SettingsPanel.setTriggerElement === 'function') {
          window.SettingsPanel.setTriggerElement(element);
        }
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
    log.debug('openLeaderboard called');
    // Immediate panel opening - no async delays
    const panel = document.getElementById('leaderboard-panel');
    if (!panel) {
      log.error('leaderboard-panel not found in DOM');
      return;
    }
    log.debug('Panel found, removing hidden attribute');
    
    // Always remove hidden attribute first (synchronous, immediate)
    panel.removeAttribute('hidden');
    
    // Force display style (inline style has higher specificity than CSS class)
    panel.style.display = 'flex';
    
    // Wait for API to be available (with retry mechanism)
    (async function waitForAPI() {
      const maxRetries = 10;
      const delayMs = 100;
      
      for (let i = 0; i < maxRetries; i++) {
        if (typeof window.BaseManLeaderboard !== 'undefined' && 
            typeof window.BaseManLeaderboard.setVisible === 'function') {
          log.debug('BaseManLeaderboard API available, calling setVisible()');
          window.BaseManLeaderboard.setVisible(true, { force: true });
          
          // Refresh data in background (async, non-blocking)
          if (typeof window.BaseManLeaderboard.refresh === 'function') {
            requestAnimationFrame(() => {
              window.BaseManLeaderboard.refresh();
            });
          }
          return; // API found and used, exit retry loop
        }
        
        // Wait before retrying (except on last attempt)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      // API still not available after retries - log once
      log.warnOnce('lb-api-unavailable', 'BaseManLeaderboard API not available after retries - panel opened without API');
    })();
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

      // Refresh panel in background (non-blocking)
      // NOTE: Do NOT call ensureWallet() or signIn() here to avoid passkey prompts.
      // Base App mini apps are automatically connected - wallet info is available without requesting.
      requestAnimationFrame(() => {
        if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.refresh === 'function') {
          window.ProfilePanel.refresh();
        }
      });
    }
  }

  function openWallet() {
    log.debug('openWallet called');
    
    // Try API first (preferred method)
    if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.show === 'function') {
      log.debug('Using WalletPanel API');
      window.WalletPanel.show();
      // Refresh in background
      requestAnimationFrame(() => {
        if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.refresh === 'function') {
          window.WalletPanel.refresh();
        }
        // Trigger wallet connect once if not ready
        try {
          if (!walletConnectRequested &&
              typeof window.BaseManOnchain !== 'undefined' &&
              typeof window.BaseManOnchain.isWalletReady === 'function' &&
              typeof window.BaseManOnchain.ensureWallet === 'function' &&
              !window.BaseManOnchain.isWalletReady()) {
            walletConnectRequested = true;
            window.BaseManOnchain.ensureWallet(true).catch((err) => {
              log.warn('Wallet connect attempt failed:', err);
            });
          }
        } catch (err) {
          log.warn('Wallet connect attempt error:', err);
        }
      });
      return;
    }

    // Fallback: Wait for wallet-panel.js to initialize
    log.debug('WalletPanel API not ready, waiting for initialization...');
    let attempts = 0;
    const maxAttempts = 20; // 4 seconds max wait
    const checkInterval = setInterval(() => {
      attempts++;
      if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.show === 'function') {
        clearInterval(checkInterval);
        log.debug('WalletPanel API now available, using it');
        window.WalletPanel.show();
        requestAnimationFrame(() => {
          if (typeof window.WalletPanel !== 'undefined' && typeof window.WalletPanel.refresh === 'function') {
            window.WalletPanel.refresh();
          }
          try {
            if (!walletConnectRequested &&
                typeof window.BaseManOnchain !== 'undefined' &&
                typeof window.BaseManOnchain.isWalletReady === 'function' &&
                typeof window.BaseManOnchain.ensureWallet === 'function' &&
                !window.BaseManOnchain.isWalletReady()) {
              walletConnectRequested = true;
              window.BaseManOnchain.ensureWallet(true).catch((err) => {
                log.warn('Wallet connect attempt failed:', err);
              });
            }
          } catch (err) {
            log.warn('Wallet connect attempt error:', err);
          }
        });
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        log.warn('WalletPanel API not available after waiting');
        // Last resort: try to open panel directly if it exists
        const panel = document.getElementById('baseman-wallet-panel');
        if (panel) {
          log.debug('Panel exists, opening directly as fallback');
          panel.classList.add('open');
          panel.setAttribute('aria-hidden', 'false');
        }
      }
    }, 200);
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

    // Fallback: Directly toggle panel immediately
    const panel = document.getElementById('baseman-settings-panel');
    if (panel) {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      panel.style.display = 'block';

      // Refresh panel in background (non-blocking)
      requestAnimationFrame(() => {
        if (typeof window.SettingsPanel !== 'undefined' && typeof window.SettingsPanel.refresh === 'function') {
          window.SettingsPanel.refresh();
        }
      });
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

  // Initialize when DOM is ready
  function initWhenReady() {
    if (_initialized) {
      return;
    }
    
    // Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
      // Fallback: init if DOMContentLoaded takes too long
      setTimeout(init, 100);
    } else {
      // DOM already ready - init immediately
      init();
    }
  }

  // Start initialization immediately
  initWhenReady();
})();
