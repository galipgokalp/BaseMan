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
    console.log('[bottom-nav] Initializing...');
    const nav = document.getElementById('bottom-nav');
    if (!nav) {
      console.error('[bottom-nav] Navigation element not found!');
      return;
    }
    console.log('[bottom-nav] Navigation element found:', nav);

    const items = nav.querySelectorAll('.nav-item');
    console.log('[bottom-nav] Found nav items:', items.length);
    
    if (items.length === 0) {
      console.error('[bottom-nav] No nav items found!');
      return;
    }

    items.forEach((item, index) => {
      const navType = item.getAttribute('data-nav');
      console.log(`[bottom-nav] Item ${index}: navType="${navType}"`, item);
      
      if (!navType) {
        console.warn(`[bottom-nav] Item ${index} has no data-nav attribute`);
        return;
      }

      // Remove any existing listeners to avoid duplicates
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
      newItem.addEventListener('click', (e) => {
        console.log(`[bottom-nav] Clicked on nav item: ${navType}`, e);
        if (newItem.disabled) {
          console.warn(`[bottom-nav] Item ${navType} is disabled`);
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        handleNavClick(navType, newItem);
      });
      
      console.log(`[bottom-nav] Event listener added to item: ${navType}`);
    });

    // Set initial active state based on URL hash or default
    const hash = window.location.hash.substring(1);
    if (hash === 'leaderboard' || hash === 'pac') {
      setActive(BOTTOM_NAV.LEADERBOARD);
    }
    
    console.log('[bottom-nav] Initialization complete');
  }

  function handleNavClick(navType, element) {
    console.log('[bottom-nav] handleNavClick called:', navType, element);
    
    switch(navType) {
      case BOTTOM_NAV.LEADERBOARD:
        console.log('[bottom-nav] Opening leaderboard...');
        openLeaderboard();
        setActive(BOTTOM_NAV.LEADERBOARD);
        break;
      
      case BOTTOM_NAV.PROFILE:
        console.log('[bottom-nav] Opening profile...');
        openProfile();
        setActive(BOTTOM_NAV.PROFILE);
        break;
      
      case BOTTOM_NAV.WALLET:
        console.log('[bottom-nav] Opening wallet...');
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
    console.log('[bottom-nav] openLeaderboard called');
    
    // Use existing leaderboard panel functionality
    const panel = document.getElementById('leaderboard-panel');
    if (!panel) {
      console.error('[bottom-nav] Leaderboard panel not found!');
      return;
    }
    console.log('[bottom-nav] Leaderboard panel found:', panel);

    // Use the correct API: window.BaseManLeaderboard
    if (typeof window.BaseManLeaderboard !== 'undefined' && typeof window.BaseManLeaderboard.show === 'function') {
      console.log('[bottom-nav] Using window.BaseManLeaderboard.show()');
      window.BaseManLeaderboard.show();
      // Also scroll to it for better UX
      setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      console.log('[bottom-nav] BaseManLeaderboard API not available, using fallback');
      // Fallback: ensure panel is visible and scroll to it
      panel.hidden = false;
      panel.style.display = 'block';
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
      console.log('[bottom-nav] Refreshing leaderboard');
      window.BaseManLeaderboard.refresh();
    }
    
    console.log('[bottom-nav] Leaderboard opened successfully');
  }

  function openProfile() {
    console.log('[bottom-nav] openProfile called');
    
    // Try multiple methods to open profile panel
    let profileOpened = false;
    
    // Method 1: Find and click profile button
    const profileBtn = document.getElementById('baseman-profile-btn') || 
                       document.querySelector('.profile-btn');
    console.log('[bottom-nav] Profile button found:', profileBtn);
    
    if (profileBtn && !profileBtn.disabled) {
      console.log('[bottom-nav] Clicking profile button...');
      profileBtn.click();
      profileOpened = true;
      console.log('[bottom-nav] Profile button clicked');
    }
    
    // Method 2: Directly toggle panel if button not found
    if (!profileOpened) {
      const panel = document.getElementById('baseman-profile-panel');
      console.log('[bottom-nav] Profile panel found:', panel);
      
      if (panel) {
        const isOpen = panel.classList.contains('open');
        console.log('[bottom-nav] Profile panel isOpen:', isOpen);
        
        if (!isOpen) {
          // Simulate button click to trigger wallet connection logic
          if (profileBtn) {
            console.log('[bottom-nav] Using profile button click');
            profileBtn.click();
          } else {
            console.log('[bottom-nav] Direct toggle - no button found');
            // Direct toggle if button not available
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            panel.style.display = 'block';
            
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
        } else {
          console.log('[bottom-nav] Profile panel already open');
        }
      }
    }
    
    if (!profileOpened) {
      console.error('[bottom-nav] Profile panel could not be opened - button and panel not found');
    } else {
      console.log('[bottom-nav] Profile opened successfully');
    }
  }

  function openWallet() {
    console.log('[bottom-nav] openWallet called');
    
    // Focus on Wagmi connect menu
    // The connect menu is in a separate React component
    // We'll trigger a custom event that the connect menu can listen to
    const walletEvent = new CustomEvent('baseman-open-wallet', {
      detail: { source: 'bottom-nav' }
    });
    console.log('[bottom-nav] Dispatching baseman-open-wallet event');
    window.dispatchEvent(walletEvent);

    // Also try to find and focus the connect menu container
    const connectRoot = document.getElementById('connect-root');
    console.log('[bottom-nav] Connect root found:', connectRoot);
    
    if (connectRoot) {
      // Scroll to connect menu if needed
      connectRoot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Try to trigger click on connect button if visible
      setTimeout(() => {
        const connectButton = connectRoot.querySelector('button');
        console.log('[bottom-nav] Connect button found:', connectButton);
        if (connectButton && !connectButton.disabled) {
          connectButton.focus();
          console.log('[bottom-nav] Connect button focused');
        }
      }, 100);
    } else {
      console.warn('[bottom-nav] Connect root not found');
    }
    
    console.log('[bottom-nav] Wallet opened successfully');
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
    console.log('[bottom-nav] initWhenReady called, document.readyState:', document.readyState);
    
    if (document.readyState === 'loading') {
      console.log('[bottom-nav] DOM is loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[bottom-nav] DOMContentLoaded fired');
        // Wait a bit for other scripts to initialize
        if (window.__basemanSDKReadyFired) {
          console.log('[bottom-nav] SDK already ready, initializing in 200ms');
          setTimeout(init, 200);
        } else {
          console.log('[bottom-nav] Waiting for SDK ready event...');
          window.addEventListener('baseman-sdk-ready', () => {
            console.log('[bottom-nav] SDK ready event fired, initializing in 200ms');
            setTimeout(init, 200);
          }, { once: true });
          // Fallback - wait longer for leaderboard/profile panels to initialize
          console.log('[bottom-nav] Fallback: initializing in 2000ms');
          setTimeout(() => {
            console.log('[bottom-nav] Fallback timeout fired, initializing now');
            init();
          }, 2000);
        }
      }, { once: true });
    } else {
      console.log('[bottom-nav] DOM already ready');
      // DOM already ready
      if (window.__basemanSDKReadyFired) {
        console.log('[bottom-nav] SDK already ready, initializing in 200ms');
        setTimeout(init, 200);
      } else {
        console.log('[bottom-nav] Waiting for SDK ready event...');
        window.addEventListener('baseman-sdk-ready', () => {
          console.log('[bottom-nav] SDK ready event fired, initializing in 200ms');
          setTimeout(init, 200);
        }, { once: true });
        // Fallback - wait longer for leaderboard/profile panels to initialize
        console.log('[bottom-nav] Fallback: initializing in 2000ms');
        setTimeout(() => {
          console.log('[bottom-nav] Fallback timeout fired, initializing now');
          init();
        }, 2000);
      }
    }
  }
  
  console.log('[bottom-nav] Script loaded, starting initialization...');
  initWhenReady();
})();

