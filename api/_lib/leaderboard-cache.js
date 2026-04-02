import { createLogger } from "../../src/utils/logger.js";

const log = createLogger("ApiLeaderboardCache");

const LEADERBOARD_RESULT_CACHE_TTL_MS = 120000;
const LEADERBOARD_ENRICHED_CACHE_TTL_MS = 60000;

const leaderboardResultCache = {
  data: null,
  timestamp: 0,
  chainId: null,
  limit: null,
  source: null
};

const enrichedLeaderboardCache = {
  data: null,
  debugInfo: null,
  config: null,
  timestamp: 0,
  chainId: null,
  limit: null,
  itemsHash: null
};

let inflightLeaderboardQuery = null;
let inflightLeaderboardQueryKey = null;

function computeItemsHash(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "empty";
  let hash = String(items.length);
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    hash += `|${item?.player || ""}:${item?.totalScore || 0}:${item?.lastUpdate || 0}`;
  }
  return hash;
}

export function invalidateLeaderboardResponseCache() {
  leaderboardResultCache.data = null;
  leaderboardResultCache.timestamp = 0;
  leaderboardResultCache.chainId = null;
  leaderboardResultCache.limit = null;
  leaderboardResultCache.source = null;

  enrichedLeaderboardCache.data = null;
  enrichedLeaderboardCache.debugInfo = null;
  enrichedLeaderboardCache.config = null;
  enrichedLeaderboardCache.timestamp = 0;
  enrichedLeaderboardCache.chainId = null;
  enrichedLeaderboardCache.limit = null;
  enrichedLeaderboardCache.itemsHash = null;
}

export async function getCachedOrFetchLeaderboardItems({ chainId, limit, fetcher, bypassCache = false }) {
  const now = Date.now();
  const cacheKey = `${chainId}:${limit}`;

  if (
    !bypassCache &&
    leaderboardResultCache.data &&
    leaderboardResultCache.chainId === chainId &&
    leaderboardResultCache.limit >= limit &&
    now - leaderboardResultCache.timestamp < LEADERBOARD_RESULT_CACHE_TTL_MS
  ) {
    log.debug(`Returning cached results (age: ${now - leaderboardResultCache.timestamp}ms)`);
    const items = leaderboardResultCache.data.slice(0, limit);
    return {
      items,
      source:
        leaderboardResultCache.source === "cdp-sql-api"
          ? "cdp-sql-api-cached"
          : leaderboardResultCache.source || "rpc-fallback",
      cacheHit: true,
      cacheAgeMs: now - leaderboardResultCache.timestamp,
      itemsHash: computeItemsHash(items)
    };
  }

  if (!bypassCache && inflightLeaderboardQuery && inflightLeaderboardQueryKey === cacheKey) {
    log.debug(`Waiting for in-flight query: ${cacheKey}`);
    const result = await inflightLeaderboardQuery;
    const items = result.items.slice(0, limit);
    return {
      items,
      source: result.source,
      cacheHit: false,
      inflightReused: true,
      itemsHash: computeItemsHash(items)
    };
  }

  const queryPromise = (async () => {
    const result = await fetcher();
    leaderboardResultCache.data = result.items;
    leaderboardResultCache.timestamp = Date.now();
    leaderboardResultCache.chainId = chainId;
    leaderboardResultCache.limit = limit;
    leaderboardResultCache.source = result.source;
    return result;
  })();

  inflightLeaderboardQuery = queryPromise;
  inflightLeaderboardQueryKey = cacheKey;

  try {
    const result = await queryPromise;
    return {
      ...result,
      cacheHit: false,
      inflightReused: false,
      itemsHash: computeItemsHash(result.items)
    };
  } finally {
    inflightLeaderboardQuery = null;
    inflightLeaderboardQueryKey = null;
  }
}

export function getCachedEnrichedLeaderboard({ chainId, limit, itemsHash, bypassCache = false }) {
  const now = Date.now();
  if (
    bypassCache ||
    !enrichedLeaderboardCache.data ||
    enrichedLeaderboardCache.chainId !== chainId ||
    enrichedLeaderboardCache.limit !== limit ||
    enrichedLeaderboardCache.itemsHash !== itemsHash ||
    now - enrichedLeaderboardCache.timestamp >= LEADERBOARD_ENRICHED_CACHE_TTL_MS
  ) {
    return null;
  }

  return {
    enriched: enrichedLeaderboardCache.data,
    debugInfo: enrichedLeaderboardCache.debugInfo,
    _config: enrichedLeaderboardCache.config,
    cacheAgeMs: now - enrichedLeaderboardCache.timestamp
  };
}

export function setCachedEnrichedLeaderboard({ chainId, limit, itemsHash, enriched, debugInfo, config }) {
  enrichedLeaderboardCache.data = Array.isArray(enriched) ? enriched : [];
  enrichedLeaderboardCache.debugInfo = debugInfo || null;
  enrichedLeaderboardCache.config = config || null;
  enrichedLeaderboardCache.timestamp = Date.now();
  enrichedLeaderboardCache.chainId = chainId;
  enrichedLeaderboardCache.limit = limit;
  enrichedLeaderboardCache.itemsHash = itemsHash || computeItemsHash(enrichedLeaderboardCache.data);
}
