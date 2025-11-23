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
          // Detect platform (farcaster, base-app, or web)
          // IMPORTANT: Check Farcaster FIRST before Base App
          // because both platforms might have similar indicators
          const platform = (() => {
            try {
              console.log('[leaderboard-panel] Starting platform detection...');
              
              // Step 1: Check for Farcaster SDK indicators (PRIORITY)
              const hasFarcasterSDK = Boolean(
                window.fc?.miniapp || 
                window.farcaster?.miniapp || 
                window.MiniAppSDK ||
                window.FarcasterMiniAppSDK
              );
              console.log('[leaderboard-panel] Farcaster SDK check:', {
                hasFc: !!window.fc?.miniapp,
                hasFarcaster: !!window.farcaster?.miniapp,
                hasMiniAppSDK: !!window.MiniAppSDK,
                hasFarcasterMiniAppSDK: !!window.FarcasterMiniAppSDK,
                result: hasFarcasterSDK
              });
              
              if (hasFarcasterSDK) {
                console.log('[leaderboard-panel] ✅ Farcaster detected via SDK');
                return 'farcaster';
              }
              
              // Step 2: Use centralized platform detection function
              if (typeof window !== 'undefined' && typeof window.getPlatform === 'function') {
                const p = window.getPlatform();
                console.log('[leaderboard-panel] getPlatform() returned:', p);
                if (p === 'farcaster') {
                  console.log('[leaderboard-panel] ✅ Farcaster detected via getPlatform()');
                  return 'farcaster';
                }
                if (p === 'base') {
                  console.log('[leaderboard-panel] ✅ Base App detected via getPlatform()');
                  return 'base-app';
                }
              }
              
              // Step 3: Use platform detection helper functions
              if (window.isFarcasterMiniApp && typeof window.isFarcasterMiniApp === 'function') {
                const isFarcaster = window.isFarcasterMiniApp();
                console.log('[leaderboard-panel] isFarcasterMiniApp() returned:', isFarcaster);
                if (isFarcaster) {
                  console.log('[leaderboard-panel] ✅ Farcaster detected via isFarcasterMiniApp()');
                  return 'farcaster';
                }
              }
              
              // Step 4: Check for Base App indicators (ONLY if Farcaster not detected)
              if (window.isBaseApp && typeof window.isBaseApp === 'function') {
                const isBase = window.isBaseApp();
                console.log('[leaderboard-panel] isBaseApp() returned:', isBase);
                if (isBase) {
                  console.log('[leaderboard-panel] ✅ Base App detected via isBaseApp()');
                  return 'base-app';
                }
              }
              
              // Step 5: Additional Base App SDK checks (ONLY if Farcaster not detected)
              if (window.MiniKit || window.ReactNativeWebView) {
                // Double-check: if ReactNativeWebView exists but Farcaster SDK also exists, it's Farcaster
                if (hasFarcasterSDK) {
                  console.log('[leaderboard-panel] ⚠️ ReactNativeWebView found but Farcaster SDK also exists - choosing Farcaster');
                  return 'farcaster';
                }
                console.log('[leaderboard-panel] ✅ Base App detected via MiniKit/ReactNativeWebView');
                return 'base-app';
              }
              
              console.warn('[leaderboard-panel] ⚠️ Platform detection failed - no platform indicators found');
              return null;
            } catch (err) {
              console.error('[leaderboard-panel] ❌ Platform detection error:', err);
              return null;
            }
          })();
          
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

    // Search functionality
    const searchBtn = panel.querySelector('[data-search-btn]');
    const searchModal = panel.querySelector('[data-search-modal]');
    const searchInput = panel.querySelector('[data-search-input]');
    const searchResults = panel.querySelector('[data-search-results]');
    const searchClose = panel.querySelector('[data-search-close]');
    const searchClear = panel.querySelector('[data-search-clear]');
    
    // Ensure modal is closed on initialization
    if (searchModal) {
      searchModal.setAttribute('hidden', '');
    }

    // Handle mobile keyboard with visualViewport API
    let viewportHandler = null;
    const setupViewportHandler = () => {
      if (window.visualViewport && searchModal) {
        viewportHandler = () => {
          if (!searchModal.hasAttribute('hidden')) {
            const viewport = window.visualViewport;
            const modalContent = searchModal.querySelector('.leaderboard-search-modal-content');
            if (modalContent) {
              // Adjust modal position when keyboard opens
              const viewportHeight = viewport.height;
              const windowHeight = window.innerHeight;
              const keyboardHeight = windowHeight - viewportHeight;
              
              if (keyboardHeight > 150) {
                // Keyboard is open, move modal up
                modalContent.style.maxHeight = `${viewportHeight - 40}px`;
                modalContent.style.marginTop = `${Math.max(20, viewport.offsetTop)}px`;
              } else {
                // Keyboard is closed, reset
                modalContent.style.maxHeight = '';
                modalContent.style.marginTop = '';
              }
            }
          }
        };
        window.visualViewport.addEventListener('resize', viewportHandler);
        window.visualViewport.addEventListener('scroll', viewportHandler);
      }
    };

    const removeViewportHandler = () => {
      if (viewportHandler && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', viewportHandler);
        window.visualViewport.removeEventListener('scroll', viewportHandler);
        viewportHandler = null;
      }
    };

    // Setup viewport handler on init
    if (window.visualViewport) {
      setupViewportHandler();
    } else {
      // Fallback: setup when visualViewport becomes available
      window.addEventListener('load', () => {
        if (window.visualViewport) {
          setupViewportHandler();
        }
      });
    }

    const openSearchModal = () => {
      console.log('[leaderboard-panel] openSearchModal called');
      if (searchModal) {
        console.log('[leaderboard-panel] Removing hidden attribute from modal');
        // Remove hidden attribute
        searchModal.removeAttribute('hidden');
        // Force display with inline style (highest priority)
        searchModal.style.display = 'flex';
        searchModal.style.visibility = 'visible';
        searchModal.style.opacity = '1';
        // Use setTimeout to ensure modal is visible before focusing
        setTimeout(() => {
          if (searchInput) {
            console.log('[leaderboard-panel] Focusing search input');
            // For mobile devices, ensure input is not readonly/disabled
            searchInput.removeAttribute('readonly');
            searchInput.removeAttribute('disabled');
            // Remove any pointer-events restrictions
            searchInput.style.pointerEvents = 'auto';
            searchInput.style.touchAction = 'manipulation';
            // Force focus multiple times to ensure it works
            searchInput.focus();
            // For mobile devices, use click + focus combination
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
              // First click to activate
              searchInput.click();
              // Then focus
              setTimeout(() => {
                searchInput.focus();
                // Try one more time after a short delay
                setTimeout(() => {
                  searchInput.click();
                  searchInput.focus();
                }, 100);
              }, 50);
            } else {
              // Desktop: just focus
              searchInput.focus();
            }
          } else {
            console.error('[leaderboard-panel] searchInput not found!');
          }
        }, 150); // Increased delay to ensure modal is fully rendered
      } else {
        console.error('[leaderboard-panel] searchModal not found!');
      }
    };

    const closeSearchModal = () => {
      console.log('[leaderboard-panel] closeSearchModal called');
      if (searchModal) {
        console.log('[leaderboard-panel] Setting hidden attribute on modal');
        searchModal.setAttribute('hidden', '');
        // Force hide with inline style
        searchModal.style.display = 'none';
        searchModal.style.visibility = 'hidden';
        searchModal.style.opacity = '0';
        if (searchInput) {
          searchInput.value = '';
          searchInput.blur(); // Remove focus to close keyboard
        }
        if (searchClear) {
          searchClear.hidden = true;
        }
        if (searchResults) {
          searchResults.innerHTML = '';
        }
        // Restore original leaderboard
        renderRows(allEntries);
        // Clear search timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          searchTimeout = null;
        }
        // Reset modal content position
        const modalContent = searchModal.querySelector('.leaderboard-search-modal-content');
        if (modalContent) {
          modalContent.style.maxHeight = '';
          modalContent.style.marginTop = '';
        }
      } else {
        console.error('[leaderboard-panel] searchModal not found in closeSearchModal!');
      }
    };

    // Debounce search for better performance
    let searchTimeout = null;
    const performSearch = (query) => {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Debounce: wait 150ms after user stops typing
      searchTimeout = setTimeout(() => {
        if (!query || !query.trim()) {
          // Restore original leaderboard
          renderRows(allEntries);
          if (searchResults) {
            searchResults.innerHTML = '';
          }
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

        if (filtered.length === 0) {
          if (searchResults) {
            searchResults.innerHTML = '<div class="leaderboard-search-no-results">No users found</div>';
          }
          // Clear leaderboard lists
          if (topListEl) topListEl.innerHTML = '';
          if (restListEl) restListEl.innerHTML = '';
          if (scrollWrapper) scrollWrapper.hidden = true;
        } else {
          if (searchResults) {
            searchResults.innerHTML = `<div class="leaderboard-search-count">Found ${filtered.length} user(s)</div>`;
          }
          // Show filtered results in leaderboard
          renderRows(filtered);
        }
      }, 150); // 150ms debounce delay
    };

    if (searchBtn) {
      console.log('[leaderboard-panel] Search button found, adding click listener');
      searchBtn.addEventListener('click', (e) => {
        console.log('[leaderboard-panel] Search button clicked');
        e.preventDefault();
        e.stopPropagation();
        openSearchModal();
      });
      // Also add touch event for mobile
      searchBtn.addEventListener('touchend', (e) => {
        console.log('[leaderboard-panel] Search button touched');
        e.preventDefault();
        e.stopPropagation();
        openSearchModal();
      }, { passive: false });
    } else {
      console.error('[leaderboard-panel] Search button not found!');
    }

    if (searchClose) {
      console.log('[leaderboard-panel] Search close button found, adding event listeners');
      // Multiple event types for maximum compatibility
      const handleClose = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        console.log('[leaderboard-panel] Close button triggered via', e?.type || 'unknown');
        closeSearchModal();
        return false;
      };
      
      searchClose.addEventListener('click', handleClose);
      searchClose.addEventListener('touchend', handleClose, { passive: false });
      searchClose.addEventListener('touchstart', (e) => {
        // Prevent default to avoid double-trigger
        e.stopPropagation();
      }, { passive: false });
      // Also handle mousedown for desktop
      searchClose.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    } else {
      console.error('[leaderboard-panel] Search close button not found!');
    }

    if (searchInput) {
      console.log('[leaderboard-panel] Search input found, adding event listeners');
      // Add multiple event types to ensure keyboard opens
      const handleInputFocus = (e) => {
        console.log('[leaderboard-panel] Search input interaction:', e.type);
        // Ensure input is not readonly/disabled
        searchInput.removeAttribute('readonly');
        searchInput.removeAttribute('disabled');
        searchInput.style.pointerEvents = 'auto';
        // Force focus
        setTimeout(() => {
          searchInput.focus();
          // For iOS, sometimes need to trigger click as well
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => {
              searchInput.click();
              searchInput.focus();
            }, 50);
          }
        }, 10);
      };
      
      searchInput.addEventListener('click', handleInputFocus);
      searchInput.addEventListener('touchstart', handleInputFocus, { passive: true });
      searchInput.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleInputFocus(e);
      }, { passive: false });
      // Also handle focus event
      searchInput.addEventListener('focus', () => {
        console.log('[leaderboard-panel] Search input focused');
      });
      
      searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        // Show/hide clear button
        if (searchClear) {
          searchClear.hidden = !value || value.trim() === '';
        }
        performSearch(value);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeSearchModal();
        } else if (e.key === 'Enter') {
          // Enter key submits search (already handled by input event)
          e.preventDefault();
        }
      });
    } else {
      console.error('[leaderboard-panel] Search input not found!');
    }

    // Clear button functionality
    if (searchClear) {
      searchClear.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          searchClear.hidden = true;
          performSearch('');
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
