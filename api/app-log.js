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
    try { console.log('[app-log]', JSON.stringify({ event: entry.event, message: entry.message })); } catch (_) {}
    // Optional forward to external log/alert endpoint
    if (FORWARD_URL) {
      try {
        const headers = Object.assign({ 'Content-Type': 'application/json' }, FORWARD_HEADERS);
        // Fire-and-forget; do not block response on failures
        fetch(FORWARD_URL, { method: 'POST', headers, body: JSON.stringify(entry) }).catch(() => {});
      } catch (_) {}
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    try { console.error('[app-log] error', error?.message || error); } catch (_) {}
    return res.status(500).json({ error: 'log failed' });
  }
}
