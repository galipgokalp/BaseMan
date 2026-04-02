/**
 * Leaderboard Panel Entry Point
 * Wires together API, state, DOM, and search modules
 * 
 * Phase 4.1: Performance optimizations
 * - View state caching for DOM references
 * - requestAnimationFrame for scroll operations
 * - Minimized DOM writes and layout thrashing
 */

import { createLogger } from './utils/logger.js';
import { createPanelLifecycle } from './utils/panel-base.js';
import { loadLeaderboard } from './leaderboard/api.js';
import { getCachedUserInfo, isMyEntry as isMyEntryService, clearUserInfoCache } from './leaderboard/services/user-detection.js';
import { calculateMyRank } from './leaderboard/services/rank-calculation.js';

const log = createLogger('UiLeaderboard');
const PANEL_TITLE_ID = 'leaderboard-panel-title';
import { 
  getLoading, 
  setLoading, 
  getAllEntries, 
  setAllEntries, 
  getVisible, 
  setVisible, 
  startPolling, 
  stopPolling 
} from './leaderboard/state.js';
import { 
  renderRows, 
  renderError, 
  renderEmpty,
  renderLoading,
  showDebugInfo, 
  hideDebugInfo,
  resetRenderCache
} from './leaderboard/dom.js';
import { initSearch, closeSearchModal } from './leaderboard/search.js';

