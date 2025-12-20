import Rollbar from 'rollbar';
import { createLogger } from '../../src/utils/logger.js';
import { ROLLBAR_SERVER_ACCESS_TOKEN } from '../../src/lib/rollbar-tokens.js';

const log = createLogger('ApiRollbar');
let rollbarInstance = null;
let initialized = false;

function sanitizeHeaderValue(value) {
  if (!value) return '';
  return String(value).trim().replace(/[\x00-\x1F\x7F]/g, '');
}

export function getRollbar() {
  if (initialized) return rollbarInstance;
  initialized = true;

  const rollbarTokenRaw = process.env.ROLLBAR_BASE_MAN_SERVER_TOKEN_1764367657
    || process.env.ROLLBAR_ACCESS_TOKEN
    || process.env.ROLLBAR_SERVER_TOKEN
    || ROLLBAR_SERVER_ACCESS_TOKEN;
  const rollbarToken = sanitizeHeaderValue(rollbarTokenRaw);

  if (!rollbarToken) {
    log.warnOnce('rollbar-missing', 'Rollbar server token not configured; skipping Rollbar init.');
    rollbarInstance = null;
    return rollbarInstance;
  }

  try {
    rollbarInstance = new Rollbar({
      accessToken: rollbarToken,
      captureUncaught: true,
      captureUnhandledRejections: true,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
      codeVersion: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      scrubFields: [
        'authorization',
        'cookie',
        'set-cookie',
        'x-api-key',
        'x-api-token',
        'x-signature'
      ]
    });
  } catch (error) {
    rollbarInstance = null;
    log.warnOnce('rollbar-init-failed', `Rollbar initialization failed: ${error?.message || error}`);
  }

  return rollbarInstance;
}
