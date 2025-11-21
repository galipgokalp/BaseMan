import { ethers } from "ethers";
import { z } from "zod";
import {
  getRegistryContext,
  getRegistryTargets,
  getSigner,
  normalizeAddress,
  scoreTypes
} from "./_lib/registry.js";
import { extractQuickAuthToken, isMiniAppAuthRequired, verifyQuickAuthToken } from './_lib/miniapp-auth-verify.js';
import { setManualProfile } from "./_lib/farcaster-profiles.js";

const SIGNATURE_TTL_SECONDS = Number(process.env.SCORE_SIGNATURE_TTL_SECONDS ?? "300");
const MIN_DURATION_MS = Number(process.env.SCORE_MIN_DURATION_MS ?? "3000");
const MAX_SCORE = BigInt(process.env.SCORE_MAX_VALUE ?? "100000000");
const DEFAULT_CHAIN = process.env.REGISTRY_DEFAULT_TARGET || "base-sepolia";

// In-memory, best-effort rate limiting for score signature requests
const RATE_WINDOW_MS = Number(process.env.SCORE_SIGNER_RATE_WINDOW_MS ?? "15000");
const RATE_MAX = Number(process.env.SCORE_SIGNER_RATE_MAX ?? "3");
const __rateBuckets = new Map();

function getClientIp(req) {
  try {
    const xf = (req.headers?.["x-forwarded-for"] || req.headers?.["X-Forwarded-For"]) ?? "";
    if (typeof xf === "string" && xf.length) {
      return xf.split(",")[0].trim();
    }
    const ip = req.socket?.remoteAddress || req.connection?.remoteAddress || "";
    return typeof ip === "string" ? ip : "";
  } catch (_) {
    return "";
  }
}

function rateKey(player, ip) {
  const addr = typeof player === "string" ? player.toLowerCase() : "";
  return JSON.stringify([addr || null, ip || null]);
}

function isRateLimited(key) {
  if (!RATE_WINDOW_MS || !RATE_MAX || RATE_MAX <= 0) return false;
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  let bucket = __rateBuckets.get(key);
  if (!Array.isArray(bucket)) bucket = [];
  // Drop stale entries
  const fresh = bucket.filter((ts) => Number.isFinite(ts) && ts >= windowStart);
  if (fresh.length >= RATE_MAX) {
    __rateBuckets.set(key, fresh);
    return true;
  }
  fresh.push(now);
  __rateBuckets.set(key, fresh);
  return false;
}

const ScorePayloadSchema = z.object({
  playerAddress: z
    .string()
    .trim()
    .refine((val) => ethers.isAddress(val), { message: "playerAddress must be a valid address" }),
  score: z.coerce.bigint().refine((value) => value >= 0n, {
    message: "score must be a non-negative integer"
  }),
  durationMs: z.coerce
    .number()
    .int()
    .positive()
    .max(10 * 60 * 1000, { message: "durationMs seems unrealistic" }),
  level: z.coerce.number().int().min(0).optional(),
  fid: z.union([z.string(), z.number()]).optional(),
  username: z.string().max(64).optional(),
  signatureSeed: z.string().max(128).optional(),
  chain: z.string().trim().optional()
});

