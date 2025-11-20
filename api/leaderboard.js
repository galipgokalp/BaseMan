import { ethers } from "ethers";
import { registryAddress, getRegistryContext, getRegistryChainIdNumber } from "./_lib/registry.js";
import { fetchProfilesForAddresses } from "./_lib/farcaster-profiles.js";

const DEFAULT_SQL_BASE = "https://api.cdp.coinbase.com";
const ALT_SQL_BASE = "https://api.developer.coinbase.com";
// Event topics (computed at runtime for safety)
const SCORE_SUBMITTED_TOPIC = ethers.id("ScoreSubmitted(address,uint256,uint256)");
const SCORE_ADDED_TOPIC = ethers.id("ScoreAdded(address,uint256,uint256,uint256)");
const SQL_API_KEY = process.env.CDP_SQL_API_KEY || "";
const DISABLE_FLAG = String(process.env.LEADERBOARD_DISABLE || "").trim().toLowerCase();
const LEADERBOARD_DISABLED = ["1","true","yes","on"].includes(DISABLE_FLAG);
const SQL_BASE_URL = (process.env.CDP_SQL_API_BASE_URL || DEFAULT_SQL_BASE).replace(/\/$/, "");
const SQL_TIMEOUT_MS = Number.parseInt(process.env.CDP_SQL_QUERY_TIMEOUT_MS || "15000", 10);
const SQL_POLL_INTERVAL_MS = 750;

// Basic in-memory rate limit for the leaderboard endpoint (prod-friendly defaults low)
const RL_WINDOW_MS = Number.parseInt(process.env.LEADERBOARD_RATE_WINDOW_MS || "10000", 10);
const RL_MAX = Number.parseInt(process.env.LEADERBOARD_RATE_MAX || "5", 10);
const __rlBuckets = new Map();
function clientIp(req) {
  try {
    const xf = (req.headers?.["x-forwarded-for"] || req.headers?.["X-Forwarded-For"]) ?? "";
    if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
    return req.socket?.remoteAddress || req.connection?.remoteAddress || "";
  } catch { return ""; }
}
function rlCheck(key) {
  if (!RL_WINDOW_MS || !RL_MAX || RL_MAX <= 0) return false;
  const now = Date.now();
  const windowStart = now - RL_WINDOW_MS;
  let bucket = __rlBuckets.get(key);
  if (!Array.isArray(bucket)) bucket = [];
  const fresh = bucket.filter((ts) => Number.isFinite(ts) && ts >= windowStart);
  if (fresh.length >= RL_MAX) { __rlBuckets.set(key, fresh); return true; }
  fresh.push(now); __rlBuckets.set(key, fresh); return false;
}
function endpointsFor(baseUrl) {
  const base = (baseUrl || DEFAULT_SQL_BASE).replace(/\/$/, "");
  return {
    v1: `${base}/sql/v1/queries`,
    platform: `${base}/platform/v2/data/query/run`
  };
}

function sanitizeLimit(value) {
  if (value === undefined || value === null) {
    return 20;
  }
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }
  return Math.min(parsed, 100);
}

