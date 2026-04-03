import { createLogger } from "../src/utils/logger.js";
import { getRollbar } from './_lib/rollbar.js';
import {
  getAppLogStoreConfig,
  readPersistentAppLogs,
  writePersistentAppLogEntry
} from './_lib/app-log-store.js';

const log = createLogger("ApiAppLog");

let cachedConfig = null;

function getAppLogConfig() {
  if (cachedConfig) return cachedConfig;
  const forwardUrl = process.env.CDP_WEBHOOK_LOG_ENDPOINT || process.env.LOG_FORWARD_URL || '';
  let forwardHeaders = {};
  try {
    const raw = process.env.CDP_WEBHOOK_LOG_HEADERS || process.env.LOG_FORWARD_HEADERS || '';
    if (raw && typeof raw === 'string') {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') forwardHeaders = obj;
    }
  } catch (_) {}
  cachedConfig = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    forwardUrl,
    forwardHeaders
  };
  return cachedConfig;
}

async function sendTelegramAlert(entry, config) {
  if (!config.telegramBotToken || !config.telegramChatId) return;

  try {
    const emoji = entry.event === 'error' ? '🔴' : '⚠️';
    const time = new Date(entry.ts).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const env = (process.env.VERCEL_ENV || 'development').toUpperCase();

    let text = `${emoji} <b>${entry.event.toUpperCase()}</b> [${env}]\n`;
    text += `<code>${entry.message}</code>\n\n`;
    text += `🕐 ${time}`;

    if (entry.meta?.address) {
      text += `\n👤 ${entry.meta.address.slice(0, 6)}...${entry.meta.address.slice(-4)}`;
    }
    if (entry.meta?.stack) {
      const shortStack = entry.meta.stack.split('\n').slice(0, 3).join('\n');
      text += `\n\n<pre>${shortStack}</pre>`;
    }

    await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: text.slice(0, 4000),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    log.warn('Telegram send failed:', err?.message);
  }
}

function isAlertEvent(entry) {
  return entry?.event === 'error' || entry?.event === 'warn';
}

function getAlertSuppressionReason(entry) {
  const message = String(entry?.message || '').toLowerCase();

  if (message.includes('autoconsent already initialized')) {
    return 'third-party-autoconsent-noise';
  }

  if (message.includes('on-chain module not loaded yet (3s check)')) {
    return 'obsolete-onchain-bootstrap-warning';
  }

  if (message.includes('no platform detected - platform matching will be skipped')) {
    return 'low-signal-platform-warning';
  }

  return null;
}

function shouldForwardAlert(entry) {
  return isAlertEvent(entry) && !getAlertSuppressionReason(entry);
}

function shouldPersistAppLogEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (isAlertEvent(entry)) return true;

  const event = String(entry.event || '');
  const message = String(entry.message || '');

  if (
    event.startsWith('score-sign:') ||
    event.startsWith('score:submission:') ||
    event.startsWith('score:submitted:') ||
    event.startsWith('score:transaction:') ||
    event.startsWith('quest:') ||
    event.startsWith('submission_transport_') ||
    event.startsWith('eth_sendTransaction:') ||
    event.startsWith('wallet_sendCalls:') ||
    event.startsWith('miniapp-auth') ||
    event.startsWith('paymaster')
  ) {
    return true;
  }

  const lowerMessage = message.toLowerCase();
  if (
    lowerMessage.includes('[uileaderboard]') &&
    (
      lowerMessage.includes('loadleaderboard') ||
      lowerMessage.includes('fetching leaderboard') ||
      lowerMessage.includes('rendered stale leaderboard snapshot') ||
      lowerMessage.includes('timed out')
    )
  ) {
    return true;
  }

  return false;
}

const RING_SIZE = 500;
globalThis.__APP_LOGS = globalThis.__APP_LOGS || [];

function parseTimestampQuery(value) {
  if (value == null || value === '') return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    if (Number.isFinite(n)) return n < 1e12 ? n * 1000 : n;
  }
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : null;
}

