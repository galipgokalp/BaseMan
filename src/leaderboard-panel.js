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

    // ============================================
    // PLATFORM-AGNOSTIC SEARCH MODAL
    // ============================================
    
    // Platform detection helpers
    const isIOS = () => {
      return typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !window.MSStream;
    };
    
    const isAndroid = () => {
      return typeof navigator !== "undefined" &&
        /Android/.test(navigator.userAgent);
    };
    
    // Visual viewport handler for keyboard detection
    let viewportHandler = null;
    
    // Debounce helper
    const debounce = (fn, delay) => {
      let timeoutId = null;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    };
    
    // Search DOM elements
    let searchModal = null;
    let searchInput = null;
    let searchResults = null;
    let searchClose = null;
    let searchClear = null;
    let searchSpinner = null;
    let searchBackdrop = null;
    
    // Search state
    let searchAbortController = null;
    let searchDebounced = null;
    let bodyScrollLocked = false;
    let originalBodyOverflow = '';
    let originalBodyPaddingRight = '';
    
    // Ensure search DOM is ready
    const ensureSearchDOM = () => {
      if (searchModal && searchInput) return true;
      
      searchModal = document.querySelector('[data-search-modal]');
      searchInput = document.querySelector('[data-search-input]');
      searchResults = document.querySelector('[data-search-results]');
      searchClose = document.querySelector('[data-search-close]');
      searchClear = document.querySelector('[data-search-clear]');
      searchBackdrop = document.querySelector('[data-search-backdrop]');
      
      // Find spinner (but keep it hidden - no spinner shown)
      const loadingEl = document.querySelector('[data-search-loading]');
      if (loadingEl) {
        searchSpinner = loadingEl.querySelector('.leaderboard-search-loading-spinner') || null;
        // Always keep loading container hidden (no spinner shown)
        loadingEl.hidden = true;
      }
      
      if (!searchModal || !searchInput) {
        console.warn('[leaderboard-panel] Search modal DOM not found');
        return false;
      }
      
      // Configure input attributes for mobile
      searchInput.setAttribute('autocapitalize', 'off');
      searchInput.setAttribute('autocomplete', 'off');
      searchInput.setAttribute('autocorrect', 'off');
      searchInput.setAttribute('spellcheck', 'false');
      searchInput.setAttribute('inputmode', 'search');
      searchInput.setAttribute('enterkeyhint', 'search');
      searchInput.style.fontSize = '16px'; // Prevent zoom on iOS
      
      return true;
    };
    
    // Body scroll lock
    const lockBodyScroll = () => {
      if (bodyScrollLocked) return;
      if (document.body) {
        originalBodyOverflow = document.body.style.overflow || '';
        originalBodyPaddingRight = document.body.style.paddingRight || '';
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        bodyScrollLocked = true;
      }
    };
    
    const unlockBodyScroll = () => {
      if (!bodyScrollLocked) return;
      if (document.body) {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
        bodyScrollLocked = false;
      }
    };
    
    // Attach visual viewport shim for keyboard detection
    const attachViewportShim = () => {
      if (!window.visualViewport || viewportHandler) return;
      
      const modalContent = searchModal?.querySelector('.leaderboard-search-modal-content');
      if (!modalContent) return;
      
      viewportHandler = () => {
        if (!modalContent) return;
        const vh = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const needsLift = vh < windowHeight * 0.8; // Keyboard open estimate
        modalContent.style.top = needsLift ? '6%' : '12%';
      };
      
      window.visualViewport.addEventListener('resize', viewportHandler);
      window.visualViewport.addEventListener('scroll', viewportHandler);
    };
    
    // Detach visual viewport shim
    const detachViewportShim = () => {
      if (!window.visualViewport || !viewportHandler) return;
      
      window.visualViewport.removeEventListener('resize', viewportHandler);
      window.visualViewport.removeEventListener('scroll', viewportHandler);
      viewportHandler = null;
      
      const modalContent = searchModal?.querySelector('.leaderboard-search-modal-content');
      if (modalContent) {
        modalContent.style.top = '';
      }
    };
    
    // Open search modal with immediate keyboard
    // CRITICAL: This function must be called from within a user gesture event handler
    // (click/touchend) to preserve user gesture context for keyboard opening
    const openSearchModal = () => {
      if (!ensureSearchDOM()) return;
      
      // Lock body scroll
      lockBodyScroll();
      
      // Clear input
      searchInput.value = '';
      if (searchClear) {
        searchClear.hidden = true;
      }
      
      // Clear results
      if (searchResults) {
        searchResults.innerHTML = '';
      }
      
      // Hide spinner (no persistent "SEARCHING")
      if (searchSpinner && searchSpinner.parentElement) {
        searchSpinner.parentElement.hidden = true;
      }
      
      // CRITICAL FIX 1: Remove hidden attribute FIRST to make modal visible
      // This ensures input is in the DOM and can receive focus
      searchModal.removeAttribute('hidden');
      
      // CRITICAL FIX 2: Prepare input immediately (remove readonly/disabled)
      searchInput.removeAttribute('readonly');
      searchInput.removeAttribute('disabled');
      searchInput.setAttribute('tabindex', '0');
      
      // CRITICAL FIX 3: Focus IMMEDIATELY while user gesture context is still active
      // This is the key to making keyboard open on iOS/Android
      // We do this BEFORE the animation starts
      if (isAndroid()) {
        // Android: click() before focus for webview compatibility
        try {
          searchInput.click();
        } catch (e) {}
      }
      
      if (isIOS()) {
        // iOS: Dispatch pointerdown event for reliable focus
        try {
          const ev = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
          searchInput.dispatchEvent(ev);
        } catch (e) {}
      }
      
      // Common focus (works for both platforms after platform-specific tricks)
      searchInput.focus({ preventScroll: true });
      try {
        const end = searchInput.value.length;
        searchInput.setSelectionRange(end, end);
      } catch (e) {}
      
      // CRITICAL FIX 4: Start animation AFTER focus (non-blocking)
      // This allows keyboard to open while modal animates
      requestAnimationFrame(() => {
        searchModal.classList.add('modal-open');
        
        // Retry focus after animation starts (for stubborn webviews)
        requestAnimationFrame(() => {
          if (document.activeElement !== searchInput) {
            if (isAndroid()) {
              try {
                searchInput.click();
              } catch (e) {}
            }
            if (isIOS()) {
              try {
                const ev = new PointerEvent('pointerdown', { bubbles: true });
                searchInput.dispatchEvent(ev);
              } catch (e) {}
            }
            searchInput.focus({ preventScroll: true });
          }
        });
        
        // Attach visual viewport shim for keyboard adjustment
        attachViewportShim();
      });
      
      // Wire live search
      wireLiveSearch();
      
      // Show empty state initially
      renderResults([]);
    };
    
    // Close search modal
    const closeSearchModal = () => {
      if (!searchModal) return;
      
      // Cancel any pending search
      if (searchAbortController) {
        searchAbortController.abort();
        searchAbortController = null;
      }
      
      // Detach viewport shim
      detachViewportShim();
      
      // Unlock body scroll
      unlockBodyScroll();
      
      // Hide modal
      searchModal.classList.remove('modal-open');
      
      // Clear input
      if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
      }
      
      // Clear results
      if (searchResults) {
        searchResults.innerHTML = '';
      }
      
      // Hide spinner
      if (searchSpinner && searchSpinner.parentElement) {
        searchSpinner.parentElement.hidden = true;
      }
      
      // Hide clear button
      if (searchClear) {
        searchClear.hidden = true;
      }
      
      // Wait for animation, then hide completely
      setTimeout(() => {
        searchModal.setAttribute('hidden', '');
        // Restore leaderboard if needed
        if (allEntries && allEntries.length > 0) {
          renderRows(allEntries);
        }
      }, 300);
    };
    
    // Render search results as rows (left: avatar + username/short address + platform, right: score)
    const renderResults = (filtered) => {
      if (!searchResults) return;
      
      if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="leaderboard-search-no-results">No users found</div>';
        return;
      }
      
      const fragment = document.createDocumentFragment();
      const resultsList = document.createElement('ol');
      resultsList.className = 'leaderboard-search-list';
      
      filtered.forEach((entry) => {
        const listItem = document.createElement('li');
        listItem.className = 'leaderboard-search-result-item';
        listItem.setAttribute('data-address', entry?.player || '');
        
        // Left: avatar + username/address + platform
        const leftEl = document.createElement('div');
        leftEl.className = 'leaderboard-search-result-left';
        
        // Avatar
        const avatar = document.createElement(entry?.profile?.profileUrl ? 'a' : 'div');
        avatar.className = 'leaderboard-search-result-avatar';
        if (entry?.profile?.profileUrl) {
          avatar.href = entry.profile.profileUrl;
          avatar.target = '_blank';
          avatar.rel = 'noopener noreferrer';
        }
        if (entry?.profile?.avatarUrl || entry?.player) {
          const img = document.createElement('img');
          img.src = entry?.profile?.avatarUrl || fallbackAvatar(entry.player);
          img.alt = entry?.profile?.username
            ? `@${entry.profile.username}`
            : entry?.profile?.displayName || abbreviateAddress(entry.player);
          img.loading = 'lazy';
          img.referrerPolicy = 'no-referrer';
          img.onerror = function() {
            this.style.display = 'none';
            avatar.textContent = '👾';
          };
          avatar.appendChild(img);
        } else {
          avatar.textContent = '👾';
        }
        
        // Name container
        const nameContainer = document.createElement('div');
        nameContainer.className = 'leaderboard-search-result-name-container';
        
        // Name
        const nameEl = document.createElement('div');
        nameEl.className = 'leaderboard-search-result-name';
        const name = entry?.profile?.username || entry?.profile?.displayName || abbreviateAddress(entry?.player || '');
        nameEl.textContent = name || 'Unknown';
        
        // Platform logo (if available)
        const platform = entry?.profile?.platform;
        if (platform === 'farcaster' || platform === 'base-app') {
          const platformLogo = document.createElement('span');
          platformLogo.className = `leaderboard-platform-logo leaderboard-platform-logo-${platform}`;
          platformLogo.setAttribute('title', platform === 'farcaster' ? 'Farcaster' : 'Base App');
          platformLogo.setAttribute('aria-label', platform === 'farcaster' ? 'Farcaster' : 'Base App');
          nameContainer.appendChild(nameEl);
          nameContainer.appendChild(platformLogo);
        } else {
          nameContainer.appendChild(nameEl);
        }
        
        leftEl.appendChild(avatar);
        leftEl.appendChild(nameContainer);
        
        // Right: score (use totalScore or highScore, same as createListItem)
        const rightEl = document.createElement('div');
        rightEl.className = 'leaderboard-search-result-right';
        const score = entry?.totalScore ?? entry?.highScore ?? 0;
        rightEl.textContent = formatScore(score, entry?.highScore);
        
        listItem.appendChild(leftEl);
        listItem.appendChild(rightEl);
        
        // Click handler to scroll to user
        listItem.addEventListener('click', () => {
          const address = entry?.player;
          if (address) {
            closeSearchModal();
            setTimeout(() => {
              const allItems = [...(topListEl?.querySelectorAll('.leaderboard-item') || []), 
                                ...(restListEl?.querySelectorAll('.leaderboard-item') || [])];
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
            }, 250);
          }
        }, { passive: true });
        
        resultsList.appendChild(listItem);
      });
      
      fragment.appendChild(resultsList);
      searchResults.innerHTML = '';
      searchResults.appendChild(fragment);
    };
    
    // Live search with debounce and AbortController
    const performLiveSearch = (query) => {
      if (!searchResults) return;
      
      // Cancel previous search
      if (searchAbortController) {
        searchAbortController.abort();
      }
      searchAbortController = new AbortController();
      
      const trimmedQuery = query.trim();
      
      // Clear results if empty
      if (!trimmedQuery) {
        searchResults.innerHTML = '';
        return;
      }
      
      // Spinner is always hidden (no loading indicator shown)
      
      // Perform search (synchronous filtering, but using AbortController pattern for future async)
      const signal = searchAbortController.signal;
      
      // Use requestAnimationFrame to allow abort
      requestAnimationFrame(() => {
        if (signal.aborted) return;
        
        if (!allEntries || !Array.isArray(allEntries) || allEntries.length === 0) {
          if (signal.aborted) return;
          searchResults.innerHTML = '<div class="leaderboard-search-no-results">No entries available</div>';
          return;
        }
        
        const searchTerm = trimmedQuery.toLowerCase();
        const filtered = allEntries.filter(entry => {
          if (signal.aborted) return false;
          const username = entry?.profile?.username?.toLowerCase() || '';
          const displayName = entry?.profile?.displayName?.toLowerCase() || '';
          const address = entry?.player?.toLowerCase() || '';
          const abbreviatedAddress = abbreviateAddress(entry?.player || '').toLowerCase();
          
          return username.includes(searchTerm) || 
                 displayName.includes(searchTerm) || 
                 address.includes(searchTerm) ||
                 abbreviatedAddress.includes(searchTerm);
        });
        
        if (signal.aborted) return;
        
        renderResults(filtered);
      });
    };
    
    // Wire live search with debounce
    const wireLiveSearch = () => {
      if (!searchInput) return;
      
      // Create debounced search function (120ms)
      searchDebounced = debounce((query) => {
        performLiveSearch(query);
      }, 120);
      
      // Input event listener
      searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Show/hide clear button
        if (searchClear) {
          searchClear.hidden = !value || value.trim() === '';
        }
        
        // Trigger debounced search
        searchDebounced(value);
      });
      
      // Keyboard events
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeSearchModal();
        }
      });
    };
    
    // Wire search button
    const searchBtn = panel.querySelector('[data-search-btn]');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSearchModal();
      });
      searchBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSearchModal();
      }, { passive: false });
    }
    
    // Wire close button
    if (ensureSearchDOM() && searchClose) {
      searchClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSearchModal();
      });
      searchClose.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSearchModal();
      }, { passive: false });
    }
    
    // Wire clear button
    if (searchClear) {
      searchClear.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          searchClear.hidden = true;
          if (searchDebounced) {
            searchDebounced('');
          }
        }
      });
    }
    
    // Wire backdrop click
    if (searchBackdrop) {
      searchBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSearchModal();
      });
    }
    
    // Wire modal background click (fallback)
    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
          closeSearchModal();
        }
      });
    }
    
    // Wire live search
    if (ensureSearchDOM()) {
      wireLiveSearch();
    }
    
    // Global Escape key handler
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
