import { TokenSchema, verifyQuickAuthToken } from './_lib/miniapp-auth-verify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body && typeof req.body === 'object') ? req.body : (() => {
    try { return JSON.parse(String(req.body || '')); } catch { return null; }
  })();
  if (!body) return res.status(400).json({ error: 'Invalid JSON body' });

  const parsed = TokenSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  try {
    const result = await verifyQuickAuthToken({ token: parsed.data.token, req });
    return res.status(200).json({ ok: true, identity: result.identity || null });
  } catch (error) {
    const status = Number(error?.statusCode || 500);
    return res.status(status).json({ error: error?.message || 'verification error' });
  }
}
