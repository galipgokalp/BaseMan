import {
  getFidMappings as getFidMappingsFromRedis,
  saveProfileMapping as saveToRedis
} from "./redis-profiles.js";
import { createLogger } from "../../src/utils/logger.js";
import { maskAddress, profileSummary } from "./leaderboard-shared.js";

const log = createLogger("ApiLeaderboardProfileMapping");

const ADDRESS_TO_PROFILE_MAP = new Map();
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
let cleanupScheduled = false;

function cleanupOldEntries() {
  const now = Date.now();
  const keysToDelete = [];
  for (const [key, value] of ADDRESS_TO_PROFILE_MAP.entries()) {
    if (value.updatedAt && now - value.updatedAt > MAX_AGE_MS) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => ADDRESS_TO_PROFILE_MAP.delete(key));
  if (keysToDelete.length > 0) {
    log.debug(`Cleaned up ${keysToDelete.length} old entries`);
  }
}

export function ensureProfileCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  if (typeof setInterval !== "undefined") {
    setInterval(cleanupOldEntries, CLEANUP_INTERVAL_MS);
  }
}

export function getProfileMapping(address) {
  ensureProfileCleanup();
  if (!address || typeof address !== "string") {
    log.debug("getProfileMapping: invalid address input");
    return null;
  }
  const key = address.toLowerCase();
  const mapping = ADDRESS_TO_PROFILE_MAP.get(key);
  log.debug("getProfileMapping lookup", {
    address: maskAddress(address),
    found: !!mapping,
    mapSize: ADDRESS_TO_PROFILE_MAP.size
  });
  if (!mapping) {
    return null;
  }
  if (mapping.updatedAt && Date.now() - mapping.updatedAt > MAX_AGE_MS) {
    log.debug("getProfileMapping: mapping expired", { address: maskAddress(key) });
    ADDRESS_TO_PROFILE_MAP.delete(key);
    return null;
  }
  log.debug("getProfileMapping: returning mapping", profileSummary(mapping));
  return mapping;
}

export async function getAllFidMappings(addresses) {
  ensureProfileCleanup();
  const result = new Map();
  const normalizedAddresses = addresses
    .filter((addr) => addr && typeof addr === "string")
    .map((addr) => addr.toLowerCase());

  if (normalizedAddresses.length === 0) {
    return result;
  }

  try {
    const redisMappings = await getFidMappingsFromRedis(normalizedAddresses);
    for (const [address, fid] of redisMappings) {
      result.set(address, fid);
    }
    if (redisMappings.size > 0) {
      log.debug(`Retrieved ${redisMappings.size} FID mapping(s) from Redis`);
    }
  } catch (error) {
    log.warn("Failed to get FID mappings from Redis (non-critical):", error?.message || error);
  }

  for (const address of normalizedAddresses) {
    if (!result.has(address)) {
      const mapping = ADDRESS_TO_PROFILE_MAP.get(address);
      if (mapping && mapping.fid) {
        result.set(address, mapping.fid);
      }
    }
  }

  return result;
}

export function getStoredProfileMapping(address) {
  if (!address || typeof address !== "string") return null;
  return ADDRESS_TO_PROFILE_MAP.get(address.toLowerCase()) || null;
}

export function saveProfileMappingToMemory(address, mapping) {
  if (!address || typeof address !== "string" || !mapping) return;
  ADDRESS_TO_PROFILE_MAP.set(address.toLowerCase(), mapping);
}

export async function handleProfileMappingPost(req, res) {
  try {
    const { address, fid, username, displayName, avatarUrl, platform } = req.body || {};
    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Address required" });
    }
    if (!fid || (typeof fid !== "number" && typeof fid !== "string")) {
      return res.status(400).json({ error: "FID required" });
    }

    const key = address.toLowerCase();
    const mapping = {
      fid: String(fid),
      username: username && typeof username === "string" ? username : null,
      displayName: displayName && typeof displayName === "string" ? displayName : null,
      avatarUrl: avatarUrl && typeof avatarUrl === "string" ? avatarUrl : null,
      platform: platform && (platform === "farcaster" || platform === "base-app") ? platform : null,
      updatedAt: Date.now()
    };

    saveProfileMappingToMemory(key, mapping);
    saveToRedis(address, mapping).catch((err) => {
      log.warn("Failed to save to Redis (non-critical):", err?.message || err);
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    log.error("POST error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleProfileMappingGet(req, res) {
  try {
    const { address } = req.query || {};
    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Address required" });
    }
    return res.status(200).json(getProfileMapping(address));
  } catch (error) {
    log.error("GET error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
