/**
 * Profile Mapping Service
 * Handles sending profile mappings to backend for leaderboard enrichment
 */

import { createLogger } from '../../utils/logger.js';

const log = createLogger('LeaderboardProfileMapping');

// Profile mapping deduplication (per session)
const sentProfileMappings = new Set(); // Track sent address mappings

/**
 * Send profile mapping if not already sent this session
 * @param {string} address - Wallet address
 * @param {Object} user - User object from SDK context
 * @param {string|null} platform - Platform ('base-app' or 'farcaster')
 */
export async function sendProfileMappingIfNeeded(address, user, platform) {
  if (!address || !user?.fid) return;
  
  const key = address.toLowerCase();
  
  // Skip if already sent this session
  if (sentProfileMappings.has(key)) {
    log.debug('Profile mapping already sent for:', key.substring(0, 10) + '...');
    return;
  }
  
  // Detect platform if not provided
  let detectedPlatform = platform;
  if (!detectedPlatform && typeof window.getPlatform === 'function') {
    try {
      detectedPlatform = await window.getPlatform();
      if (detectedPlatform === 'base') detectedPlatform = 'base-app';
    } catch (_) {}
  }
  
  const mappingData = {
    address: key,
    fid: user.fid,
    username: user.username || null,
    displayName: user.displayName || null,
    avatarUrl: user.pfpUrl || null,
    platform: detectedPlatform || null
  };
  
  log.debug('Sending profile mapping:', mappingData);
  
  // Mark as sent immediately to prevent duplicate sends
  sentProfileMappings.add(key);
  
  // Send async, don't block
  fetch('/api/leaderboard?action=profile-mapping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mappingData)
  }).catch((err) => {
    log.warn('Profile mapping POST failed:', err);
    // Remove from sent set so it can be retried
    sentProfileMappings.delete(key);
  });
}

/**
 * Build profile mapping header for API request
 * @param {string} address - Wallet address
 * @param {Object} user - User object from SDK context
 * @param {string|null} platform - Platform ('base-app' or 'farcaster')
 * @returns {string|null} JSON string for X-Profile-Mapping header or null
 */
export function buildProfileMappingHeader(address, user, platform) {
  if (!address || !user?.fid) return null;
  
  return JSON.stringify({
    [address.toLowerCase()]: {
      fid: user.fid,
      username: user.username || null,
      displayName: user.displayName || null,
      avatarUrl: user.pfpUrl || null,
      platform: platform || null
    }
  });
}

