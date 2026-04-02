import { fetchFarcasterProfilesByAddresses } from "./farcaster-profiles.js";
import { getEnv } from "./env.js";
import {
  getProfilesForAddresses as getProfilesFromRedis,
  saveProfileMapping as saveToRedis,
  setProfilesForAddresses as setProfilesToRedis
} from "./redis-profiles.js";
import {
  getStoredProfileMapping,
  saveProfileMappingToMemory
} from "./leaderboard-profile-mapping.js";
import { createLogger } from "../../src/utils/logger.js";
import {
  maskAddresses,
  profileSummary,
  shapeLeaderboardEntry
} from "./leaderboard-shared.js";

const log = createLogger("ApiLeaderboardEnrichment");
const REDIS_ENRICHMENT_BUDGET_MS = 250;
const NEYNAR_ENRICHMENT_BUDGET_MS = 800;
const TOTAL_ENRICHMENT_BUDGET_MS = 1200;

async function timebox(stage, budgetMs, fn, fallbackValue, timings, flags) {
  const startedAt = Date.now();
  let timeoutId = null;
  const timeoutToken = Symbol(stage);
  try {
    const result = await Promise.race([
      Promise.resolve().then(fn),
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(timeoutToken), budgetMs);
      })
    ]);
    timings[stage] = Date.now() - startedAt;
    if (result === timeoutToken) {
      flags.partialEnrichment = true;
      flags[`${stage}TimedOut`] = true;
      return fallbackValue;
    }
    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function hydrateProfilesForAddresses(items, req = null, timings = {}, flags = {}) {
  const env = getEnv();
  const overallStartedAt = Date.now();
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const addresses = [
    ...new Set(
      items
        .map((item) => (typeof item.player === "string" ? item.player.toLowerCase() : null))
        .filter(Boolean)
    )
  ];
  log.debug("Leaderboard addresses:", maskAddresses(addresses));

  if (addresses.length === 0) {
    return items.map((item, index) => shapeLeaderboardEntry(item, index));
  }

  const disableExternalEnrichment = env.profiles.disableEnrichment;
  const profileProvider = env.profiles.provider?.toLowerCase() || "";
  const neynarApiKey = env.profiles.neynarApiKey;
  const externalEnrichmentEnabled =
    !disableExternalEnrichment && profileProvider === "neynar" && !!neynarApiKey;

  const headerProfiles = {};
  if (req) {
    const headerValue = req.headers?.["x-profile-mapping"] || req.headers?.["X-Profile-Mapping"];
    if (headerValue) {
      try {
        const headerMapping = JSON.parse(headerValue);
        let mappingCount = 0;
        for (const [address, mapping] of Object.entries(headerMapping || {})) {
          if (address && mapping && mapping.fid) {
            const key = address.toLowerCase();
            const profile = {
              fid: String(mapping.fid),
              username: mapping.username || null,
              displayName: mapping.displayName || null,
              avatarUrl: mapping.avatarUrl || null,
              profileUrl: mapping.username ? `https://warpcast.com/${mapping.username}` : null,
              platform: mapping.platform || null,
              provider: "header"
            };
            headerProfiles[key] = profile;
            saveProfileMappingToMemory(key, { ...profile, updatedAt: Date.now() });
            saveToRedis(key, {
              fid: String(mapping.fid),
              username: mapping.username || null,
              displayName: mapping.displayName || null,
              avatarUrl: mapping.avatarUrl || null,
              platform: mapping.platform || null
            }).catch((err) => {
              log.warn("Failed to save header profile to Redis (non-critical):", err?.message || err);
            });
            mappingCount += 1;
          }
        }
        if (mappingCount > 0) {
          log.debug(`Extracted ${mappingCount} profile mapping(s) from header`);
        }
      } catch (err) {
        log.warn("Failed to parse header mapping:", err?.message, err?.stack);
      }
    }
  }

  let cachedProfiles = {};
  if (externalEnrichmentEnabled) {
    try {
      cachedProfiles = await timebox(
        "redisDurationMs",
        REDIS_ENRICHMENT_BUDGET_MS,
        () => getProfilesFromRedis(addresses),
        {},
        timings,
        flags
      );
      log.debug(`Loaded ${Object.keys(cachedProfiles).length} cached profiles from Redis`);
    } catch (error) {
      log.warn("Failed to load profiles from Redis (non-critical):", error?.message || error);
      cachedProfiles = {};
    }
  }

  const missingForExternalFetch = externalEnrichmentEnabled
    ? addresses.filter((addr) => !cachedProfiles[addr] && !headerProfiles[addr])
    : [];

  let fetchedProfiles = {};
  const remainingBudgetMs = Math.max(
    0,
    Math.min(NEYNAR_ENRICHMENT_BUDGET_MS, TOTAL_ENRICHMENT_BUDGET_MS - (Date.now() - overallStartedAt))
  );
  if (externalEnrichmentEnabled && missingForExternalFetch.length > 0 && remainingBudgetMs > 0) {
    try {
      fetchedProfiles = await timebox(
        "neynarDurationMs",
        remainingBudgetMs,
        () => fetchFarcasterProfilesByAddresses(missingForExternalFetch),
        {},
        timings,
        flags
      );
      if (Object.keys(fetchedProfiles).length > 0) {
        try {
          await setProfilesToRedis(fetchedProfiles);
        } catch (error) {
          log.warn("Failed to cache profiles in Redis (non-critical):", error?.message || error);
        }
      }
    } catch (error) {
      log.error("Failed to fetch profiles from Neynar (non-critical):", error?.message || error);
      fetchedProfiles = {};
    }
  } else if (externalEnrichmentEnabled && missingForExternalFetch.length > 0) {
    flags.partialEnrichment = true;
  }

  const allProfiles = {};
  for (const [addr, profile] of Object.entries(fetchedProfiles)) {
    allProfiles[addr] = profile;
  }
  for (const [addr, profile] of Object.entries(cachedProfiles)) {
    if (allProfiles[addr]) {
      allProfiles[addr] = {
        ...allProfiles[addr],
        ...profile,
        avatarUrl: profile.avatarUrl || allProfiles[addr].avatarUrl,
        displayName: profile.displayName || allProfiles[addr].displayName,
        username: profile.username || allProfiles[addr].username
      };
    } else {
      allProfiles[addr] = profile;
    }
  }
  for (const [addr, profile] of Object.entries(headerProfiles)) {
    allProfiles[addr] = profile;
  }

  return items.map((item, index) => {
    const addr = typeof item.player === "string" ? item.player.toLowerCase() : null;
    let profile = null;

    if (addr) {
      if (headerProfiles[addr]) {
        profile = headerProfiles[addr];
      } else if (allProfiles[addr]) {
        profile = allProfiles[addr];
      } else if (getStoredProfileMapping(addr)) {
        const stored = getStoredProfileMapping(addr);
        profile = stored
          ? {
              fid: stored.fid || null,
              username: stored.username || null,
              displayName: stored.displayName || null,
              avatarUrl: stored.avatarUrl || null,
              profileUrl: stored.profileUrl || null,
              platform: stored.platform || null,
              provider: stored.provider || "header"
            }
          : null;
      }
    }

    const entry = shapeLeaderboardEntry(item, index, profile);
    log.debug("Final entry profile:", {
      address: entry.player,
      profile: profileSummary(profile)
    });
    return entry;
  });
}