function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = parseBody(req);
  if (!payload) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Enforce Quick Auth if configured; also try to decode token for profile metadata if present
  let decodedIdentity = null;
  const token = extractQuickAuthToken(req, payload);
  if (isMiniAppAuthRequired('score')) {
    if (!token) {
      return res.status(401).json({ error: 'Mini App auth token missing' });
    }
    try {
      const verified = await verifyQuickAuthToken({ token, req });
      decodedIdentity = verified?.identity || null;
    } catch (error) {
      const status = Number(error?.statusCode || 401);
      return res.status(status).json({ error: 'Mini App auth invalid', details: error?.message || String(error) });
    }
  } else if (token) {
    // Best-effort decode even when not required, to harvest fid/username for leaderboard
    try {
      const verified = await verifyQuickAuthToken({ token, req });
      decodedIdentity = verified?.identity || null;
    } catch (_) {
      // Ignore decode errors when auth is optional
    }
  }

  const parsed = ScorePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
  }

  const data = parsed.data;
  // Rate-limit per player + IP to mitigate abuse of sponsored flow
  try {
    const ip = getClientIp(req);
    const key = rateKey(data.playerAddress, ip);
    if (isRateLimited(key)) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
  } catch (_) {}
  const targetChain = data.chain ?? DEFAULT_CHAIN;
  let registryContext;
  try {
    registryContext = getRegistryContext(targetChain);
  } catch (error) {
    if (String(error.message).includes("Unsupported registry target")) {
      return res.status(400).json({
        error: "Unsupported chain value",
        supported: getRegistryTargets()
      });
    }
    return res.status(500).json({
      error: "Registry configuration missing",
      details: error.message
    });
  }

  if (data.durationMs < MIN_DURATION_MS) {
    return res.status(400).json({
      error: "durationMs below threshold",
      minimum: MIN_DURATION_MS
    });
  }

  if (data.score > MAX_SCORE) {
    return res.status(400).json({
      error: "score exceeds reasonable threshold",
      maximum: MAX_SCORE.toString()
    });
  }

  const player = normalizeAddress(data.playerAddress);
  const deadlineSeconds = Math.floor(Date.now() / 1000) + Math.max(SIGNATURE_TTL_SECONDS, 60);
  const deadline = BigInt(deadlineSeconds);

  // Support EIP-712 v1 (deadline) and v2 (deadline + nonce)
  const isV2 = (process.env.REGISTRY_EIP712_VERSION || "2").toString() === "2";
  let nonce = undefined;
  if (isV2) {
    // Stateless nonce example (timestamp). In production, prefer per-address monotonic nonces server-side.
    nonce = BigInt(Date.now());
  }

  const value = isV2
    ? { player, score: data.score, deadline, nonce }
    : { player, score: data.score, deadline };

  const signerKeyMap = {
    appchain: "APPCHAIN_SCORE_SIGNER_PRIVATE_KEY",
    "base-sepolia": "BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY"
  };
  const signerKey = signerKeyMap[registryContext.target] || "SCORE_SIGNER_PRIVATE_KEY";
  const signer = getSigner(signerKey);
  const signature = await signer.signTypedData(registryContext.domain, scoreTypes, value);

  const response = {
    signature,
    deadline: deadlineSeconds,
    contractAddress: registryContext.address,
    chainId: registryContext.chainIdNumber,
    score: data.score.toString(),
    chain: registryContext.target
  };
  if (isV2) response.nonce = nonce?.toString?.() || String(nonce);

  // Cache inline profile data for leaderboard enrichment (optional)
  try {
    const identity = decodedIdentity || {};
    const user = identity.user || identity.profile || {};

    const inlineFid =
      data.fid ??
      identity.fid ??
      user.fid ??
      (identity.sub && String(identity.sub).startsWith("fid:")
        ? String(identity.sub).slice(4)
        : null);

    const inlineUsername =
      data.username ??
      identity.username ??
      user.username ??
      user.handle ??
      user.user_name ??
      null;

    const inlineDisplayName =
      data.displayName ??
      identity.displayName ??
      user.displayName ??
      user.display_name ??
      user.name ??
      inlineUsername ??
      null;

    const inlineAvatar =
      identity.pfpUrl ||
      (identity.pfp && identity.pfp.url) ||
      user.pfpUrl ||
      (user.pfp && user.pfp.url) ||
      user.avatar_url ||
      null;

    if (inlineFid || inlineUsername || inlineAvatar) {
      setManualProfile(player, {
        fid: inlineFid,
        username: inlineUsername,
        displayName: inlineDisplayName,
        avatarUrl: inlineAvatar
      });
    }
  } catch (_) {}

  return res.status(200).json(response);
}
