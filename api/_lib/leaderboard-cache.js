import { createLogger } from "../../src/utils/logger.js";

const log = createLogger("ApiLeaderboardCache");

const LEADERBOARD_RESULT_CACHE_TTL_MS = 5000;

const leaderboardResultCache = {
  data: null,
  timestamp: 0,
  chainId: null,
  limit: null,
  source: null
};

let inflightLeaderboardQuery = null;
let inflightLeaderboardQueryKey = null;

export async function getCachedOrFetchLeaderboardItems({ chainId, limit, fetcher }) {
  const now = Date.now();
  const cacheKey = `${chainId}:${limit}`;

  if (
    leaderboardResultCache.data &&
    leaderboardResultCache.chainId === chainId &&
    leaderboardResultCache.limit >= limit &&
    now - leaderboardResultCache.timestamp < LEADERBOARD_RESULT_CACHE_TTL_MS
  ) {
    log.debug(`Returning cached results (age: ${now - leaderboardResultCache.timestamp}ms)`);
    return {
      items: leaderboardResultCache.data.slice(0, limit),
      source:
        leaderboardResultCache.source === "cdp-sql-api"
          ? "cdp-sql-api-cached"
          : leaderboardResultCache.source || "rpc-fallback"
    };
  }

  if (inflightLeaderboardQuery && inflightLeaderboardQueryKey === cacheKey) {
    log.debug(`Waiting for in-flight query: ${cacheKey}`);
    const result = await inflightLeaderboardQuery;
    return {
      items: result.items.slice(0, limit),
      source: result.source
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
    return await queryPromise;
  } finally {
    inflightLeaderboardQuery = null;
    inflightLeaderboardQueryKey = null;
  }
}
