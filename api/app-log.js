const RING_SIZE = 200;
globalThis.__APP_LOGS = globalThis.__APP_LOGS || [];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const dump = Array.isArray(globalThis.__APP_LOGS) ? globalThis.__APP_LOGS.slice(-RING_SIZE) : [];
      return res.status(200).json({ logs: dump });
    } catch (err) {
      return res.status(500).json({ error: 'dump failed' });
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
    const evt = body?.event || 'unknown';
    const msg = body?.message || '';
    const meta = body?.meta && typeof body.meta === 'object' ? body.meta : null;
    const entry = { ts: new Date().toISOString(), event: evt, message: String(msg).slice(0, 300), meta };
    // push to ring buffer
    try {
      globalThis.__APP_LOGS.push(entry);
      if (globalThis.__APP_LOGS.length > RING_SIZE) {
        globalThis.__APP_LOGS.splice(0, globalThis.__APP_LOGS.length - RING_SIZE);
      }
    } catch (_) {}
    // Avoid logging secrets
    try { console.log('[app-log]', JSON.stringify({ event: entry.event, message: entry.message })); } catch (_) {}
    return res.status(200).json({ ok: true });
  } catch (error) {
    try { console.error('[app-log] error', error?.message || error); } catch (_) {}
    return res.status(500).json({ error: 'log failed' });
  }
}
