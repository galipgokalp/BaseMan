/**
 * User Detection Service
 * Handles detecting current user (address, FID, platform) from wallet and SDK
 */

import { createLogger } from '../../utils/logger.js';
import { getPlatformSync, isPlatformDetected, getPlatform, initPlatformDetection } from '../../utils/platform-detection.js';

const log = createLogger('LeaderboardUserDetection');

// Cached user info to avoid repeated SDK calls
let cachedUserInfo = null;
let cachedUserInfoTimestamp = 0;
const USER_INFO_CACHE_TTL_MS = 30000; // 30 seconds

// Cached SDK user to avoid repeated context awaits
let cachedSdkUser = null;
let sdkUserFetched = false;

/**
 * Get SDK user once and cache it
 * @returns {Promise<Object|null>} SDK user object or null
 */
async function getSdkUserOnce() {
  if (sdkUserFetched) {
    return cachedSdkUser;
  }

  try {
    if (window.sdk?.context) {
      const context = await Promise.race([
        window.sdk.context,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SDK context timeout')), 2000))
      ]);
      cachedSdkUser = context?.user || null;
    }
  } catch (err) {
    // SDK context not available or timed out
    log.debug('SDK user fetch failed or timed out');
  }

  sdkUserFetched = true;
  return cachedSdkUser;
}

/**
 * Get cached user info or fetch fresh
 * Optimized: No blocking retries, uses cached platform detection
 * @returns {Promise<Object>} User info with { address, user, platform }
 */
export async function getCachedUserInfo() {
  const now = Date.now();

  // Return cached if fresh
  if (cachedUserInfo && (now - cachedUserInfoTimestamp) < USER_INFO_CACHE_TTL_MS) {
    return cachedUserInfo;
  }

  let address = null;
  let user = null;
  let platform = null;

  try {
    // Get wallet address - try multiple sources
    // 1. First try BaseManOnchain (preferred, most reliable)
    if (window.BaseManOnchain?.getWalletAddress) {
      address = window.BaseManOnchain.getWalletAddress() || null;
    }

    // 2. If still null, try window.ethereum (standard EIP-1193)
    if (!address && window.ethereum?.selectedAddress) {
      address = window.ethereum.selectedAddress;
    }

    // Get SDK user first (needed for address fallbacks)
    user = await getSdkUserOnce();

    // 3. If still null, try to get address from SDK user object
    if (!address && user?.custody_address) {
      address = user.custody_address;
    }
    if (!address && user?.verifications?.length > 0) {
      // Use first verified address
      address = user.verifications[0];
    }

    // 4. Last resort: try SDK wallet provider (only if in MiniApp context)
    const inMiniApp = (typeof window !== 'undefined' && window !== window.parent) || 
                      (typeof window.ReactNativeWebView !== 'undefined');
    if (!address && inMiniApp && window.sdk?.wallet && user) {
      try {
        const getProvider = window.sdk.wallet.getEthereumProvider;
        if (typeof getProvider === 'function') {
          const provider = await Promise.race([
            getProvider.call(window.sdk.wallet),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
          ]);
          if (provider && typeof provider.request === 'function') {
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (Array.isArray(accounts) && accounts.length > 0) {
              address = accounts[0];
            }
          }
        }
      } catch (walletErr) {
        // Silent fail - this is a fallback
        log.debug('SDK wallet provider fallback failed:', walletErr?.message);
      }
    }

    // Platform detection: Always wait for async detection to ensure we get the correct platform
    // This is critical for mobile MiniApp environments where SDK may load slowly
    try {
      let detectedPlatform;
      if (isPlatformDetected()) {
        // Use cached value if available
        detectedPlatform = getPlatformSync();
      } else {
        // Wait for platform detection to complete (important for mobile)
        // This ensures we get the correct platform even if SDK loads slowly
        detectedPlatform = await getPlatform();
      }
      
      // Convert platform format: 'base' -> 'base-app', 'farcaster' -> 'farcaster'
      if (detectedPlatform === 'base') {
        platform = 'base-app';
        log.debug('Platform detected: base-app');
      } else if (detectedPlatform === 'farcaster') {
        platform = 'farcaster';
        log.debug('Platform detected: farcaster');
      } else {
        log.debug('Platform not detected (web mode):', detectedPlatform);
      }
    } catch (platformErr) {
      log.warn('Platform detection failed:', platformErr?.message);
      // Fallback: try sync version
      if (isPlatformDetected()) {
        const detectedPlatform = getPlatformSync();
        if (detectedPlatform === 'base') {
          platform = 'base-app';
        } else if (detectedPlatform === 'farcaster') {
          platform = 'farcaster';
        }
      }
    }
  } catch (err) {
    log.warn('Error getting user info:', err);
  }

  cachedUserInfo = { address, user, platform };
  cachedUserInfoTimestamp = now;

  log.debug('getCachedUserInfo result:', {
    hasAddress: !!address,
    addressPrefix: address ? address.substring(0, 10) + '...' : null,
    hasUser: !!user,
    hasFid: !!user?.fid,
    platform
  });

  return cachedUserInfo;
}

