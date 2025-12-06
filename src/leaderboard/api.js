/**
 * Leaderboard API Module
 * Handles fetching leaderboard data and profile mapping
 * 
 * Phase 4.3: Performance optimizations
 * - In-memory cache for leaderboard data (short TTL)
 * - In-flight request deduplication
 * - Profile mapping deduplication (sent once per session)
 */

import { createLogger } from '../utils/logger.js';
import { getCachedUserInfo } from './services/user-detection.js';
import { sendProfileMappingIfNeeded, buildProfileMappingHeader } from './services/profile-mapping.js';

const log = createLogger('LeaderboardAPI');

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
const LEADERBOARD_CACHE_TTL_MS = 10000; // 10 seconds

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
  // Always use Base Mainnet for leaderboard
  const leaderboardChainId = 8453;
  const now = Date.now();
  
  // Check for debug mode
  const urlHash = window.location.hash || '';
  const isDebugMode = urlHash.includes('debug=1') || localStorage.getItem('baseManDebug') === '1';
  
  // Phase 4.3: Return cached data if fresh (unless forced refresh)
  if (!forceRefresh && 
      leaderboardCache.data && 
      leaderboardCache.chainId === leaderboardChainId &&
      leaderboardCache.limit >= limit &&
      (now - leaderboardCache.timestamp) < LEADERBOARD_CACHE_TTL_MS) {
    log.debug('Returning cached leaderboard data (age:', now - leaderboardCache.timestamp, 'ms)');
    if (onSuccess) {
      // Return subset if cached limit was higher
      const items = leaderboardCache.data.slice(0, limit);
      onSuccess(items, leaderboardCache.debugInfo, isDebugMode);
    }
    return;
  }
  
  // Phase 4.3: Deduplicate in-flight requests
  if (inflightLeaderboardRequest) {
    log.debug('Reusing in-flight leaderboard request');
    try {
      const { items, debugInfo } = await inflightLeaderboardRequest;
      if (onSuccess) {
        onSuccess(items.slice(0, limit), debugInfo, isDebugMode);
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
    try {
      // Phase 4.3: Get cached user info (fast, no redundant SDK calls)
      const { address, user, platform } = await getCachedUserInfo();
      
      log.debug('Profile mapping check:', {
        hasAddress: !!address,
        hasUser: !!user,
        hasFid: !!user?.fid,
        address: address ? address.substring(0, 10) + '...' : null
      });
      
      // Phase 4.3: Send profile mapping only if not already sent this session
      let profileMappingHeader = null;
      if (address && user?.fid) {
        // Send mapping async (deduplicated)
        sendProfileMappingIfNeeded(address, user, platform);
        
        // Include in header for same request
        profileMappingHeader = buildProfileMappingHeader(address, user, platform);
      }
      
      const headers = { Accept: "application/json" };
      if (profileMappingHeader) {
        headers['X-Profile-Mapping'] = profileMappingHeader;
      }
      
      const apiUrl = `/api/leaderboard?limit=${limit}&chain=${leaderboardChainId}${isDebugMode ? '&debug=1' : ''}`;
      log.debug('Fetching leaderboard from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers,
        cache: "no-store"
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        log.error('API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const payload = await response.json();
      log.debug('API payload:', {
        source: payload.source,
        chainId: payload.chainId,
        count: payload.count,
        itemsCount: Array.isArray(payload.items) ? payload.items.length : 0
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
    log.error("load failed", error);
    if (onError) {
      onError(error);
    }
  }
}

