import Rollbar from 'rollbar';
import { createLogger } from "../src/utils/logger.js";

const log = createLogger("ApiAppLog");

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

async function sendTelegramAlert(entry) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  try {
    const emoji = entry.event === 'error' ? '🔴' : '⚠️';
    const time = new Date(entry.ts).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let text = `${emoji} <b>${entry.event.toUpperCase()}</b>\n`;
    text += `<code>${entry.message}</code>\n\n`;
    text += `🕐 ${time}`;

    if (entry.meta?.address) {
      text += `\n👤 ${entry.meta.address.slice(0, 6)}...${entry.meta.address.slice(-4)}`;
    }
    if (entry.meta?.stack) {
      const shortStack = entry.meta.stack.split('\n').slice(0, 3).join('\n');
      text += `\n\n<pre>${shortStack}</pre>`;
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text.slice(0, 4000),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    log.warn('Telegram send failed:', err?.message);
  }
}

const RING_SIZE = 200;
const FORWARD_URL = process.env.CDP_WEBHOOK_LOG_ENDPOINT || process.env.LOG_FORWARD_URL || '';
let FORWARD_HEADERS = {};
try {
  const raw = process.env.CDP_WEBHOOK_LOG_HEADERS || process.env.LOG_FORWARD_HEADERS || '';
  if (raw && typeof raw === 'string') {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') FORWARD_HEADERS = obj;
  }
} catch (_) {}
globalThis.__APP_LOGS = globalThis.__APP_LOGS || [];

// Initialize Rollbar (optional - only if ROLLBAR token is set)
let rollbar = null;
try {
  // Support both Vercel Marketplace format and standard format
  const rollbarToken = process.env.ROLLBAR_BASE_MAN_SERVER_TOKEN_1764367657 
    || process.env.ROLLBAR_ACCESS_TOKEN 
    || process.env.ROLLBAR_SERVER_TOKEN;
  if (rollbarToken) {
    rollbar = new Rollbar({
      accessToken: rollbarToken,
      captureUncaught: false,
      captureUnhandledRejections: false,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
      codeVersion: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
    });
  }
} catch (err) {
  log.warnOnce('rollbar-init', 'Rollbar initialization failed:', err?.message);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let dump = Array.isArray(globalThis.__APP_LOGS) ? globalThis.__APP_LOGS.slice(-RING_SIZE) : [];
      
      // Filter by event type if provided
      if (req.query.event) {
        const eventFilter = String(req.query.event).trim();
        dump = dump.filter(entry => entry.event === eventFilter);
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
      
      // Limit results
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 200, 500) : 200;
      dump = dump.slice(-limit);
      
      return res.status(200).json({ 
        logs: dump,
        total: dump.length,
        filters: {
          event: req.query.event || null,
          address: req.query.address || null,
          contains: req.query.contains || null,
          limit: limit
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
    // push to ring buffer
    try {
      globalThis.__APP_LOGS.push(entry);
      if (globalThis.__APP_LOGS.length > RING_SIZE) {
        globalThis.__APP_LOGS.splice(0, globalThis.__APP_LOGS.length - RING_SIZE);
      }
    } catch (_) {}
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
    if (FORWARD_URL) {
      try {
        const headers = Object.assign({ 'Content-Type': 'application/json' }, FORWARD_HEADERS);
        // Fire-and-forget; do not block response on failures
        fetch(FORWARD_URL, { method: 'POST', headers, body: JSON.stringify(entry) }).catch(() => {});
      } catch (_) {}
    }
    
    // Forward to AI Agent webhook if enabled (only for errors and warnings)
    const AI_AGENT_URL = process.env.AI_AGENT_WEBHOOK_URL || '';
    if (AI_AGENT_URL && (entry.event === 'error' || entry.event === 'warn')) {
      try {
        // Fire-and-forget; do not block response on failures
        fetch(AI_AGENT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        }).catch(() => {});
      } catch (_) {}
    }

    // Send to Telegram (only for errors and warnings)
    if ((entry.event === 'error' || entry.event === 'warn') && TELEGRAM_BOT_TOKEN) {
      sendTelegramAlert(entry).catch(() => {});
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    try { log.error('handler error', error?.message || error); } catch (_) {}
    return res.status(500).json({ error: 'log failed' });
  }
}
