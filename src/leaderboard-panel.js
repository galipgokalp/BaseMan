(() => {
  const panel = document.getElementById("leaderboard-panel");
  if (!panel) return;

  const statusEl = panel.querySelector("[data-status]");
  const topListEl = panel.querySelector("[data-list-top]");
  const restListEl = panel.querySelector("[data-list-rest]");
  const scrollWrapper = panel.querySelector("[data-scroll-wrapper]");
  const refreshBtn = panel.querySelector("[data-refresh]");
  const limit = Number(panel.dataset.limit || "10");

  let loading = false;
  let timerId = null;
  // Default: visible. Allow hiding when NEXT_PUBLIC_SHOW_LEADERBOARD is set to 0/false.
  let visible = (() => {
    try {
      const v = window.__ENV && String(window.__ENV.NEXT_PUBLIC_SHOW_LEADERBOARD || '').toLowerCase();
      if (v === '0' || v === 'false') return false;
      return true;
    } catch (_) {
      return true;
    }
  })();

  const abbreviateAddress = (address) => {
    if (typeof address !== "string") return "";
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  const fallbackAvatar = (address) => {
    if (!address) return "";
    return `https://effigy.im/a/${address}.png`;
  };

  const parseDateValue = (value) => {
    if (!value && value !== 0) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return null;
      return new Date(value);
    }
    if (typeof value === "string") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  const formatRelativeTime = (value) => {
    const date = parseDateValue(value);
    if (!date) return "";
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) {
      return "";
    }
    const minutes = Math.floor(diffMs / (60 * 1000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const formatScore = (value, fallback) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value.toLocaleString("en-US");
    }
    if (typeof fallback === "string") {
      return fallback;
    }
    if (typeof value === "string") {
      return value;
    }
    return "0";
  };

  const formatTimestamp = (value) => {
    if (!value && value !== 0) return "";
    const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  const createListItem = (entry, fallbackRank) => {
    const li = document.createElement("li");
    li.className = "leaderboard-item";

    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    const rankValue =
      typeof entry.rank === "number" && Number.isFinite(entry.rank) ? entry.rank : fallbackRank;
    rank.textContent = `#${rankValue}`;
    li.append(rank);

    const identityRoot = document.createElement(entry?.profile?.profileUrl ? "a" : "div");
    identityRoot.className = "leaderboard-identity";
    if (entry?.profile?.profileUrl) {
      identityRoot.href = entry.profile.profileUrl;
      identityRoot.target = "_blank";
      identityRoot.rel = "noopener noreferrer";
    }

    const avatar = document.createElement("div");
    avatar.className = "leaderboard-avatar";
    if (entry?.profile?.avatarUrl || entry?.player) {
      const img = document.createElement("img");
      img.src = entry?.profile?.avatarUrl || fallbackAvatar(entry.player);
      img.alt =
        entry?.profile?.username
          ? `@${entry.profile.username}`
          : entry?.profile?.displayName || abbreviateAddress(entry.player);
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      avatar.appendChild(img);
    } else {
      avatar.textContent = "👾";
    }
    identityRoot.appendChild(avatar);

    const identityText = document.createElement("div");
    identityText.className = "leaderboard-text";
    identityRoot.appendChild(identityText);

    const name = document.createElement("span");
    name.className = "leaderboard-name";
    name.textContent =
      entry?.profile?.displayName || entry?.profile?.username || abbreviateAddress(entry.player);
    identityText.appendChild(name);

    const handle = document.createElement("span");
    handle.className = "leaderboard-handle";
    if (entry?.profile?.username) {
      handle.textContent = `@${entry.profile.username}`;
    } else {
      handle.textContent = abbreviateAddress(entry.player);
    }
    identityText.appendChild(handle);

    li.append(identityRoot);

    const scoreWrap = document.createElement("div");
    scoreWrap.className = "leaderboard-score";

    const scoreValue = document.createElement("span");
    scoreValue.className = "leaderboard-score-value";
    scoreValue.textContent = formatScore(entry.totalScore, entry.highScore);
    scoreWrap.appendChild(scoreValue);

    const scoreLabel = document.createElement("span");
    scoreLabel.className = "leaderboard-score-label";
    scoreLabel.textContent = "Total score";
    scoreWrap.appendChild(scoreLabel);

    const updateLabel = document.createElement("span");
    updateLabel.className = "leaderboard-updated";
    const relative = entry.lastUpdatedAt
      ? formatRelativeTime(entry.lastUpdatedAt)
      : formatTimestamp(entry.lastUpdate ?? entry.updatedAt);
    if (relative) {
      updateLabel.textContent = `Last update: ${relative}`;
      scoreWrap.appendChild(updateLabel);
    }

    li.append(scoreWrap);
    return li;
  };

  const renderRows = (items = []) => {
    if (topListEl) {
      topListEl.innerHTML = "";
    }
    if (restListEl) {
      restListEl.innerHTML = "";
    }
    if (scrollWrapper) {
      scrollWrapper.hidden = true;
    }
    if (!items.length) {
      statusEl.textContent = "No scores yet.";
      return null;
    }

    const effectiveItems = items.slice(0, limit);
    // First 10 shown prominently, rest 90 in scroller
    const topItems = effectiveItems.slice(0, 10);
    const restItems = effectiveItems.slice(10);

    if (topListEl) {
      const fragmentTop = document.createDocumentFragment();
      topItems.forEach((entry, index) => {
        fragmentTop.appendChild(createListItem(entry, index + 1));
      });
      topListEl.appendChild(fragmentTop);
    }

    if (restItems.length && restListEl && scrollWrapper) {
      const fragmentRest = document.createDocumentFragment();
      restItems.forEach((entry, index) => {
        const fallbackRank = 10 + index + 1;
        fragmentRest.appendChild(createListItem(entry, fallbackRank));
      });
      restListEl.appendChild(fragmentRest);
      scrollWrapper.hidden = false;
    }

    return {
      total: items.length,
      pinned: topItems.length,
      scrollable: restItems.length
    };
  };

  const renderError = (message) => {
    statusEl.textContent = message;
    if (topListEl) {
      topListEl.innerHTML = "";
    }
    if (restListEl) {
      restListEl.innerHTML = "";
    }
    if (scrollWrapper) {
      scrollWrapper.hidden = true;
    }
  };

  const loadLeaderboard = async () => {
    if (loading) return;
    if (!visible) return;
    loading = true;
    statusEl.textContent = "Updating leaderboard…";

    try {
      const response = await fetch(`/api/leaderboard?limit=${limit}`, {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const rendered = renderRows(Array.isArray(payload.items) ? payload.items : []);

      if (rendered) {
        const total = rendered.total ?? payload.items?.length ?? 0;
        const pinned = rendered.pinned ?? Math.min(total, 5);
        const scrollable = rendered.scrollable ?? Math.max(0, total - pinned);
        const updateText =
          (payload?.updatedAt && (formatRelativeTime(payload.updatedAt) || formatTimestamp(payload.updatedAt))) ||
          "-";
        statusEl.textContent = `Total: ${total} • Top ${pinned} pinned${
          scrollable ? ` • ${scrollable} scrollable` : ""
        } • Updated: ${updateText}`;
      }
    } catch (error) {
      console.error("[leaderboard-panel] load failed", error);
      const errorMsg = error?.message || String(error);
      // Provide more helpful error messages
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        renderError("Network error. Please check your connection and try again.");
      } else if (errorMsg.includes('429')) {
        renderError("Too many requests. Please wait a moment and refresh.");
      } else {
        renderError("Leaderboard is currently unavailable. Please try refreshing.");
      }
    } finally {
      loading = false;
    }
  };

  const startPolling = () => {
    stopPolling();
    if (!visible) return;
    timerId = window.setInterval(loadLeaderboard, 30000);
  };

  const stopPolling = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const setVisible = (value, options = {}) => {
    const shouldShow = Boolean(value);
    const reload = options.reload !== undefined ? options.reload : true;
    if (visible === shouldShow) {
      return;
    }
    visible = shouldShow;
    // Show panel immediately (synchronous)
    // Use display style instead of hidden attribute to work with flexbox
    if (visible) {
      panel.hidden = false;
      panel.style.display = 'flex';
    } else {
      panel.hidden = true;
      panel.style.display = 'none';
    }
    if (!visible) {
      stopPolling();
    } else {
      // Start polling immediately
      startPolling();
      // Load data in background (non-blocking)
      if (reload) {
        requestAnimationFrame(() => {
          loadLeaderboard();
        });
      }
    }
  };

  const init = () => {
    // Start with panel closed - Game Canvas should be visible first
    // Only show if explicitly requested via URL hash or user action
    if (typeof window.__BaseManLeaderboardDesiredVisible === "boolean") {
      visible = window.__BaseManLeaderboardDesiredVisible;
    } else {
      // Check URL hash for explicit leaderboard request
      const hash = window.location.hash.substring(1);
      visible = hash === 'leaderboard' || hash === 'pac';
    }
    // Use display style instead of hidden attribute to work with flexbox
    if (visible) {
      panel.hidden = false;
      panel.style.display = 'flex';
    } else {
      panel.hidden = true;
      panel.style.display = 'none';
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        if (!visible) {
          setVisible(true);
        }
        loadLeaderboard();
      });
    }

    // Close button event listener
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false, { reload: false });
        // Also update bottom nav state
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      });
      // Touch event for mobile
      closeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false, { reload: false });
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      }, { passive: false });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (!visible) return;
        loadLeaderboard();
        startPolling();
      } else {
        stopPolling();
      }
    });

    if (visible) {
      loadLeaderboard();
      startPolling();
    }
  };

  init();

  window.BaseManLeaderboard = {
    show() {
      window.__BaseManLeaderboardDesiredVisible = true;
      setVisible(true);
    },
    hide() {
      window.__BaseManLeaderboardDesiredVisible = false;
      setVisible(false, { reload: false });
    },
    setVisible(value) {
      window.__BaseManLeaderboardDesiredVisible = Boolean(value);
      setVisible(value);
    },
    refresh() {
      if (visible) {
        void loadLeaderboard();
      }
    }
  };

  if (typeof window.__BaseManLeaderboardDesiredVisible === "boolean") {
    window.BaseManLeaderboard.setVisible(window.__BaseManLeaderboardDesiredVisible);
  } else {
    window.__BaseManLeaderboardDesiredVisible = visible;
  }
})();
