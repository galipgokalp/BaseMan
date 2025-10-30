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

  // Local/JWKS verification using Farcaster issuer JWKS
  if (mode === 'jwks' || mode === 'local') {
    const origin = env('MINIAPP_AUTH_ORIGIN', 'https://auth.farcaster.xyz');
    const explicitDomain = domainOverride || env('MINIAPP_AUTH_DOMAIN', '');
    const hostHeader = String(req?.headers?.host || '').split(':')[0];
    const domain = explicitDomain || hostHeader || undefined;
    if (!domain) {
      const err = new Error('Missing MINIAPP_AUTH_DOMAIN and could not infer from Host header');
      err.statusCode = 400;
      throw err;
    }
    const client = createQuickAuthClient({ origin });
    try {
      const payload = await client.verifyJwt({ token, domain });
      return { ok: true, identity: payload };
    } catch (error) {
      const err = new Error(error?.message || 'invalid token (jwks)');
      err.statusCode = 401;
      throw err;
    }
  }

  // Remote verify endpoint
  const VERIFY_URL = env('MINIAPP_AUTH_VERIFY_URL');
  if (VERIFY_URL) {
    const headers = { 'Content-Type': 'application/json' };
    const extra = parseHeadersConfig(env('MINIAPP_AUTH_VERIFY_HEADERS', ''));
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (typeof v === 'string') headers[k] = v;
      }
    }
    const upstream = await fetch(VERIFY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token })
    });
    const text = await upstream.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    if (!upstream.ok) {
      const err = new Error(json?.error || 'token verification failed');
      err.statusCode = 401;
      err.response = json || text;
      throw err;
    }
    return { ok: true, identity: json || null };
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

