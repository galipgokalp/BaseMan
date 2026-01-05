import { z } from 'zod';
import { createClient as createQuickAuthClient } from '@farcaster/quick-auth';

function env(key, fallback = '') {
  const v = process?.env?.[key];
  return typeof v === 'string' ? v.trim() : fallback;
}

function parseHeadersConfig(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') return obj;
  } catch (_) {}
  return null;
}

export const TokenSchema = z.object({ token: z.string().min(8) });

export async function verifyQuickAuthToken({ token, req, domainOverride } = {}) {
  const mode = (env('MINIAPP_AUTH_MODE', '').toLowerCase() || '').trim();
  const VERIFY_URL = env('MINIAPP_AUTH_VERIFY_URL');

  // CRITICAL: Prefer JWKS/local verification over remote endpoint
  // Remote endpoint is only used if explicitly configured AND mode is not 'jwks' or 'local'
  // If VERIFY_URL is set but endpoint returns 404, fallback to JWKS
  
  // Local/JWKS verification using Farcaster issuer JWKS
  if (mode === 'jwks' || mode === 'local' || !VERIFY_URL) {
    const origin = env('MINIAPP_AUTH_ORIGIN', 'https://auth.farcaster.xyz');
    const explicitDomain = domainOverride || env('MINIAPP_AUTH_DOMAIN', '');
    const hostHeader = String(req?.headers?.host || '').split(':')[0];
    const domain = explicitDomain || hostHeader || undefined;
    if (!domain) {
      const err = new Error('Missing MINIAPP_AUTH_DOMAIN and could not infer from Host header');
      err.statusCode = 400;
      throw err;
    }
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message: 'miniapp-auth-verify: using JWKS verification',
      origin,
      domain,
      mode: mode || 'default (no VERIFY_URL)'
    }));
    
    const client = createQuickAuthClient({ origin });
    try {
      const payload = await client.verifyJwt({ token, domain });
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'miniapp-auth-verify: JWKS verification success',
        hasIdentity: !!payload
      }));
      return { ok: true, identity: payload };
    } catch (error) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'miniapp-auth-verify: JWKS verification failed',
        error: error?.message || 'invalid token (jwks)',
        errorName: error?.name || 'UnknownError'
      }));
      const err = new Error(error?.message || 'invalid token (jwks)');
      err.statusCode = 401;
      throw err;
    }
  }

  // Remote verify endpoint (only if VERIFY_URL is set AND mode is not 'jwks'/'local')
  if (VERIFY_URL) {
    const headers = { 'Content-Type': 'application/json' };
    const extra = parseHeadersConfig(env('MINIAPP_AUTH_VERIFY_HEADERS', ''));
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (typeof v === 'string') headers[k] = v;
      }
    }
    
    // Log request details (mask token for security)
    const tokenPrefix = token?.substring(0, 20) || 'missing';
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message: 'miniapp-auth-verify: calling remote endpoint',
      verifyUrl: VERIFY_URL,
      tokenPrefix: tokenPrefix + '...',
      tokenLength: token?.length || 0,
      hasExtraHeaders: !!extra,
      headerKeys: Object.keys(headers)
    }));
    
    try {
      const upstream = await fetch(VERIFY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token })
      });
      const text = await upstream.text();
      let json = null; 
      try { 
        json = JSON.parse(text); 
      } catch (parseErr) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'miniapp-auth-verify: failed to parse response as JSON',
          status: upstream.status,
          statusText: upstream.statusText,
          responseText: text?.substring(0, 200) || 'empty'
        }));
      }
      
      if (!upstream.ok) {
        // CRITICAL: If remote endpoint returns 404 (not found), fallback to JWKS verification
        // This handles cases where VERIFY_URL is misconfigured or endpoint doesn't exist
        if (upstream.status === 404) {
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: 'miniapp-auth-verify: remote endpoint 404, falling back to JWKS',
            verifyUrl: VERIFY_URL
          }));
          
          // Fallback to JWKS verification
          const origin = env('MINIAPP_AUTH_ORIGIN', 'https://auth.farcaster.xyz');
          const explicitDomain = domainOverride || env('MINIAPP_AUTH_DOMAIN', '');
          const hostHeader = String(req?.headers?.host || '').split(':')[0];
          const domain = explicitDomain || hostHeader || undefined;
          
          if (domain) {
            try {
              const client = createQuickAuthClient({ origin });
              const payload = await client.verifyJwt({ token, domain });
              console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'miniapp-auth-verify: JWKS fallback success',
                hasIdentity: !!payload
              }));
              return { ok: true, identity: payload };
            } catch (jwksError) {
              console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'error',
                message: 'miniapp-auth-verify: JWKS fallback also failed',
                error: jwksError?.message || 'invalid token (jwks)'
              }));
              const err = new Error(jwksError?.message || 'token verification failed (remote 404, JWKS fallback failed)');
              err.statusCode = 401;
              throw err;
            }
          } else {
            // Can't fallback - no domain
            const err = new Error('Remote endpoint 404 and cannot fallback to JWKS (missing domain)');
            err.statusCode = 500;
            throw err;
          }
        }
        
        // For other errors (not 404), log and throw
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'miniapp-auth-verify: remote endpoint returned error',
          verifyUrl: VERIFY_URL,
          status: upstream.status,
          statusText: upstream.statusText,
          response: json || text?.substring(0, 200) || 'empty',
          responseType: json ? 'json' : 'text'
        }));
        
        const err = new Error(json?.error || text || 'token verification failed');
        err.statusCode = upstream.status === 401 || upstream.status === 403 ? 401 : 500;
        err.response = json || text;
        err.remoteStatus = upstream.status;
        err.remoteStatusText = upstream.statusText;
        throw err;
      }
      
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'miniapp-auth-verify: remote endpoint success',
        verifyUrl: VERIFY_URL,
        status: upstream.status,
        hasIdentity: !!json
      }));
      
      return { ok: true, identity: json || null };
    } catch (fetchErr) {
      // Network or fetch errors
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'miniapp-auth-verify: fetch error',
        verifyUrl: VERIFY_URL,
        error: fetchErr?.message || 'unknown fetch error',
        errorName: fetchErr?.name || 'UnknownError',
        errorCode: fetchErr?.code || null
      }));
      
      const err = new Error(fetchErr?.message || 'token verification failed (network error)');
      err.statusCode = 500;
      err.originalError = fetchErr;
      throw err;
    }
  }

  const err = new Error('Verification not configured');
  err.statusCode = 501;
  throw err;
}

export function extractQuickAuthToken(req, body) {
  try {
    const h = req?.headers || {};
    const auth = h['authorization'] || h['Authorization'];
    if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
      return auth.slice(7).trim();
    }
    const x1 = h['x-miniapp-auth-token'] || h['x-quickauth-token'];
    if (typeof x1 === 'string' && x1.trim().length >= 8) return x1.trim();
    const token = body?.quickAuthToken || body?.token;
    if (typeof token === 'string' && token.length >= 8) return token;
  } catch (_) {}
  return null;
}

export function isMiniAppAuthRequired(endpoint) {
  const global = (env('REQUIRE_MINIAPP_AUTH', 'false').toLowerCase() || '') === 'true';
  const map = {
    score: env('SCORE_REQUIRE_MINIAPP_AUTH', ''),
    quest: env('QUEST_REQUIRE_MINIAPP_AUTH', '')
  };
  const v = (map[endpoint] || '').toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  return global;
}

