import { ethers } from "ethers";
import {
  getRegistryAddress,
  getRegistryChainIdNumber,
  getRegistryContext
} from "./registry.js";
import { getEnv } from "./env.js";
import { createLogger } from "../../src/utils/logger.js";
import { mapLeaderboardRow } from "./leaderboard-shared.js";

const log = createLogger("ApiLeaderboardQuery");

const DEFAULT_SQL_BASE = "https://api.cdp.coinbase.com";
const ALT_SQL_BASE = "https://api.developer.coinbase.com";
const SCORE_ADDED_TOPIC = ethers.id("ScoreAdded(address,uint256,uint256,uint256)");

let cachedConfig = null;
const rateLimitBuckets = new Map();

export function getLeaderboardConfig() {
  if (cachedConfig) return cachedConfig;
  const env = getEnv();
  const disableFlag = String(process.env.LEADERBOARD_DISABLE || "").trim().toLowerCase();
  cachedConfig = {
    env,
    sqlApiKey: env.cdp.sqlApiKey || "",
    leaderboardDisabled: ["1", "true", "yes", "on"].includes(disableFlag),
    sqlBaseUrl: (process.env.CDP_SQL_API_BASE_URL || DEFAULT_SQL_BASE).replace(/\/$/, ""),
    sqlTimeoutMs: Number.parseInt(process.env.CDP_SQL_QUERY_TIMEOUT_MS || "15000", 10),
    sqlPollIntervalMs: 750,
    rlWindowMs: Number.parseInt(process.env.LEADERBOARD_RATE_WINDOW_MS || "10000", 10),
    rlMax: Number.parseInt(process.env.LEADERBOARD_RATE_MAX || "5", 10),
    lookbackDays: Number.parseInt(process.env.LEADERBOARD_SQL_LOOKBACK_DAYS || "0", 10)
  };
  return cachedConfig;
}

export function clientIp(req) {
  try {
    const xf = (req.headers?.["x-forwarded-for"] || req.headers?.["X-Forwarded-For"]) ?? "";
    if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
    return req.socket?.remoteAddress || req.connection?.remoteAddress || "";
  } catch {
    return "";
  }
}

export function isRateLimited(key, config) {
  if (!config.rlWindowMs || !config.rlMax || config.rlMax <= 0) return false;
  const now = Date.now();
  const windowStart = now - config.rlWindowMs;
  const bucket = Array.isArray(rateLimitBuckets.get(key)) ? rateLimitBuckets.get(key) : [];
  const fresh = bucket.filter((ts) => Number.isFinite(ts) && ts >= windowStart);
  if (fresh.length >= config.rlMax) {
    rateLimitBuckets.set(key, fresh);
    return true;
  }
  fresh.push(now);
  rateLimitBuckets.set(key, fresh);
  return false;
}

function endpointsFor(baseUrl) {
  const base = (baseUrl || DEFAULT_SQL_BASE).replace(/\/$/, "");
  return {
    v1: `${base}/sql/v1/queries`,
    platform: `${base}/platform/v2/data/query/run`
  };
}

function buildQuery(limit, chainId, config) {
  const targetChainId = chainId !== null ? Number(chainId) : getRegistryChainIdNumber() || 8453;
  const eventsTable = targetChainId === 84532 ? "base_sepolia.events" : "base.events";
  const lookbackDays = config?.lookbackDays ?? 0;
  const timeFilter =
    Number.isFinite(lookbackDays) && lookbackDays > 0
      ? `AND block_timestamp >= now() - INTERVAL ${lookbackDays} DAY`
      : "";

  let registry;
  try {
    if (targetChainId === 8453) {
      const ctx = getRegistryContext("base");
      registry = ctx.address ? ethers.getAddress(ctx.address).toLowerCase() : null;
    } else if (targetChainId === 84532) {
      const ctx = getRegistryContext("base-sepolia");
      registry = ctx.address ? ethers.getAddress(ctx.address).toLowerCase() : null;
    } else {
      const fallback = getRegistryAddress();
      registry = fallback ? ethers.getAddress(fallback).toLowerCase() : null;
    }
  } catch (error) {
    log.warn(`Failed to get registry context for chain ${targetChainId}:`, error?.message || error);
    const fallback = getRegistryAddress();
    registry = fallback ? ethers.getAddress(fallback).toLowerCase() : null;
  }

  if (!registry) {
    return "";
  }

  return `
WITH events AS (
  SELECT
    lower(CAST(parameters['player'] AS String)) AS player,
    toFloat64OrNull(CAST(parameters['newTotal'] AS String)) AS total,
    toInt64(toUnixTimestamp(block_timestamp)) AS block_ts
  FROM ${eventsTable}
  WHERE lower(address) = lower('${registry}')
    AND event_name = 'ScoreAdded'
    ${timeFilter}
)
SELECT LOWER(player) AS player_address,
       MAX(total) AS total_score,
       MAX(block_ts) AS last_update
FROM events
GROUP BY player_address
ORDER BY total_score DESC
LIMIT ${limit};
`.trim();
}