function buildQuery(limit, chainId = null) {
  // Handle missing registry address gracefully
  // Determine chain ID: use provided chainId, or try to get from registry context, or default to Base Mainnet (8453)
  const targetChainId = chainId !== null 
    ? Number(chainId) 
    : (getRegistryChainIdNumber() || 8453); // Default to Base Mainnet (8453) if not specified
  
  // Determine table name based on chain ID
  // Base Mainnet (8453) uses 'base.events', Base Sepolia (84532) uses 'base_sepolia.events'
  const eventsTable = targetChainId === 84532 ? 'base_sepolia.events' : 'base.events';
  
  // Get registry address for the target chain
  let registry;
  try {
    if (targetChainId === 8453) {
      // Base Mainnet
      const ctx = getRegistryContext('base');
      registry = ctx.address ? ethers.getAddress(ctx.address).toLowerCase() : null;
    } else if (targetChainId === 84532) {
      // Base Sepolia
      const ctx = getRegistryContext('base-sepolia');
      registry = ctx.address ? ethers.getAddress(ctx.address).toLowerCase() : null;
    } else {
      // Fallback to default registry address
      registry = registryAddress ? ethers.getAddress(registryAddress).toLowerCase() : null;
    }
  } catch (error) {
    console.warn(`[leaderboard] Failed to get registry context for chain ${targetChainId}:`, error?.message || error);
    registry = registryAddress ? ethers.getAddress(registryAddress).toLowerCase() : null;
  }
  
  if (!registry) {
    return ""; // Return empty string if registry not configured
  }
  
  // Use normalized events table and parameters JSON.
  // On CDP SQL (ClickHouse), use JSONExtract* functions and 1-based array index for topics.
  return `
WITH events AS (
  SELECT
    lower(CAST(parameters['player'] AS String)) AS player,
    toFloat64OrNull(CAST(parameters['newTotal'] AS String)) AS total,
    toInt64(toUnixTimestamp(block_timestamp)) AS block_ts
  FROM ${eventsTable}
  WHERE lower(address) = lower('${registry}')
    AND topics[1] IN ('${SCORE_ADDED_TOPIC}')
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

async function postQuery(endpoint, statement) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SQL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: statement
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL API responded with ${response.status}: ${text}`);
  }
  return response.json();
}

async function fetchQuery(baseEndpoint, queryId) {
  const response = await fetch(`${baseEndpoint}/${queryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SQL_API_KEY}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL API polling failed with ${response.status}: ${text}`);
  }
  return response.json();
}

function extractRows(payload) {
  if (!payload) {
    return null;
  }
  if (Array.isArray(payload.rows)) {
    return payload.rows;
  }
  // CDP platform/v2/data/query/run returns { result: [...] }
  if (Array.isArray(payload?.result)) {
    return payload.result;
  }
  if (Array.isArray(payload?.result?.rows)) {
    return payload.result.rows;
  }
  if (Array.isArray(payload?.result?.data)) {
    return payload.result.data;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.records)) {
    return payload.records;
  }
  return null;
}

function mapRow(row) {
  if (!row) return null;

  const get = (key) => {
    if (row[key] !== undefined) {
      return row[key];
    }
    if (row[0] !== undefined && key === "player_address") {
      return row[0];
    }
    if (row[1] !== undefined) {
      if (key === "high_score" || key === "total_score") return row[1];
    }
    if (row[2] !== undefined && key === "last_update") {
      return row[2];
    }
    return undefined;
  };

  const playerRaw = get("player_address");
  const scoreRaw = get("total_score") ?? get("high_score");
  const updatedRaw = get("last_update");

  let player = typeof playerRaw === "string" ? playerRaw : "";
  if (player && !player.startsWith("0x") && /^[0-9a-fA-F]+$/.test(player)) {
    player = `0x${player}`;
  }
  try {
    player = ethers.getAddress(player);
  } catch {
    player = playerRaw;
  }

  const totalScore = scoreRaw !== undefined ? scoreRaw.toString() : "0";
  const lastUpdate = updatedRaw !== undefined ? Number(updatedRaw) : null;

  return {
    player,
    totalScore,
    lastUpdate
  };
}

