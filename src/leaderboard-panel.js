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
  hideDebugInfo 
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

  // Load leaderboard data
  const loadLeaderboardData = async () => {
    if (getLoading()) return;
    if (!getVisible()) return;
    setLoading(true);
    if (statusEl) statusEl.textContent = "";

    await loadLeaderboard({
      limit,
      onSuccess: (items, debugInfo, isDebugMode) => {
        setAllEntries(items);
        const rendered = renderRows(items, {
          topListEl,
          restListEl,
          scrollWrapper,
          statusEl,
          limit
        });
        
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
      onChange: (visible) => {
        if (visible) {
          panel.removeAttribute('hidden');
          panel.classList.add('open');
        } else {
          panel.setAttribute('hidden', '');
          panel.classList.remove('open');
        }
      },
      onShow: loadLeaderboardData,
      reload: true
    });

    // Close button event listener
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn) {
      const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false, { reload: false });
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
        // Restore leaderboard when search closes
        const entries = getAllEntries();
        if (entries && entries.length > 0) {
          renderRows(entries, {
            topListEl,
            restListEl,
            scrollWrapper,
            statusEl,
            limit
          });
        }
      }
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
        onChange: (visible) => {
          if (visible) {
            panel.removeAttribute('hidden');
            panel.classList.add('open');
          } else {
            panel.setAttribute('hidden', '');
            panel.classList.remove('open');
          }
        },
        onShow: loadLeaderboardData,
        reload: true
      });
    },
    hide() {
      window.__BaseManLeaderboardDesiredVisible = false;
      setVisible(false, { reload: false });
    },
    setVisible(value, options = {}) {
      window.__BaseManLeaderboardDesiredVisible = Boolean(value);
      setVisible(value, {
        onChange: (visible) => {
          if (visible) {
            panel.removeAttribute('hidden');
            panel.classList.add('open');
          } else {
            panel.setAttribute('hidden', '');
            panel.classList.remove('open');
          }
        },
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
