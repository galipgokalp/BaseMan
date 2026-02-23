import { ethers } from "ethers";
import { Buffer } from "buffer";
import { z } from "zod";
import { getRegistryContext } from "./_lib/registry.js";
import { createLogger } from "../src/utils/logger.js";

const log = createLogger("ApiPaymasterProxy");

function readEnv(key, fallback = "") {
  const v = process?.env?.[key];
  return typeof v === "string" ? v.trim() : fallback;
}

let cachedConfig = null;

function getPaymasterConfig() {
  if (cachedConfig) return cachedConfig;
  const rawMaxCalls = process.env.PAYMASTER_MAX_CALLS ?? "1";
  const maxCalls = (() => {
    const value = Number.parseInt(rawMaxCalls, 10);
    if (!Number.isFinite(value) || value <= 0) {
      return 1;
    }
    return value;
  })();

  const enforceAllowlist =
    (process.env.PAYMASTER_ENFORCE_ALLOWLIST ?? "true").toLowerCase() !== "false";

  const extraTargets = (process.env.PAYMASTER_ALLOWED_TARGETS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const rawSelectors = (process.env.PAYMASTER_ALLOWED_SELECTORS || "").trim();
  const allowedFunctionSelectors = parseAllowedSelectors(rawSelectors) || defaultAllowedSelectors;

  cachedConfig = {
    maxCalls,
    enforceAllowlist,
    extraTargets,
    allowedFunctionSelectors
  };
  return cachedConfig;
}

function buildAllowlistContext(registryContext, extraTargets) {
  const addresses = new Set();
  let normalizedRegistryAddress;
  try {
    normalizedRegistryAddress = ethers.getAddress(registryContext.address);
    addresses.add(normalizedRegistryAddress);
  } catch (error) {
    throw new Error(
      `registryAddress is missing or invalid for paymaster proxy: ${error?.message || error}`
    );
  }

  for (const value of extraTargets || []) {
    if (!ethers.isAddress(value)) {
      throw new Error(
        `PAYMASTER_ALLOWED_TARGETS includes invalid address: ${value}`
      );
    }
    addresses.add(ethers.getAddress(value));
  }

  let expectedChainIdHex;
  try {
    expectedChainIdHex = ethers.toBeHex(registryContext.chainId);
  } catch (error) {
    throw new Error(
      `registryChainId is missing or invalid for paymaster proxy: ${error?.message || error}`
    );
  }

  return { allowedTargets: addresses, normalizedRegistryAddress, expectedChainIdHex };
}

const smartWalletInterface = new ethers.Interface([
  "function execute(address target,uint256 value,bytes data)",
  "function executeBatch(tuple(address target,uint256 value,bytes data)[] calls)"
]);

function parseAllowedSelectors(raw) {
  if (!raw) return null;
  const items = raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .map((v) => (v.startsWith("0x") ? v : `0x${v}`))
    .map((v) => v.slice(0, 10));
  const out = new Set();
  for (const sel of items) {
    if (sel.length === 10) out.add(sel);
  }
  return out.size ? out : null;
}

const defaultAllowedSelectors = new Set([
  // V2 only (recommended)
  ethers.id("submitScore(address,uint256,uint256,uint256,bytes)").slice(0, 10).toLowerCase(),
  ethers.id("completeQuest(address,uint256,uint256,uint256,bytes)").slice(0, 10).toLowerCase()
]);

const JsonRpcRequestSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    jsonrpc: z.string().optional(),
    method: z.string(),
    params: z.array(z.any()).optional()
  })
  .strict();

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

