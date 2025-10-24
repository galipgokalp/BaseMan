import { ethers } from "ethers";
import { registryAddress } from "./_lib/registry.js";
import { fetchProfilesForAddresses } from "./_lib/farcaster-profiles.js";

const DEFAULT_SQL_BASE = "https://api.cdp.coinbase.com";
// keccak256("ScoreSubmitted(address,uint256,uint256)")
const SCORE_EVENT_TOPIC = "0xb7f20d0949b6a8bc59d005af4a52f7ff5d0cfcde9056fa556adb0e4b24dcb6d2";
const SQL_API_KEY = process.env.CDP_SQL_API_KEY || "";
const SQL_BASE_URL = (process.env.CDP_SQL_API_BASE_URL || DEFAULT_SQL_BASE).replace(/\/$/, "");
const SQL_TIMEOUT_MS = Number.parseInt(process.env.CDP_SQL_QUERY_TIMEOUT_MS || "15000", 10);
const SQL_POLL_INTERVAL_MS = 750;
const SQL_ENDPOINT = `${SQL_BASE_URL}/sql/v1/queries`;
const PLATFORM_RUN_ENDPOINT = `${SQL_BASE_URL}/platform/v2/data/query/run`;

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

function buildQuery(limit) {
  const registry = ethers.getAddress(registryAddress).toLowerCase();
  // Use normalized events table and parameters JSON.
  // On CDP SQL (ClickHouse), use JSONExtract* functions and 1-based array index for topics.
  return `
WITH events AS (
  SELECT
    lower(CAST(parameters['player'] AS String)) AS player,
    toFloat64OrNull(CAST(parameters['score'] AS String)) AS score,
    toInt64(toUnixTimestamp(block_timestamp)) AS block_ts
  FROM base.events
  WHERE lower(address) = lower('${registry}')
    AND topics[1] = '${SCORE_EVENT_TOPIC}'
)
SELECT LOWER(player) AS player_address,
       MAX(score) AS high_score,
       MAX(block_ts) AS last_update
FROM events
GROUP BY player_address
ORDER BY high_score DESC
LIMIT ${limit};
`.trim();
}

async function postQuery(statement) {
  const response = await fetch(SQL_ENDPOINT, {
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

async function fetchQuery(queryId) {
  const response = await fetch(`${SQL_ENDPOINT}/${queryId}`, {
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
    if (row[1] !== undefined && key === "high_score") {
      return row[1];
    }
    if (row[2] !== undefined && key === "last_update") {
      return row[2];
    }
    return undefined;
  };

  const playerRaw = get("player_address");
  const scoreRaw = get("high_score");
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

  const highScore = scoreRaw !== undefined ? scoreRaw.toString() : "0";
  const lastUpdate = updatedRaw !== undefined ? Number(updatedRaw) : null;

  return {
    player,
    highScore,
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
    const scoreNumeric = toNumericScore(item.highScore);
    const totalScore = scoreNumeric ?? null;
    const lastUpdatedAt = toIsoTimestamp(item.lastUpdate);

    return {
      rank: index + 1,
      player: item.player,
      playerAddress: item.player,
      highScore: item.highScore,
      totalScore,
      lastUpdate: item.lastUpdate,
      lastUpdatedAt,
      profile
    };
  });
}

async function runQueryV1(statement) {
  const initial = await postQuery(statement);

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
      current = await fetchQuery(initial.id);
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

async function runQueryPlatform(statement) {
  const response = await fetch(PLATFORM_RUN_ENDPOINT, {
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
  try {
    return await runQueryV1(statement);
  } catch (e) {
    // Fallback to platform/v2 endpoint if v1 path unsupported (404) or other errors
    console.warn("[leaderboard] v1 SQL failed, trying platform run:", e?.message || e);
    return await runQueryPlatform(statement);
  }
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

async function fetchFromRpcFallback(limit) {
  try {
    const address = ethers.getAddress(registryAddress);
    const chain = Number.parseInt(process.env.REGISTRY_CHAIN_ID || process.env.BASE_SEPOLIA_REGISTRY_CHAIN_ID || "84532", 10);
    const rpcUrl = pickRpcUrl(chain);
    if (!rpcUrl) throw new Error("No RPC URL configured for fallback");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const latest = await provider.getBlockNumber();
    const windowBlocks = Number.parseInt(process.env.LEADERBOARD_FALLBACK_WINDOW_BLOCKS || "50000", 10);
    const fromBlock = Math.max(0, latest - windowBlocks);

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
          const part = await provider.getLogs({ address, topics: [SCORE_EVENT_TOPIC], fromBlock: start, toBlock: end });
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
      "event ScoreSubmitted(address indexed player,uint256 score,uint256 timestamp)"
    ]);

    const items = logs
      .map((log) => {
        try {
          const parsed = iface.decodeEventLog("ScoreSubmitted", log.data, log.topics);
          const player = ethers.getAddress(parsed.player);
          const score = parsed.score?.toString?.() || String(parsed.score);
          const ts = parsed.timestamp ? Number(parsed.timestamp) : null;
          return {
            player,
            highScore: score,
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
      const scoreNum = Number(it.highScore);
      if (!prev || scoreNum > Number(prev.highScore)) {
        map.set(key, { ...it });
      } else if (prev && (it.lastUpdate || 0) > (prev.lastUpdate || 0)) {
        prev.lastUpdate = it.lastUpdate;
        prev.blockNumber = it.blockNumber;
      }
    }

    const list = Array.from(map.values())
      .sort((a, b) => Number(b.highScore) - Number(a.highScore))
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

  if (!SQL_API_KEY) {
    return res.status(500).json({ error: "CDP_SQL_API_KEY is not configured" });
  }

  try {
    const limit = sanitizeLimit(req.query.limit);
    const statement = buildQuery(limit);
    let rows = [];
    try {
      rows = await runQuery(statement);
    } catch (sqlError) {
      console.warn("[leaderboard] SQL query failed:", sqlError?.message || sqlError);
      rows = [];
    }

    let items = Array.isArray(rows) ? rows.map(mapRow).filter(Boolean) : [];

    if (!items.length) {
      // Try RPC fallback for quick freshness
      const fallback = await fetchFromRpcFallback(limit);
      if (fallback.length) {
        items = fallback;
      }
    }
    const enriched = await enrichWithProfiles(items);

    return res.status(200).json({
      source: "cdp-sql-api",
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