/**
 * Clear user info cache
 */
export function clearUserInfoCache() {
  cachedUserInfo = null;
  cachedUserInfoTimestamp = 0;
  // Also reset SDK user cache to allow re-fetch
  cachedSdkUser = null;
  sdkUserFetched = false;
}

/**
 * Check if an entry belongs to the current user
 * @param {Object} entry - Leaderboard entry
 * @param {Object} currentUser - Current user info { address, user, platform }
 * @returns {boolean} True if entry belongs to current user
 */
export function isMyEntry(entry, currentUser) {
  if (!entry || !currentUser) return false;

  // Platform matching: If current user has platform info, entry must also have platform info and match
  // This ensures Base App users see Base App entries, Farcaster users see Farcaster entries
  // If current user has platform but entry doesn't, reject (to avoid matching wrong account)
  // If neither has platform info, allow match (backward compatibility)
  if (currentUser.platform) {
    // User has platform info - entry must also have platform info and match
    if (!entry?.profile?.platform) {
      // Entry has no platform info, but user does - reject to avoid matching wrong account
      log.debug('isMyEntry: Rejected - user has platform but entry does not', {
        userPlatform: currentUser.platform,
        entryAddress: entry?.player?.substring(0, 10) + '...',
        entryFid: entry?.profile?.fid
      });
      return false;
    }
    if (currentUser.platform !== entry.profile.platform) {
      // Platforms don't match - reject
      log.debug('isMyEntry: Rejected - platform mismatch', {
        userPlatform: currentUser.platform,
        entryPlatform: entry.profile.platform,
        entryAddress: entry?.player?.substring(0, 10) + '...',
        entryFid: entry?.profile?.fid
      });
      return false;
    }
    log.debug('isMyEntry: Platform match', {
      platform: currentUser.platform,
      entryAddress: entry?.player?.substring(0, 10) + '...',
      entryFid: entry?.profile?.fid
    });
  }

  // Match by FID if available
  if (currentUser.user?.fid && entry?.profile?.fid) {
    if (Number(currentUser.user.fid) === Number(entry.profile.fid)) {
      return true;
    }
  }

  // Match by address
  const entryAddress = entry?.player || entry?.address;
  if (currentUser.address && entryAddress) {
    const normalizedCurrent = normalizeAddress(currentUser.address);
    const normalizedEntry = normalizeAddress(entryAddress);
    if (normalizedCurrent && normalizedEntry && normalizedCurrent === normalizedEntry) {
      return true;
    }
  }

  // Also check entry.addresses array if it exists
  if (currentUser.address && Array.isArray(entry?.addresses)) {
    const normalizedCurrent = normalizeAddress(currentUser.address);
    const matches = entry.addresses.some(addr => {
      const normalizedAddr = normalizeAddress(addr);
      return normalizedCurrent && normalizedAddr && normalizedCurrent === normalizedAddr;
    });
    if (matches) return true;
  }

  return false;
}

/**
 * Normalize address for comparison
 * @param {string} addr - Address to normalize
 * @returns {string|null} Normalized address or null
 */
function normalizeAddress(addr) {
  return typeof addr === "string" ? addr.toLowerCase() : null;
}

