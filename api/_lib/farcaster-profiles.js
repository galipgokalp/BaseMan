/**
 * Farcaster Profiles Module
 * Handles fetching and caching user profiles from Neynar API
 * 
 * Phase 4.3: Performance optimizations
 * - In-memory caching (PROFILE_CACHE, MANUAL_PROFILE_CACHE)
 * - In-flight request deduplication for Neynar API calls
 * - Bulk FID lookups to minimize API calls
 */
import { ethers } from "ethers";
import { getAllFidMappings, getProfileMapping } from "../leaderboard.js";
import { getProfileMappings as getFromRedis } from "./redis-profiles.js";

const PROFILE_PROVIDER = (process.env.FARCASTER_PROFILE_PROVIDER || "").trim().toLowerCase();
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY?.trim();
const NEYNAR_API_BASE_URL = (process.env.NEYNAR_API_BASE_URL || "https://api.neynar.com").replace(/\/$/, "");
const PROFILE_CACHE = new Map();
const MANUAL_PROFILE_CACHE = new Map();
const FALLBACK_PROVIDER = "neynar";
const DISABLE_ENRICHMENT = ["none", "off", "false", "0"].includes(PROFILE_PROVIDER);
let ENRICHMENT_DISABLED_REASON = null;

// ============================================
// IN-FLIGHT REQUEST DEDUPLICATION - Phase 4.3
// ============================================

// Track in-flight Neynar API requests to avoid duplicate calls
const inflightNeynarRequests = new Map(); // key: address, value: Promise

// Track in-flight bulk FID requests
let inflightBulkFidRequest = null;
let inflightBulkFidRequestFids = null;

