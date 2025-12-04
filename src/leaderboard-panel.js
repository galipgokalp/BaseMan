/**
 * Leaderboard Panel Entry Point
 * Wires together API, state, DOM, and search modules
 */

import { loadLeaderboard } from './leaderboard/api.js';
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
  formatScore
} from './leaderboard/dom.js';
import { initSearch, closeSearchModal } from './leaderboard/search.js';

(() => {
  const panel = document.getElementById("leaderboard-panel");
  if (!panel) return;

  const statusEl = panel.querySelector("[data-status]");
  const topListEl = panel.querySelector("[data-list-top]");
  const restListEl = panel.querySelector("[data-list-rest]");
  const scrollWrapper = panel.querySelector("[data-scroll-wrapper]");
  const limit = Number(panel.dataset.limit || "10");

  // Current user state (cached)
  let currentUser = null;
  let currentAddress = null;

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
      console.warn('[leaderboard-panel] Error getting user info:', err);
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
   */
  const updateMyRankSummary = (entries) => {
    const myRankSummaryEl = panel.querySelector("[data-my-rank-summary]");
    if (!myRankSummaryEl) return;

    // Clear existing content safely
    myRankSummaryEl.textContent = '';

    // If no user or address, show connect wallet message
    if (!currentUser && !currentAddress) {
      myRankSummaryEl.hidden = false;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'leaderboard-my-rank-message';
      msgDiv.textContent = 'Connect your wallet to see your rank.';
      myRankSummaryEl.appendChild(msgDiv);
      return;
    }

    // Find user's entry
    const myEntry = entries.find(entry => isMyEntry(entry));

    // If user exists but no entry found
    if (!myEntry) {
      myRankSummaryEl.hidden = false;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'leaderboard-my-rank-message';
      msgDiv.textContent = "You don't have a score yet. Play to enter the leaderboard.";
      myRankSummaryEl.appendChild(msgDiv);
      return;
    }

    // User has an entry - show rank card
    const rank = typeof myEntry.rank === "number" && Number.isFinite(myEntry.rank)
      ? myEntry.rank
      : entries.findIndex(e => isMyEntry(e)) + 1;
    
    const formattedScore = formatScore(myEntry.totalScore, myEntry.highScore);

    myRankSummaryEl.hidden = false;
    
    // Build rank card using safe DOM APIs
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
    scoreDiv.textContent = formattedScore;
    metaDiv.appendChild(scoreDiv);
    
    button.appendChild(metaDiv);
    
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'leaderboard-my-rank-cta';
    ctaDiv.textContent = 'Scroll to me';
    button.appendChild(ctaDiv);
    
    myRankSummaryEl.appendChild(button);
  };

  /**
   * Scroll to user's rank in the leaderboard
   */
  const scrollToMyRank = () => {
    // Find user's item in both top and rest lists
    const myItem = topListEl?.querySelector("[data-my-rank-item='true']") ||
                   restListEl?.querySelector("[data-my-rank-item='true']") ||
                   panel.querySelector("[data-my-rank-item='true']");

    if (!myItem) return;

    // If item is in top list, just scroll it into view (top list is not scrollable)
    if (topListEl && topListEl.contains(myItem)) {
      myItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } 
    // If item is in rest list (scrollable area)
    else if (scrollWrapper && restListEl && restListEl.contains(myItem)) {
      // Scroll within the scrollWrapper
      const scrollOffset = Math.max(
        myItem.offsetTop - scrollWrapper.offsetTop - 16,
        0
      );
      scrollWrapper.scrollTo({
        top: scrollOffset,
        behavior: "smooth"
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
        console.error("[leaderboard-panel] load failed", error);
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
  const handleSearchItemClick = (entry) => {
    closeSearchModal(() => {
      setTimeout(() => {
        const allItems = [
          ...(topListEl?.querySelectorAll('.leaderboard-item') || []), 
          ...(restListEl?.querySelectorAll('.leaderboard-item') || [])
        ];
        const address = entry?.player;
        if (address) {
          const targetItem = Array.from(allItems).find(item => {
            const itemAddress = item.dataset.address || item.querySelector('[data-address]')?.dataset.address;
            return itemAddress && itemAddress.toLowerCase() === address.toLowerCase();
          });
          if (targetItem) {
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetItem.classList.add('leaderboard-item-highlight');
            setTimeout(() => {
              targetItem.classList.remove('leaderboard-item-highlight');
            }, 2000);
          }
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

    // Close button event listener
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn) {
      const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false, { 
          reload: false,
          onChange: updatePanelVisibility
        });
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      };
      closeBtn.addEventListener('click', handleClose);
      closeBtn.addEventListener('touchend', handleClose, { passive: false });
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
  
  console.log('[leaderboard-panel] BaseManLeaderboard API exported');

  if (typeof window.__BaseManLeaderboardDesiredVisible === "boolean") {
    window.BaseManLeaderboard.setVisible(window.__BaseManLeaderboardDesiredVisible);
  } else {
    window.__BaseManLeaderboardDesiredVisible = getVisible();
  }
})();
