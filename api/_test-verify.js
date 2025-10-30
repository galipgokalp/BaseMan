export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(String(req.body||'{}'));
    const token = body?.token || req.headers['authorization']?.toString()?.replace(/^Bearer\s+/i,'') || '';
    if (!token || token.length < 1) return res.status(400).json({ error: 'missing token' });
    // DEV-ONLY: accept any token and echo a fake identity
    return res.status(200).json({ iss: 'http://localhost/dev', aud: req.headers['host']||'localhost', sub: 'fid:12345', exp: Math.floor(Date.now()/1000)+300 });
  } catch (e) {
    return res.status(200).json({ ok: true });
  }
}