(() => {
  const panel = document.getElementById("leaderboard-panel");
  if (!panel) return;
  panel.setAttribute('role', 'region');
  const titleEl = panel.querySelector('.leaderboard-title');
  if (titleEl && !titleEl.id) {
    titleEl.id = PANEL_TITLE_ID;
  }
  if (titleEl) {
    panel.setAttribute('aria-labelledby', titleEl.id);
  }

  // ============================================
  // VIEW CACHE - Phase 4.1 optimization
  // ============================================
  // Cache DOM references to avoid repeated querySelector calls
  const view = {
    panel,
    statusEl: panel.querySelector("[data-status]"),
    topListEl: panel.querySelector("[data-list-top]"),
    restListEl: panel.querySelector("[data-list-rest]"),
    scrollWrapper: panel.querySelector("[data-scroll-wrapper]"),
    myRankSummaryEl: null, // Lazy-init on first use
    myRankRow: null, // Cache for scroll-to-me
    closeBtn: null, // Lazy-init
  };
  
  // Debug: Log DOM element detection
  log.debug('Leaderboard panel DOM elements:', {
    hasPanel: !!panel,
    hasStatusEl: !!view.statusEl,
    hasTopListEl: !!view.topListEl,
    hasRestListEl: !!view.restListEl,
    hasScrollWrapper: !!view.scrollWrapper
  });
  
  if (!view.topListEl) {
    log.error('topListEl not found! Check HTML for [data-list-top] element');
  }
  if (!view.restListEl) {
    log.error('restListEl not found! Check HTML for [data-list-rest] element');
  }
  if (!view.scrollWrapper) {
    log.error('scrollWrapper not found! Check HTML for [data-scroll-wrapper] element');
  }
  
  // Shorthand references for backward compatibility
  const statusEl = view.statusEl;
  const topListEl = view.topListEl;
  const restListEl = view.restListEl;
  const scrollWrapper = view.scrollWrapper;
  const limit = Number(panel.dataset.limit || "10");

  // Current user state (cached)
  let currentUser = null;
  let currentAddress = null;
  let currentPlatform = null;
  
  // My rank state cache - avoid redundant DOM updates
  let lastMyRankState = null; // { rank, score, hasEntry, connected }

  // User detection is now handled by services module
  // Using imported functions: getCachedUserInfo, isMyEntryService
  
  /**
   * Get current user and address (async)
   * Wrapper around service function
   */
  const getCurrentUserInfo = async () => {
    const userInfo = await getCachedUserInfo();
    return { address: userInfo.address, user: userInfo.user, platform: userInfo.platform };
  };

  /**
   * Check if an entry belongs to the current user
   * Wrapper around service function
   * Now includes platform matching to distinguish between Base App and Farcaster accounts
   */
  const isMyEntry = (entry) => {
    if (!entry) return false;
    return isMyEntryService(entry, { address: currentAddress, user: currentUser, platform: currentPlatform });
  };

  /**
   * Update the "My Rank" summary card
   * Uses safe DOM APIs instead of innerHTML
   * 
   * Phase 4.1: Skip redundant DOM updates when state unchanged
   */
  const updateMyRankSummary = (entries) => {
    // Lazy-init and cache the element reference
    if (!view.myRankSummaryEl) {
      view.myRankSummaryEl = panel.querySelector("[data-my-rank-summary]");
    }
    const myRankSummaryEl = view.myRankSummaryEl;
    if (!myRankSummaryEl) return;

    // Determine current state
    const isConnected = !!(currentUser || currentAddress);
    
    // Use rank calculation service
    const rankInfo = isConnected ? calculateMyRank(entries, isMyEntry) : null;
    const hasEntry = rankInfo?.hasEntry || false;
    const rank = rankInfo?.rank || 0;
    const score = rankInfo?.score || '';
    
    // Create state hash to detect changes
    const newState = { connected: isConnected, hasEntry, rank, score };
    const stateKey = `${isConnected}|${hasEntry}|${rank}|${score}`;
    const lastStateKey = lastMyRankState 
      ? `${lastMyRankState.connected}|${lastMyRankState.hasEntry}|${lastMyRankState.rank}|${lastMyRankState.score}`
      : null;
    
    // Skip DOM work if state unchanged
    if (stateKey === lastStateKey) {
      log.debug('updateMyRankSummary: skipping (state unchanged)');
      return;
    }
    
    lastMyRankState = newState;

    // Clear existing content safely
    myRankSummaryEl.textContent = '';
    // Invalidate my rank row cache since DOM structure changed
    view.myRankRow = null;

    // If no user or address, show connect wallet message
    if (!isConnected) {
      myRankSummaryEl.hidden = false;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'leaderboard-my-rank-message';
      msgDiv.textContent = 'Connect your wallet to see your rank.';
      myRankSummaryEl.appendChild(msgDiv);
      return;
    }

    // If user exists but no entry found
    if (!hasEntry) {
      myRankSummaryEl.hidden = false;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'leaderboard-my-rank-message';
      msgDiv.textContent = "You don't have a score yet. Play to enter the leaderboard.";
      myRankSummaryEl.appendChild(msgDiv);
      return;
    }

    // User has an entry - show rank card
    myRankSummaryEl.hidden = false;
    
    // Build rank card using DocumentFragment for single DOM insertion
    const fragment = document.createDocumentFragment();
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'leaderboard-my-rank-inner';
    button.setAttribute('data-my-rank-scroll', '');
    
    const positionDiv = document.createElement('div');
    positionDiv.className = 'leaderboard-my-rank-position';
    positionDiv.textContent = `#${rank}`;
    button.appendChild(positionDiv);
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'leaderboard-my-rank-meta';
    
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'leaderboard-my-rank-score';
    scoreDiv.textContent = score;
    metaDiv.appendChild(scoreDiv);
    
    button.appendChild(metaDiv);
    
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'leaderboard-my-rank-cta';
    const ctaText = document.createElement('span');
    ctaText.className = 'leaderboard-my-rank-cta-text';
    ctaText.textContent = 'Scroll to me';
    ctaDiv.appendChild(ctaText);
    const ctaIcon = document.createElement('span');
    ctaIcon.className = 'leaderboard-my-rank-cta-icon';
    ctaIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    ctaDiv.appendChild(ctaIcon);
    button.appendChild(ctaDiv);
    
    fragment.appendChild(button);
    myRankSummaryEl.appendChild(fragment);
  };

  /**
   * Scroll to user's rank in the leaderboard
   * Phase 4.1: Use requestAnimationFrame to avoid layout thrashing
   */
  const scrollToMyRank = () => {
    // Find user's item - check cached reference first
    let myItem = view.myRankRow;
    
    // Verify cached reference is still valid, otherwise re-query
    if (!myItem || !myItem.parentElement) {
      myItem = view.topListEl?.querySelector("[data-my-rank-item='true']") ||
               view.restListEl?.querySelector("[data-my-rank-item='true']") ||
               panel.querySelector("[data-my-rank-item='true']");
      view.myRankRow = myItem; // Cache for next time
    }

    if (!myItem) return;

    // Use requestAnimationFrame for all scroll operations to avoid layout thrashing
    requestAnimationFrame(() => {
      // Read layout values in one batch
      const itemInTopList = view.topListEl && view.topListEl.contains(myItem);
      const itemInRestList = view.scrollWrapper && view.restListEl && view.restListEl.contains(myItem);
      
      // If item is in top list, just scroll it into view (top list is not scrollable)
      if (itemInTopList) {
        myItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } 
      // If item is in rest list (scrollable area)
      else if (itemInRestList) {
        // Read layout values
        const scrollOffset = Math.max(
          myItem.offsetTop - view.scrollWrapper.offsetTop - 16,
          0
        );
        // Schedule scroll in next frame to separate read/write
        requestAnimationFrame(() => {
          view.scrollWrapper.scrollTo({
            top: scrollOffset,
            behavior: "smooth"
          });
        });
      } 
      // Fallback: scroll item into view
      else {
        myItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Add highlight class temporarily
      myItem.classList.add('leaderboard-item-me-highlight');
      setTimeout(() => {
        myItem.classList.remove('leaderboard-item-me-highlight');
      }, 1200);
    });
  };

  // Load leaderboard data
  // Phase 6: Enhanced error handling with loading/error/empty states
  const loadLeaderboardData = async () => {
    if (getLoading()) return;
    if (!getVisible()) return;
    setLoading(true);
    const loadStartedAt = Date.now();

    // Phase 6: Show loading state
    renderLoading({ topListEl, restListEl, scrollWrapper, statusEl });

    // Clear user info cache to get fresh data on each load
    // This ensures we pick up wallet connections that happened after panel was first shown
    clearUserInfoCache();

    // CRITICAL: Ensure platform detection is initialized before loading leaderboard
    // This is especially important for mobile MiniApp environments where SDK may load slowly
    try {
      const { initPlatformDetection } = await import('./utils/platform-detection.js');
      await initPlatformDetection();
      log.debug('Platform detection initialized before leaderboard load');
    } catch (platformErr) {
      log.warn('Platform detection init failed (non-critical):', platformErr?.message);
    }

    // Update current user info
    const userInfo = await getCurrentUserInfo();
    currentUser = userInfo.user;
    currentAddress = userInfo.address;
    currentPlatform = userInfo.platform;

    log.debug('loadLeaderboardData user info:', {
      hasUser: !!currentUser,
      hasAddress: !!currentAddress,
      hasFid: !!currentUser?.fid,
      platform: currentPlatform,
      addressPrefix: currentAddress ? currentAddress.substring(0, 10) + '...' : null
    });
    
    // Only surface platform warnings when we actually have identity/address signals
    // and platform matching would materially improve ranking/ownership detection.
    if (currentPlatform) {
      log.info('🔍 Platform detected:', currentPlatform);
    } else if (currentAddress || currentUser?.fid || currentUser?.username) {
      log.warn('⚠️ Platform not detected despite user/address signals - platform matching will be skipped', {
        hasAddress: !!currentAddress,
        hasFid: !!currentUser?.fid,
        hasUsername: !!currentUser?.username
      });
    } else {
      log.debug('No platform detected and no user/address signals available; platform matching skipped');
    }

    await loadLeaderboard({
      limit,
      onSuccess: (items, debugInfo, isDebugMode) => {
        log.debug('loadLeaderboard onSuccess', {
          itemsCount: items?.length || 0,
          hasTopListEl: !!topListEl,
          hasRestListEl: !!restListEl,
          hasScrollWrapper: !!scrollWrapper,
          hasStatusEl: !!statusEl,
          durationMs: Date.now() - loadStartedAt,
          limit,
          currentPlatform
        });
        
        // Phase 6: Handle empty state
        if (!items || items.length === 0) {
          log.debug('loadLeaderboard: items empty, rendering empty state');
          renderEmpty({ topListEl, restListEl, scrollWrapper, statusEl });
          setAllEntries([]);
          updateMyRankSummary([]);
          setLoading(false);
          return;
        }
        
        setAllEntries(items);
        log.debug('loadLeaderboard: calling renderRows with', items.length, 'items');
        const rendered = renderRows(items, {
          topListEl,
          restListEl,
          scrollWrapper,
          statusEl,
          limit,
          isMyEntry // Pass the function to renderRows
        });
        log.debug('loadLeaderboard: renderRows returned', rendered);
        
        // Update My Rank summary
        updateMyRankSummary(items);
        
        if (isDebugMode && debugInfo) {
          showDebugInfo(panel, debugInfo);
        } else {
          hideDebugInfo(panel);
        }

        if (rendered && statusEl) {
          statusEl.textContent = "";
          
          // Show diagnostic message in dev mode if profiles might be limited
          const isDev = (window.__ENV?.NODE_ENV || window.__ENV?.NEXT_PUBLIC_NODE_ENV || '').toLowerCase() !== 'production';
          if (isDev && debugInfo) {
            const hasLimitedProfiles = debugInfo.enrichmentDisabled || debugInfo.missingNeynarKey || debugInfo.missingRedis;
            if (hasLimitedProfiles) {
              const diagnosticMsg = document.createElement('div');
              diagnosticMsg.className = 'leaderboard-diagnostic';
              diagnosticMsg.style.cssText = 'font-size: 0.75rem; color: #999; padding: 4px 8px; margin-top: 8px; text-align: center;';
              let msg = '(Dev) ';
              if (debugInfo.enrichmentDisabled) {
                msg += 'Profiles disabled';
              } else if (debugInfo.missingNeynarKey) {
                msg += 'Profiles limited: missing Neynar API key';
              } else if (debugInfo.missingRedis) {
                msg += 'Profiles limited: missing Redis config';
              }
              diagnosticMsg.textContent = msg;
              statusEl.appendChild(diagnosticMsg);
            }
          }
        }
        setLoading(false);
      },
      onError: (error) => {
        log.error("load failed", {
          error,
          durationMs: Date.now() - loadStartedAt,
          limit,
          currentPlatform,
          hasAddress: !!currentAddress,
          hasFid: !!currentUser?.fid
        });
        
        // Phase 6: Map error to user-friendly message
        const errorMsg = error?.message || String(error);
        let message = "Couldn't load the leaderboard right now.";
        
        // Check if it's an AppError with kind
        if (error?.kind) {
          switch (error.kind) {
            case 'NETWORK_ERROR':
            case 'TIMEOUT':
              message = "Network error. Please check your connection and try again.";
              break;
            case 'UNAUTHORIZED':
              message = "Authentication failed. Please try again.";
              break;
            case 'BAD_RESPONSE':
              message = "Invalid response from server. Please try again.";
              break;
            default:
              message = error.message || message;
          }
        } else {
          // Fallback to message-based detection
          if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('network')) {
            message = "Network error. Please check your connection and try again.";
          } else if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
            message = "Request timed out. Please try again.";
          } else if (errorMsg.includes('429')) {
            message = "Too many requests. Please wait a moment and refresh.";
          }
        }
        
        // Phase 6: Show error with retry button
        renderError(message, { 
          topListEl, 
          restListEl, 
          scrollWrapper, 
          statusEl,
          onRetry: () => {
            // Retry after a short delay
            setTimeout(() => {
              loadLeaderboardData();
            }, 500);
          }
        });
        setLoading(false);
      }
    });
  };

  // Handle search result item click (scroll to user in leaderboard)
  // Phase 4.1: Use requestAnimationFrame for scroll, optimized item lookup
  const handleSearchItemClick = (entry) => {
    closeSearchModal(() => {
      setTimeout(() => {
        const address = entry?.player;
        if (!address) return;
        
        const normalizedAddress = address.toLowerCase();
        
        // Query items once and use simple for-loop
        const topItems = view.topListEl?.querySelectorAll('.leaderboard-item') || [];
        const restItems = view.restListEl?.querySelectorAll('.leaderboard-item') || [];
        
        let targetItem = null;
        
        // Search top items first
        for (let i = 0, len = topItems.length; i < len; i++) {
          const item = topItems[i];
          const itemAddress = item.dataset.address;
          if (itemAddress && itemAddress.toLowerCase() === normalizedAddress) {
            targetItem = item;
            break;
          }
        }
        
        // Search rest items if not found in top
        if (!targetItem) {
          for (let i = 0, len = restItems.length; i < len; i++) {
            const item = restItems[i];
            const itemAddress = item.dataset.address;
            if (itemAddress && itemAddress.toLowerCase() === normalizedAddress) {
              targetItem = item;
              break;
            }
          }
        }
        
        if (targetItem) {
          // Use requestAnimationFrame for scroll to avoid layout thrashing
          requestAnimationFrame(() => {
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetItem.classList.add('leaderboard-item-highlight');
            setTimeout(() => {
              targetItem.classList.remove('leaderboard-item-highlight');
            }, 2000);
          });
        }
      }, 250);
    });
  };

  // Helper to update DOM visibility
  const updatePanelVisibility = (visible) => {
    if (visible) {
      panel.removeAttribute('hidden');
      panel.classList.add('open');
    } else {
      panel.setAttribute('hidden', '');
      panel.classList.remove('open');
    }
  };

  const lifecycle = createPanelLifecycle({
    getPanel: () => panel,
    getIsOpen: () => getVisible(),
    applyVisibility(visible, _panel, options = {}) {
      setVisible(visible, {
        onChange: updatePanelVisibility,
        onShow: loadLeaderboardData,
        ...options
      });
    },
    focusFallback: panel,
    onAfterClose() {
      if (window.BottomNav) {
        window.BottomNav.setActive(null);
      }
    }
  });

  // Initialize panel
  const init = async () => {
    // Ensure platform detection is initialized early
    try {
      const { initPlatformDetection } = await import('./utils/platform-detection.js');
      // Don't block on this, just start it
      initPlatformDetection().catch(err => {
        log.debug('Platform detection init failed (non-critical):', err?.message);
      });
    } catch (err) {
      log.debug('Failed to import platform detection:', err?.message);
    }

    // Determine initial visibility
    let initialVisible = getVisible();
    if (typeof window.__BaseManLeaderboardDesiredVisible === "boolean") {
      initialVisible = window.__BaseManLeaderboardDesiredVisible;
    } else {
      const hash = window.location.hash.substring(1);
      initialVisible = hash === 'leaderboard' || hash === 'pac';
    }

    // Set visibility
    setVisible(initialVisible, {
      onChange: updatePanelVisibility,
      onShow: loadLeaderboardData,
      reload: true
    });

    // Close button event listener (use cached reference)
    view.closeBtn = panel.querySelector('[data-close]');
    if (view.closeBtn) {
      const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Reset render cache when closing so next show gets fresh render
        resetRenderCache();
        lastMyRankState = null;
        lifecycle.hide({ 
          reload: false,
          onChange: updatePanelVisibility
        });
      };
      view.closeBtn.addEventListener('click', handleClose);
      view.closeBtn.addEventListener('touchend', handleClose, { passive: false });
    }

    // Visibility change handler
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (!getVisible()) return;
        loadLeaderboardData();
        startPolling(loadLeaderboardData);
      } else {
        stopPolling();
      }
    });

    // Initialize search module (pass function to get latest entries)
    initSearch(panel, getAllEntries, {
      topListEl,
      restListEl,
      onItemClick: handleSearchItemClick,
      onClose: () => {
        // Modal close callback - no need to re-render leaderboard
        // The main leaderboard content remains unchanged when search closes
      }
    });

    // Click listener for "Scroll to me" button
    panel.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-my-rank-scroll]");
      if (!trigger) return;
      event.preventDefault();
      scrollToMyRank();
    });

    // Initial load if visible
    if (getVisible()) {
      loadLeaderboardData();
      startPolling(loadLeaderboardData);
    }
  };

  init();

  // Export API
  window.BaseManLeaderboard = {
    show() {
      window.__BaseManLeaderboardDesiredVisible = true;
      lifecycle.show({
        reload: true
      });
    },
    hide() {
      window.__BaseManLeaderboardDesiredVisible = false;
      lifecycle.hide({ 
        reload: false,
      });
    },
    setVisible(value, options = {}) {
      window.__BaseManLeaderboardDesiredVisible = Boolean(value);
      lifecycle.setVisible(value, options);
    },
    setTriggerElement(el) {
      lifecycle.setTriggerElement(el);
    },
    refresh() {
      if (getVisible()) {
        void loadLeaderboardData();
      }
    }
  };
  
  log.debug('BaseManLeaderboard API exported');

  if (typeof window.__BaseManLeaderboardDesiredVisible === "boolean") {
    window.BaseManLeaderboard.setVisible(window.__BaseManLeaderboardDesiredVisible);
  } else {
    window.__BaseManLeaderboardDesiredVisible = getVisible();
  }
})();
