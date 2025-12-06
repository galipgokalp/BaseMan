/**
 * Profile Service Module
 * 
 * Handles:
 * - Profile mapping deduplication
 * - Profile mapping submission to backend
 * - Platform detection for profile mapping
 */

import { createLogger } from '../utils/logger.js';
import { getCachedSDKContext, getFreshSDKContext } from './sdk-context.js';

const log = createLogger('OnchainProfileService');

/**
 * Profile mapping deduplication (sent once per session per address)
 */
const sentProfileMappings = new Set();

/**
 * Check if profile mapping was already sent for this address
 * @param {string|null} address - Wallet address
 * @returns {boolean} True if already sent
 */
export function hasProfileMappingBeenSent(address) {
  if (!address) return true; // Treat null as "sent" to skip
  return sentProfileMappings.has(address.toLowerCase());
}

/**
 * Mark profile mapping as sent for this address
 * @param {string|null} address - Wallet address
 */
export function markProfileMappingSent(address) {
  if (!address) return;
  sentProfileMappings.add(address.toLowerCase());
}

/**
 * Detect platform from SDK context
 * @param {Object} context - SDK context
 * @param {Function} debug - Debug logging function
 * @returns {Promise<string|null>} Platform ('base-app', 'farcaster', or null)
 */
export async function detectPlatform(context, debug = () => {}) {
  if (!context) {
    return null;
  }
  
  // OFFICIAL METHOD: Detect platform using clientFid (per Base App docs)
  // Base App clientFid is 309857, Farcaster clientFid is typically 9152 (Warpcast)
  if (context?.client?.clientFid === 309857) {
    debug('detectPlatform: ✅ Base App detected via clientFid (309857) - OFFICIAL METHOD');
    return 'base-app';
  } else if (context?.client?.clientFid) {
    // If clientFid exists but is not 309857, it's Farcaster
    debug(`detectPlatform: ✅ Farcaster detected via clientFid (${context.client.clientFid}) - OFFICIAL METHOD`);
    return 'farcaster';
  }
  
  // If clientFid not available, use centralized utility (which also uses clientFid)
  if (typeof window !== 'undefined' && typeof window.getPlatform === 'function') {
    try {
      let platform = await window.getPlatform();
      // Convert 'base' to 'base-app' for consistency
      if (platform === 'base') {
        platform = 'base-app';
      }
      debug(`detectPlatform: Platform detected via centralized utility: ${platform}`);
      return platform;
    } catch (err) {
      debug(`detectPlatform: Error using centralized platform detection: ${err?.message || err}`);
    }
  }
  
  return null;
}

/**
 * Send profile mapping to backend for leaderboard enrichment
 * @param {Object} params - Parameters
 * @param {Object} params.sdk - Mini App SDK instance
 * @param {string} params.address - Wallet address
 * @param {Function} params.debug - Debug logging function
 * @returns {Promise<void>}
 */
export async function sendProfileMapping({ sdk, address, debug = () => {} }) {
  if (!sdk || !sdk.context || !address || hasProfileMappingBeenSent(address)) {
    if (hasProfileMappingBeenSent(address)) {
      debug('sendProfileMapping: Skipping - already sent this session');
    } else {
      debug('sendProfileMapping: Skipping - SDK context or address not available');
    }
    return;
  }
  
  try {
    // Get SDK context (try cached first, then fresh if needed)
    let context = await getCachedSDKContext(sdk, debug);
    
    // If cached context doesn't have client info, try getting fresh context
    if (!context?.client?.clientFid) {
      debug('sendProfileMapping: Cached context missing clientFid, fetching fresh context...');
      context = await getFreshSDKContext(sdk, debug);
    }
    
    const user = context?.user;
    
    if (!user || !user.fid) {
      debug('sendProfileMapping: Skipping - no user FID available');
      return;
    }
    
    // Detect platform
    const platform = await detectPlatform(context, debug);
    
    if (!platform) {
      log().warn('sendProfileMapping: ⚠️ Platform detection failed - profile mapping will be saved without platform info');
    } else {
      log().debug('sendProfileMapping: ✅ Platform detected successfully:', platform);
    }
    
    const profileMapping = {
      address: address.toLowerCase(),
      fid: user.fid,
      username: user.username || null,
      displayName: user.displayName || null,
      avatarUrl: user.pfpUrl || null,
      platform: platform || null // CRITICAL: Include platform for correct logo display
    };
    
    debug(`sendProfileMapping: Sending profile mapping for leaderboard: ${profileMapping.username || profileMapping.displayName || 'unnamed'} (platform: ${platform || 'unknown'})`);
    log().debug('sendProfileMapping: Sending profile mapping for leaderboard enrichment:', {
      address: profileMapping.address.substring(0, 10) + '...',
      fid: profileMapping.fid,
      username: profileMapping.username,
      displayName: profileMapping.displayName,
      platform: profileMapping.platform || '⚠️ NULL - logo will not be displayed'
    });
    
    // Mark as sent BEFORE making request to prevent race conditions
    markProfileMappingSent(address);
    
    // Send profile mapping asynchronously, don't block score submission
    fetch('/api/leaderboard?action=profile-mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileMapping)
    }).then((response) => {
      if (response.ok) {
        debug('sendProfileMapping: Profile mapping sent successfully');
        log().debug('sendProfileMapping: ✅ Profile mapping sent successfully for leaderboard enrichment');
      } else {
        debug(`sendProfileMapping: Profile mapping failed with status ${response.status}`);
        log().warn('sendProfileMapping: Profile mapping failed with status:', response.status);
      }
    }).catch((err) => {
      // Silently fail - profile mapping is not critical for score submission
      debug(`sendProfileMapping: Profile mapping failed (non-critical): ${err?.message || err}`);
      log().warn('sendProfileMapping: Profile mapping failed (non-critical):', err?.message || err);
    });
  } catch (profileErr) {
    // Silently fail - profile mapping is not critical for score submission
    debug(`sendProfileMapping: Profile mapping error (non-critical): ${profileErr?.message || profileErr}`);
    log().warn('sendProfileMapping: Profile mapping error (non-critical):', profileErr?.message || profileErr);
  }
}

