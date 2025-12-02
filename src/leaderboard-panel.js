(() => {
  const panel = document.getElementById("leaderboard-panel");
  if (!panel) return;

  const statusEl = panel.querySelector("[data-status]");
  const topListEl = panel.querySelector("[data-list-top]");
  const restListEl = panel.querySelector("[data-list-rest]");
  const scrollWrapper = panel.querySelector("[data-scroll-wrapper]");
  const limit = Number(panel.dataset.limit || "10");

  let loading = false;
  let timerId = null;
  let allEntries = []; // Store all entries for search functionality
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
    // String'den number'a çevir
    let numValue = null;
    if (typeof value === "number" && Number.isFinite(value)) {
      numValue = value;
    } else if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        numValue = parsed;
      }
    }
    
    // Number değilse fallback kullan
    if (numValue === null) {
      if (typeof fallback === "string") return fallback;
      if (typeof value === "string") return value;
      return "0";
    }
    
    // Kompakt format (54K, 1.5M)
    if (numValue >= 1000000) {
      const millions = numValue / 1000000;
      // 1.0M gibi göster, gereksiz .0'ları kaldır
      return millions % 1 === 0 
        ? `${millions.toFixed(0)}M`
        : `${millions.toFixed(1)}M`;
    } else if (numValue >= 1000) {
      const thousands = numValue / 1000;
      // 54K gibi göster
      return thousands % 1 === 0
        ? `${thousands.toFixed(0)}K`
        : `${thousands.toFixed(1)}K`;
    } else {
      // 1000'den küçük: normal göster
      return numValue.toLocaleString("en-US");
    }
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

    // Rank
    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    const rankValue =
      typeof entry.rank === "number" && Number.isFinite(entry.rank) ? entry.rank : fallbackRank;
    rank.textContent = `${rankValue}`; // Removed # symbol
    li.append(rank);

    // Avatar (moved outside identityRoot, directly in li)
    const avatar = document.createElement(entry?.profile?.profileUrl ? "a" : "div");
    avatar.className = "leaderboard-avatar";
    if (entry?.profile?.profileUrl) {
      avatar.href = entry.profile.profileUrl;
      avatar.target = "_blank";
      avatar.rel = "noopener noreferrer";
    }
    if (entry?.profile?.avatarUrl || entry?.player) {
      const img = document.createElement("img");
      img.src = entry?.profile?.avatarUrl || fallbackAvatar(entry.player);
      img.alt =
        entry?.profile?.username
          ? `@${entry.profile.username}`
          : entry?.profile?.displayName || abbreviateAddress(entry.player);
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.onerror = function() {
        // Fallback to emoji if image fails to load
        this.style.display = 'none';
        avatar.textContent = "👾";
      };
      avatar.appendChild(img);
    } else {
      avatar.textContent = "👾";
    }
    li.append(avatar);

    // Username Container (text only, no avatar)
    const identityRoot = document.createElement(entry?.profile?.profileUrl ? "a" : "div");
    identityRoot.className = "leaderboard-identity";
    if (entry?.profile?.profileUrl) {
      identityRoot.href = entry.profile.profileUrl;
      identityRoot.target = "_blank";
      identityRoot.rel = "noopener noreferrer";
    }

    // Username
    const identityText = document.createElement("div");
    identityText.className = "leaderboard-text";
    const name = document.createElement("span");
    name.className = "leaderboard-name";
    const displayName = entry?.profile?.displayName || entry?.profile?.username || abbreviateAddress(entry.player);
    name.textContent = displayName || "Unknown";
    identityText.appendChild(name);
    
    // Platform logo (if available)
    // Optimized: Using CSS background-image instead of inline SVG for better performance
    const platform = entry?.profile?.platform;
    console.log('[leaderboard-panel] Entry platform for', entry?.profile?.username || entry?.player, ':', platform);
    if (platform === 'farcaster' || platform === 'base-app') {
      const platformLogo = document.createElement("span");
      platformLogo.className = `leaderboard-platform-logo leaderboard-platform-logo-${platform}`;
      platformLogo.setAttribute("title", platform === 'farcaster' ? 'Farcaster' : 'Base App');
      platformLogo.setAttribute("aria-label", platform === 'farcaster' ? 'Farcaster' : 'Base App');
      // Logo is rendered via CSS background-image for better performance
      // SVG is defined once in CSS and cached by browser
      
      identityText.appendChild(platformLogo);
    } else if (entry?.profile) {
      // Debug: Log when profile exists but platform is missing
      console.warn('[leaderboard-panel] Profile exists but platform is missing:', {
        username: entry.profile.username,
        displayName: entry.profile.displayName,
        platform: entry.profile.platform,
        provider: entry.profile.provider
      });
    }
    
    identityRoot.appendChild(identityText);

    li.append(identityRoot);

    // Total Score
    const scoreWrap = document.createElement("div");
    scoreWrap.className = "leaderboard-score";
    const scoreValue = document.createElement("span");
    scoreValue.className = "leaderboard-score-value";
    scoreValue.textContent = formatScore(entry.totalScore, entry.highScore);
    scoreWrap.appendChild(scoreValue);
    li.append(scoreWrap);

    return li;
  };

  const showDebugInfo = (debugInfo) => {
    let debugEl = panel.querySelector('[data-debug-info]');
    if (!debugEl) {
      debugEl = document.createElement('div');
      debugEl.setAttribute('data-debug-info', '');
      debugEl.style.cssText = `
        margin-top: 16px;
        padding: 12px;
        background: rgba(0,0,0,0.1);
        border-radius: 8px;
        font-family: monospace;
        font-size: 11px;
        max-height: 200px;
        overflow-y: auto;
        color: #666;
        border: 1px solid rgba(0,0,0,0.1);
      `;
      panel.appendChild(debugEl);
    }
    
    const info = [];
    info.push(`🔍 DEBUG MODE`);
    if (debugInfo.headerReceived !== undefined) {
      info.push(`Header: ${debugInfo.headerReceived ? '✅ Received' : '❌ Not received'}`);
    }
    if (debugInfo.mappingCount !== undefined) {
      info.push(`Mappings: ${debugInfo.mappingCount}`);
    }
    if (debugInfo.addressesRequested !== undefined) {
      info.push(`Addresses: ${debugInfo.addressesRequested}`);
    }
    if (debugInfo.profilesFound !== undefined) {
      info.push(`Profiles: ${debugInfo.profilesFound}`);
    }
    if (debugInfo.profileDetails) {
      info.push('');
      info.push('Profile Details:');
      debugInfo.profileDetails.forEach(detail => {
        const hasProfile = detail.hasProfile ? '✅' : '❌';
        const user = detail.username ? `@${detail.username}` : detail.address;
        info.push(`  ${hasProfile} ${user.substring(0, 20)}${detail.fid ? ` (FID: ${detail.fid})` : ''}`);
      });
    }
    if (debugInfo.error) {
      info.push('');
      info.push(`❌ Error: ${debugInfo.error}`);
    }
    
    debugEl.textContent = info.join('\n');
    debugEl.style.display = 'block';
  };

  const hideDebugInfo = () => {
    const debugEl = panel.querySelector('[data-debug-info]');
    if (debugEl) {
      debugEl.style.display = 'none';
    }
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
    statusEl.textContent = "";
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
    statusEl.textContent = "";

    try {
      // Determine chain ID for leaderboard:
      // 1. Use chain from BaseManOnchainConfig if available
      // 2. Default to Base Mainnet (8453) for production use
      // Base Mainnet is the primary network for score tracking
      let chainId = 8453; // Default to Base Mainnet
      try {
        const config = window.BaseManOnchainConfig;
        if (config && config.chainId) {
          const configChainId = Number(config.chainId);
          // Only use config chain if it's a valid Base network
          if (configChainId === 8453 || configChainId === 84532) {
            chainId = configChainId;
          }
        }
      } catch (error) {
        console.warn('[leaderboard-panel] Failed to get chain ID from config:', error);
        // Keep default (Base Mainnet)
      }
      
      // For production, always use Base Mainnet (8453) to show main network scores
      // Users can still see Sepolia scores by switching network in Profile panel
      // But default Leaderboard shows Base Mainnet scores
      const leaderboardChainId = 8453; // Always use Base Mainnet for leaderboard
      
      // Get current user's profile mapping if available (for same request enrichment)
      // Use same simple approach as profile-panel.js
      let profileMappingHeader = null;
      
      // Get address from BaseManOnchain (same as profile-panel.js)
      let address = null;
      let user = null;
      let platform = null; // Will be set via clientFid (official method) or fallback detection
      
      try {
        // Wait for BaseManOnchain wallet to be ready (with retry mechanism)
        const maxWalletRetries = 10;
        const walletDelayMs = 200;
        
        for (let i = 0; i < maxWalletRetries; i++) {
          if (window.BaseManOnchain) {
            const isWalletReady = window.BaseManOnchain?.isWalletReady?.();
            if (isWalletReady) {
              address = window.BaseManOnchain?.getWalletAddress?.() || null;
              if (address) {
                console.log('[leaderboard-panel] Got address from BaseManOnchain (attempt ' + (i + 1) + '):', address.substring(0, 10) + '...');
                break; // Found address, exit loop
              }
            }
          }
          
          // Wait before retrying (except on last attempt)
          if (i < maxWalletRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, walletDelayMs));
          }
        }
        
        // Get SDK context (same simple approach as profile-panel.js)
        if (window.sdk && window.sdk.context) {
          try {
            const context = await window.sdk.context;
            user = context?.user;
            
            // OFFICIAL METHOD: Check clientFid for platform detection (per Base App docs)
            // Base App clientFid is 309857, Farcaster clientFid is typically 9152 (Warpcast)
            if (context?.client?.clientFid === 309857) {
              console.log('[leaderboard-panel] ✅ Base App detected via clientFid (309857) - OFFICIAL METHOD');
              platform = 'base-app';
            } else if (context?.client?.clientFid) {
              // If clientFid exists but is not 309857, it's Farcaster
              console.log('[leaderboard-panel] ✅ Farcaster detected via clientFid (' + context.client.clientFid + ') - OFFICIAL METHOD');
              platform = 'farcaster';
            }
          } catch (ctxErr) {
            // SDK context not available
          }
        }
      } catch (err) {
        // Error getting profile data - log for debugging
        console.warn('[leaderboard-panel] Error getting profile data:', err);
      }
      
      // Debug: Log what we have (always log, even if mapping fails)
      console.log('[leaderboard-panel] Profile mapping check:', {
        hasBaseManOnchain: !!window.BaseManOnchain,
        isWalletReady: !!window.BaseManOnchain?.isWalletReady?.(),
        hasAddress: !!address,
        hasSDK: !!window.sdk,
        hasSDKContext: !!(window.sdk && window.sdk.context),
        hasUser: !!user,
        hasFid: !!user?.fid,
        address: address ? address.substring(0, 10) + '...' : null
      });
      
      // If we have both address and user with FID, send mapping
      if (address && user && user.fid) {
        try {
          // OFFICIAL METHOD: Platform detection via clientFid (per Base App docs)
          // If platform was not detected via clientFid, use centralized utility
          if (!platform) {
            console.log('[leaderboard-panel] Platform not detected via clientFid, using centralized utility...');
            try {
              if (typeof window.getPlatform === 'function') {
                platform = await window.getPlatform();
                // Convert 'base' to 'base-app' for consistency
                if (platform === 'base') {
                  platform = 'base-app';
                }
                console.log('[leaderboard-panel] Platform detected via centralized utility:', platform);
              } else {
                console.warn('[leaderboard-panel] getPlatform() not available, platform will be null');
              }
            } catch (err) {
              console.error('[leaderboard-panel] Error using centralized platform detection:', err);
            }
          }
          
          console.log('[leaderboard-panel] 🎯 Final detected platform:', platform);
          
          const mappingData = {
            address: address.toLowerCase(),
            fid: user.fid,
            username: user.username || null,
            displayName: user.displayName || null,
            avatarUrl: user.pfpUrl || null,
            platform: platform || null
          };
          
          console.log('[leaderboard-panel] Sending profile mapping:', mappingData);
          
          // Send mapping immediately before leaderboard request
          await fetch('/api/leaderboard?action=profile-mapping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mappingData)
          }).catch((err) => {
            console.warn('[leaderboard-panel] Profile mapping POST failed:', err);
          });
          
          // Also include in header for same request
          profileMappingHeader = JSON.stringify({
            [address.toLowerCase()]: {
              fid: user.fid,
              username: user.username || null,
              displayName: user.displayName || null,
              avatarUrl: user.pfpUrl || null,
              platform: platform || null
            }
          });
          console.log('[leaderboard-panel] Profile mapping header prepared with platform:', platform);
        } catch (mappingErr) {
          console.warn('[leaderboard-panel] Error creating profile mapping:', mappingErr);
        }
      } else {
        console.log('[leaderboard-panel] Skipping profile mapping - missing data:', {
          hasAddress: !!address,
          hasUser: !!user,
          hasFid: !!user?.fid
        });
      }
      
      const headers = { Accept: "application/json" };
      if (profileMappingHeader) {
        headers['X-Profile-Mapping'] = profileMappingHeader;
        console.log('[leaderboard-panel] Sending leaderboard request with profile mapping header');
      } else {
        console.warn('[leaderboard-panel] No profile mapping header to send');
      }
      
      // Check for debug mode (from URL hash or localStorage)
      const urlHash = window.location.hash || '';
      const isDebugMode = urlHash.includes('debug=1') || localStorage.getItem('baseManDebug') === '1';
      
      const apiUrl = `/api/leaderboard?limit=${limit}&chain=${leaderboardChainId}${isDebugMode ? '&debug=1' : ''}`;
      console.log('[leaderboard-panel] Fetching leaderboard from:', apiUrl);
      const response = await fetch(apiUrl, {
        headers,
        cache: "no-store"
      });

      console.log('[leaderboard-panel] API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[leaderboard-panel] API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const payload = await response.json();
      console.log('[leaderboard-panel] API payload:', {
        source: payload.source,
        chainId: payload.chainId,
        count: payload.count,
        itemsCount: Array.isArray(payload.items) ? payload.items.length : 0,
        hasDebug: !!payload._debug,
        sampleItem: payload.items?.[0] || null
      });
      
      const items = Array.isArray(payload.items) ? payload.items : [];
      console.log('[leaderboard-panel] Processing', items.length, 'items');
      allEntries = items; // Store entries for search
      const rendered = renderRows(items);
      
      // Show debug info if available
      if (isDebugMode && payload._debug) {
        showDebugInfo(payload._debug);
      } else {
        hideDebugInfo();
      }

      if (rendered) {
        statusEl.textContent = "";
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
    // Auto-refresh every 15 seconds in background (non-blocking)
    timerId = window.setInterval(() => {
      if (visible && document.visibilityState === 'visible') {
        // Only update if panel is visible and page is active
        requestAnimationFrame(() => {
          loadLeaderboard();
        });
      }
    }, 15000);
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
    
    // Always update if value changed, regardless of DOM state
    // This ensures the panel opens even if hidden attribute was already removed
    if (visible === shouldShow && !options.force) {
      // Only skip if state matches and not forced
      // But still ensure DOM is in sync
      const isCurrentlyHidden = panel.hasAttribute('hidden');
      const hasOpenClass = panel.classList.contains('open');
      if (isCurrentlyHidden === !shouldShow && hasOpenClass === shouldShow) {
        return;
      }
    }
    
    visible = shouldShow;
    // Show panel immediately (synchronous)
    // Use both hidden attribute and open class for consistency with other panels
    if (visible) {
      panel.removeAttribute('hidden');
      panel.classList.add('open');
    } else {
      panel.setAttribute('hidden', '');
      panel.classList.remove('open');
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
    // Use both hidden attribute and open class for consistency with other panels
    if (visible) {
      panel.removeAttribute('hidden');
      panel.classList.add('open');
    } else {
      panel.setAttribute('hidden', '');
      panel.classList.remove('open');
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

    // Search functionality - Enhanced with better UX
    const searchBtn = panel.querySelector('[data-search-btn]');
    const searchModal = document.querySelector('[data-search-modal]');
    const searchInput = document.querySelector('[data-search-input]');
    const searchResults = document.querySelector('[data-search-results]');
    const searchClose = document.querySelector('[data-search-close]');
    const searchClear = document.querySelector('[data-search-clear]');
    const searchLoading = document.querySelector('[data-search-loading]');
    const recentSearches = document.querySelector('[data-recent-searches]');
    
    // Search state
    let searchTimeout = null;
    let isSearching = false;
    let selectedResultIndex = -1;
    let currentSearchResults = [];
    const MAX_RECENT_SEARCHES = 5;
    const SEARCH_DEBOUNCE = 200; // Faster response (200ms instead of 300ms)
    
    // Recent searches storage
    const getRecentSearches = () => {
      try {
        const stored = localStorage.getItem('baseman_recent_searches');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    };
    
    const saveRecentSearch = (query) => {
      if (!query || !query.trim()) return;
      try {
        const recent = getRecentSearches();
        const trimmed = query.trim();
        // Remove if already exists
        const filtered = recent.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
        // Add to beginning
        filtered.unshift(trimmed);
        // Keep only MAX_RECENT_SEARCHES
        const limited = filtered.slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem('baseman_recent_searches', JSON.stringify(limited));
      } catch {
        // Ignore storage errors
      }
    };
    
    const renderRecentSearches = () => {
      if (!recentSearches) return;
      const recent = getRecentSearches();
      if (recent.length === 0) {
        recentSearches.innerHTML = '';
        recentSearches.hidden = true;
        return;
      }
      
      recentSearches.hidden = false;
      const fragment = document.createDocumentFragment();
      const list = document.createElement('div');
      list.className = 'leaderboard-recent-searches-list';
      
      recent.forEach((query, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'leaderboard-recent-search-item';
        item.textContent = query;
        item.addEventListener('click', () => {
          if (searchInput) {
            searchInput.value = query;
            searchInput.focus();
            performSearch(query);
          }
        });
        list.appendChild(item);
      });
      
      fragment.appendChild(list);
      recentSearches.innerHTML = '';
      recentSearches.appendChild(fragment);
    };
    
    // Highlight search term in text
    const highlightText = (text, searchTerm) => {
      if (!searchTerm || !text) return text;
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };
    
    // Ensure modal is closed on initialization
    if (searchModal) {
      searchModal.setAttribute('hidden', '');
      searchModal.classList.remove('modal-open');
    }
    
    // Prepare input for mobile keyboard - ensure it's always ready
    if (searchInput) {
      // Set inputmode for better mobile keyboard
      searchInput.setAttribute('inputmode', 'text');
      searchInput.setAttribute('autocomplete', 'off');
      // Ensure input is not readonly initially
      searchInput.removeAttribute('readonly');
    }

    const openSearchModal = (userEvent = null) => {
      if (!searchModal || !searchInput) {
        console.warn('[leaderboard-panel] Cannot open modal: searchModal or searchInput missing');
        return;
      }
      
      // CRITICAL: Prepare input FIRST, before opening modal
      // This ensures input is ready when modal opens
      searchInput.removeAttribute('readonly');
      searchInput.removeAttribute('disabled');
      searchInput.setAttribute('tabindex', '0');
      
      // Remove hidden attribute and add open class for animation
      searchModal.removeAttribute('hidden');
      searchModal.classList.add('modal-open');
      
      // Show recent searches if input is empty
      if (!searchInput.value || !searchInput.value.trim()) {
        renderRecentSearches();
      }
      
      // CRITICAL FOR iOS: Focus must happen SYNCHRONOUSLY while user interaction is valid
      // No setTimeout, no requestAnimationFrame - must be immediate
      // iOS Safari only allows programmatic keyboard opening during user interaction
      
      // Step 1: iOS Safari readonly trick (MUST be first, synchronous)
      searchInput.setAttribute('readonly', 'readonly');
      void searchInput.offsetHeight; // Force reflow
      searchInput.removeAttribute('readonly');
      
      // Step 2: Focus immediately (while user interaction is still valid)
      searchInput.focus();
      
      // Step 3: Set selection to trigger keyboard (helps on iOS)
      if (searchInput.setSelectionRange) {
        const len = searchInput.value.length;
        searchInput.setSelectionRange(len, len);
      }
      
      // Step 4: Click as backup (preserves user interaction chain)
      if (document.activeElement !== searchInput) {
        searchInput.click();
        searchInput.focus();
      }
    };

    const closeSearchModal = () => {
      if (!searchModal) return;
      
      // Remove open class for closing animation
      searchModal.classList.remove('modal-open');
      
      // Clear search state immediately
      if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
      }
      if (searchClear) {
        searchClear.hidden = true;
      }
      if (searchResults) {
        searchResults.innerHTML = '';
      }
      if (recentSearches) {
        recentSearches.hidden = true;
      }
      if (searchLoading) {
        searchLoading.hidden = true;
      }
      selectedResultIndex = -1;
      currentSearchResults = [];
      
      // Wait for animation, then hide completely
      setTimeout(() => {
        searchModal.setAttribute('hidden', '');
        if (allEntries && allEntries.length > 0) {
          renderRows(allEntries);
        }
      }, 200); // Match CSS animation duration
      
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
      }
    };
    
    // Scroll to user in leaderboard
    const scrollToUser = (address) => {
      if (!address) return;
      closeSearchModal();
      
      // Wait for modal to close, then scroll
      setTimeout(() => {
        const allItems = [...(topListEl?.querySelectorAll('.leaderboard-item') || []), 
                          ...(restListEl?.querySelectorAll('.leaderboard-item') || [])];
        const targetItem = Array.from(allItems).find(item => {
          const itemAddress = item.dataset.address || item.querySelector('[data-address]')?.dataset.address;
          return itemAddress && itemAddress.toLowerCase() === address.toLowerCase();
        });
        
        if (targetItem) {
          targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight briefly
          targetItem.classList.add('leaderboard-item-highlight');
          setTimeout(() => {
            targetItem.classList.remove('leaderboard-item-highlight');
          }, 2000);
        }
      }, 250);
    };

    const performSearch = (query) => {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Hide recent searches when typing
      if (recentSearches) {
        recentSearches.hidden = true;
      }
      
      // Show loading state
      if (searchLoading && query && query.trim()) {
        searchLoading.hidden = false;
        isSearching = true;
      }
      
      // Debounce search
      searchTimeout = setTimeout(() => {
        isSearching = false;
        if (searchLoading) {
          searchLoading.hidden = true;
        }
        
        if (!query || !query.trim()) {
          // Show recent searches when empty
          renderRecentSearches();
          if (searchResults) {
            searchResults.innerHTML = '';
          }
          selectedResultIndex = -1;
          currentSearchResults = [];
          return;
        }

        // Ensure allEntries is available
        if (!allEntries || !Array.isArray(allEntries) || allEntries.length === 0) {
          if (searchResults) {
            searchResults.innerHTML = '<div class="leaderboard-search-no-results">No entries available</div>';
          }
          selectedResultIndex = -1;
          currentSearchResults = [];
          return;
        }

        const searchTerm = query.trim().toLowerCase();
        const filtered = allEntries.filter(entry => {
          const username = entry?.profile?.username?.toLowerCase() || '';
          const displayName = entry?.profile?.displayName?.toLowerCase() || '';
          const address = entry?.player?.toLowerCase() || '';
          const abbreviatedAddress = abbreviateAddress(entry?.player || '').toLowerCase();
          
          return username.includes(searchTerm) || 
                 displayName.includes(searchTerm) || 
                 address.includes(searchTerm) ||
                 abbreviatedAddress.includes(searchTerm);
        });

        currentSearchResults = filtered;
        selectedResultIndex = -1;

        if (filtered.length === 0) {
          if (searchResults) {
            searchResults.innerHTML = '<div class="leaderboard-search-no-results">No users found</div>';
          }
        } else {
          // Save to recent searches
          saveRecentSearch(query);
          
          // Render results with highlighting
          if (searchResults) {
            const fragment = document.createDocumentFragment();
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'leaderboard-search-results-container';
            
            // Count header
            const countHeader = document.createElement('div');
            countHeader.className = 'leaderboard-search-count';
            countHeader.textContent = `Found ${filtered.length} user${filtered.length !== 1 ? 's' : ''}`;
            resultsContainer.appendChild(countHeader);
            
            // Results list
            const resultsList = document.createElement('ol');
            resultsList.className = 'leaderboard-search-list';
            
            const listFragment = document.createDocumentFragment();
            filtered.forEach((entry, index) => {
              const listItem = createListItem(entry, index + 1);
              listItem.setAttribute('data-result-index', index);
              listItem.setAttribute('data-address', entry?.player || '');
              
              // Add click handler to scroll to user
              listItem.addEventListener('click', () => {
                scrollToUser(entry?.player);
              });
              
              // Highlight search term in username/displayName
              const nameEl = listItem.querySelector('.leaderboard-item-name');
              if (nameEl && searchTerm) {
                const originalText = nameEl.textContent;
                nameEl.innerHTML = highlightText(originalText, searchTerm);
              }
              
              listFragment.appendChild(listItem);
            });
            resultsList.appendChild(listFragment);
            resultsContainer.appendChild(resultsList);
            fragment.appendChild(resultsContainer);
            
            searchResults.innerHTML = '';
            searchResults.appendChild(fragment);
          }
        }
      }, SEARCH_DEBOUNCE);
    };

    // Keyboard navigation for search results
    const handleKeyboardNavigation = (e) => {
      if (!searchResults || currentSearchResults.length === 0) return;
      
      const resultItems = searchResults.querySelectorAll('[data-result-index]');
      if (resultItems.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedResultIndex = Math.min(selectedResultIndex + 1, resultItems.length - 1);
        updateSelectedResult(resultItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
        updateSelectedResult(resultItems);
      } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
        e.preventDefault();
        const selectedItem = resultItems[selectedResultIndex];
        if (selectedItem) {
          const address = selectedItem.getAttribute('data-address');
          scrollToUser(address);
        }
      }
    };
    
    const updateSelectedResult = (resultItems) => {
      resultItems.forEach((item, index) => {
        if (index === selectedResultIndex) {
          item.classList.add('leaderboard-search-result-selected');
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          item.classList.remove('leaderboard-search-result-selected');
        }
      });
    };

    if (searchBtn) {
      const handleSearchClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Pass the original event to preserve user interaction
        // This is critical for iOS Safari to allow programmatic keyboard opening
        openSearchModal(e);
      };
      
      searchBtn.addEventListener('click', handleSearchClick);
      searchBtn.addEventListener('touchend', handleSearchClick, { passive: false });
    }

    if (searchClose) {
      const handleClose = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        closeSearchModal();
      };
      
      searchClose.addEventListener('click', handleClose);
      searchClose.addEventListener('touchend', handleClose, { passive: false });
    }

    if (searchInput) {
      searchInput.removeAttribute('readonly');
      searchInput.removeAttribute('disabled');
      searchInput.setAttribute('tabindex', '0');
      
      // Input event
      searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (searchClear) {
          searchClear.hidden = !value || value.trim() === '';
        }
        performSearch(value);
      });

      // Keyboard events
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeSearchModal();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
          handleKeyboardNavigation(e);
        }
      });
    }

    // Clear button
    if (searchClear) {
      searchClear.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          searchClear.hidden = true;
          performSearch('');
          renderRecentSearches();
        }
      });
    }

    // Close modal when clicking outside
    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
          closeSearchModal();
        }
      });
    }
    
    // Close on Escape key (global)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal && !searchModal.hasAttribute('hidden')) {
        closeSearchModal();
      }
    });

    if (visible) {
      loadLeaderboard();
      startPolling();
    }
  };

  init();

  // Export API early to avoid "API not available" warnings
  window.BaseManLeaderboard = {
    show() {
      window.__BaseManLeaderboardDesiredVisible = true;
      setVisible(true);
    },
    hide() {
      window.__BaseManLeaderboardDesiredVisible = false;
      setVisible(false, { reload: false });
    },
    setVisible(value, options = {}) {
      window.__BaseManLeaderboardDesiredVisible = Boolean(value);
      setVisible(value, options);
    },
    refresh() {
      if (visible) {
        void loadLeaderboard();
      }
    }
  };
  
  console.log('[leaderboard-panel] BaseManLeaderboard API exported');

  if (typeof window.__BaseManLeaderboardDesiredVisible === "boolean") {
    window.BaseManLeaderboard.setVisible(window.__BaseManLeaderboardDesiredVisible);
  } else {
    window.__BaseManLeaderboardDesiredVisible = visible;
  }
})();
