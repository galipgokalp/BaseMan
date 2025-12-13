/**
 * Global Error Handler for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Catches unhandled errors and promise rejections
 */

import { createLogger } from '../utils/logger.js';
import { createAppError } from './errors.js';

const log = createLogger('GlobalErrorHandler');

const noisyPatterns = [
  'ResizeObserver loop', 
  'Script error',
  "Cannot read properties of undefined (reading 'result')",  // SDK internal error
  'miniapp-sdk',  // Any SDK internal errors
  'vendor/miniapp-sdk'  // SDK file path errors
];

function shouldDowngrade(message = '', stack = '') {
  const text = `${String(message || '')} ${String(stack || '')}`;
  return noisyPatterns.some((p) => text.includes(p));
}

function logGlobal(topic, payload) {
  const message = payload?.message || payload?.technicalMessage || '';
  const stack = payload?.meta?.stack || payload?.stack || '';
  if (shouldDowngrade(message, stack)) {
    log.debug(topic, payload);
  } else {
    log.error(topic, payload);
  }
}

/**
 * Initialize global error handlers
 * Should be called once at app startup
 */
export function initGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  const handleError = (event) => {
    const error = event?.error || event?.reason || new Error(event?.message || 'Unknown error');
    const appError = createAppError(error, {
      context: 'global',
      meta: {
        filename: event?.filename,
        lineno: event?.lineno,
        colno: event?.colno,
        stack: error?.stack,
        promise: Boolean(event?.reason)
      }
    });

    logGlobal(event?.reason ? 'unhandled-promise' : 'unhandled-error', {
      kind: appError.kind,
      message: appError.technicalMessage,
      context: appError.context,
      meta: appError.meta
    });

    // Log to backend if available
    try {
      fetch('/api/app-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event?.reason ? 'global:unhandled-rejection' : 'global:unhandled-error',
          meta: appError.toJSON()
        }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}
  };

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    handleError(event);
    // Don't prevent default - let browser handle it normally
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event);
    event.preventDefault();
  });

  window.onerror = function (message, source, lineno, colno, error) {
    handleError({ message, filename: source, lineno, colno, error });
  };

  window.onunhandledrejection = function (event) {
    handleError(event);
  };

  log.debug('Global error handler initialized');
}
