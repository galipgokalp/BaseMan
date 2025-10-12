import { ethers } from "ethers";
import { z } from "zod";
import {
  getSigner,
  normalizeAddress,
  questTypes,
  registryAddress,
  registryChainIdNumber,
  registryDomain
} from "./_lib/registry.js";

const signer = getSigner("QUEST_SIGNER_PRIVATE_KEY");

const SIGNATURE_TTL_SECONDS = Number(process.env.QUEST_SIGNATURE_TTL_SECONDS ?? "300");

const allowedQuestIds = (process.env.ALLOWED_QUEST_IDS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .map((value) => {
    try {
      return BigInt(value);
    } catch (error) {
      return null;
    }
  })
  .filter((value) => value !== null);

const QuestPayloadSchema = z.object({
  playerAddress: z
    .string()
    .trim()
    .refine((val) => ethers.isAddress(val), { message: "playerAddress must be a valid address" }),
  questId: z.coerce.bigint().refine((value) => value >= 0n, {
    message: "questId must be a non-negative integer"
  }),
  context: z
    .object({
      note: z.string().max(280).optional(),
      score: z.coerce.bigint().optional()
    })
    .optional()
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

  const parsed = QuestPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.flatten()
    });
  }

  const data = parsed.data;
  const questId = data.questId;
  if (allowedQuestIds.length && !allowedQuestIds.some((value) => value === questId)) {
    return res.status(400).json({
      error: "questId not allowed",
      allowed: allowedQuestIds.map((value) => value.toString())
    });
  }

  const player = normalizeAddress(data.playerAddress);
  const deadlineSeconds = Math.floor(Date.now() / 1000) + Math.max(SIGNATURE_TTL_SECONDS, 60);
  const deadline = BigInt(deadlineSeconds);

  const value = {
    player,
    questId,
    deadline
  };

  const signature = await signer.signTypedData(registryDomain, questTypes, value);

  return res.status(200).json({
    signature,
    deadline: deadlineSeconds,
    contractAddress: registryAddress,
    chainId: registryChainIdNumber,
    questId: questId.toString()
  });
}

