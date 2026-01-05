import { TokenSchema, verifyQuickAuthToken } from './_lib/miniapp-auth-verify.js';

// Simple logger for serverless environment
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    JSON.stringify(logEntry)
  );
}

export default async function handler(req, res) {
  const startTime = Date.now();
  const method = req.method;
  const path = req.url || '/api/miniapp-auth';
  
  log('info', 'miniapp-auth request', { method, path });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    log('warn', 'miniapp-auth method not allowed', { method, path });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body && typeof req.body === 'object') ? req.body : (() => {
    try { return JSON.parse(String(req.body || '')); } catch { return null; }
  })();
  if (!body) {
    log('warn', 'miniapp-auth invalid JSON body', { path });
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const parsed = TokenSchema.safeParse(body);
  if (!parsed.success) {
    log('warn', 'miniapp-auth invalid payload', { 
      path, 
      error: parsed.error.flatten() 
    });
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  try {
    const tokenPrefix = parsed.data.token?.substring(0, 20) || 'missing';
    log('debug', 'miniapp-auth verifying token', { 
      path, 
      tokenPrefix: tokenPrefix + '...',
      tokenLength: parsed.data.token?.length || 0
    });
    
    const result = await verifyQuickAuthToken({ token: parsed.data.token, req });
    
    const duration = Date.now() - startTime;
    log('info', 'miniapp-auth success', { 
      path, 
      duration,
      hasIdentity: !!result.identity,
      fid: result.identity?.fid || null
    });
    
    return res.status(200).json({ ok: true, identity: result.identity || null });
  } catch (error) {
    const status = Number(error?.statusCode || 500);
    const duration = Date.now() - startTime;
    
    log('error', 'miniapp-auth verification failed', {
      path,
      status,
      duration,
      error: error?.message || 'verification error',
      errorName: error?.name || 'UnknownError',
      stack: error?.stack ? error.stack.split('\n').slice(0, 3).join(' | ') : null
    });
    
    return res.status(status).json({ error: error?.message || 'verification error' });
  }
}
