/**
 * Leaderboard API Module
 * Handles fetching leaderboard data and profile mapping
 */

/**
 * Load leaderboard data from API
 * @param {Object} options
 * @param {number} options.limit - Number of entries to fetch
 * @param {Function} options.onSuccess - Callback with (items, debugInfo)
 * @param {Function} options.onError - Callback with (error)
 */
export async function loadLeaderboard({ limit, onSuccess, onError }) {
  try {
    // Determine chain ID for leaderboard
    let chainId = 8453; // Default to Base Mainnet
    try {
      const config = window.BaseManOnchainConfig;
      if (config && config.chainId) {
        const configChainId = Number(config.chainId);
        if (configChainId === 8453 || configChainId === 84532) {
          chainId = configChainId;
        }
      }
    } catch (error) {
      console.warn('[leaderboard-api] Failed to get chain ID from config:', error);
    }
    
    // Always use Base Mainnet for leaderboard
    const leaderboardChainId = 8453;
    
    // Get current user's profile mapping if available
    let profileMappingHeader = null;
    let address = null;
    let user = null;
    let platform = null;
    
    try {
      // Wait for BaseManOnchain wallet to be ready
      const maxWalletRetries = 10;
      const walletDelayMs = 200;
      
      for (let i = 0; i < maxWalletRetries; i++) {
        if (window.BaseManOnchain) {
          const isWalletReady = window.BaseManOnchain?.isWalletReady?.();
          if (isWalletReady) {
            address = window.BaseManOnchain?.getWalletAddress?.() || null;
            if (address) {
              console.log('[leaderboard-api] Got address from BaseManOnchain (attempt ' + (i + 1) + '):', address.substring(0, 10) + '...');
              break;
            }
          }
        }
        
        if (i < maxWalletRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, walletDelayMs));
        }
      }
      
      // Get SDK context
      if (window.sdk && window.sdk.context) {
        try {
          const context = await window.sdk.context;
          user = context?.user;
          
          // Platform detection via clientFid
          if (context?.client?.clientFid === 309857) {
            console.log('[leaderboard-api] ✅ Base App detected via clientFid (309857)');
            platform = 'base-app';
          } else if (context?.client?.clientFid) {
            console.log('[leaderboard-api] ✅ Farcaster detected via clientFid (' + context.client.clientFid + ')');
            platform = 'farcaster';
          }
        } catch (ctxErr) {
          // SDK context not available
        }
      }
    } catch (err) {
      console.warn('[leaderboard-api] Error getting profile data:', err);
    }
    
    console.log('[leaderboard-api] Profile mapping check:', {
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
        // Platform detection fallback
        if (!platform) {
          console.log('[leaderboard-api] Platform not detected via clientFid, using centralized utility...');
          try {
            if (typeof window.getPlatform === 'function') {
              platform = await window.getPlatform();
              if (platform === 'base') {
                platform = 'base-app';
              }
              console.log('[leaderboard-api] Platform detected via centralized utility:', platform);
            } else {
              console.warn('[leaderboard-api] getPlatform() not available, platform will be null');
            }
          } catch (err) {
            console.error('[leaderboard-api] Error using centralized platform detection:', err);
          }
        }
        
        console.log('[leaderboard-api] 🎯 Final detected platform:', platform);
        
        const mappingData = {
          address: address.toLowerCase(),
          fid: user.fid,
          username: user.username || null,
          displayName: user.displayName || null,
          avatarUrl: user.pfpUrl || null,
          platform: platform || null
        };
        
        console.log('[leaderboard-api] Sending profile mapping:', mappingData);
        
        // Send mapping immediately before leaderboard request
        await fetch('/api/leaderboard?action=profile-mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappingData)
        }).catch((err) => {
          console.warn('[leaderboard-api] Profile mapping POST failed:', err);
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
        console.log('[leaderboard-api] Profile mapping header prepared with platform:', platform);
      } catch (mappingErr) {
        console.warn('[leaderboard-api] Error creating profile mapping:', mappingErr);
      }
    } else {
      console.log('[leaderboard-api] Skipping profile mapping - missing data:', {
        hasAddress: !!address,
        hasUser: !!user,
        hasFid: !!user?.fid
      });
    }
    
    const headers = { Accept: "application/json" };
    if (profileMappingHeader) {
      headers['X-Profile-Mapping'] = profileMappingHeader;
      console.log('[leaderboard-api] Sending leaderboard request with profile mapping header');
    } else {
      console.warn('[leaderboard-api] No profile mapping header to send');
    }
    
    // Check for debug mode
    const urlHash = window.location.hash || '';
    const isDebugMode = urlHash.includes('debug=1') || localStorage.getItem('baseManDebug') === '1';
    
    const apiUrl = `/api/leaderboard?limit=${limit}&chain=${leaderboardChainId}${isDebugMode ? '&debug=1' : ''}`;
    console.log('[leaderboard-api] Fetching leaderboard from:', apiUrl);
    const response = await fetch(apiUrl, {
      headers,
      cache: "no-store"
    });

    console.log('[leaderboard-api] API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[leaderboard-api] API error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const payload = await response.json();
    console.log('[leaderboard-api] API payload:', {
      source: payload.source,
      chainId: payload.chainId,
      count: payload.count,
      itemsCount: Array.isArray(payload.items) ? payload.items.length : 0,
      hasDebug: !!payload._debug,
      sampleItem: payload.items?.[0] || null
    });
    
    const items = Array.isArray(payload.items) ? payload.items : [];
    console.log('[leaderboard-api] Processing', items.length, 'items');
    
    if (onSuccess) {
      onSuccess(items, payload._debug, isDebugMode);
    }
  } catch (error) {
    console.error("[leaderboard-api] load failed", error);
    if (onError) {
      onError(error);
    }
  }
}

