/**
 * User Detection Service
 * Handles detecting current user (address, FID, platform) from wallet and SDK
 */

import { createLogger } from '../../utils/logger.js';
import { getPlatformSync, isPlatformDetected } from '../../utils/platform-detection.js';

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
    // 1. First try BaseManOnchain (preferred)
    if (window.BaseManOnchain?.getWalletAddress) {
      address = window.BaseManOnchain.getWalletAddress() || null;
    }

    // 2. If still null, try SDK wallet provider
    if (!address && window.sdk?.wallet) {
      try {
        const provider = await window.sdk.wallet.getEthereumProvider?.();
        if (provider) {
          const accounts = await provider.request?.({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            address = accounts[0];
          }
        }
      } catch (walletErr) {
        log.debug('SDK wallet provider failed:', walletErr?.message);
      }
    }

    // 3. If still null, try window.ethereum
    if (!address && window.ethereum?.selectedAddress) {
      address = window.ethereum.selectedAddress;
    }

    // Get SDK user (cached after first fetch)
    user = await getSdkUserOnce();

    // If we got user from SDK but no address, try to get address from user
    if (!address && user?.custody_address) {
      address = user.custody_address;
    }
    if (!address && user?.verifications?.length > 0) {
      // Use first verified address
      address = user.verifications[0];
    }

    // Use cached platform detection (sync, no await needed)
    // If not detected yet, try to detect now
    if (isPlatformDetected()) {
      const detectedPlatform = getPlatformSync();
      if (detectedPlatform === 'base') {
        platform = 'base-app';
      } else if (detectedPlatform === 'farcaster') {
        platform = 'farcaster';
      }
    } else {
      // Try async detection if not cached yet
      try {
        const { getPlatform } = await import('../../utils/platform-detection.js');
        const detectedPlatform = await getPlatform();
        if (detectedPlatform === 'base') {
          platform = 'base-app';
        } else if (detectedPlatform === 'farcaster') {
          platform = 'farcaster';
        }
      } catch (platformErr) {
        log.debug('Platform detection failed:', platformErr?.message);
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
 * @param {Object} currentUser - Current user info { address, user }
 * @returns {boolean} True if entry belongs to current user
 */
export function isMyEntry(entry, currentUser) {
  if (!entry || !currentUser) return false;

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