function toNumericScore(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoTimestamp(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  try {
    return new Date(seconds * 1000).toISOString();
  } catch {
    return null;
  }
}

async function enrichWithProfiles(items) {
  if (!items.length) {
    return [];
  }

  const addresses = [
    ...new Set(
      items
        .map((item) => (typeof item.player === "string" ? item.player.toLowerCase() : null))
        .filter(Boolean)
    )
  ];

  let profileMap = new Map();
  try {
    profileMap = await fetchProfilesForAddresses(addresses);
  } catch (error) {
    console.error("[leaderboard] profile enrichment failed", error);
  }

  return items.map((item, index) => {
    const key = typeof item.player === "string" ? item.player.toLowerCase() : null;
    const profile = key ? profileMap.get(key) ?? null : null;
    const totalNumeric = toNumericScore(item.totalScore ?? item.highScore);
    const totalScore = totalNumeric ?? null;
    const lastUpdatedAt = toIsoTimestamp(item.lastUpdate);

    return {
      rank: index + 1,
      player: item.player,
      playerAddress: item.player,
      highScore: item.highScore ?? null,
      totalScore,
      lastUpdate: item.lastUpdate,
      lastUpdatedAt,
      profile
    };
  });
}

async function runQueryV1(base, statement) {
  const eps = endpointsFor(base);
  const initial = await postQuery(eps.v1, statement);

  let rows = extractRows(initial?.result ?? initial);
  if (!rows && initial?.id) {
    const deadline = Date.now() + SQL_TIMEOUT_MS;
    let current = initial;
    while (!rows && Date.now() < deadline) {
      if (current?.status === "failed" || current?.state === "failed") {
        throw new Error("SQL query failed to execute");
      }
      if (current?.status === "completed" || current?.state === "completed") {
        rows = extractRows(current?.result ?? current);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, SQL_POLL_INTERVAL_MS));
      current = await fetchQuery(eps.v1, initial.id);
      rows = extractRows(current?.result ?? current);
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

async function runQueryPlatform(base, statement) {
  const eps = endpointsFor(base);
  const response = await fetch(eps.platform, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SQL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sql: statement })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Platform SQL API responded with ${response.status}: ${text}`);
  }
  const payload = await response.json();
  const rows = extractRows(payload);
  if (!rows) {
    throw new Error("Platform SQL API returned no rows");
  }
  return rows;
}

async function runQuery(statement) {
  // Try provided base first, then alternate known base URLs
  const tried = new Set();
  const bases = [SQL_BASE_URL, ALT_SQL_BASE, DEFAULT_SQL_BASE].filter(Boolean);
  let lastError = null;
  for (const base of bases) {
    const key = (base || '').toLowerCase();
    if (tried.has(key)) continue;
    tried.add(key);
    try {
      return await runQueryV1(base, statement);
    } catch (e1) {
      lastError = e1;
      console.warn("[leaderboard] v1 SQL failed, trying platform run on", base, ":", e1?.message || e1);
      try {
        return await runQueryPlatform(base, statement);
      } catch (e2) {
        lastError = e2;
        console.warn("[leaderboard] platform run failed on", base, ":", e2?.message || e2);
      }
    }
  }
  throw lastError || new Error("All SQL endpoints failed");
}

// ---------- RPC FALLBACK (when SQL returns no rows or is unavailable) ----------

function pickRpcUrl(chain) {
  // Prefer network specific RPC, else generic ADDRESS_HISTORY_RPC_URL, else BASE_MAINNET
  // If LEADERBOARD_RPC_URL is provided, always use it (must not require custom headers)
  if (process.env.LEADERBOARD_RPC_URL) {
    return process.env.LEADERBOARD_RPC_URL;
  }
  if (chain === 84532) {
    const url = process.env.BASE_SEPOLIA_RPC_URL || process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL;
    if (!url || /developer\.coinbase\.com\/rpc\//.test(url)) {
      // Use public Base Sepolia RPC when CDP RPC (requiring headers) is set
      return "https://sepolia.base.org";
    }
    return url;
  }
  if (chain === 8453) {
    const url = process.env.BASE_MAINNET_RPC_URL || process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL;
    if (!url || /developer\.coinbase\.com\/rpc\//.test(url)) {
      return "https://mainnet.base.org";
    }
    return url;
  }
  return process.env.ADDRESS_HISTORY_RPC_URL || process.env.RPC_URL || process.env.BASE_SEPOLIA_RPC_URL;
}

async function fetchFromRpcFallback(limit, chainId = null) {
  try {
    // Determine chain ID: use provided chainId, or try to get from registry context, or default to Base Mainnet (8453)
    const targetChainId = chainId !== null 
      ? Number(chainId) 
      : (getRegistryChainIdNumber() || 8453); // Default to Base Mainnet (8453) if not specified
    
    // Get registry address for the target chain
    let address;
    try {
      if (targetChainId === 8453) {
        // Base Mainnet
        const ctx = getRegistryContext('base');
        address = ctx.address ? ethers.getAddress(ctx.address) : null;
      } else if (targetChainId === 84532) {
        // Base Sepolia
        const ctx = getRegistryContext('base-sepolia');
        address = ctx.address ? ethers.getAddress(ctx.address) : null;
      } else {
        // Fallback to default registry address
        address = registryAddress ? ethers.getAddress(registryAddress) : null;
      }
    } catch (error) {
      console.warn(`[leaderboard] Failed to get registry context for chain ${targetChainId}:`, error?.message || error);
      address = registryAddress ? ethers.getAddress(registryAddress) : null;
    }
    
    // Handle missing registry address gracefully
    if (!address) {
      console.warn(`[leaderboard] RPC fallback skipped: registry address not configured for chain ${targetChainId}`);
      return [];
    }
    
    const rpcUrl = pickRpcUrl(targetChainId);
    if (!rpcUrl) throw new Error(`No RPC URL configured for fallback (chain ${targetChainId})`);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const latest = await provider.getBlockNumber();
    const windowBlocks = Number.parseInt(process.env.LEADERBOARD_FALLBACK_WINDOW_BLOCKS || "50000", 10);
    const fromBlock = Math.max(0, latest - windowBlocks);
    
    console.log(`[leaderboard] RPC fallback: chain=${targetChainId}, address=${address}, fromBlock=${fromBlock}, toBlock=${latest}`);

    // Fetch logs in chunks to avoid provider limits
    const chunkMax = Number.parseInt(process.env.LEADERBOARD_FALLBACK_CHUNK_SIZE || "4000", 10);
    let logs = [];
    let start = fromBlock;
    while (start <= latest) {
      let size = chunkMax;
      let fetched = null;
      while (size >= 256) {
        const end = Math.min(start + size, latest);
        try {
          const part = await provider.getLogs({ address, topics: [SCORE_ADDED_TOPIC], fromBlock: start, toBlock: end });
          fetched = part;
          logs.push(...part);
          start = end + 1;
          break;
        } catch (err) {
          // Reduce chunk size and retry
          size = Math.floor(size / 2);
          if (size < 256) break;
        }
      }
      if (fetched === null) {
        // Could not fetch this window; advance a bit to avoid infinite loop
        start += 256;
      }
    }

    if (!logs.length) return [];

    const iface = new ethers.Interface([
      "event ScoreAdded(address indexed player,uint256 added,uint256 newTotal,uint256 timestamp)"
    ]);

    const items = logs
      .map((log) => {
        try {
          const parsed = iface.decodeEventLog("ScoreAdded", log.data, log.topics);
          const player = ethers.getAddress(parsed.player);
          const total = parsed.newTotal?.toString?.() || String(parsed.newTotal);
          const ts = parsed.timestamp ? Number(parsed.timestamp) : null;
          return {
            player,
            totalScore: total,
            lastUpdate: ts,
            blockNumber: log.blockNumber
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Reduce to max score per player, and latest update
    const map = new Map();
    for (const it of items) {
      const key = it.player.toLowerCase();
      const prev = map.get(key);
      const totalNum = Number(it.totalScore);
      // Keep the latest observed total (assume monotonic increase)
      if (!prev || totalNum > Number(prev.totalScore) || ((it.lastUpdate || 0) > (prev.lastUpdate || 0))) {
        map.set(key, { ...it });
      }
    }

    const list = Array.from(map.values())
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
      .slice(0, limit);
    return list;
  } catch (error) {
    console.warn("[leaderboard] RPC fallback failed:", error?.message || error);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ip = clientIp(req);
    if (rlCheck(ip)) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
  } catch (_) {}

  // Allow disabling the leaderboard in local/dev to avoid noisy logs
  if (LEADERBOARD_DISABLED) {
    return res.status(200).json({
      source: "disabled",
      limit: sanitizeLimit(req.query.limit),
      count: 0,
      items: [],
      updatedAt: new Date().toISOString()
    });
  }

  // Parse chain ID from query parameter (default to Base Mainnet 8453)
  // Supported values: "8453" (Base Mainnet), "84532" (Base Sepolia), or "base", "base-sepolia"
  let chainId = null;
  if (req.query.chain) {
    const chainParam = String(req.query.chain).trim().toLowerCase();
    if (chainParam === "8453" || chainParam === "base" || chainParam === "base-mainnet") {
      chainId = 8453;
    } else if (chainParam === "84532" || chainParam === "base-sepolia" || chainParam === "basesepolia") {
      chainId = 84532;
    } else {
      // Try to parse as number
      const parsed = Number.parseInt(chainParam, 10);
      if (Number.isFinite(parsed) && (parsed === 8453 || parsed === 84532)) {
        chainId = parsed;
      }
    }
  }
  
  // Default to Base Mainnet (8453) if not specified
  if (chainId === null) {
    chainId = 8453; // Base Mainnet
  }

  // If no SQL key, fall back to RPC so the app still functions in dev
  const limit = sanitizeLimit(req.query.limit);
  if (!SQL_API_KEY) {
    try {
      const fallback = await fetchFromRpcFallback(limit, chainId);
      const items = await enrichWithProfiles(fallback);
      return res.status(200).json({ 
        source: "rpc-fallback", 
        chainId,
        limit, 
        count: items.length, 
        items, 
        updatedAt: new Date().toISOString() 
      });
    } catch (_) {
      return res.status(200).json({ 
        source: "rpc-fallback", 
        chainId,
        limit, 
        count: 0, 
        items: [], 
        updatedAt: new Date().toISOString() 
      });
    }
  }

  try {
    
    const statement = buildQuery(limit, chainId);
    let rows = [];
    
    // Skip SQL query if registry address is not configured
    if (statement && statement.trim()) {
      try {
        rows = await runQuery(statement);
      } catch (sqlError) {
        console.warn(`[leaderboard] SQL query failed for chain ${chainId}:`, sqlError?.message || sqlError);
        rows = [];
      }
    } else {
      console.warn(`[leaderboard] SQL query skipped: registry address not configured for chain ${chainId}`);
      rows = [];
    }

    let items = Array.isArray(rows) ? rows.map(mapRow).filter(Boolean) : [];

    if (!items.length) {
      // Try RPC fallback for quick freshness
      const fallback = await fetchFromRpcFallback(limit, chainId);
      if (fallback.length) {
        items = fallback;
      }
    }
    const disableProfiles = String(process.env.LEADERBOARD_DISABLE_PROFILE_ENRICHMENT || "").trim().toLowerCase();
    const shouldEnrich = !["1","true","yes","on"].includes(disableProfiles);
    const enriched = shouldEnrich ? await enrichWithProfiles(items) : items.map((it, i) => ({
      rank: i + 1,
      player: it.player,
      playerAddress: it.player,
      highScore: it.highScore ?? null,
      totalScore: toNumericScore(it.totalScore ?? it.highScore) ?? null,
      lastUpdate: it.lastUpdate,
      lastUpdatedAt: toIsoTimestamp(it.lastUpdate),
      profile: null
    }));

    return res.status(200).json({
      source: "cdp-sql-api",
      chainId,
      limit,
      count: enriched.length,
      items: enriched,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[leaderboard] error", error);
    return res.status(500).json({
      error: "Failed to fetch leaderboard",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
