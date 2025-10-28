export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
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
    const safe = { event: evt, message: String(msg).slice(0, 300), meta };
    // Avoid logging secrets
    try { console.log('[app-log]', JSON.stringify(safe)); } catch (_) {}
    return res.status(200).json({ ok: true });
  } catch (error) {
    try { console.error('[app-log] error', error?.message || error); } catch (_) {}
    return res.status(500).json({ error: 'log failed' });
  }
}

