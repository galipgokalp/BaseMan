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
      initStarted = false; // Reset so we can retry
      return;
    }
    console.log('[bottom-nav] Navigation element found:', nav);

    const items = nav.querySelectorAll('.nav-item');
    console.log('[bottom-nav] Found nav items:', items.length);
    
    if (items.length === 0) {
      console.error('[bottom-nav] No nav items found!');
      initStarted = false; // Reset so we can retry
      return;
    }

    items.forEach((item, index) => {
      const navType = item.getAttribute('data-nav');
      console.log(`[bottom-nav] Item ${index}: navType="${navType}"`, item);
      
      if (!navType) {
        console.warn(`[bottom-nav] Item ${index} has no data-nav attribute`);
        return;
      }

      // Check if already has listener (avoid duplicates)
      if (item.hasAttribute('data-listener-attached')) {
        console.log(`[bottom-nav] Item ${navType} already has listener, skipping...`);
        return;
      }
      
      item.setAttribute('data-listener-attached', 'true');
      
      item.addEventListener('click', (e) => {
        console.log(`[bottom-nav] Clicked on nav item: ${navType}`, e);
        if (item.disabled) {
          console.warn(`[bottom-nav] Item ${navType} is disabled`);
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        handleNavClick(navType, item);
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
    
    // Try to find connect menu - wait for it to mount if not ready
    let connectRoot = document.getElementById('connect-root');
    console.log('[bottom-nav] Connect root found (initial):', connectRoot);
    
    if (!connectRoot) {
      // Wait a bit for connect menu to mount (it's loaded with defer)
      console.log('[bottom-nav] Connect root not found, waiting for mount...');
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = setInterval(() => {
        attempts++;
        connectRoot = document.getElementById('connect-root');
        if (connectRoot) {
          console.log('[bottom-nav] Connect root found after wait:', connectRoot);
          clearInterval(checkInterval);
          handleConnectMenu(connectRoot);
        } else if (attempts >= maxAttempts) {
          console.warn('[bottom-nav] Connect root not found after', maxAttempts, 'attempts');
          clearInterval(checkInterval);
          // Fallback: dispatch event anyway
          dispatchWalletEvent();
        }
      }, 200);
    } else {
      handleConnectMenu(connectRoot);
    }
    
    // Always dispatch event for connect menu to listen
    dispatchWalletEvent();
  }
  
  function handleConnectMenu(connectRoot) {
    if (!connectRoot) return;
    
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
  }
  
  function dispatchWalletEvent() {
    const walletEvent = new CustomEvent('baseman-open-wallet', {
      detail: { source: 'bottom-nav' }
    });
    console.log('[bottom-nav] Dispatching baseman-open-wallet event');
    window.dispatchEvent(walletEvent);
  }

  // Public API
  window.BottomNav = {
    setActive,
    openLeaderboard,
    openProfile,
    openWallet,
    getCurrentActive: () => currentActive
  };

  // Initialize when DOM is ready - prevent double initialization
  let initStarted = false;
  let initComplete = false;
  
  function initWhenReady() {
    if (initStarted) {
      console.log('[bottom-nav] Initialization already started, skipping...');
      return;
    }
    initStarted = true;
    
    console.log('[bottom-nav] initWhenReady called, document.readyState:', document.readyState);
    
    function doInit() {
      if (initComplete) {
        console.log('[bottom-nav] Already initialized, skipping...');
        return;
      }
      initComplete = true;
      init();
    }
    
    if (document.readyState === 'loading') {
      console.log('[bottom-nav] DOM is loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[bottom-nav] DOMContentLoaded fired');
        // Wait for SDK ready
        if (window.__basemanSDKReadyFired) {
          console.log('[bottom-nav] SDK already ready, initializing in 500ms');
          setTimeout(doInit, 500);
        } else {
          console.log('[bottom-nav] Waiting for SDK ready event...');
          const sdkReadyHandler = () => {
            console.log('[bottom-nav] SDK ready event fired, initializing in 500ms');
            setTimeout(doInit, 500);
          };
          window.addEventListener('baseman-sdk-ready', sdkReadyHandler, { once: true });
          // Single fallback - wait for connect menu to mount
          console.log('[bottom-nav] Fallback: initializing in 3000ms');
          setTimeout(() => {
            if (!initComplete) {
              console.log('[bottom-nav] Fallback timeout fired, initializing now');
              window.removeEventListener('baseman-sdk-ready', sdkReadyHandler);
              doInit();
            }
          }, 3000);
        }
      }, { once: true });
    } else {
      console.log('[bottom-nav] DOM already ready');
      if (window.__basemanSDKReadyFired) {
        console.log('[bottom-nav] SDK already ready, initializing in 500ms');
        setTimeout(doInit, 500);
      } else {
        console.log('[bottom-nav] Waiting for SDK ready event...');
        const sdkReadyHandler = () => {
          console.log('[bottom-nav] SDK ready event fired, initializing in 500ms');
          setTimeout(doInit, 500);
        };
        window.addEventListener('baseman-sdk-ready', sdkReadyHandler, { once: true });
        // Single fallback - wait for connect menu to mount
        console.log('[bottom-nav] Fallback: initializing in 3000ms');
        setTimeout(() => {
          if (!initComplete) {
            console.log('[bottom-nav] Fallback timeout fired, initializing now');
            window.removeEventListener('baseman-sdk-ready', sdkReadyHandler);
            doInit();
          }
        }, 3000);
      }
    }
  }
  
  console.log('[bottom-nav] Script loaded, starting initialization...');
  initWhenReady();
})();