function extractRows(payload) {
  if (!payload) return null;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.rows)) return payload.result.rows;
  if (Array.isArray(payload?.result?.data)) return payload.result.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  return null;
}

async function postQuery(endpoint, statement, config) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.sqlApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: statement })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL API responded with ${response.status}: ${text}`);
  }
  try {
    return await response.json();
  } catch (err) {
    throw new Error(`SQL API returned invalid JSON: ${err?.message || err}`);
  }
}

async function fetchQuery(baseEndpoint, queryId, config) {
  const response = await fetch(`${baseEndpoint}/${queryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.sqlApiKey}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL API polling failed with ${response.status}: ${text}`);
  }
  try {
    return await response.json();
  } catch (err) {
    throw new Error(`SQL API returned invalid JSON: ${err?.message || err}`);
  }
}

async function runQueryV1(base, statement, config) {
  const eps = endpointsFor(base);
  const initial = await postQuery(eps.v1, statement, config);

  let rows = extractRows(initial?.result ?? initial);
  if (!rows && initial?.id) {
    const deadline = Date.now() + config.sqlTimeoutMs;
    let current = initial;
    while (!rows && Date.now() < deadline) {
      if (current?.status === "failed" || current?.state === "failed") {
        throw new Error("SQL query failed to execute");
      }
      if (current?.status === "completed" || current?.state === "completed") {
        rows = extractRows(current?.result ?? current);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, config.sqlPollIntervalMs));
      try {
        current = await fetchQuery(eps.v1, initial.id, config);
        rows = extractRows(current?.result ?? current);
      } catch (err) {
        log.warn("fetchQuery failed during polling:", err?.message || err);
        if (Date.now() >= deadline) {
          break;
        }
      }
    }
    if (!rows) {
      throw new Error("SQL query timed out without returning rows");
    }
  }
  if (!rows) {
    throw new Error("SQL API did not return any rows");
  }
  return rows;
}

async function runQueryPlatform(base, statement, config) {
  const eps = endpointsFor(base);
  const response = await fetch(eps.platform, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.sqlApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sql: statement })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Platform SQL API responded with ${response.status}: ${text}`);
  }
  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    throw new Error(`Platform SQL API returned invalid JSON: ${err?.message || err}`);
  }
  const rows = extractRows(payload);
  if (!rows) {
    throw new Error("Platform SQL API returned no rows");
  }
  return rows;
}

async function runQuery(statement, config) {
  const tried = new Set();
  const bases = [config.sqlBaseUrl, ALT_SQL_BASE, DEFAULT_SQL_BASE].filter(Boolean);
  let lastError = null;
  for (const base of bases) {
    const key = String(base || "").toLowerCase();
    if (tried.has(key)) continue;
    tried.add(key);
    try {
      return await runQueryPlatform(base, statement, config);
    } catch (e1) {
      lastError = e1;
      log.warn("platform run failed on", base, ":", e1?.message || e1);
      try {
        return await runQueryV1(base, statement, config);
      } catch (e2) {
        lastError = e2;
        log.warn("v1 SQL failed on", base, ":", e2?.message || e2);
      }
    }
  }
  throw lastError || new Error("All SQL endpoints failed");
}

function pickRpcUrl(chain) {
  const env = getEnv();
  if (env.rpc.leaderboard) {
    return env.rpc.leaderboard;
  }
  if (chain === 84532) {
    const url = env.rpc.baseSepolia || process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL;
    if (!url || /developer\.coinbase\.com\/rpc\//.test(url)) {
      return "https://sepolia.base.org";
    }
    return url;
  }
  if (chain === 8453) {
    const url = env.rpc.baseMainnet || process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL;
    if (!url || /developer\.coinbase\.com\/rpc\//.test(url)) {
      return "https://mainnet.base.org";
    }
    return url;
  }
  return process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL || env.rpc.baseSepolia;
}