function validateTargetsFromCallData(callData, allowlist, config) {
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
    const [target, value, data] = parsed.args;
    targets.push({ target, value, data });
  } else if (parsed.name === "executeBatch") {
    const [calls] = parsed.args;
    if (!Array.isArray(calls)) {
      return { ok: false, error: "Unexpected executeBatch arguments" };
    }
    if (calls.length > config.maxCalls) {
      return {
        ok: false,
        error: `executeBatch contains ${calls.length} calls but maximum is ${config.maxCalls}`
      };
    }
    for (const call of calls) {
      targets.push({ target: call.target, value: call.value, data: call.data });
    }
  } else {
    return {
      ok: false,
      error: `Unsupported smart wallet function ${parsed.name}`
    };
  }

  for (const { target, value, data } of targets) {
    if (!ethers.isAddress(target)) {
      return { ok: false, error: `Invalid call target: ${target}` };
    }
    const normalizedTarget = ethers.getAddress(target);
    if (config.enforceAllowlist && allowlist && !allowlist.allowedTargets.has(normalizedTarget)) {
      return {
        ok: false,
        error: `Call target ${normalizedTarget} is not allowlisted for sponsorship`
      };
    }
    const amount = (() => {
      try {
        return bigIntFrom(value);
      } catch (_error) {
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

    // Function-level allowlist only for registry calls
    if (
      config.enforceAllowlist &&
      allowlist &&
      normalizedTarget === allowlist.normalizedRegistryAddress
    ) {
      if (typeof data !== "string" || !data.startsWith("0x") || data.length < 10) {
        return { ok: false, error: "Missing or invalid call data for registry target" };
      }
      const selector = data.slice(0, 10).toLowerCase();
      if (!config.allowedFunctionSelectors.has(selector)) {
        return {
          ok: false,
          error: `Function selector ${selector} is not allowlisted for sponsorship`
        };
      }
    }
  }

  return { ok: true };
}

async function forwardToPaymaster(payload, authMode, overrideHeaders) {
  const paymasterServiceUrl = readEnv('PAYMASTER_SERVICE_URL') || readEnv('PAYMASTER_URL');
  if (!paymasterServiceUrl) {
    throw new Error("Paymaster proxy is missing PAYMASTER_SERVICE_URL configuration.");
  }

  // Birden fazla kimlik doğrulama modu deneyebilmek için aday başlık setleri oluştur.
  const authHeaderCandidates = (() => {
    if (overrideHeaders && typeof overrideHeaders === 'object') {
      return [Object.assign({ "Content-Type": "application/json" }, overrideHeaders)];
    }
    const list = [];
    const PAYMASTER_API_KEY = readEnv('PAYMASTER_API_KEY');
    const PAYMASTER_API_KEY_HEADER = readEnv('PAYMASTER_API_KEY_HEADER', 'Authorization') || 'Authorization';
    const PAYMASTER_API_KEY_SCHEME = readEnv('PAYMASTER_API_KEY_SCHEME', 'Bearer');
    const CDP_API_KEY_SECRET = readEnv('CDP_API_KEY_SECRET');
    const CDP_API_KEY_ID = readEnv('CDP_API_KEY_ID');
    const addAuth = (name, scheme, value) => {
      if (!name || !value) return;
      const headers = { "Content-Type": "application/json" };
      const prefix = scheme && scheme.length ? `${scheme} ` : "";
      headers[name] = `${prefix}${value}`;
      list.push(headers);
    };

    // 1) Basic <base64(id:secret)> — CDP RPC için en yaygın mod (öncelik ver ve tek mod seçeneği olarak dön)
    if (CDP_API_KEY_ID && CDP_API_KEY_SECRET) {
      try {
        const token = Buffer.from(`${CDP_API_KEY_ID}:${CDP_API_KEY_SECRET}`).toString('base64');
        const headers = { "Content-Type": "application/json", Authorization: `Basic ${token}`, 'User-Agent': 'BaseManProxy/1.0' };
        return [headers];
      } catch (_) {}
    }

    // 2) x-api-key + Bearer — bazı projeler ikisini bir arada ister
    if (CDP_API_KEY_ID && CDP_API_KEY_SECRET) {
      const headers = { "Content-Type": "application/json", "x-api-key": CDP_API_KEY_ID, Authorization: `Bearer ${CDP_API_KEY_SECRET}` };
      list.push(headers);
    }

    // 3) Authorization: Bearer <CDP_API_KEY_SECRET>
    if (CDP_API_KEY_SECRET) addAuth("Authorization", "Bearer", CDP_API_KEY_SECRET);

    // 4) ENV’de açıkça belirtilen header/scheme + PAYMASTER_API_KEY
    if (PAYMASTER_API_KEY) addAuth(PAYMASTER_API_KEY_HEADER, PAYMASTER_API_KEY_SCHEME, PAYMASTER_API_KEY);

    // 5) x-api-key: <PAYMASTER_API_KEY>
    if (PAYMASTER_API_KEY) addAuth("x-api-key", "", PAYMASTER_API_KEY);

    // 6) x-api-key: <CDP_API_KEY_SECRET>
    if (CDP_API_KEY_SECRET) addAuth("x-api-key", "", CDP_API_KEY_SECRET);

    // 7) Headersız (bazı path‑param’lı endpointler için)
    list.push({ "Content-Type": "application/json" });

    // Tekrarlı kombinasyonları ele
    const serialized = new Set();
    const unique = [];
    for (const h of list) {
      const key = JSON.stringify(h);
      if (!serialized.has(key)) {
        serialized.add(key);
        unique.push(h);
      }
    }
    let out = unique;
    // Force mode for diagnostics: 'basic', 'both', 'bearer', 'x-api-key', 'none'
    const mode = (authMode || "").toString().toLowerCase();
    if (mode === 'basic' && (CDP_API_KEY_ID && CDP_API_KEY_SECRET)) {
      try {
        const token = Buffer.from(`${CDP_API_KEY_ID}:${CDP_API_KEY_SECRET}`).toString('base64');
        out = [{ "Content-Type": "application/json", Authorization: `Basic ${token}` }];
      } catch (_) {}
    } else if (mode === 'both' && (CDP_API_KEY_ID && CDP_API_KEY_SECRET)) {
      out = [{ "Content-Type": "application/json", "x-api-key": CDP_API_KEY_ID, Authorization: `Bearer ${CDP_API_KEY_SECRET}` }];
    } else if (mode === 'bearer' && CDP_API_KEY_SECRET) {
      out = [{ "Content-Type": "application/json", Authorization: `Bearer ${CDP_API_KEY_SECRET}` }];
    } else if (mode === 'x-api-key' && PAYMASTER_API_KEY) {
      out = [{ "Content-Type": "application/json", "x-api-key": PAYMASTER_API_KEY }];
    } else if (mode === 'none') {
      out = [{ "Content-Type": "application/json" }];
    }
    return out;
  })();

  let lastResponse = null;
  let lastHeaderNames = [];
  for (let i = 0; i < authHeaderCandidates.length; i++) {
    const headers = authHeaderCandidates[i];
    let headerNames = [];
    try { headerNames = Object.keys(headers).filter(k => k.toLowerCase() !== 'content-type'); } catch (_) {}
    const response = await fetch(paymasterServiceUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    // Başarılı veya 401/403 dışındaki durumlarda denemeyi sonlandır
    if (response.status !== 401 && response.status !== 403) {
      const text = await response.text();
      const contentType = response.headers.get("content-type") || "application/json";
      return { status: response.status, body: text, contentType, debug: headerNames };
    }
    lastResponse = response;
    lastHeaderNames = headerNames;
  }

  if (lastResponse) {
    const text = await lastResponse.text();
    const contentType = lastResponse.headers.get("content-type") || "application/json";
    return { status: lastResponse.status, body: text, contentType, debug: lastHeaderNames };
  }

  // Güvenli varsayılan: hiç deneme yapılamadıysa 502 dön
  return { status: 502, body: JSON.stringify({ error: "No attempt performed" }), contentType: "application/json" };
}

export default async function handler(req, res) {
  // Handle OPTIONS for CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const config = getPaymasterConfig();
  const serviceUrl = process.env.PAYMASTER_SERVICE_URL || process.env.PAYMASTER_URL || "";
  if (!serviceUrl) {
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
  let allowlistCtx = null;

  if (config.enforceAllowlist) {
    try {
      const registryContext = getRegistryContext();
      allowlistCtx = buildAllowlistContext(registryContext, config.extraTargets);
    } catch (error) {
      return res.status(503).json({
        error: "Paymaster allowlist is not configured",
        details: error?.message || error
      });
    }

    const userOp = extractUserOperation(jsonRpc);
    if (userOp?.callData) {
      const validation = validateTargetsFromCallData(userOp.callData, allowlistCtx, config);
      if (!validation.ok) {
        return res.status(403).json({ error: validation.error });
      }
    }

    if (userOp?.chainId) {
      try {
        const normalizedChainId = ethers.toBeHex(userOp.chainId);
        const expectedChainIdHex = allowlistCtx.expectedChainIdHex;
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
    const override = {};
    if (req.headers && typeof req.headers === 'object') {
      if (req.headers['authorization']) override['Authorization'] = String(req.headers['authorization']);
      if (req.headers['x-api-key']) override['x-api-key'] = String(req.headers['x-api-key']);
    }
    const method = jsonRpc.method || 'unknown';
    const upstream = await forwardToPaymaster(jsonRpc, req.query?.auth, Object.keys(override).length ? override : null);
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.contentType);
    const isProd = String(process?.env?.NODE_ENV || '').toLowerCase() === 'production';
    if (!isProd) {
      try { res.setHeader('X-Env-Has-PSU', String(Boolean(process?.env?.PAYMASTER_SERVICE_URL))); } catch (_) {}
      try { if (Array.isArray(upstream.debug)) res.setHeader('X-Auth-Debug', upstream.debug.join(',')); } catch (_) {}
      try { const u = new URL(serviceUrl); res.setHeader('X-Target-Host', u.host); res.setHeader('X-Target-Path', u.pathname); } catch (_) {}
    }
    try { log.debug(`method=${method} status=${upstream.status}`); } catch (_) {}
    return res.send(upstream.body);
  } catch (error) {
    log.error("upstream error:", error);
    return res
      .status(502)
      .json({ error: "Unable to reach paymaster service", details: error?.message || String(error) });
  }
}
