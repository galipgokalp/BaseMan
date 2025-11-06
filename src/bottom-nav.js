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

  function init() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) {
      console.warn('[bottom-nav] Navigation element not found');
      return;
    }

    const items = nav.querySelectorAll('.nav-item');
    items.forEach(item => {
      const navType = item.getAttribute('data-nav');
      if (!navType) return;

      item.addEventListener('click', (e) => {
        if (item.disabled) return;
        e.preventDefault();
        e.stopPropagation();
        handleNavClick(navType, item);
      });
    });

    // Set initial active state based on URL hash or default
    const hash = window.location.hash.substring(1);
    if (hash === 'leaderboard' || hash === 'pac') {
      setActive(BOTTOM_NAV.LEADERBOARD);
    }
  }

  function handleNavClick(navType, element) {
    switch(navType) {
      case BOTTOM_NAV.LEADERBOARD:
        openLeaderboard();
        setActive(BOTTOM_NAV.LEADERBOARD);
        break;
      
      case BOTTOM_NAV.PROFILE:
        openProfile();
        setActive(BOTTOM_NAV.PROFILE);
        break;
      
      case BOTTOM_NAV.WALLET:
        openWallet();
        setActive(BOTTOM_NAV.WALLET);
        break;
      
      case BOTTOM_NAV.SETTINGS:
        // Settings panel will be implemented later
        console.log('[bottom-nav] Settings panel coming soon');
        break;
      
      default:
        console.warn('[bottom-nav] Unknown nav type:', navType);
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
    // Use existing leaderboard panel functionality
    const panel = document.getElementById('leaderboard-panel');
    if (!panel) {
      console.warn('[bottom-nav] Leaderboard panel not found');
      return;
    }

    // Use the correct API: window.BaseManLeaderboard
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.show === 'function') {
      window.BaseManLeaderboard.show();
      // Also scroll to it for better UX
      setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // Fallback: ensure panel is visible and scroll to it
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Add a subtle highlight animation
    panel.style.transition = 'box-shadow 0.3s ease';
    panel.style.boxShadow = '0 0 30px rgba(255, 225, 79, 0.6)';
    setTimeout(() => {
      panel.style.boxShadow = '';
    }, 1000);
    
    // Scroll to top if panel is scrollable
    const scrollWrapper = panel.querySelector('[data-scroll-wrapper]');
    if (scrollWrapper) {
      scrollWrapper.scrollTop = 0;
    }
    
    // Refresh leaderboard data
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.refresh === 'function') {
      window.BaseManLeaderboard.refresh();
    }
  }

  function openProfile() {
    // Try multiple methods to open profile panel
    let profileOpened = false;
    
    // Method 1: Find and click profile button
    const profileBtn = document.getElementById('baseman-profile-btn') || 
                       document.querySelector('.profile-btn');
    if (profileBtn && !profileBtn.disabled) {
      profileBtn.click();
      profileOpened = true;
    }
    
    // Method 2: Directly toggle panel if button not found
    if (!profileOpened) {
      const panel = document.getElementById('baseman-profile-panel');
      if (panel) {
        const isOpen = panel.classList.contains('open');
        if (!isOpen) {
          // Simulate button click to trigger wallet connection logic
          if (profileBtn) {
            profileBtn.click();
          } else {
            // Direct toggle if button not available
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            
            // Trigger wallet connection and refresh
            (async () => {
              try {
                if (window.BaseManOnchain && typeof window.BaseManOnchain.ensureWallet === 'function') {
                  await window.BaseManOnchain.ensureWallet();
                } else if (window.sdk && window.sdk.actions && typeof window.sdk.actions.signIn === 'function') {
                  await window.sdk.actions.signIn({ acceptAuthAddress: true });
                }
              } catch (err) {
                console.warn('[bottom-nav] Wallet connection failed:', err?.message || err);
              }
              
              // Refresh panel if refresh function exists
              if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.refresh === 'function') {
                window.ProfilePanel.refresh();
              }
            })();
          }
          profileOpened = true;
        }
      }
    }
    
    if (!profileOpened) {
      console.warn('[bottom-nav] Profile panel could not be opened - button and panel not found');
    }
  }

  function openWallet() {
    // Focus on Wagmi connect menu
    // The connect menu is in a separate React component
    // We'll trigger a custom event that the connect menu can listen to
    const walletEvent = new CustomEvent('baseman-open-wallet', {
      detail: { source: 'bottom-nav' }
    });
    window.dispatchEvent(walletEvent);

    // Also try to find and focus the connect menu container
    const connectRoot = document.getElementById('connect-root');
    if (connectRoot) {
      // Scroll to connect menu if needed
      connectRoot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Try to trigger click on connect button if visible
      setTimeout(() => {
        const connectButton = connectRoot.querySelector('button');
        if (connectButton && !connectButton.disabled) {
          connectButton.focus();
        }
      }, 100);
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
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other scripts to initialize
        if (window.__basemanSDKReadyFired) {
          setTimeout(init, 200);
        } else {
          window.addEventListener('baseman-sdk-ready', () => {
            setTimeout(init, 200);
          }, { once: true });
          // Fallback - wait longer for leaderboard/profile panels to initialize
          setTimeout(init, 1000);
        }
      }, { once: true });
    } else {
      // DOM already ready
      if (window.__basemanSDKReadyFired) {
        setTimeout(init, 200);
      } else {
        window.addEventListener('baseman-sdk-ready', () => {
          setTimeout(init, 200);
        }, { once: true });
        // Fallback - wait longer for leaderboard/profile panels to initialize
        setTimeout(init, 1000);
      }
    }
  }
  
  initWhenReady();
})();