function normalizeAddress(value) {
  if (!value) return null;
  try {
    return ethers.getAddress(value);
  } catch {
    return null;
  }
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUser(user, address) {
  if (!user) return null;

  const fid =
    user.fid ??
    user.profile?.fid ??
    user.profile?.fidNumber ??
    (typeof user.object === "object" && user.object?.fid);

  const username =
    user.username ??
    user.profile?.username ??
    user.profile?.handle ??
    user.profile?.user_name ??
    null;

  const displayName =
    user.display_name ??
    user.displayName ??
    user.profile?.display_name ??
    user.profile?.displayName ??
    user.profile?.name ??
    null;

  const avatarUrl =
    user.pfp?.url ??
    user.profile?.pfp_url ??
    user.profile?.pfp?.url ??
    user.profile?.avatar_url ??
    null;

  const followerCount =
    toNumber(user.follower_count ?? user.followers ?? user.profile?.follower_count) ?? null;
  const followingCount =
    toNumber(user.following_count ?? user.following ?? user.profile?.following_count) ?? null;

  const bio =
    (typeof user.profile?.bio === "object" && user.profile?.bio?.text) ||
    user.profile?.bio ||
    user.bio ||
    null;

  const fidString = fid !== undefined && fid !== null ? String(fid) : null;
  const profileUrl =
    username && typeof username === "string"
      ? `https://warpcast.com/${username}`
      : fidString
      ? `https://warpcast.com/~/users/${fidString}`
      : null;

  return {
    fid: fidString,
    username: typeof username === "string" ? username : null,
    displayName: typeof displayName === "string" ? displayName : null,
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
    followerCount,
    followingCount,
    bio,
    profileUrl,
    address: normalizeAddress(address),
    provider: "neynar",
    platform: "farcaster" // Neynar API only returns Farcaster users, so always 'farcaster'
  };
}

async function fetchNeynarProfile(address) {
  const cacheKey = address.toLowerCase();
  
  // Phase 4.3: Check for in-flight request for this address
  if (inflightNeynarRequests.has(cacheKey)) {
    console.log(`[farcaster-profiles] Reusing in-flight request for ${cacheKey.substring(0, 10)}...`);
    return inflightNeynarRequests.get(cacheKey);
  }
  
  const fetchPromise = (async () => {
    try {
      const url = `${NEYNAR_API_BASE_URL}/v2/farcaster/user/by/verified_address?address=${encodeURIComponent(
        address
      )}`;

      const headers = {
        accept: "application/json",
        "api_key": NEYNAR_API_KEY,
        "x-api-key": NEYNAR_API_KEY,
        "x-neynar-experimental": "true"
      };

      const response = await fetch(url, { headers });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        // Treat auth/payment errors as "disabled" to avoid spamming logs
        if (response.status === 401 || response.status === 402) {
          ENRICHMENT_DISABLED_REASON = `neynar-${response.status}`;
          return null;
        }
        const text = await response.text();
        throw new Error(`Neynar responded with ${response.status}: ${text}`);
      }

      const payload = await response.json();
      const user = payload?.result?.user ?? payload?.user ?? (Array.isArray(payload?.users) ? payload.users[0] : null);
      return normalizeUser(user, address);
    } finally {
      // Phase 4.3: Clear in-flight request when done
      inflightNeynarRequests.delete(cacheKey);
    }
  })();
  
  // Phase 4.3: Store in-flight request
  inflightNeynarRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// Fetch profiles by FID using bulk endpoint (free tier)
// Phase 4.3: Added in-flight request deduplication
async function fetchProfilesByFids(fids) {
  if (!fids || !fids.length || !NEYNAR_API_KEY) {
    return new Map();
  }

  // Filter out invalid FIDs
  const validFids = fids
    .map(fid => typeof fid === 'string' ? fid : String(fid))
    .filter(fid => fid && fid !== 'null' && fid !== 'undefined');

  if (!validFids.length) {
    return new Map();
  }

  // Phase 4.3: Check for in-flight bulk request with same FIDs
  const sortedFidsKey = validFids.slice().sort().join(',');
  if (inflightBulkFidRequest && inflightBulkFidRequestFids === sortedFidsKey) {
    console.log(`[farcaster-profiles] Reusing in-flight bulk FID request for ${validFids.length} FIDs`);
    return inflightBulkFidRequest;
  }

  const fetchPromise = (async () => {
    try {
      const url = `${NEYNAR_API_BASE_URL}/v2/farcaster/user/bulk?fids=${validFids.join(',')}`;
      const response = await fetch(url, {
        headers: {
          'api_key': NEYNAR_API_KEY,
          'x-api-key': NEYNAR_API_KEY,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return new Map();
        }
        // Don't set ENRICHMENT_DISABLED_REASON for bulk endpoint failures
        // It's optional and shouldn't disable the whole enrichment
        console.warn(`[farcaster-profiles] Bulk API error: ${response.status}`);
        return new Map();
      }

      const payload = await response.json();
      const users = payload?.users || [];

      // Create FID -> Address mapping from verified_addresses
      const fidToAddressMap = new Map();
      const addressToProfileMap = new Map();

      // Phase 4.3: Use for loop instead of forEach for micro-optimization
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (!user.fid) continue;

        const fidStr = String(user.fid);
        const normalizedUser = normalizeUser(user, null);

        // Map FID to all verified addresses
        if (user.verified_addresses?.eth_addresses) {
          const ethAddresses = user.verified_addresses.eth_addresses;
          for (let j = 0; j < ethAddresses.length; j++) {
            const addr = ethAddresses[j];
            const normalized = normalizeAddress(addr);
            if (normalized) {
              fidToAddressMap.set(fidStr, normalized.toLowerCase());
              // Create profile for each address
              addressToProfileMap.set(normalized.toLowerCase(), {
                ...normalizedUser,
                address: normalized
              });
            }
          }
        }

        // If no verified addresses, still store the profile keyed by FID
        if (!fidToAddressMap.has(fidStr)) {
          addressToProfileMap.set(`fid:${fidStr}`, normalizedUser);
        }
      }

      return addressToProfileMap;
    } catch (error) {
      console.error('[farcaster-profiles] Bulk fetch error:', error);
      return new Map();
    } finally {
      // Phase 4.3: Clear in-flight request
      inflightBulkFidRequest = null;
      inflightBulkFidRequestFids = null;
    }
  })();

  // Phase 4.3: Store in-flight request
  inflightBulkFidRequest = fetchPromise;
  inflightBulkFidRequestFids = sortedFidsKey;
  
  return fetchPromise;
}

async function resolveProfile(address) {
  if (!address) return null;

  const cacheKey = address.toLowerCase();
  if (PROFILE_CACHE.has(cacheKey)) {
    return PROFILE_CACHE.get(cacheKey);
  }

  let profile = null;
  try {
    if (!ENRICHMENT_DISABLED_REASON && !DISABLE_ENRICHMENT && (PROFILE_PROVIDER === "neynar" || (!PROFILE_PROVIDER && FALLBACK_PROVIDER === "neynar"))) {
      if (!NEYNAR_API_KEY) {
        PROFILE_CACHE.set(cacheKey, null);
        return null;
      }
      profile = await fetchNeynarProfile(address);
    }
  } catch (error) {
    console.error("[farcaster-profiles] resolve error", error);
  }

  PROFILE_CACHE.set(cacheKey, profile ?? null);
  return profile ?? null;
}

export async function fetchProfilesForAddresses(addresses = []) {
  const results = new Map();
  const normalizedAddresses = addresses
    .map(addr => normalizeAddress(addr))
    .filter(Boolean);

  if (!normalizedAddresses.length) {
    return results;
  }

  // Step 1: Check cache first
  for (const address of normalizedAddresses) {
    const cacheKey = address.toLowerCase();
    if (PROFILE_CACHE.has(cacheKey)) {
      results.set(cacheKey, PROFILE_CACHE.get(cacheKey));
    } else if (MANUAL_PROFILE_CACHE.has(cacheKey)) {
      results.set(cacheKey, MANUAL_PROFILE_CACHE.get(cacheKey));
    }
  }

  // Step 2: Check Redis (persistent storage) first
  // This ensures all users' profile data is available, not just the current user
  const addressesNeedingFetch = normalizedAddresses.filter(
    addr => !results.has(addr.toLowerCase())
  );

  // Try Redis first (persistent storage for all users)
  if (addressesNeedingFetch.length > 0) {
    try {
      console.log(`[farcaster-profiles] Checking Redis for ${addressesNeedingFetch.length} addresses:`, addressesNeedingFetch.map(a => a.substring(0, 10) + '...'));
      const redisMappings = await getFromRedis(addressesNeedingFetch);
      console.log(`[farcaster-profiles] Redis returned ${redisMappings.size} mappings for ${addressesNeedingFetch.length} requested addresses`);
      
      let redisProfileCount = 0;
      for (const [address, mapping] of redisMappings) {
        if (mapping && (mapping.username || mapping.displayName || mapping.avatarUrl)) {
          const key = address.toLowerCase();
          const profile = {
            fid: mapping.fid,
            username: mapping.username,
            displayName: mapping.displayName,
            avatarUrl: mapping.avatarUrl,
            platform: mapping.platform && (mapping.platform === 'farcaster' || mapping.platform === 'base-app') ? mapping.platform : null,
            profileUrl: mapping.username
              ? `https://warpcast.com/${mapping.username}`
              : mapping.fid
              ? `https://warpcast.com/~/users/${mapping.fid}`
              : null,
            address: normalizeAddress(address),
            provider: 'redis-persistent'
          };
          results.set(key, profile);
          PROFILE_CACHE.set(key, profile);
          redisProfileCount++;
          console.log(`[farcaster-profiles] ✅ Using Redis mapping for ${key}:`, profile.username || profile.displayName || 'unnamed', `platform=${profile.platform || 'null'}`);
        } else {
          const key = address.toLowerCase();
          console.log(`[farcaster-profiles] ⚠️ Redis mapping for ${key} exists but incomplete:`, { hasUsername: !!mapping?.username, hasDisplayName: !!mapping?.displayName, hasAvatarUrl: !!mapping?.avatarUrl });
        }
      }
      
      if (redisProfileCount > 0) {
        console.log(`[farcaster-profiles] ✅ Successfully loaded ${redisProfileCount} profile(s) from Redis out of ${addressesNeedingFetch.length} requested`);
      } else if (addressesNeedingFetch.length > 0) {
        console.log(`[farcaster-profiles] ℹ️ No profiles found in Redis for ${addressesNeedingFetch.length} addresses - profiles will appear as users play and submit scores`);
      }
    } catch (error) {
      console.warn('[farcaster-profiles] Failed to get profiles from Redis (non-critical):', error?.message || error);
    }
  }

  // Step 3: Check direct profile mapping (from header/SDK context)
  // This is the most reliable source as it comes from the current user's SDK
  // IMPORTANT: Always check direct mapping even if enrichment is disabled
  // because direct mapping doesn't require external API calls
  const addressesForDirectMapping = normalizedAddresses.filter(
    addr => !results.has(addr.toLowerCase())
  );

  // First, try direct mapping from header/SDK context (highest priority for current user)
  // This works even when Neynar API is disabled because it uses header data
  for (const address of addressesForDirectMapping) {
    const key = address.toLowerCase();
    const directMapping = getProfileMapping(address);
    console.log(`[farcaster-profiles] Checking direct mapping for ${key}:`, { 
      found: !!directMapping, 
      hasUsername: !!directMapping?.username,
      hasDisplayName: !!directMapping?.displayName,
      hasAvatarUrl: !!directMapping?.avatarUrl,
      fid: directMapping?.fid 
    });
    if (directMapping && (directMapping.username || directMapping.displayName || directMapping.avatarUrl)) {
      const profile = {
        fid: directMapping.fid,
        username: directMapping.username,
        displayName: directMapping.displayName,
        avatarUrl: directMapping.avatarUrl,
        platform: directMapping.platform && (directMapping.platform === 'farcaster' || directMapping.platform === 'base-app') ? directMapping.platform : null,
        profileUrl: directMapping.username
          ? `https://warpcast.com/${directMapping.username}`
          : directMapping.fid
          ? `https://warpcast.com/~/users/${directMapping.fid}`
          : null,
        address: normalizeAddress(address),
        provider: 'sdk-context-direct'
      };
      results.set(key, profile);
      PROFILE_CACHE.set(key, profile);
      console.log(`[farcaster-profiles] ✅ Using direct SDK context mapping for ${key}:`, profile.username || profile.displayName || 'unnamed', `platform=${profile.platform || 'null'}`);
    } else {
      console.log(`[farcaster-profiles] ❌ No direct mapping for ${key} (mapping exists: ${!!directMapping})`);
    }
  }

  // Update addresses needing fetch (exclude ones we just found from direct mapping)
  const addressesStillNeedingFetch = addressesForDirectMapping.filter(
    addr => !results.has(addr.toLowerCase())
  );

  if (addressesStillNeedingFetch.length === 0) {
    return results;
  }

  try {
    // Step 4: Get FID mappings for remaining addresses
    const addressToFidMap = await getAllFidMappings(addressesStillNeedingFetch);
    console.log(`[farcaster-profiles] Found ${addressToFidMap.size} FID mappings for ${addressesStillNeedingFetch.length} addresses`);
    
    // Step 4: If we have FIDs, use bulk endpoint (free)
    if (addressToFidMap.size > 0) {
      const fids = Array.from(new Set(Array.from(addressToFidMap.values()).filter(Boolean)));
      console.log(`[farcaster-profiles] Fetching ${fids.length} profiles via bulk endpoint:`, fids);
      const bulkProfiles = await fetchProfilesByFids(fids);
      console.log(`[farcaster-profiles] Bulk endpoint returned ${bulkProfiles.size} profiles`);

      // Map bulk results back to addresses
      for (const address of addressesStillNeedingFetch) {
        const key = address.toLowerCase();
        const fid = addressToFidMap.get(key);
        
        if (fid && bulkProfiles.has(key)) {
          const profile = bulkProfiles.get(key);
          results.set(key, profile);
          PROFILE_CACHE.set(key, profile);
          console.log(`[farcaster-profiles] Found bulk profile for ${key}:`, profile.username || profile.displayName || 'unnamed');
        } else {
          // Bulk didn't return profile for this address
          results.set(key, null);
          if (fid) {
            console.log(`[farcaster-profiles] No bulk profile found for ${key} (FID: ${fid}) - verified_addresses may not match`);
          }
        }
      }

      // For remaining addresses without FIDs, try old method (might fail with 402)
      const remainingAddresses = addressesStillNeedingFetch.filter(
        addr => !results.has(addr.toLowerCase())
      );

      if (remainingAddresses.length > 0 && !ENRICHMENT_DISABLED_REASON) {
        const tasks = [];
        for (const address of remainingAddresses) {
          const cacheKey = address.toLowerCase();
          tasks.push(
            resolveProfile(address).then((profile) => {
              results.set(cacheKey, profile ?? null);
            })
          );
        }
        if (tasks.length) {
          await Promise.allSettled(tasks);
        }
      } else {
        // Mark remaining as null
        for (const address of remainingAddresses) {
          const cacheKey = address.toLowerCase();
          if (!results.has(cacheKey)) {
            results.set(cacheKey, null);
          }
        }
      }
    } else {
      // No FID mappings - direct mapping already checked above
      // For remaining addresses, try old method only if enrichment is enabled
      const remainingAddresses = addressesStillNeedingFetch.filter(
        addr => !results.has(addr.toLowerCase())
      );
      
      if (remainingAddresses.length > 0 && !DISABLE_ENRICHMENT && !ENRICHMENT_DISABLED_REASON) {
        const tasks = [];
        for (const address of remainingAddresses) {
          const cacheKey = address.toLowerCase();
          tasks.push(
            resolveProfile(address).then((profile) => {
              results.set(cacheKey, profile ?? null);
            })
          );
        }
        if (tasks.length) {
          await Promise.allSettled(tasks);
        }
      } else {
        // Mark remaining as null (enrichment disabled or no mappings)
        for (const address of remainingAddresses) {
          const cacheKey = address.toLowerCase();
          if (!results.has(cacheKey)) {
            results.set(cacheKey, null);
          }
        }
        // Log enrichment disabled only if we couldn't find profiles via direct mapping
        if (remainingAddresses.length > 0 && ENRICHMENT_DISABLED_REASON) {
          console.warn(
            `[farcaster-profiles] enrichment disabled (${ENRICHMENT_DISABLED_REASON}); set FARCASTER_PROFILE_PROVIDER=none to silence`
          );
        }
      }
    }
  } catch (error) {
    console.error('[farcaster-profiles] fetchProfilesForAddresses error:', error);
    // Set remaining addresses to null
    for (const address of addressesStillNeedingFetch || addressesNeedingFetch || []) {
      const cacheKey = address.toLowerCase();
      if (!results.has(cacheKey)) {
        results.set(cacheKey, null);
      }
    }
  }

  // Log summary
  const foundCount = Array.from(results.values()).filter(p => p !== null).length;
  if (foundCount > 0) {
    console.log(`[farcaster-profiles] Returning ${foundCount} profile(s) out of ${normalizedAddresses.length} requested addresses`);
  }

  return results;
}

export function setManualProfile(address, { fid = null, username = null, displayName = null, avatarUrl = null } = {}) {
  const normalized = normalizeAddress(address);
  if (!normalized) return;
  const key = normalized.toLowerCase();
  const profile = {
    fid: fid ? String(fid) : null,
    username: typeof username === "string" && username.trim() ? username.trim() : null,
    displayName: typeof displayName === "string" && displayName.trim() ? displayName.trim() : (username || null),
    avatarUrl: typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : null,
    followerCount: null,
    followingCount: null,
    bio: null,
    profileUrl: null,
    address: normalized,
    provider: "inline"
  };
  MANUAL_PROFILE_CACHE.set(key, profile);
  PROFILE_CACHE.set(key, profile);
}
/**
 * Fetch Farcaster users for multiple Ethereum addresses using Neynar bulk-by-address API.
 * @param {string[]} addresses - lowercase Ethereum addresses
 * @returns {Promise<Object<string, Profile>>} - { [address]: normalizedProfile }
 */
export async function fetchFarcasterProfilesByAddresses(addresses) {
  // Guard: if no addresses or Neynar not enabled → return {}
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return {};
  }

  const PROFILE_PROVIDER = (process.env.FARCASTER_PROFILE_PROVIDER || "").trim().toLowerCase();
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY?.trim();
  const NEYNAR_API_BASE_URL = (process.env.NEYNAR_API_BASE_URL || "https://api.neynar.com").replace(/\/$/, "");
  const DISABLE_ENRICHMENT = ["none", "off", "false", "0"].includes(PROFILE_PROVIDER);
  const disableEnrichmentFlag = ["1","true","yes","on"].includes(String(process.env.LEADERBOARD_DISABLE_PROFILE_ENRICHMENT || "").trim().toLowerCase());

  console.log("[DEBUG] Neynar ENV:", {
    provider: PROFILE_PROVIDER,
    hasApiKey: !!NEYNAR_API_KEY,
    disableEnrichment: disableEnrichmentFlag,
    addressCount: addresses.length
  });

  if (DISABLE_ENRICHMENT || PROFILE_PROVIDER !== "neynar" || !NEYNAR_API_KEY || disableEnrichmentFlag) {
    return {};
  }

  // Normalize all addresses to lowercase and de-duplicate
  const normalizedAddresses = addresses
    .map(addr => {
      if (!addr || typeof addr !== 'string') return null;
      try {
        return ethers.getAddress(addr).toLowerCase();
      } catch {
        return addr.toLowerCase();
      }
    })
    .filter(Boolean);

  if (normalizedAddresses.length === 0) {
    return {};
  }

  // Remove duplicates
  const uniqueAddresses = [...new Set(normalizedAddresses)];
  console.log("[DEBUG] Unique addresses for Neynar:", uniqueAddresses);

  // Chunk addresses into batches of <= 350 for the API
  const CHUNK_SIZE = 350;
  const chunks = [];
  for (let i = 0; i < uniqueAddresses.length; i += CHUNK_SIZE) {
    chunks.push(uniqueAddresses.slice(i, i + CHUNK_SIZE));
  }

  const allProfiles = {};

  // For each chunk, call the bulk-by-address endpoint
  for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
    const chunk = chunks[chunkIdx];
    console.log(`[DEBUG] Chunk ${chunkIdx + 1}/${chunks.length}: size=${chunk.length}`);
    try {
      const addressesParam = chunk.join(',');
      const url = `${NEYNAR_API_BASE_URL}/v2/farcaster/user/bulk-by-address/?addresses=${encodeURIComponent(addressesParam)}&address_types=custody_address,verified_address`;

      const headers = {
        'accept': 'application/json',
        'x-api-key': NEYNAR_API_KEY
      };

      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`[farcaster-profiles] Bulk-by-address API returned 404 for chunk ${chunkIdx + 1}/${chunks.length}`);
          continue;
        }
        if (response.status === 401 || response.status === 402) {
          console.warn(`[farcaster-profiles] Bulk-by-address API auth error: ${response.status}`);
          break; // Don't retry other chunks if auth fails
        }
        const text = await response.text();
        console.warn(`[farcaster-profiles] Bulk-by-address API error ${response.status} for chunk ${chunkIdx + 1}/${chunks.length}: ${text.substring(0, 200)}`);
        continue; // Continue with next chunk
      }

      const payload = await response.json();
      console.log("[DEBUG] Neynar raw response keys:", Object.keys(payload || {}));
      const users = payload?.users || payload?.result?.users || [];
      console.log("[DEBUG] Neynar response.users length:", Array.isArray(users) ? users.length : "NO USERS");

      // For every ETH address associated with a user (custody or verified)
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (!user) continue;

        const normalizedProfile = normalizeUser(user, null);

        // Map profile to all associated addresses (custody and verified)
        const associatedAddresses = [];

        // Check custody address
        if (user.custody_address) {
          try {
            const addr = ethers.getAddress(user.custody_address).toLowerCase();
            associatedAddresses.push(addr);
          } catch {
            // Invalid address, skip
          }
        }

        // Check verified addresses
        if (user.verified_addresses?.eth_addresses && Array.isArray(user.verified_addresses.eth_addresses)) {
          for (let j = 0; j < user.verified_addresses.eth_addresses.length; j++) {
            try {
              const addr = ethers.getAddress(user.verified_addresses.eth_addresses[j]).toLowerCase();
              if (!associatedAddresses.includes(addr)) {
                associatedAddresses.push(addr);
              }
            } catch {
              // Invalid address, skip
            }
          }
        }

        // Map profile to each associated address
        for (let j = 0; j < associatedAddresses.length; j++) {
          const addr = associatedAddresses[j];
          if (chunk.includes(addr)) {
            allProfiles[addr] = {
              ...normalizedProfile,
              address: addr,
              provider: "neynar",
              platform: "farcaster"
            };
          }
        }
      }

      console.log(`[farcaster-profiles] Bulk-by-address chunk ${chunkIdx + 1}/${chunks.length}: found ${Object.keys(allProfiles).length} profiles so far`);
    } catch (error) {
      console.error(`[farcaster-profiles] Bulk-by-address chunk ${chunkIdx + 1}/${chunks.length} error:`, error?.message || error);
      // Continue with next chunk
    }
  }

  console.log(`[farcaster-profiles] Bulk-by-address: returning ${Object.keys(allProfiles).length} profiles for ${uniqueAddresses.length} addresses`);
  console.log("[DEBUG] Total normalized profiles:", Object.keys(allProfiles).length);
  return allProfiles;
}

// Cache clear trigger: 20251206030633
