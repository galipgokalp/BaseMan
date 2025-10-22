import { ethers } from "ethers";
import { registryAddress } from "./_lib/registry.js";
import { fetchProfilesForAddresses } from "./_lib/farcaster-profiles.js";

const DEFAULT_SQL_BASE = "https://api.cdp.coinbase.com";
const SCORE_EVENT_TOPIC = "0xfb7fe18d16b2e6db5fc136ce3b1fddf2c039e2b4c5e98e8dfa9be94cf236503b";
const SQL_API_KEY = process.env.CDP_SQL_API_KEY || "";
const SQL_BASE_URL = (process.env.CDP_SQL_API_BASE_URL || DEFAULT_SQL_BASE).replace(/\/$/, "");
const SQL_TIMEOUT_MS = Number.parseInt(process.env.CDP_SQL_QUERY_TIMEOUT_MS || "15000", 10);
const SQL_POLL_INTERVAL_MS = 750;
const SQL_ENDPOINT = `${SQL_BASE_URL}/sql/v1/queries`;

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
  return `
WITH events AS (
  SELECT
    (args->>'player')::text AS player,
    (args->>'score')::numeric AS score,
    block_timestamp
  FROM base.logs
  WHERE address = LOWER('${registry}')
    AND topic0 = '${SCORE_EVENT_TOPIC}'
)
SELECT LOWER(player) AS player_address,
       MAX(score) AS high_score,
       MAX(block_timestamp) AS last_update
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

async function runQuery(statement) {
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
    const rows = await runQuery(statement);
    const items = rows.map(mapRow).filter(Boolean);
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
