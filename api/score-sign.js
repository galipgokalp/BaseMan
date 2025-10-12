import { ethers } from "ethers";
import { z } from "zod";
import {
  getSigner,
  normalizeAddress,
  registryAddress,
  registryChainIdNumber,
  registryDomain,
  scoreTypes
} from "./_lib/registry.js";

const signer = getSigner("SCORE_SIGNER_PRIVATE_KEY");

const SIGNATURE_TTL_SECONDS = Number(process.env.SCORE_SIGNATURE_TTL_SECONDS ?? "300");
const MIN_DURATION_MS = Number(process.env.SCORE_MIN_DURATION_MS ?? "10000");
const MAX_SCORE = BigInt(process.env.SCORE_MAX_VALUE ?? "100000000");

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
  signatureSeed: z.string().max(128).optional()
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

  const signature = await signer.signTypedData(registryDomain, scoreTypes, value);

  return res.status(200).json({
    signature,
    deadline: deadlineSeconds,
    contractAddress: registryAddress,
    chainId: registryChainIdNumber,
    score: data.score.toString()
  });
}
