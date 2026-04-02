/**
 * Leaderboard API Module
 * Handles fetching leaderboard data and profile mapping
 * 
 * Phase 4.3: Performance optimizations
 * - In-memory cache for leaderboard data (short TTL)
 * - In-flight request deduplication
 * - Profile mapping deduplication (sent once per session)
 * 
 * Phase 6: Error handling & stability
 * - Uses safeFetchJson for robust error handling
 * - Returns Result<T> pattern for safe error propagation
 */

import { createLogger } from '../utils/logger.js';
import { safeFetchJson, requireOnline } from '../lib/safe-fetch.js';
import { getCachedUserInfo } from './services/user-detection.js';
import { sendProfileMappingIfNeeded, buildProfileMappingHeader } from './services/profile-mapping.js';
import { getConfiguredChainId } from '../onchain/provider.js';

const log = createLogger('UiLeaderboard');

// ============================================
// CACHING & DEDUPLICATION - Phase 4.3
// ============================================

// Leaderboard cache with short TTL
const leaderboardCache = {
  data: null,
  debugInfo: null,
  timestamp: 0,
  chainId: null,
  limit: null
};
const LEADERBOARD_CACHE_TTL_MS = 5000; // 5 seconds - fast updates after score submission
const LEADERBOARD_TIMEOUT_MS = 15000;

/**
 * Invalidate leaderboard cache
 * Call this after score submission to force fresh data on next load
 */
export function invalidateLeaderboardCache() {
  leaderboardCache.data = null;
  leaderboardCache.timestamp = 0;
  log.debug('Leaderboard cache invalidated');
}

// In-flight request deduplication
let inflightLeaderboardRequest = null;

// User detection and profile mapping are now handled by services modules
// Using imported functions: getCachedUserInfo, sendProfileMappingIfNeeded, buildProfileMappingHeader

/**
 * Load leaderboard data from API
 * @param {Object} options
 * @param {number} options.limit - Number of entries to fetch
 * @param {Function} options.onSuccess - Callback with (items, debugInfo)
 * @param {Function} options.onError - Callback with (error)
 * @param {boolean} options.forceRefresh - Skip cache and fetch fresh data
 * 
 * Phase 4.3 optimizations:
 * - Uses short-lived cache to avoid redundant fetches
 * - Deduplicates in-flight requests (multiple callers share same Promise)
 * - Profile mapping sent only once per session per address
 */