async function fetchFromRpcFallback(limit, chainId) {
  try {
    const env = getEnv();
    const targetChainId = chainId !== null ? Number(chainId) : getRegistryChainIdNumber() || 8453;

    let address;
    try {
      if (targetChainId === 8453) {
        const ctx = getRegistryContext("base");
        address = ctx.address ? ethers.getAddress(ctx.address) : null;
      } else if (targetChainId === 84532) {
        const ctx = getRegistryContext("base-sepolia");
        address = ctx.address ? ethers.getAddress(ctx.address) : null;
      } else {
        const fallback = getRegistryAddress();
        address = fallback ? ethers.getAddress(fallback) : null;
      }
    } catch (error) {
      log.warn(`Failed to get registry context for chain ${targetChainId}:`, error?.message || error);
      const fallback = getRegistryAddress();
      address = fallback ? ethers.getAddress(fallback) : null;
    }

    if (!address) {
      const fallback = getRegistryAddress();
      log.warn(`RPC fallback skipped: registry address not configured for chain ${targetChainId}`);
      log.warn("Available env vars check:", {
        hasRegistryAddress: !!fallback,
        targetChainId,
        hasBaseMainnetReg: !!env.registry.baseMainnetAddress,
        hasBaseSepoliaReg: !!env.registry.baseSepoliaAddress,
        hasRegDefaultTarget: !!env.registry.defaultTarget
      });
      return [];
    }

    const rpcUrl = pickRpcUrl(targetChainId);
    if (!rpcUrl) {
      log.error(`RPC fallback failed: No RPC URL configured for chain ${targetChainId}`);
      throw new Error(`No RPC URL configured for fallback (chain ${targetChainId})`);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const latest = await provider.getBlockNumber();
    const windowBlocks = Number.parseInt(process.env.LEADERBOARD_FALLBACK_WINDOW_BLOCKS || "50000", 10);
    const fromBlock = Math.max(0, latest - windowBlocks);
    const chunkMax = Number.parseInt(process.env.LEADERBOARD_FALLBACK_CHUNK_SIZE || "400", 10);

    let logs = [];
    let start = fromBlock;
    while (start <= latest) {
      let size = chunkMax;
      let fetched = null;
      while (size >= 1) {
        const end = Math.min(start + size, latest);
        try {
          const part = await provider.getLogs({
            address,
            topics: [SCORE_ADDED_TOPIC],
            fromBlock: start,
            toBlock: end
          });
          fetched = part;
          logs.push(...part);
          start = end + 1;
          break;
        } catch {
          size = Math.max(1, Math.floor(size / 2));
          if (size === 1) {
            start = end + 1;
            break;
          }
        }
      }
      if (fetched === null) {
        start += Math.max(1, chunkMax);
      }
    }

    const iface = new ethers.Interface([
      "event ScoreAdded(address indexed player, uint256 score, uint256 newTotal, uint256 timestamp)"
    ]);

    const items = logs
      .map((logEntry) => {
        try {
          const parsed = iface.decodeEventLog("ScoreAdded", logEntry.data, logEntry.topics);
          const player = ethers.getAddress(parsed.player);
          const total = parsed.newTotal?.toString?.() || String(parsed.newTotal);
          const ts = parsed.timestamp ? Number(parsed.timestamp) : null;
          return {
            player,
            totalScore: total,
            lastUpdate: ts,
            blockNumber: logEntry.blockNumber
          };
        } catch (err) {
          log.warn("RPC fallback: Failed to parse log:", err?.message);
          return null;
        }
      })
      .filter(Boolean);

    const map = new Map();
    for (const item of items) {
      const key = item.player.toLowerCase();
      const prev = map.get(key);
      const totalNum = Number(item.totalScore);
      if (!prev || totalNum > Number(prev.totalScore) || (item.lastUpdate || 0) > (prev.lastUpdate || 0)) {
        map.set(key, { ...item });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
      .slice(0, limit);
  } catch (error) {
    log.warn("RPC fallback failed:", error?.message || error);
    return [];
  }
}

export async function fetchLeaderboardItems(limit, chainId, config) {
  const timings = {};
  if (!config.sqlApiKey) {
    const rpcStartedAt = Date.now();
    const items = await fetchFromRpcFallback(limit, chainId);
    timings.rpcDurationMs = Date.now() - rpcStartedAt;
    return { items, source: "rpc-fallback", timings };
  }

  const statement = buildQuery(limit, chainId, config);
  let items = [];

  if (statement && statement.trim()) {
    try {
      const sqlStartedAt = Date.now();
      const rows = await runQuery(statement, config);
      timings.sqlDurationMs = Date.now() - sqlStartedAt;
      items = Array.isArray(rows) ? rows.map(mapLeaderboardRow).filter(Boolean) : [];
    } catch (sqlError) {
      log.warn(`SQL query failed for chain ${chainId}:`, sqlError?.message || sqlError);
    }
  } else {
    log.warn(`SQL query skipped: registry address not configured for chain ${chainId}`);
  }

  if (!items.length) {
    const rpcStartedAt = Date.now();
    const fallback = await fetchFromRpcFallback(limit, chainId);
    timings.rpcDurationMs = Date.now() - rpcStartedAt;
    if (fallback.length) {
      return { items: fallback, source: "rpc-fallback", timings };
    }
  }

  return { items, source: "cdp-sql-api", timings };
}
