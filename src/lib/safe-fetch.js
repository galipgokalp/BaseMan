/**
 * Safe Fetch Utility for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Wraps fetch with timeout, error handling, and Result<T> pattern
 */

import { ok, err, createAppError } from './errors.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('SafeFetch');

const DEFAULT_TIMEOUT_MS = 7000; // 7 seconds

/**
 * Safe fetch with timeout and error handling
 * @template T
 * @param {RequestInfo | URL} input - Fetch input
 * @param {RequestInit} [init] - Fetch options
 * @param {Object} [options]
 * @param {number} [options.timeoutMs] - Timeout in milliseconds
 * @param {string} [options.context] - Error context
 * @returns {Promise<import('./errors.js').Result<T>>}
 */
export async function safeFetchJson(input, init = {}, { timeoutMs = DEFAULT_TIMEOUT_MS, context = 'unknown' } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle non-2xx status codes
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = `HTTP ${response.status}`;
      }

      const error = new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      error.status = response.status;
      error.statusText = response.statusText;

      let kind = 'BAD_RESPONSE';
      if (response.status === 401) {
        kind = 'UNAUTHORIZED';
      } else if (response.status >= 500) {
        kind = 'NETWORK_ERROR';
      }

      return err(createAppError(error, {
        context,
        meta: {
          status: response.status,
          statusText: response.statusText,
          url: typeof input === 'string' ? input : input?.url || 'unknown'
        }
      }));
    }

    // Parse JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return err(createAppError(parseError, {
        context,
        meta: {
          status: response.status,
          url: typeof input === 'string' ? input : input?.url || 'unknown'
        }
      }));
    }

    return ok(data);
  } catch (fetchError) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
      return err(createAppError(new Error('Request timeout'), {
        context,
        meta: {
          timeoutMs,
          url: typeof input === 'string' ? input : input?.url || 'unknown'
        }
      }));
    }

    // Handle network errors
    if (fetchError.message?.includes('fetch') || fetchError.message?.includes('network')) {
      return err(createAppError(fetchError, {
        context,
        meta: {
          url: typeof input === 'string' ? input : input?.url || 'unknown'
        }
      }));
    }

    // Other errors
    return err(createAppError(fetchError, {
      context,
      meta: {
        url: typeof input === 'string' ? input : input?.url || 'unknown'
      }
    }));
  }
}

/**
 * Check if currently offline
 * @returns {boolean}
 */
export function isOffline() {
  if (typeof navigator === 'undefined') return false;
  return !navigator.onLine;
}

/**
 * Check if action requires network and block if offline
 * @param {string} actionName - Name of action (for logging)
 * @param {string} [context] - Error context
 * @returns {import('./errors.js').Result<true> | null} - null if online, error result if offline
 */
export function requireOnline(actionName, context = 'unknown') {
  if (isOffline()) {
    log.warn(`Action blocked (offline): ${actionName}`);
    return err(createAppError(new Error('Network connection required'), {
      context,
      meta: { actionName, offline: true }
    }));
  }
  return null;
}

