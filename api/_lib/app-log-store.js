import { Redis } from '@upstash/redis';
import { createLogger } from '../../src/utils/logger.js';
const log = createLogger('ApiAppLogStore');

const EVENTS_KEY = 'applog:events:json';

const DEFAULT_RETENTION_DAYS = 7;
const DEFAULT_MAX_RESULTS = 500;
const DEFAULT_SCAN_LIMIT = 1500;

let redis = null;
let redisInitAttempted = false;
let hasLoggedMissingRedis = false;
let redisInitDebug = {
  attempted: false,
  enabled: true,
  hasKVVars: false,
  hasStandardVars: false,
  hasRedisUrl: false,
  initMode: 'not-attempted',
  initError: null
};

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readEnvValue(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function getStoreConfig() {
  const enabledRaw = String(process.env.APP_LOG_PERSIST_ENABLED ?? 'true').trim().toLowerCase();
  const enabled = !(enabledRaw === 'false' || enabledRaw === '0' || enabledRaw === 'no' || enabledRaw === 'off');
  return {
    enabled,
    retentionDays: parsePositiveInt(process.env.APP_LOG_PERSIST_RETENTION_DAYS, DEFAULT_RETENTION_DAYS),
    maxResults: Math.min(parsePositiveInt(process.env.APP_LOG_PERSIST_MAX_RESULTS, DEFAULT_MAX_RESULTS), 500),
    scanLimit: Math.min(parsePositiveInt(process.env.APP_LOG_PERSIST_SCAN_LIMIT, DEFAULT_SCAN_LIMIT), 5000)
  };
}

function initRedis() {
  if (redisInitAttempted) return;
  redisInitAttempted = true;
  redisInitDebug.attempted = true;

  try {
    const kvRestApiUrl = readEnvValue('KV_REST_API_URL');
    const kvRestApiToken = readEnvValue('KV_REST_API_TOKEN');
    const upstashRestUrl = readEnvValue('UPSTASH_REDIS_REST_URL');
    const upstashRestToken = readEnvValue('UPSTASH_REDIS_REST_TOKEN');
    const redisUrl = readEnvValue('REDIS_URL');

    const hasKVVars = !!(kvRestApiUrl && kvRestApiToken);
    const hasStandardVars = !!(upstashRestUrl && upstashRestToken);
    const hasRedisUrl = !!redisUrl;
    redisInitDebug.hasKVVars = hasKVVars;
    redisInitDebug.hasStandardVars = hasStandardVars;
    redisInitDebug.hasRedisUrl = hasRedisUrl;

    if (hasKVVars) {
      redis = new Redis({
        url: kvRestApiUrl,
        token: kvRestApiToken
      });
      redisInitDebug.initMode = 'kv-rest-api';
      redisInitDebug.initError = null;
      log.debug('App log Redis initialized with KV_REST_API');
      return;
    }

    if (hasStandardVars || hasRedisUrl) {
      redis = Redis.fromEnv();
      redisInitDebug.initMode = hasStandardVars ? 'upstash-from-env' : 'redis-url-from-env';
      redisInitDebug.initError = null;
      log.debug('App log Redis initialized');
      return;
    }

    redisInitDebug.initMode = 'missing-config';
    redisInitDebug.initError = 'Redis environment variables not found';
    if (!hasLoggedMissingRedis) {
      hasLoggedMissingRedis = true;
      log.warnOnce('app-log-missing-redis-config', 'Redis environment variables not found. app-log persistence disabled.');
    }
    redis = null;
  } catch (error) {
    redisInitDebug.initMode = 'init-error';
    redisInitDebug.initError = error?.message || String(error);
    if (!hasLoggedMissingRedis) {
      hasLoggedMissingRedis = true;
      log.warnOnce('app-log-redis-init-failed', `App log Redis initialization failed: ${error?.message || error}`);
    }
    redis = null;
  }
}

export function isAppLogStoreAvailable() {
  const config = getStoreConfig();
  if (!config.enabled) return false;
  initRedis();
  return redis !== null;
}

export function getAppLogStoreConfig() {
  const config = getStoreConfig();
  const base = {
    enabled: config.enabled,
    available: isAppLogStoreAvailable(),
    retentionDays: config.retentionDays,
    maxResults: config.maxResults,
    scanLimit: config.scanLimit,
    initDebug: {
      ...redisInitDebug
    }
  };
  base.initDebug.enabled = config.enabled;
  return base;
}

function normalizeAddress(address) {
  return typeof address === 'string' && address.trim() ? address.trim().toLowerCase() : null;
}

function getEntryAddress(entry) {
  return normalizeAddress(entry?.meta?.address || entry?.meta?.stateAddress || entry?.meta?.from);
}

function compactMeta(meta) {
  if (!meta || typeof meta !== 'object') return {};
  const out = {};
  const allowedKeys = [
    'address',
    'stateAddress',
    'from',
    'fid',
    'username',
    'platform',
    'chainId',
    'code',
    'identifier',
    'id',
    'status',
    'score',
    'questId',
    'durationMs',
    'transport',
    'action',
    'suppressed',
    'suppressionReason',
    'error',
    'errorKind',
    'context',
    'result'
  ];

  for (const key of allowedKeys) {
    if (meta[key] !== undefined) {
      out[key] = meta[key];
    }
  }

  if (meta.stack) {
    out.stack = String(meta.stack).split('\n').slice(0, 5).join('\n');
  }

  return out;
}

function buildStoredEntry(entry) {
  const parsedTs = Date.parse(String(entry?.ts || ''));
  const tsMs = Number.isFinite(parsedTs) ? parsedTs : Date.now();
  return {
    id: `${tsMs}:${Math.random().toString(36).slice(2, 10)}`,
    ts: new Date(tsMs).toISOString(),
    event: String(entry?.event || 'unknown'),
    message: String(entry?.message || '').slice(0, 300),
    meta: compactMeta(entry?.meta || {})
  };
}

function sortEntriesByTimestamp(entries, order) {
  const sorted = entries.slice().sort((a, b) => {
    const aTs = Date.parse(String(a?.ts || '')) || 0;
    const bTs = Date.parse(String(b?.ts || '')) || 0;
    return order === 'desc' ? bTs - aTs : aTs - bTs;
  });
  return sorted;
}

export async function writePersistentAppLogEntry(entry) {
  if (!isAppLogStoreAvailable()) {
    return { ok: false, available: false };
  }

  const config = getStoreConfig();
  const storedEntry = buildStoredEntry(entry);
  const keepEntries = Math.max(config.scanLimit, config.maxResults);

  try {
    const raw = await redis.get(EVENTS_KEY);
    const currentEntries = parseStoredEntries(typeof raw === 'string' ? JSON.parse(raw) : raw);
    const nextEntries = [storedEntry, ...currentEntries].slice(0, keepEntries);
    await redis.set(EVENTS_KEY, JSON.stringify(nextEntries));
  } catch (error) {
    throw new Error(`app-log persistent write failed at set/get: ${error?.message || error}`);
  }

  return { ok: true, available: true };
}

function parseStoredEntries(values) {
  if (!Array.isArray(values)) return [];
  const parsed = [];
  for (const value of values) {
    if (!value) continue;
    try {
      const entry = typeof value === 'string' ? JSON.parse(value) : value;
      if (entry && typeof entry === 'object') {
        parsed.push(entry);
      }
    } catch (_error) {}
  }
  return parsed;
}

function filterEntries(entries, filters) {
  const {
    event = null,
    eventPrefix = null,
    address = null,
    contains = null,
    sinceTs = null,
    untilTs = null
  } = filters;

  const normalizedAddress = normalizeAddress(address);
  const containsFilter = contains ? String(contains).trim().toLowerCase() : null;
  const prefixFilter = eventPrefix ? String(eventPrefix).trim() : null;
  const eventFilter = event ? String(event).trim() : null;

  return entries.filter((entry) => {
    if (eventFilter && entry.event !== eventFilter) return false;
    if (prefixFilter && !String(entry.event || '').startsWith(prefixFilter)) return false;
    if (normalizedAddress && getEntryAddress(entry) !== normalizedAddress) return false;
    if (containsFilter) {
      const eventMatch = String(entry.event || '').toLowerCase().includes(containsFilter);
      const messageMatch = String(entry.message || '').toLowerCase().includes(containsFilter);
      if (!eventMatch && !messageMatch) return false;
    }
    const ts = Date.parse(String(entry.ts || ''));
    if (sinceTs != null && (!Number.isFinite(ts) || ts < sinceTs)) return false;
    if (untilTs != null && (!Number.isFinite(ts) || ts > untilTs)) return false;
    return true;
  });
}

export async function readPersistentAppLogs(filters = {}) {
  const config = getStoreConfig();
  const memoryStored = Array.isArray(globalThis.__APP_LOGS) ? globalThis.__APP_LOGS.length : 0;

  if (!isAppLogStoreAvailable()) {
    return {
      logs: [],
      available: false,
      source: 'memory',
      partial: true,
      retentionDays: config.retentionDays,
      persistentStored: 0,
      memoryStored
    };
  }

  const order = String(filters.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
  const limit = Math.min(parsePositiveInt(filters.limit, config.maxResults), config.maxResults);
  const scanLimit = Math.max(limit, Math.min(config.scanLimit, Math.max(limit * 5, 200)));
  let entries;
  try {
    const raw = await redis.get(EVENTS_KEY);
    const parsed = parseStoredEntries(typeof raw === 'string' ? JSON.parse(raw) : raw);
    entries = sortEntriesByTimestamp(parsed, order).slice(0, scanLimit);
  } catch (error) {
    throw new Error(`app-log persistent read failed at get: ${error?.message || error}`);
  }
  entries = filterEntries(entries, filters).slice(0, limit);

  let persistentStored = 0;
  try {
    persistentStored = entries.length;
    const raw = await redis.get(EVENTS_KEY);
    const parsed = parseStoredEntries(typeof raw === 'string' ? JSON.parse(raw) : raw);
    persistentStored = parsed.length;
  } catch (error) {
    throw new Error(`app-log persistent read failed at count-get: ${error?.message || error}`);
  }

  return {
    logs: entries,
    available: true,
    source: 'redis',
    partial: false,
    retentionDays: config.retentionDays,
    persistentStored,
    memoryStored,
    readPath: 'redis-json-buffer',
    redisAvailable: true,
    initDebug: {
      ...getAppLogStoreConfig().initDebug
    }
  };
}

export async function runAppLogStoreSmoke() {
  const config = getAppLogStoreConfig();
  const result = {
    available: config.available,
    retentionDays: config.retentionDays,
    maxResults: config.maxResults,
    checks: {
      setGet: { ok: false, detail: null },
      jsonWriteRead: { ok: false, detail: null }
    }
  };

  if (!config.available || !redis) {
    return result;
  }

  const smokeKey = `applog:smoke:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const smokeValue = JSON.stringify({ ok: true, ts: new Date().toISOString() });

  try {
    await redis.set(`${smokeKey}:kv`, smokeValue, { ex: 60 });
    const got = await redis.get(`${smokeKey}:kv`);
    result.checks.setGet = {
      ok: String(got || '') === smokeValue,
      detail: got ? 'read-back ok' : 'empty read-back'
    };
  } catch (error) {
    result.checks.setGet.detail = error?.message || String(error);
  }

  try {
    const payload = JSON.stringify([{ ok: true, ts: new Date().toISOString() }]);
    await redis.set(smokeKey, payload, { ex: 60 });
    const got = await redis.get(smokeKey);
    result.checks.jsonWriteRead = {
      ok: String(got || '') === payload,
      detail: got ? 'json roundtrip ok' : 'empty json read-back'
    };
  } catch (error) {
    result.checks.jsonWriteRead.detail = error?.message || String(error);
  }

  return result;
}
