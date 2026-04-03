import { Redis } from '@upstash/redis';
import { createLogger } from '../../src/utils/logger.js';
import { getEnv } from './env.js';

const log = createLogger('ApiAppLogStore');

const EVENTS_KEY = 'applog:events';
const EVENT_INDEX_PREFIX = 'applog:index:event:';
const ADDRESS_INDEX_PREFIX = 'applog:index:address:';

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
    const env = getEnv();
    const hasKVVars = !!(env.redis.kvRestApiUrl && env.redis.kvRestApiToken);
    const hasStandardVars = !!(env.redis.upstashRestUrl && env.redis.upstashRestToken);
    const hasRedisUrl = !!env.redis.url;

    if (hasKVVars) {
      redis = new Redis({
        url: env.redis.kvRestApiUrl,
        token: env.redis.kvRestApiToken
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

async function addToIndex(key, score, member) {
  if (!redis) return;
  await redis.zadd(key, { score, member });
}

async function pruneExpiredEntries(cutoffMs) {
  if (!redis) return;
  await Promise.allSettled([
    redis.zremrangebyscore(EVENTS_KEY, 0, cutoffMs),
    redis.zremrangebyscore(`${EVENT_INDEX_PREFIX}warn`, 0, cutoffMs),
    redis.zremrangebyscore(`${EVENT_INDEX_PREFIX}error`, 0, cutoffMs)
  ]);
}

export async function writePersistentAppLogEntry(entry) {
  if (!isAppLogStoreAvailable()) {
    return { ok: false, available: false };
  }

  const config = getStoreConfig();
  const storedEntry = buildStoredEntry(entry);
  const score = Date.parse(storedEntry.ts);
  const member = JSON.stringify(storedEntry);
  const eventKey = `${EVENT_INDEX_PREFIX}${storedEntry.event}`;
  const address = getEntryAddress(storedEntry);

  const writes = [addToIndex(EVENTS_KEY, score, member), addToIndex(eventKey, score, member)];
  if (address) {
    writes.push(addToIndex(`${ADDRESS_INDEX_PREFIX}${address}`, score, member));
  }

  await Promise.allSettled(writes);

  const cutoffMs = score - config.retentionDays * 24 * 60 * 60 * 1000;
  pruneExpiredEntries(cutoffMs).catch((error) => {
    log.warn('App log prune failed:', error?.message || error);
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
  const options = order === 'desc' ? { rev: true } : {};
  const values = await redis.zrange(key, 0, Math.max(count - 1, 0), options);
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
  const address = normalizeAddress(filters.address);
  const event = filters.event ? String(filters.event).trim() : null;

  let key = EVENTS_KEY;
  if (address) {
    key = `${ADDRESS_INDEX_PREFIX}${address}`;
  } else if (event) {
    key = `${EVENT_INDEX_PREFIX}${event}`;
  }

  let entries = await readFromKey(key, order, scanLimit);
  entries = filterEntries(entries, filters).slice(0, limit);

  let persistentStored = 0;
  try {
    persistentStored = await redis.zcard(EVENTS_KEY);
  } catch (_error) {}

  return {
    logs: entries,
    available: true,
    source: 'redis',
    partial: false,
    retentionDays: config.retentionDays,
    persistentStored,
    memoryStored
  };
}
