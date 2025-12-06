/**
 * User Detection Service
 * Handles detecting current user (address, FID, platform) from wallet and SDK
 */

import { createLogger } from '../../utils/logger.js';

const log = createLogger('LeaderboardUserDetection');

// Cached user info to avoid repeated SDK calls
let cachedUserInfo = null;
let cachedUserInfoTimestamp = 0;
const USER_INFO_CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Get cached user info or fetch fresh
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
    // Get wallet address (fast check first)
    if (window.BaseManOnchain?.isWalletReady?.()) {
      address = window.BaseManOnchain?.getWalletAddress?.() || null;
    }
    
    // If not ready, do a few quick retries
    if (!address) {
      const maxRetries = 5;
      const delayMs = 100;
      for (let i = 0; i < maxRetries && !address; i++) {
        if (window.BaseManOnchain?.isWalletReady?.()) {
          address = window.BaseManOnchain?.getWalletAddress?.() || null;
        }
        if (!address && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }
    
    // Get SDK context
    if (window.sdk?.context) {
      try {
        const context = await window.sdk.context;
        user = context?.user;
        
        // Platform detection via clientFid
        if (context?.client?.clientFid === 309857) {
          platform = 'base-app';
        } else if (context?.client?.clientFid) {
          platform = 'farcaster';
        }
      } catch (ctxErr) {
        // SDK context not available
      }
    }
  } catch (err) {
    log.warn('Error getting user info:', err);
  }
  
  cachedUserInfo = { address, user, platform };
  cachedUserInfoTimestamp = now;
  return cachedUserInfo;
}

/**
 * Clear user info cache
 */
export function clearUserInfoCache() {
  cachedUserInfo = null;
  cachedUserInfoTimestamp = 0;
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

