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
import { loadLeaderboard } from './leaderboard/api.js';

const log = createLogger('Leaderboard');
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
  showDebugInfo, 
  hideDebugInfo,
  formatScore,
  resetRenderCache
} from './leaderboard/dom.js';
import { initSearch, closeSearchModal } from './leaderboard/search.js';

(() => {
  const panel = document.getElementById("leaderboard-panel");
  if (!panel) return;

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
  
  // Shorthand references for backward compatibility
  const statusEl = view.statusEl;
  const topListEl = view.topListEl;
  const restListEl = view.restListEl;
  const scrollWrapper = view.scrollWrapper;
  const limit = Number(panel.dataset.limit || "10");

  // Current user state (cached)
  let currentUser = null;
  let currentAddress = null;
  
  // My rank state cache - avoid redundant DOM updates
  let lastMyRankState = null; // { rank, score, hasEntry, connected }

  /**
   * Normalize address for comparison
   */
  const normalizeAddress = (addr) => {
    return typeof addr === "string" ? addr.toLowerCase() : null;
  };

  /**
   * Get current user and address (async)
   */
  const getCurrentUserInfo = async () => {
    let address = null;
    let user = null;

    try {
      // Try to get address from BaseManOnchain
      if (window.BaseManOnchain) {
        const isWalletReady = window.BaseManOnchain?.isWalletReady?.();
        if (isWalletReady) {
          address = window.BaseManOnchain?.getWalletAddress?.() || null;
        }
      }

      // Try to get user from SDK context
      if (window.sdk && window.sdk.context) {
        try {
          const context = await window.sdk.context;
          user = context?.user;
        } catch (ctxErr) {
          // SDK context not available
        }
      }
    } catch (err) {
      log.warn('Error getting user info:', err);
    }

    return { address, user };
  };

  /**
   * Check if an entry belongs to the current user
   */
  const isMyEntry = (entry) => {
    if (!entry) return false;

    // Match by FID if available
    if (currentUser?.fid && entry?.profile?.fid) {
      if (Number(currentUser.fid) === Number(entry.profile.fid)) {
        return true;
      }
    }

    // Match by address
    const entryAddress = entry?.player || entry?.address;
    if (currentAddress && entryAddress) {
      const normalizedCurrent = normalizeAddress(currentAddress);
      const normalizedEntry = normalizeAddress(entryAddress);
      if (normalizedCurrent && normalizedEntry && normalizedCurrent === normalizedEntry) {
        return true;
      }
    }

    // Also check entry.addresses array if it exists
    if (currentAddress && Array.isArray(entry?.addresses)) {
      const normalizedCurrent = normalizeAddress(currentAddress);
      const matches = entry.addresses.some(addr => {
        const normalizedAddr = normalizeAddress(addr);
        return normalizedCurrent && normalizedAddr && normalizedCurrent === normalizedAddr;
      });
      if (matches) return true;
    }

    return false;
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
    const myEntry = isConnected ? entries.find(entry => isMyEntry(entry)) : null;
    const hasEntry = !!myEntry;
    
    let rank = 0;
    let score = '';
    
    if (hasEntry) {
      rank = typeof myEntry.rank === "number" && Number.isFinite(myEntry.rank)
        ? myEntry.rank
        : entries.findIndex(e => isMyEntry(e)) + 1;
      score = formatScore(myEntry.totalScore, myEntry.highScore);
    }
    
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
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'leaderboard-my-rank-label';
    labelDiv.textContent = 'Your rank';
    metaDiv.appendChild(labelDiv);
    
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'leaderboard-my-rank-score';
    scoreDiv.textContent = score;
    metaDiv.appendChild(scoreDiv);
    
    button.appendChild(metaDiv);
    
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'leaderboard-my-rank-cta';
    ctaDiv.textContent = 'Scroll to me';
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
  const loadLeaderboardData = async () => {
    if (getLoading()) return;
    if (!getVisible()) return;
    setLoading(true);
    if (statusEl) statusEl.textContent = "";

    // Update current user info
    const userInfo = await getCurrentUserInfo();
    currentUser = userInfo.user;
    currentAddress = userInfo.address;

    await loadLeaderboard({
      limit,
      onSuccess: (items, debugInfo, isDebugMode) => {
        setAllEntries(items);
        const rendered = renderRows(items, {
          topListEl,
          restListEl,
          scrollWrapper,
          statusEl,
          limit,
          isMyEntry // Pass the function to renderRows
        });
        
        // Update My Rank summary
        updateMyRankSummary(items);
        
        if (isDebugMode && debugInfo) {
          showDebugInfo(panel, debugInfo);
        } else {
          hideDebugInfo(panel);
        }

        if (rendered && statusEl) {
          statusEl.textContent = "";
        }
        setLoading(false);
      },
      onError: (error) => {
        log.error("load failed", error);
        const errorMsg = error?.message || String(error);
        let message = "Leaderboard is currently unavailable. Please try refreshing.";
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          message = "Network error. Please check your connection and try again.";
        } else if (errorMsg.includes('429')) {
          message = "Too many requests. Please wait a moment and refresh.";
        }
        renderError(message, { topListEl, restListEl, scrollWrapper, statusEl });
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

  // Initialize panel
  const init = () => {
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
        setVisible(false, { 
          reload: false,
          onChange: updatePanelVisibility
        });
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
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
      setVisible(true, {
        onChange: updatePanelVisibility,
        onShow: loadLeaderboardData,
        reload: true
      });
    },
    hide() {
      window.__BaseManLeaderboardDesiredVisible = false;
      setVisible(false, { 
        reload: false,
        onChange: updatePanelVisibility
      });
    },
    setVisible(value, options = {}) {
      window.__BaseManLeaderboardDesiredVisible = Boolean(value);
      setVisible(value, {
        onChange: updatePanelVisibility,
        onShow: loadLeaderboardData,
        ...options
      });
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
