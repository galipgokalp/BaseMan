import { ethers } from "ethers";
import { z } from "zod";
import {
  getRegistryContext,
  getRegistryTargets,
  getSigner,
  normalizeAddress,
  scoreTypes
} from "./_lib/registry.js";

const SIGNATURE_TTL_SECONDS = Number(process.env.SCORE_SIGNATURE_TTL_SECONDS ?? "300");
const MIN_DURATION_MS = Number(process.env.SCORE_MIN_DURATION_MS ?? "3000");
const MAX_SCORE = BigInt(process.env.SCORE_MAX_VALUE ?? "100000000");
const DEFAULT_CHAIN = process.env.REGISTRY_DEFAULT_TARGET || "base-sepolia";

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

  const parsed = ScorePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
  }

  const data = parsed.data;
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

  const value = {
    player,
    score: data.score,
    deadline
  };

  const signerKeyMap = {
    appchain: "APPCHAIN_SCORE_SIGNER_PRIVATE_KEY",
    "base-sepolia": "BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY"
  };
  const signerKey = signerKeyMap[registryContext.target] || "SCORE_SIGNER_PRIVATE_KEY";
  const signer = getSigner(signerKey);
  const signature = await signer.signTypedData(registryContext.domain, scoreTypes, value);

  return res.status(200).json({
    signature,
    deadline: deadlineSeconds,
    contractAddress: registryContext.address,
    chainId: registryContext.chainIdNumber,
    score: data.score.toString(),
    chain: registryContext.target
  });
}
