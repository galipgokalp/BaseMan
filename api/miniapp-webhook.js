import crypto from "crypto";
import { createLogger } from "../src/utils/logger.js";

const log = createLogger("ApiMiniappWebhook");

function timingSafeEqual(expectedHex, providedHex) {
  if (!expectedHex || !providedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const provided = Buffer.from(providedHex, "hex");
  if (expected.length !== provided.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, provided);
}

function extractRawBody(req) {
  if (typeof req.rawBody === "string") {
    return req.rawBody;
  }
  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody.toString("utf8");
  }
  if (typeof req.body === "string") {
    return req.body;
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }
  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }
  return "";
}

function getSignatureHeader(req) {
  return (
    req.headers["x-hook0-signature"] ||
    req.headers["x-cdp-signature"] ||
    req.headers["X-Hook0-Signature"] ||
    req.headers["X-Cdp-Signature"] ||
    ""
  );
}

function parseSignatureHeader(signatureHeader) {
  if (!signatureHeader || typeof signatureHeader !== "string") {
    return null;
  }

  const components = signatureHeader
    .split(",")
    .map((component) => component.trim())
    .filter(Boolean);

  const record = {};
  for (const component of components) {
    const index = component.indexOf("=");
    if (index === -1) continue;
    const key = component.slice(0, index).trim();
    const value = component.slice(index + 1).trim();
    if (key && value) {
      record[key] = value;
    }
  }

  if (!record.t || !record.v1) {
    return null;
  }

  const headerNamesRaw = record.h ? record.h.trim() : "";
  const headerList = headerNamesRaw
    ? headerNamesRaw.split(" ").map((item) => item.trim()).filter(Boolean)
    : [];

  return {
    timestamp: record.t,
    signature: record.v1,
    headerNamesRaw,
    headerList
  };
}

function buildSignedPayload({ timestamp, headerNamesRaw, headerList, rawBody, headers }) {
  const headerValues = headerList
    .map((name) => {
      const value = headers[name.toLowerCase()];
      if (Array.isArray(value)) {
        return value.join("");
      }
      return value ?? "";
    })
    .join(".");

  return `${timestamp}.${headerNamesRaw || ""}.${headerValues}.${rawBody}`;
}

function verifySignature(req, rawBody, secret) {
  if (!secret) {
    return { valid: true, reason: "secret-not-configured" };
  }

  const signatureHeader = getSignatureHeader(req);
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    return { valid: false, reason: "invalid-signature-header" };
  }

  const signedPayload = buildSignedPayload({
    timestamp: parsed.timestamp,
    headerNamesRaw: parsed.headerNamesRaw,
    headerList: parsed.headerList,
    rawBody,
    headers: req.headers
  });

  const expectedSignature = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  const signaturesMatch = timingSafeEqual(expectedSignature, parsed.signature);

  if (!signaturesMatch) {
    return { valid: false, reason: "signature-mismatch" };
  }

  const timestampMs = Number.parseInt(parsed.timestamp, 10) * 1000;
  if (Number.isFinite(timestampMs)) {
    const drift = Math.abs(Date.now() - timestampMs);
    const maxDriftMs = Number(process.env.CDP_WEBHOOK_MAX_DRIFT_MS || 5 * 60 * 1000);
    if (drift > maxDriftMs) {
      return { valid: false, reason: "timestamp-drift" };
    }
  }

  return { valid: true };
}

const EVENT_CACHE = new Map();
let cachedConfig = null;

function getWebhookConfig() {
  if (cachedConfig) return cachedConfig;
  cachedConfig = {
    maxCacheSize: Number(process.env.CDP_WEBHOOK_CACHE_SIZE || 200),
    logEndpoint: process.env.CDP_WEBHOOK_LOG_ENDPOINT || ""
  };
  return cachedConfig;
}

function isDuplicate(eventId, ttlMs, config) {
  if (!eventId) return false;
  const now = Date.now();
  const expiresAt = EVENT_CACHE.get(eventId);
  if (expiresAt && expiresAt > now) {
    return true;
  }
  EVENT_CACHE.set(eventId, now + ttlMs);
  if (EVENT_CACHE.size > config.maxCacheSize) {
    const iterator = EVENT_CACHE.keys();
    const key = iterator.next().value;
    if (key) EVENT_CACHE.delete(key);
  }
  return false;
}

async function forwardLog(details, config) {
  if (!config.logEndpoint) return;
  try {
    await fetch(config.logEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });
  } catch (error) {
    log.warn("log forward failed", error?.message || error);
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const config = getWebhookConfig();
    const secret = process.env.CDP_WEBHOOK_SECRET;
    const cacheTtl = Number(process.env.CDP_WEBHOOK_CACHE_TTL_MS || 5 * 60 * 1000);
    const rawBody = extractRawBody(req);
    let parsedBody = null;
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : null;
    } catch (error) {
      parsedBody = null;
    }

    const verification = verifySignature(req, rawBody, secret);

    if (!verification.valid) {
      log.warnOnce(`signature-${verification.reason || "unknown"}`, "signature verification failed", verification.reason);
      await forwardLog({
        type: "webhook.invalid_signature",
        reason: verification.reason,
        signatureHeader: getSignatureHeader(req),
        headers: req.headers,
        receivedAt: new Date().toISOString()
      }, config);
      return res.status(401).json({ error: "invalid signature", reason: verification.reason });
    }

    const eventId =
      req.headers["x-hook0-id"] ||
      req.headers["x-cdp-event-id"] ||
      req.headers["X-Hook0-Id"] ||
      req.headers["X-Cdp-Event-Id"];
    if (isDuplicate(eventId, cacheTtl, config)) {
      log.debug("duplicate event ignored", eventId);
      return res.status(200).json({ received: true, duplicate: true });
    }

    log.debug("event received", {
      eventId: eventId || null,
      verification: verification.reason || "ok"
    });
    await forwardLog({
      type: "webhook.received",
      eventId,
      headers: req.headers,
      receivedAt: new Date().toISOString()
    }, config);
    return res.status(200).json({ received: true });
  }

  return res.status(200).json({ status: "ok" });
}


export const config = {
  api: {
    bodyParser: false
  }
};
