import { getEnv } from "./_lib/env.js";
import {
  ensureProfileCleanup,
  handleProfileMappingGet,
  handleProfileMappingPost
} from "./_lib/leaderboard-profile-mapping.js";
import {
  clientIp,
  fetchLeaderboardItems,
  getLeaderboardConfig,
  isRateLimited
} from "./_lib/leaderboard-query.js";
import {
  getCachedEnrichedLeaderboard,
  getCachedOrFetchLeaderboardItems,
  setCachedEnrichedLeaderboard
} from "./_lib/leaderboard-cache.js";
import {
  buildDebugResponseInfo,
  enrichLeaderboardItems
} from "./_lib/leaderboard-enrichment.js";
import {
  parseLeaderboardChainId,
  sanitizeLimit,
  shapeLeaderboardEntry
} from "./_lib/leaderboard-shared.js";
import { createLogger } from "../src/utils/logger.js";

const log = createLogger("ApiLeaderboard");

function buildSuccessResponse({ source, chainId, limit, enriched, debugInfo }) {
  const response = {
    source,
    chainId,
    limit,
    count: enriched.length,
    items: enriched,
    updatedAt: new Date().toISOString()
  };

  if (debugInfo) {
    response._debug = debugInfo;
  }

  return response;
}

function buildProfilesDisabledResult(items, isDebug) {
  return {
    enriched: items.map((item, index) => shapeLeaderboardEntry(item, index)),
    debugInfo: isDebug ? { enrichmentDisabled: true } : null,
    _config: {
      hasNeynarKey: !!getEnv().profiles.neynarApiKey,
      hasRedis: !!(getEnv().redis.url || getEnv().redis.upstashRestUrl),
      enrichmentDisabled: true
    }
  };
}

export default async function handler(req, res) {
  ensureProfileCleanup();

  if (req.method === "POST" && req.query.action === "profile-mapping") {
    return handleProfileMappingPost(req, res);
  }

  if (req.method === "GET" && req.query.action === "profile-mapping") {
    return handleProfileMappingGet(req, res);
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = getLeaderboardConfig();

  try {
    const ip = clientIp(req);
    if (isRateLimited(ip, config)) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
  } catch (_) {}

  const limit = sanitizeLimit(req.query.limit);
  const chainId = parseLeaderboardChainId(req.query.chain, 8453);
  const bypassCache = req.query.refresh === "1" || req.query.refresh === "true";

  if (config.leaderboardDisabled) {
    return res.status(200).json({
      source: "disabled",
      chainId,
      limit,
      count: 0,
      items: [],
      updatedAt: new Date().toISOString()
    });
  }

  try {
    const requestStartedAt = Date.now();
    const rawResult = await getCachedOrFetchLeaderboardItems({
      chainId,
      limit,
      fetcher: () => fetchLeaderboardItems(limit, chainId, config),
      bypassCache
    });
    const {
      items,
      source,
      itemsHash,
      timings: rawTimings,
      cacheHit: rawCacheHit,
      cacheAgeMs: rawCacheAgeMs
    } = rawResult;

    const isDebug = req?.query?.debug === "1" || req?.query?.debug === "true";
    const cachedEnriched = getCachedEnrichedLeaderboard({
      chainId,
      limit,
      itemsHash,
      bypassCache
    });
    const result = cachedEnriched
      ? {
          enriched: cachedEnriched.enriched,
          debugInfo: cachedEnriched.debugInfo,
          _config: cachedEnriched._config
        }
      : config.env.profiles.disableEnrichment
      ? buildProfilesDisabledResult(items, isDebug)
      : await enrichLeaderboardItems(items, req);

    if (!cachedEnriched) {
      setCachedEnrichedLeaderboard({
        chainId,
        limit,
        itemsHash,
        enriched: result.enriched,
        debugInfo: result.debugInfo,
        config: result._config
      });
    }

    const mergedDebugInfo =
      isDebug || result.debugInfo
        ? {
            ...(result.debugInfo || {}),
            timings: {
              ...(result.debugInfo?.timings || {}),
              ...(rawTimings || {}),
              totalDurationMs: Date.now() - requestStartedAt
            },
            cache: {
              rawCacheHit: !!rawCacheHit,
              rawCacheAgeMs: rawCacheAgeMs ?? null,
              enrichedCacheHit: !!cachedEnriched,
              bypassCache
            }
          }
        : result.debugInfo;
    const debugInfo = buildDebugResponseInfo(req, mergedDebugInfo, result._config);
    return res.status(200).json(
      buildSuccessResponse({
        source,
        chainId,
        limit,
        enriched: result.enriched,
        debugInfo
      })
    );
  } catch (error) {
    log.error("error", error);
    return res.status(500).json({
      error: "Failed to fetch leaderboard",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
