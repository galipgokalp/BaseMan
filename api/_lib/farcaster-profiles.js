import { ethers } from "ethers";
import { getAllFidMappings, getProfileMapping } from "../leaderboard.js";

const PROFILE_PROVIDER = (process.env.FARCASTER_PROFILE_PROVIDER || "").trim().toLowerCase();
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY?.trim();
const NEYNAR_API_BASE_URL = (process.env.NEYNAR_API_BASE_URL || "https://api.neynar.com").replace(/\/$/, "");
const PROFILE_CACHE = new Map();
const MANUAL_PROFILE_CACHE = new Map();
const FALLBACK_PROVIDER = "neynar";
const DISABLE_ENRICHMENT = ["none", "off", "false", "0"].includes(PROFILE_PROVIDER);
let ENRICHMENT_DISABLED_REASON = null;

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
    provider: "neynar"
  };
}

async function fetchNeynarProfile(address) {
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
}

// Fetch profiles by FID using bulk endpoint (free tier)
async function fetchProfilesByFids(fids) {
  if (!fids || !fids.length || !NEYNAR_API_KEY) {
    return new Map();
  }

  try {
    // Filter out invalid FIDs
    const validFids = fids
      .map(fid => typeof fid === 'string' ? fid : String(fid))
      .filter(fid => fid && fid !== 'null' && fid !== 'undefined');

    if (!validFids.length) {
      return new Map();
    }

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

    users.forEach(user => {
      if (!user.fid) return;

      const fidStr = String(user.fid);
      const normalizedUser = normalizeUser(user, null);

      // Map FID to all verified addresses
      if (user.verified_addresses?.eth_addresses) {
        user.verified_addresses.eth_addresses.forEach(addr => {
          const normalized = normalizeAddress(addr);
          if (normalized) {
            fidToAddressMap.set(fidStr, normalized.toLowerCase());
            // Create profile for each address
            addressToProfileMap.set(normalized.toLowerCase(), {
              ...normalizedUser,
              address: normalized
            });
          }
        });
      }

      // If no verified addresses, still store the profile keyed by FID
      if (!fidToAddressMap.has(fidStr)) {
        addressToProfileMap.set(`fid:${fidStr}`, normalizedUser);
      }
    });

    return addressToProfileMap;
  } catch (error) {
    console.error('[farcaster-profiles] Bulk fetch error:', error);
    return new Map();
  }
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
  if (DISABLE_ENRICHMENT || ENRICHMENT_DISABLED_REASON) {
    // Short-circuit: do not attempt external calls
    const results = new Map();
    for (const raw of addresses) {
      const addr = normalizeAddress(raw);
      if (addr) results.set(addr.toLowerCase(), null);
    }
    if (ENRICHMENT_DISABLED_REASON) {
      console.warn(
        `[farcaster-profiles] enrichment disabled (${ENRICHMENT_DISABLED_REASON}); set FARCASTER_PROFILE_PROVIDER=none to silence`
      );
    }
    return results;
  }

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

  // Step 2: Get FID mappings from SDK context cache
  const addressesNeedingFetch = normalizedAddresses.filter(
    addr => !results.has(addr.toLowerCase())
  );

  if (addressesNeedingFetch.length === 0) {
    return results;
  }

  try {
    // Get FID mappings from profile-mapping.js
    const addressToFidMap = getAllFidMappings(addressesNeedingFetch);
    console.log(`[farcaster-profiles] Found ${addressToFidMap.size} FID mappings for ${addressesNeedingFetch.length} addresses`);
    
    // Step 3: If we have FIDs, use bulk endpoint (free)
    if (addressToFidMap.size > 0) {
      const fids = Array.from(new Set(Array.from(addressToFidMap.values()).filter(Boolean)));
      console.log(`[farcaster-profiles] Fetching ${fids.length} profiles via bulk endpoint:`, fids);
      const bulkProfiles = await fetchProfilesByFids(fids);
      console.log(`[farcaster-profiles] Bulk endpoint returned ${bulkProfiles.size} profiles`);

      // Map bulk results back to addresses
      for (const address of addressesNeedingFetch) {
        const key = address.toLowerCase();
        const fid = addressToFidMap.get(key);
        
        if (fid && bulkProfiles.has(key)) {
          const profile = bulkProfiles.get(key);
          results.set(key, profile);
          PROFILE_CACHE.set(key, profile);
          console.log(`[farcaster-profiles] Found bulk profile for ${key}:`, profile.username || profile.displayName || 'unnamed');
        } else {
          // Try direct SDK context mapping if bulk didn't return it
          const directMapping = getProfileMapping(address);
          if (directMapping && (directMapping.username || directMapping.displayName || directMapping.avatarUrl)) {
            const profile = {
              fid: directMapping.fid,
              username: directMapping.username,
              displayName: directMapping.displayName,
              avatarUrl: directMapping.avatarUrl,
              profileUrl: directMapping.username
                ? `https://warpcast.com/${directMapping.username}`
                : directMapping.fid
                ? `https://warpcast.com/~/users/${directMapping.fid}`
                : null,
              address: normalizeAddress(address),
              provider: 'sdk-context'
            };
            results.set(key, profile);
            PROFILE_CACHE.set(key, profile);
            console.log(`[farcaster-profiles] Using SDK context mapping for ${key}:`, profile.username || profile.displayName || 'unnamed');
          } else {
            results.set(key, null);
            if (fid) {
              console.log(`[farcaster-profiles] No profile found for ${key} (FID: ${fid}) - bulk returned nothing and no direct mapping`);
            }
          }
        }
      }

      // For remaining addresses without FIDs, try old method (might fail with 402)
      const remainingAddresses = addressesNeedingFetch.filter(
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
      // No FID mappings from SDK context cache
      // Try direct mapping lookup first (might exist from same request)
      for (const address of addressesNeedingFetch) {
        const key = address.toLowerCase();
        const directMapping = getProfileMapping(address);
        if (directMapping && (directMapping.username || directMapping.displayName || directMapping.avatarUrl)) {
          const profile = {
            fid: directMapping.fid,
            username: directMapping.username,
            displayName: directMapping.displayName,
            avatarUrl: directMapping.avatarUrl,
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
        }
      }
      
      // For remaining addresses, try old method (might fail with 402)
      const remainingAddresses = addressesNeedingFetch.filter(
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
    }
  } catch (error) {
    console.error('[farcaster-profiles] fetchProfilesForAddresses error:', error);
    // Set remaining addresses to null
    for (const address of addressesNeedingFetch) {
      const cacheKey = address.toLowerCase();
      if (!results.has(cacheKey)) {
        results.set(cacheKey, null);
      }
    }
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
