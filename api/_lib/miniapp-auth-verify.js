import { z } from 'zod';
import { createClient as createQuickAuthClient } from '@farcaster/quick-auth';
import { createLogger } from '../../src/utils/logger.js';
import { isDebugFlagEnabled } from './request-policy.js';

const log = createLogger('ApiMiniappAuthVerify');
const FARCASTER_AUTH_ORIGIN = 'https://auth.farcaster.xyz';

function env(key, fallback = '') {
  const value = process?.env?.[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseHeadersConfig(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (_) {}
  return null;
}

function createAuthError(code, statusCode, message, cause) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  error.cause = cause;
  return error;
}

function resolveDomain(req, domainOverride) {
  const explicitDomain = domainOverride || env('MINIAPP_AUTH_DOMAIN', '');
  const hostHeader = String(req?.headers?.host || '').split(':')[0];
  return explicitDomain || hostHeader || '';
}

function shouldUseRemoteVerification() {
  const mode = env('MINIAPP_AUTH_MODE', '').toLowerCase();
  const verifyUrl = env('MINIAPP_AUTH_VERIFY_URL', '');
  return mode === 'remote' && Boolean(verifyUrl);
}

function isDebugEnabled() {
  return isDebugFlagEnabled('MINIAPP_AUTH_DEBUG');
}

export const TokenSchema = z.object({ token: z.string().min(8) });

export function formatMiniAppAuthError(error, fallbackStatusCode = 401) {
  const code = error?.code || 'verification_failed';
  const statusCode = Number(error?.statusCode || fallbackStatusCode || 401);
  if (code === 'missing_token') {
    return { statusCode, body: { error: 'Mini App auth token missing', code } };
  }
  if (code === 'invalid_token') {
    return { statusCode, body: { error: 'Mini App auth invalid', code } };
  }
  if (code === 'misconfigured_auth') {
    return { statusCode, body: { error: 'Mini App auth misconfigured', code } };
  }
  return { statusCode, body: { error: 'Mini App auth verification failed', code } };
}

async function verifyWithJwks({ token, domain }) {
  const client = createQuickAuthClient({ origin: FARCASTER_AUTH_ORIGIN });
  try {
    const identity = await client.verifyJwt({ token, domain });
    log.debug('JWKS verification succeeded', { domain, fid: identity?.fid || null });
    return { ok: true, identity };
  } catch (error) {
    log.warn('JWKS verification failed', {
      domain,
      name: error?.name || 'UnknownError',
      message: isDebugEnabled() ? error?.message || 'invalid token' : 'invalid token'
    });
    throw createAuthError('invalid_token', 401, 'Mini App auth invalid', error);
  }
}

async function verifyWithRemote({ token, req }) {
  const verifyUrl = env('MINIAPP_AUTH_VERIFY_URL', '');
  if (!verifyUrl) {
    throw createAuthError('misconfigured_auth', 500, 'Mini App auth misconfigured');
  }

  const headers = { 'Content-Type': 'application/json' };
  const extraHeaders = parseHeadersConfig(env('MINIAPP_AUTH_VERIFY_HEADERS', ''));
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }
  }

  try {
    const upstream = await fetch(verifyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token })
    });

    const text = await upstream.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (_) {}

    if (!upstream.ok) {
      const isAuthStatus = upstream.status === 401 || upstream.status === 403;
      log.warn('Remote Mini App auth verification failed', {
        status: upstream.status,
        verifyUrl,
        bodyPreview: isDebugEnabled() ? String(text || '').slice(0, 160) : undefined
      });
      throw createAuthError(
        isAuthStatus ? 'invalid_token' : 'verification_failed',
        isAuthStatus ? 401 : 502,
        isAuthStatus ? 'Mini App auth invalid' : 'Mini App auth verification failed'
      );
    }

    log.debug('Remote Mini App auth verification succeeded', {
      verifyUrl,
      fid: json?.fid || null,
      host: req?.headers?.host || null
    });
    return { ok: true, identity: json || null };
  } catch (error) {
    if (error?.code) {
      throw error;
    }
    log.error('Remote Mini App auth verification error', {
      verifyUrl,
      name: error?.name || 'UnknownError',
      message: error?.message || 'network failure'
    });
    throw createAuthError('verification_failed', 502, 'Mini App auth verification failed', error);
  }
}

export async function verifyQuickAuthToken({ token, req, domainOverride } = {}) {
  const domain = resolveDomain(req, domainOverride);
  if (!domain) {
    log.error('Mini App auth domain resolution failed');
    throw createAuthError('misconfigured_auth', 500, 'Mini App auth misconfigured');
  }

  if (shouldUseRemoteVerification()) {
    return verifyWithRemote({ token, req, domain });
  }

  return verifyWithJwks({ token, domain });
}

export function extractQuickAuthToken(req, body) {
  try {
    const headers = req?.headers || {};
    const auth = headers.authorization || headers.Authorization;
    if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
      return auth.slice(7).trim();
    }

    const altHeader = headers['x-miniapp-auth-token'] || headers['x-quickauth-token'];
    if (typeof altHeader === 'string' && altHeader.trim().length >= 8) {
      return altHeader.trim();
    }

    const token = body?.quickAuthToken || body?.token;
    if (typeof token === 'string' && token.length >= 8) {
      return token;
    }
  } catch (_) {}
  return null;
}

export function requireMiniAppToken(req, body) {
  const token = extractQuickAuthToken(req, body);
  if (!token) {
    throw createAuthError('missing_token', 401, 'Mini App auth token missing');
  }
  return token;
}

export function isMiniAppAuthRequired(endpoint) {
  const global = env('REQUIRE_MINIAPP_AUTH', 'false').toLowerCase() === 'true';
  const endpointSetting = {
    score: env('SCORE_REQUIRE_MINIAPP_AUTH', ''),
    quest: env('QUEST_REQUIRE_MINIAPP_AUTH', '')
  }[endpoint];

  const normalized = String(endpointSetting || '').toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return global;
}
