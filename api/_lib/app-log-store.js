import { Redis } from '@upstash/redis';
import { createLogger } from '../../src/utils/logger.js';
const log = createLogger('ApiAppLogStore');

const EVENTS_KEY = 'applog:events:list';

const DEFAULT_RETENTION_DAYS = 7;
const DEFAULT_MAX_RESULTS = 500;
const DEFAULT_SCAN_LIMIT = 1500;

let redis = null;
let redisInitAttempted = false;
let hasLoggedMissingRedis = false;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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

  try {
    const kvRestApiUrl = process.env.KV_REST_API_URL || '';
    const kvRestApiToken = process.env.KV_REST_API_TOKEN || '';
    const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL || '';
    const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
    const redisUrl = process.env.REDIS_URL || '';

    const hasKVVars = !!(kvRestApiUrl && kvRestApiToken);
    const hasStandardVars = !!(upstashRestUrl && upstashRestToken);
    const hasRedisUrl = !!redisUrl;

    if (hasKVVars) {
      redis = new Redis({
        url: kvRestApiUrl,
        token: kvRestApiToken
      });
      log.debug('App log Redis initialized with KV_REST_API');
      return;
    }

    if (hasStandardVars || hasRedisUrl) {
      redis = Redis.fromEnv();
      log.debug('App log Redis initialized');
      return;
    }

    if (!hasLoggedMissingRedis) {
      hasLoggedMissingRedis = true;
      log.warnOnce('app-log-missing-redis-config', 'Redis environment variables not found. app-log persistence disabled.');
    }
    redis = null;
  } catch (error) {
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
  return {
    enabled: config.enabled,
    available: isAppLogStoreAvailable(),
    retentionDays: config.retentionDays,
    maxResults: config.maxResults,
    scanLimit: config.scanLimit
  };
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

async function addToIndex(key, member) {
  if (!redis) return;
  await redis.lpush(key, member);
}

async function trimStoredEntries(maxEntries) {
  if (!redis) return;
  await redis.ltrim(EVENTS_KEY, 0, Math.max(maxEntries - 1, 0));
}

export async function writePersistentAppLogEntry(entry) {
  if (!isAppLogStoreAvailable()) {
    return { ok: false, available: false };
  }

  const config = getStoreConfig();
  const storedEntry = buildStoredEntry(entry);
  const member = JSON.stringify(storedEntry);

  const writeResult = await Promise.allSettled([addToIndex(EVENTS_KEY, member)]);
  const writeError = writeResult.find((result) => result.status === 'rejected');
  if (writeError) {
    throw new Error(`app-log persistent write failed at lpush: ${writeError.reason?.message || writeError.reason || 'unknown error'}`);
  }

  const keepEntries = Math.max(config.scanLimit, config.maxResults);
  trimStoredEntries(keepEntries).catch((error) => {
    log.warn('App log trim failed:', error?.message || error);
  });

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

async function readFromKey(key, order, count) {
  if (!redis) return [];
  const values = await redis.lrange(key, 0, Math.max(count - 1, 0));
  if (order !== 'desc') {
    values.reverse();
  }
  return parseStoredEntries(values);
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
    entries = await readFromKey(EVENTS_KEY, order, scanLimit);
  } catch (error) {
    throw new Error(`app-log persistent read failed at lrange: ${error?.message || error}`);
  }
  entries = filterEntries(entries, filters).slice(0, limit);

  let persistentStored = 0;
  try {
    persistentStored = await redis.llen(EVENTS_KEY);
  } catch (error) {
    throw new Error(`app-log persistent read failed at llen: ${error?.message || error}`);
  }

  return {
    logs: entries,
    available: true,
    source: 'redis',
    partial: false,
    retentionDays: config.retentionDays,
    persistentStored,
    memoryStored,
    readPath: 'redis-global-zset',
    redisAvailable: true
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
      lpush: { ok: false, detail: null },
      lrange: { ok: false, detail: null },
      llen: { ok: false, detail: null },
      ltrim: { ok: false, detail: null }
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
    await redis.lpush(smokeKey, smokeValue);
    result.checks.lpush = { ok: true, detail: 'lpush ok' };
  } catch (error) {
    result.checks.lpush.detail = error?.message || String(error);
  }

  try {
    const range = await redis.lrange(smokeKey, 0, 0);
    result.checks.lrange = {
      ok: Array.isArray(range),
      detail: Array.isArray(range) ? `returned ${range.length} member(s)` : 'non-array response'
    };
  } catch (error) {
    result.checks.lrange.detail = error?.message || String(error);
  }

  try {
    const count = await redis.llen(smokeKey);
    result.checks.llen = {
      ok: Number.isFinite(Number(count)),
      detail: `count=${count}`
    };
  } catch (error) {
    result.checks.llen.detail = error?.message || String(error);
  }

  try {
    await redis.ltrim(smokeKey, 0, 0);
    result.checks.ltrim = { ok: true, detail: 'ltrim ok' };
  } catch (error) {
    result.checks.ltrim.detail = error?.message || String(error);
  }

  return result;
}
