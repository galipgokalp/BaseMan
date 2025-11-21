import { ethers } from "ethers";
import { getCachedProfiles, setCachedProfile } from "./profile-cache.js";

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
  const tasks = [];

  // Check persistent cache first (if configured)
  try {
    const cached = await getCachedProfiles(addresses);
    for (const [key, value] of cached.entries()) {
      if (value) {
        results.set(key, value);
      }
    }
  } catch (_) {}

  for (const raw of addresses) {
    const address = normalizeAddress(raw);
    if (!address) continue;

    const cacheKey = address.toLowerCase();
    if (results.has(cacheKey)) {
      continue;
    }

    if (PROFILE_CACHE.has(cacheKey)) {
      results.set(cacheKey, PROFILE_CACHE.get(cacheKey));
      continue;
    }

    if (MANUAL_PROFILE_CACHE.has(cacheKey)) {
      results.set(cacheKey, MANUAL_PROFILE_CACHE.get(cacheKey));
      continue;
    }

    tasks.push(
      resolveProfile(address).then((profile) => {
        results.set(cacheKey, profile ?? null);
      })
    );
  }

  if (tasks.length) {
    await Promise.allSettled(tasks);
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
  // Fire and forget; if store fails, do not block request path
  try { setCachedProfile(normalized, profile); } catch (_) {}
}
