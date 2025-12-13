/**
 * Profile Mapping Service
 * Handles sending profile mappings to backend for leaderboard enrichment
 */

import { createLogger } from '../../utils/logger.js';
import { getPlatformSync, isPlatformDetected } from '../../utils/platform-detection.js';

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

  // Skip if already sent this session (reduce log noise)
  if (sentProfileMappings.has(key)) {
    // Only log at trace level to reduce noise - this is expected behavior
    return;
  }

  // Detect platform if not provided
  let detectedPlatform = platform;
  if (!detectedPlatform) {
    // First try sync cached version
    if (isPlatformDetected()) {
      const cachedPlatform = getPlatformSync();
      if (cachedPlatform === 'base') {
        detectedPlatform = 'base-app';
      } else if (cachedPlatform === 'farcaster') {
        detectedPlatform = 'farcaster';
      }
    } else {
      // If not cached, try async detection
      try {
        const { getPlatform } = await import('../../utils/platform-detection.js');
        const asyncPlatform = await getPlatform();
        if (asyncPlatform === 'base') {
          detectedPlatform = 'base-app';
        } else if (asyncPlatform === 'farcaster') {
          detectedPlatform = 'farcaster';
        }
      } catch (err) {
        log.debug('Async platform detection failed:', err?.message);
      }
    }
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

  // Ensure platform is set if available from sync cache
  let effectivePlatform = platform;
  if (!effectivePlatform && isPlatformDetected()) {
    const cachedPlatform = getPlatformSync();
    if (cachedPlatform === 'base') {
      effectivePlatform = 'base-app';
    } else if (cachedPlatform === 'farcaster') {
      effectivePlatform = 'farcaster';
    }
  }

  return JSON.stringify({
    [address.toLowerCase()]: {
      fid: user.fid,
      username: user.username || null,
      displayName: user.displayName || null,
      avatarUrl: user.pfpUrl || null,
      platform: effectivePlatform || null
    }
  });
}

