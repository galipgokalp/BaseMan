/**
 * Rank Calculation Service
 * Handles rank calculation and "My Rank" summary logic
 */

import { formatScore } from '../dom.js';

/**
 * Calculate user's rank from entries
 * @param {Array} entries - Leaderboard entries
 * @param {Function} isMyEntryFn - Function to check if entry belongs to current user
 * @returns {Object|null} Rank info { rank, score, hasEntry } or null if not found
 */
export function calculateMyRank(entries, isMyEntryFn) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  
  // Find all matching entries (user might have multiple accounts: Base App + Farcaster)
  const matchingEntries = entries.filter(entry => isMyEntryFn(entry));
  
  if (matchingEntries.length === 0) {
    return { rank: 0, score: '', hasEntry: false };
  }
  
  // isMyEntryFn already filters by platform, so matchingEntries should only contain
  // entries that match the current user's platform (if platform info is available)
  // If multiple matches (shouldn't happen with platform matching), use first one
  const myEntry = matchingEntries[0];
  
  const rank = typeof myEntry.rank === "number" && Number.isFinite(myEntry.rank)
    ? myEntry.rank
    : entries.findIndex(e => e === myEntry) + 1;
  
  const score = formatScore(myEntry.totalScore, myEntry.highScore);
  
  return { rank, score, hasEntry: true };
}

/**
 * Find entry by address in leaderboard
 * @param {Array} entries - Leaderboard entries
 * @param {string} address - Address to find
 * @returns {Object|null} Entry or null
 */
export function findEntryByAddress(entries, address) {
  if (!entries || !Array.isArray(entries) || !address) return null;
  
  const normalizedAddress = address.toLowerCase();
  
  for (let i = 0, len = entries.length; i < len; i++) {
    const entry = entries[i];
    const entryAddress = entry?.player || entry?.address;
    if (entryAddress && entryAddress.toLowerCase() === normalizedAddress) {
      return entry;
    }
    
    // Check addresses array if it exists
    if (Array.isArray(entry?.addresses)) {
      for (let j = 0, addrLen = entry.addresses.length; j < addrLen; j++) {
        if (entry.addresses[j]?.toLowerCase() === normalizedAddress) {
          return entry;
        }
      }
    }
  }
  
  return null;
}

