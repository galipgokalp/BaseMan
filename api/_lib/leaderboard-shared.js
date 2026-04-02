import { ethers } from "ethers";

export function maskAddress(address) {
  if (!address || typeof address !== "string") return "";
  const normalized = address.toLowerCase();
  return normalized.length > 10 ? `${normalized.slice(0, 6)}…${normalized.slice(-4)}` : normalized;
}

export function maskAddresses(addresses = []) {
  return addresses.map((addr) => maskAddress(addr));
}

export function profileSummary(profile) {
  if (!profile) return { hasProfile: false };
  return {
    fid: profile.fid || null,
    hasUsername: Boolean(profile.username),
    platform: profile.platform || null,
    provider: profile.provider || null
  };
}

export function sanitizeLimit(value) {
  if (value === undefined || value === null) {
    return 20;
  }
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }
  return Math.min(parsed, 100);
}

export function parseLeaderboardChainId(value, fallback = 8453) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const chainParam = String(value).trim().toLowerCase();
  if (chainParam === "8453" || chainParam === "base" || chainParam === "base-mainnet") {
    return 8453;
  }
  if (chainParam === "84532" || chainParam === "base-sepolia" || chainParam === "basesepolia") {
    return 84532;
  }

  const parsed = Number.parseInt(chainParam, 10);
  if (Number.isFinite(parsed) && (parsed === 8453 || parsed === 84532)) {
    return parsed;
  }

  return fallback;
}

export function mapLeaderboardRow(row) {
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

export function toNumericScore(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toIsoTimestamp(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  try {
    return new Date(seconds * 1000).toISOString();
  } catch {
    return null;
  }
}

export function shapeLeaderboardEntry(item, index, profile = null) {
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
    profile: profile || null
  };
}
