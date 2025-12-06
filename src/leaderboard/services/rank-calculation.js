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
  
  const myEntry = entries.find(entry => isMyEntryFn(entry));
  if (!myEntry) {
    return { rank: 0, score: '', hasEntry: false };
  }
  
  const rank = typeof myEntry.rank === "number" && Number.isFinite(myEntry.rank)
    ? myEntry.rank
    : entries.findIndex(e => isMyEntryFn(e)) + 1;
  
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