export async function enrichLeaderboardItems(items, req = null) {
  const env = getEnv();
  if (!Array.isArray(items) || items.length === 0) {
    return {
      enriched: [],
      debugInfo: { empty: true }
    };
  }

  const isDebug = req?.query?.debug === "1" || req?.query?.debug === "true";
  const hasNeynarKey = !!env.profiles.neynarApiKey;
  const hasRedis = !!(env.redis.url || env.redis.upstashRestUrl);
  const enrichmentDisabled = env.profiles.disableEnrichment;
  const timings = {};
  const flags = {
    partialEnrichment: false,
    redisDurationMsTimedOut: false,
    neynarDurationMsTimedOut: false
  };

  let enriched = [];
  let debugInfo = null;
  const startedAt = Date.now();

  try {
    enriched = await hydrateProfilesForAddresses(items, req, timings, flags);
  } catch (error) {
    log.error("hydrateProfilesForAddresses failed", error);
    enriched = items.map((item, index) => shapeLeaderboardEntry(item, index));
    if (isDebug) {
      debugInfo = {
        error: error?.message || String(error),
        hydrationFailed: true,
        partialEnrichment: true
      };
    }
  }

  if (isDebug && !debugInfo) {
    debugInfo = {
      enrichmentEnabled: true,
      items: enriched.length,
      hasNeynarKey,
      hasRedis,
      enrichmentDisabled,
      partialEnrichment: flags.partialEnrichment,
      timings: {
        enrichmentDurationMs: Date.now() - startedAt,
        ...timings
      }
    };
  }

  return {
    enriched,
    debugInfo,
    _config: { hasNeynarKey, hasRedis, enrichmentDisabled }
  };
}

export function buildDebugResponseInfo(req, resultDebugInfo, resultConfig) {
  const isDebugMode = req?.query?.debug === "1" || req?.query?.debug === "true";
  const isDevEnv = (process.env.NODE_ENV || process.env.VERCEL_ENV || "").toLowerCase() !== "production";
  if (!resultDebugInfo && !isDebugMode && !isDevEnv) {
    return null;
  }

  const debugInfo = resultDebugInfo || {};
  if ((isDebugMode || isDevEnv) && resultConfig) {
    const { hasNeynarKey, hasRedis, enrichmentDisabled } = resultConfig;
    if (!hasNeynarKey && !enrichmentDisabled) {
      debugInfo.missingNeynarKey = true;
    }
    if (!hasRedis) {
      debugInfo.missingRedis = true;
    }
    if (enrichmentDisabled) {
      debugInfo.enrichmentDisabled = true;
    }
  }

  return debugInfo;
}