export async function loadLeaderboard({ limit, onSuccess, onError, forceRefresh = false }) {
  const leaderboardChainId = getConfiguredChainId();
  const now = Date.now();
  const requestStartedAt = now;
  
  // Check for debug mode
  const urlHash = window.location.hash || '';
  const isDebugMode = urlHash.includes('debug=1') || localStorage.getItem('baseManDebug') === '1';
  
  // Phase 4.3: Return cached data if fresh (unless forced refresh)
  if (!forceRefresh && 
      leaderboardCache.data && 
      leaderboardCache.chainId === leaderboardChainId &&
      leaderboardCache.limit >= limit &&
      (now - leaderboardCache.timestamp) < LEADERBOARD_CACHE_TTL_MS) {
    log.debug('Returning cached leaderboard data', {
      ageMs: now - leaderboardCache.timestamp,
      chainId: leaderboardChainId,
      limit
    });
    if (onSuccess) {
      // Return subset if cached limit was higher
      const items = leaderboardCache.data.slice(0, limit);
      onSuccess(items, leaderboardCache.debugInfo, isDebugMode);
    }
    return;
  }
  
  // Phase 4.3: Deduplicate in-flight requests
  if (inflightLeaderboardRequest) {
    log.debug('Reusing in-flight leaderboard request', {
      chainId: leaderboardChainId,
      limit
    });
    try {
      const { items, debugInfo } = await inflightLeaderboardRequest;
      if (onSuccess) {
        // API already applies limit, no need to slice again
        onSuccess(items, debugInfo, isDebugMode);
      }
    } catch (error) {
      log.error("load failed (shared request)", error);
      if (onError) {
        onError(error);
      }
    }
    return;
  }
  
  // Create the actual fetch promise
  inflightLeaderboardRequest = (async () => {
    const fetchStartedAt = Date.now();
    try {
      // Ensure platform detection is complete before getting user info
      // This ensures profile mappings include the correct platform
      try {
        const { initPlatformDetection } = await import('../utils/platform-detection.js');
        await Promise.race([
          initPlatformDetection(),
          new Promise(resolve => setTimeout(resolve, 1500)) // Max 1.5s wait
        ]);
      } catch (platformErr) {
        log.debug('Platform detection init failed (non-critical):', platformErr?.message);
      }

      // Phase 4.3: Get cached user info (fast, no redundant SDK calls)
      const { address, user, platform } = await getCachedUserInfo();

      log.debug('Profile mapping check:', {
        hasAddress: !!address,
        hasUser: !!user,
        hasFid: !!user?.fid,
        platform,
        address: address ? address.substring(0, 10) + '...' : null
      });

      // Phase 4.3: Send profile mapping only if not already sent this session
      let profileMappingHeader = null;
      if (address && user?.fid) {
        // Send mapping async (deduplicated)
        sendProfileMappingIfNeeded(address, user, platform);

        // Include in header for same request
        profileMappingHeader = buildProfileMappingHeader(address, user, platform);

        log.debug('Profile mapping header:', profileMappingHeader ? 'set' : 'null');
      }
      
      const headers = { Accept: "application/json" };
      if (profileMappingHeader) {
        headers['X-Profile-Mapping'] = profileMappingHeader;
      }
      
      const apiUrl = `/api/leaderboard?limit=${limit}&chain=${leaderboardChainId}${isDebugMode ? '&debug=1' : ''}`;
      log.debug('Fetching leaderboard', {
        apiUrl,
        chainId: leaderboardChainId,
        limit,
        hasProfileMappingHeader: !!profileMappingHeader
      });
      
      // Phase 6: Check if online before making request
      const offlineCheck = requireOnline('loadLeaderboard', 'leaderboard');
      if (offlineCheck) {
        throw offlineCheck.error;
      }
      
      // Phase 6: Use safeFetchJson for robust error handling
      const result = await safeFetchJson(apiUrl, {
        headers,
        cache: "no-store"
      }, {
        context: 'leaderboard',
        timeoutMs: LEADERBOARD_TIMEOUT_MS
      });

      if (!result.ok) {
        log.error('Leaderboard API error', {
          kind: result.error.kind,
          message: result.error.message,
          technicalMessage: result.error.technicalMessage,
          context: result.error.context,
          meta: result.error.meta,
          durationMs: Date.now() - fetchStartedAt,
          chainId: leaderboardChainId,
          limit
        });
        throw result.error;
      }

      const payload = result.data;
      log.debug('Leaderboard API success', {
        source: payload.source,
        chainId: payload.chainId,
        count: payload.count,
        itemsCount: Array.isArray(payload.items) ? payload.items.length : 0,
        durationMs: Date.now() - fetchStartedAt,
        requestedLimit: limit
      });
      
      const items = Array.isArray(payload.items) ? payload.items : [];
      const debugInfo = payload._debug || null;
      
      // Phase 4.3: Update cache
      leaderboardCache.data = items;
      leaderboardCache.debugInfo = debugInfo;
      leaderboardCache.timestamp = Date.now();
      leaderboardCache.chainId = leaderboardChainId;
      leaderboardCache.limit = limit;
      
      return { items, debugInfo };
    } finally {
      // Clear in-flight request
      inflightLeaderboardRequest = null;
    }
  })();
  
  try {
    const { items, debugInfo } = await inflightLeaderboardRequest;
    if (onSuccess) {
      onSuccess(items, debugInfo, isDebugMode);
    }
  } catch (error) {
    log.error("load failed", {
      error,
      durationMs: Date.now() - requestStartedAt,
      chainId: leaderboardChainId,
      limit,
      forceRefresh
    });
    if (onError) {
      onError(error);
    }
  }
}