function summarizeLogs(entries, allStoredCount) {
  const byEvent = {};
  let oldestTs = null;
  let newestTs = null;
  for (const entry of entries) {
    const key = String(entry?.event || 'unknown');
    byEvent[key] = (byEvent[key] || 0) + 1;
    const ts = Date.parse(String(entry?.ts || ''));
    if (Number.isFinite(ts)) {
      if (oldestTs == null || ts < oldestTs) oldestTs = ts;
      if (newestTs == null || ts > newestTs) newestTs = ts;
    }
  }
  return {
    ringSize: RING_SIZE,
    stored: allStoredCount,
    returned: entries.length,
    oldestTs: oldestTs != null ? new Date(oldestTs).toISOString() : null,
    newestTs: newestTs != null ? new Date(newestTs).toISOString() : null,
    byEvent
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const memoryDump = Array.isArray(globalThis.__APP_LOGS) ? globalThis.__APP_LOGS.slice(-RING_SIZE) : [];
      const storedCount = memoryDump.length;
      const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 200, 500) : 200;
      const requestedSource = String(req.query.source || '').trim().toLowerCase();
      const storeConfig = getAppLogStoreConfig();

      let dump = memoryDump;
      let source = 'memory';
      let partial = false;
      let persistentStored = 0;

      if (requestedSource !== 'memory') {
        const persistent = await readPersistentAppLogs({
          event: req.query.event || null,
          eventPrefix: req.query.eventPrefix || null,
          address: req.query.address || null,
          contains: req.query.contains || null,
          sinceTs: parseTimestampQuery(req.query.since),
          untilTs: parseTimestampQuery(req.query.until),
          order,
          limit
        });

        persistentStored = persistent.persistentStored || 0;
        if (persistent.available || requestedSource === 'redis') {
          dump = persistent.logs;
          source = persistent.source;
          partial = persistent.partial;
        }
      }
      
      if (source === 'memory') {
        // Filter by event type if provided
        if (req.query.event) {
          const eventFilter = String(req.query.event).trim();
          dump = dump.filter(entry => entry.event === eventFilter);
        }

        // Filter by event prefix if provided
        if (req.query.eventPrefix) {
          const prefix = String(req.query.eventPrefix).trim();
          if (prefix) {
            dump = dump.filter(entry => String(entry?.event || '').startsWith(prefix));
          }
        }
      
        // Filter by address if provided (check meta.address or meta.stateAddress)
        if (req.query.address) {
          const addressFilter = String(req.query.address).trim().toLowerCase();
          dump = dump.filter(entry => {
            if (!entry.meta) return false;
            const addr = entry.meta.address || entry.meta.stateAddress || entry.meta.from;
            return addr && String(addr).toLowerCase() === addressFilter;
          });
        }
      
        // Filter by event pattern (contains)
        if (req.query.contains) {
          const containsFilter = String(req.query.contains).trim().toLowerCase();
          dump = dump.filter(entry => {
            const eventMatch = entry.event && entry.event.toLowerCase().includes(containsFilter);
            const messageMatch = entry.message && entry.message.toLowerCase().includes(containsFilter);
            return eventMatch || messageMatch;
          });
        }

        // Filter by time range if provided (unix sec/ms or ISO string)
        const sinceTs = parseTimestampQuery(req.query.since);
        const untilTs = parseTimestampQuery(req.query.until);
        if (sinceTs != null) {
          dump = dump.filter(entry => {
            const ts = Date.parse(String(entry?.ts || ''));
            return Number.isFinite(ts) && ts >= sinceTs;
          });
        }
        if (untilTs != null) {
          dump = dump.filter(entry => {
            const ts = Date.parse(String(entry?.ts || ''));
            return Number.isFinite(ts) && ts <= untilTs;
          });
        }

        if (order === 'desc') dump = dump.slice().reverse();
      
        dump = order === 'desc' ? dump.slice(0, limit) : dump.slice(-limit);
      }

      const summary = summarizeLogs(dump, storedCount);
      
      return res.status(200).json({ 
        logs: dump,
        total: dump.length,
        summary,
        source,
        partial,
        retentionDays: storeConfig.retentionDays,
        persistentStored,
        memoryStored: storedCount,
        filters: {
          event: req.query.event || null,
          eventPrefix: req.query.eventPrefix || null,
          address: req.query.address || null,
          contains: req.query.contains || null,
          since: req.query.since || null,
          until: req.query.until || null,
          order,
          limit,
          source: requestedSource || null
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'dump failed', details: err?.message || String(err) });
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const config = getAppLogConfig();
    const rollbar = getRollbar();
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = { raw: body }; }
    }
    
    // Support both formats:
    // 1. console-logger.js format: {type, timestamp, message, args, stack}
    // 2. Standard format: {event, message, meta}
    let evt, msg, meta, ts;
    
    if (body?.type) {
      // console-logger.js format
      evt = body.type || 'log';
      msg = body.message || '';
      ts = body.timestamp || new Date().toISOString();
      meta = {
        args: body.args || [],
        stack: body.stack || null,
        filename: body.filename || null,
        lineno: body.lineno || null,
        colno: body.colno || null
      };
    } else {
      // Standard format
      evt = body?.event || 'unknown';
      msg = body?.message || '';
      meta = body?.meta && typeof body.meta === 'object' ? body.meta : null;
      ts = body?.ts || new Date().toISOString();
    }
    
    const entry = { 
      ts: ts, 
      event: evt, 
      message: String(msg).slice(0, 300), 
      meta: meta || {} 
    };
    const suppressionReason = getAlertSuppressionReason(entry);
    if (suppressionReason) {
      entry.meta = Object.assign({}, entry.meta || {}, {
        suppressed: true,
        suppressionReason
      });
    }
    // push to ring buffer
    try {
      globalThis.__APP_LOGS.push(entry);
      if (globalThis.__APP_LOGS.length > RING_SIZE) {
        globalThis.__APP_LOGS.splice(0, globalThis.__APP_LOGS.length - RING_SIZE);
      }
    } catch (_) {}

    if (shouldPersistAppLogEntry(entry)) {
      writePersistentAppLogEntry(entry).catch((persistError) => {
        try {
          log.warn('Persistent app-log write failed:', persistError?.message || persistError);
        } catch (_) {}
      });
    }
    // Avoid logging secrets
    try { log.debug('App log received', { event: entry.event, message: entry.message }); } catch (_) {}
    
    // Send to Rollbar if configured
    if (rollbar && entry.event === 'error') {
      try {
        // Extract person info from meta if available (address, fid, etc.)
        const person = {};
        if (entry.meta?.address) {
          person.id = entry.meta.address; // Use address as person ID
        }
        if (entry.meta?.fid) {
          person.id = String(entry.meta.fid); // Prefer FID if available
          person.username = entry.meta.username || undefined;
        }
        
        // Build Rollbar error payload
        const rollbarPayload = {
          custom: {
            timestamp: entry.ts,
            meta: entry.meta,
            filename: entry.meta?.filename,
            lineno: entry.meta?.lineno,
            colno: entry.meta?.colno
          },
          fingerprint: entry.meta?.stack ? entry.meta.stack.split('\n')[0] : entry.message
        };
        
        // Add person tracking if available
        if (person.id) {
          rollbarPayload.person = person;
        }
        
        rollbar.error(entry.message, rollbarPayload);
      } catch (err) {
        log.warn('Rollbar send failed:', err?.message);
      }
    }
    
    // Optional forward to external log/alert endpoint (AI Agent or custom webhook)
    if (config.forwardUrl) {
      try {
        const headers = Object.assign({ 'Content-Type': 'application/json' }, config.forwardHeaders);
        // Fire-and-forget; do not block response on failures
        fetch(config.forwardUrl, { method: 'POST', headers, body: JSON.stringify(entry) }).catch(() => {});
      } catch (_) {}
    }
    
    // Forward to AI Agent webhook if enabled (only for errors and warnings)
    const AI_AGENT_URL = process.env.AI_AGENT_WEBHOOK_URL || '';
    if (AI_AGENT_URL && shouldForwardAlert(entry)) {
      try {
        const secret = String(process.env.AI_AGENT_WEBHOOK_SECRET || '').trim();
        const headers = { 'Content-Type': 'application/json' };
        if (secret) {
          headers.Authorization = `Bearer ${secret}`;
        }
        // Fire-and-forget; do not block response on failures
        fetch(AI_AGENT_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(entry)
        }).catch(() => {});
      } catch (_) {}
    }

    // Send to Telegram (only for errors and warnings)
    if (shouldForwardAlert(entry)) {
      sendTelegramAlert(entry, config).catch(() => {});
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    try { log.error('handler error', error?.message || error); } catch (_) {}
    return res.status(500).json({ error: 'log failed' });
  }
}
