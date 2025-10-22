import { ethers } from "ethers";
import { z } from "zod";
import { registryAddress, registryChainId } from "./_lib/registry.js";

const PAYMASTER_SERVICE_URL =
  process.env.PAYMASTER_SERVICE_URL?.trim() || process.env.PAYMASTER_URL?.trim() || "";

const PAYMASTER_API_KEY = process.env.PAYMASTER_API_KEY?.trim() || "";
const PAYMASTER_API_KEY_HEADER =
  process.env.PAYMASTER_API_KEY_HEADER?.trim() || "Authorization";
const PAYMASTER_API_KEY_SCHEME =
  process.env.PAYMASTER_API_KEY_SCHEME?.trim() || "Bearer";

const MAX_CALLS = (() => {
  const raw = process.env.PAYMASTER_MAX_CALLS ?? "1";
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  return value;
})();

const ENFORCE_ALLOWLIST =
  (process.env.PAYMASTER_ENFORCE_ALLOWLIST ?? "true").toLowerCase() !== "false";

const allowedTargets = (() => {
  const addresses = new Set();
  try {
    addresses.add(ethers.getAddress(registryAddress));
  } catch (error) {
    throw new Error(
      `Unable to normalize registryAddress for paymaster proxy: ${error?.message || error}`
    );
  }

  const extra = (process.env.PAYMASTER_ALLOWED_TARGETS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  for (const value of extra) {
    if (!ethers.isAddress(value)) {
      throw new Error(
        `PAYMASTER_ALLOWED_TARGETS includes invalid address: ${value}`
      );
    }
    addresses.add(ethers.getAddress(value));
  }
  return addresses;
})();

const smartWalletInterface = new ethers.Interface([
  "function execute(address target,uint256 value,bytes data)",
  "function executeBatch(tuple(address target,uint256 value,bytes data)[] calls)"
]);

const JsonRpcRequestSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    jsonrpc: z.string().optional(),
    method: z.string(),
    params: z.array(z.any()).optional()
  })
  .strict();

const ensureHexChainId = () => {
  try {
    return ethers.toBeHex(registryChainId);
  } catch (error) {
    throw new Error(
      `Unable to derive hex chain id for paymaster proxy: ${error?.message || error}`
    );
  }
};

const expectedChainIdHex = ensureHexChainId();

function parseBody(req) {
  if (!req?.body) {
    return null;
  }
  if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

function extractUserOperation(payload) {
  if (!payload?.params || !Array.isArray(payload.params)) {
    return null;
  }

  for (const candidate of payload.params) {
    if (candidate && typeof candidate === "object") {
      if (isUserOperation(candidate)) {
        return candidate;
      }
      if (candidate.userOperation && isUserOperation(candidate.userOperation)) {
        return candidate.userOperation;
      }
      if (candidate.request && isUserOperation(candidate.request)) {
        return candidate.request;
      }
    }
  }
  return null;
}

function isUserOperation(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (typeof value.callData !== "string" || !value.callData.startsWith("0x")) {
    return false;
  }
  return true;
}

function bigIntFrom(value) {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    return BigInt(value);
  }
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return BigInt(value);
    }
    return BigInt(value);
  }
  throw new Error(`Cannot convert value to bigint: ${value}`);
}

function validateTargetsFromCallData(callData) {
  let parsed;
  try {
    parsed = smartWalletInterface.parseTransaction({ data: callData });
  } catch (error) {
    return {
      ok: false,
      error: `Unsupported callData for paymaster sponsorship: ${error?.message || error}`
    };
  }

  const targets = [];

  if (parsed.name === "execute") {
    const [target, value] = parsed.args;
    targets.push({ target, value });
  } else if (parsed.name === "executeBatch") {
    const [calls] = parsed.args;
    if (!Array.isArray(calls)) {
      return { ok: false, error: "Unexpected executeBatch arguments" };
    }
    if (calls.length > MAX_CALLS) {
      return {
        ok: false,
        error: `executeBatch contains ${calls.length} calls but maximum is ${MAX_CALLS}`
      };
    }
    for (const call of calls) {
      targets.push({ target: call.target, value: call.value });
    }
  } else {
    return {
      ok: false,
      error: `Unsupported smart wallet function ${parsed.name}`
    };
  }

  for (const { target, value } of targets) {
    if (!ethers.isAddress(target)) {
      return { ok: false, error: `Invalid call target: ${target}` };
    }
    const normalizedTarget = ethers.getAddress(target);
    if (ENFORCE_ALLOWLIST && !allowedTargets.has(normalizedTarget)) {
      return {
        ok: false,
        error: `Call target ${normalizedTarget} is not allowlisted for sponsorship`
      };
    }
    const amount = (() => {
      try {
        return bigIntFrom(value);
      } catch (error) {
        return null;
      }
    })();
    if (amount === null) {
      return {
        ok: false,
        error: `Unable to normalize call value for ${normalizedTarget}`
      };
    }
    if (amount !== 0n) {
      return {
        ok: false,
        error: `Sponsored calls must have zero value (found ${amount} for ${normalizedTarget})`
      };
    }
  }

  return { ok: true };
}

async function forwardToPaymaster(payload) {
  if (!PAYMASTER_SERVICE_URL) {
    throw new Error("Paymaster proxy is missing PAYMASTER_SERVICE_URL configuration.");
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (PAYMASTER_API_KEY) {
    const headerName = PAYMASTER_API_KEY_HEADER;
    const scheme = PAYMASTER_API_KEY_SCHEME.length ? `${PAYMASTER_API_KEY_SCHEME} ` : "";
    headers[headerName] = `${scheme}${PAYMASTER_API_KEY}`;
  }

  const response = await fetch(PAYMASTER_SERVICE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "application/json";

  return {
    status: response.status,
    body: text,
    contentType
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!PAYMASTER_SERVICE_URL) {
    return res.status(500).json({ error: "Paymaster proxy is not configured." });
  }

  const payload = parseBody(req);
  if (!payload) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const parsed = JsonRpcRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid JSON-RPC payload",
      details: parsed.error.flatten()
    });
  }

  const jsonRpc = parsed.data;

  if (ENFORCE_ALLOWLIST) {
    const userOp = extractUserOperation(jsonRpc);
    if (userOp?.callData) {
      const validation = validateTargetsFromCallData(userOp.callData);
      if (!validation.ok) {
        return res.status(403).json({ error: validation.error });
      }
    }

    if (userOp?.chainId) {
      try {
        const normalizedChainId = ethers.toBeHex(userOp.chainId);
        if (normalizedChainId.toLowerCase() !== expectedChainIdHex.toLowerCase()) {
          return res.status(403).json({
            error: `Unsupported chainId ${normalizedChainId}, expected ${expectedChainIdHex}`
          });
        }
      } catch (error) {
        return res.status(403).json({
          error: `Unable to normalize chainId: ${error?.message || error}`
        });
      }
    }
  }

  try {
    const upstream = await forwardToPaymaster(jsonRpc);
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.contentType);
    return res.send(upstream.body);
  } catch (error) {
    console.error("[PaymasterProxy] upstream error:", error);
    return res
      .status(502)
      .json({ error: "Unable to reach paymaster service", details: error?.message || String(error) });
  }
}
