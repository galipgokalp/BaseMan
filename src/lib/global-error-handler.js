/**
 * Global Error Handler for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Catches unhandled errors and promise rejections
 */

import { createLogger } from '../utils/logger.js';
import { createAppError } from './errors.js';

const log = createLogger('GlobalErrorHandler');

/**
 * Initialize global error handlers
 * Should be called once at app startup
 */
export function initGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message || 'Unknown error');
    const appError = createAppError(error, {
      context: 'global',
      meta: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: error.stack
      }
    });

    log.error('Unhandled error:', {
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
          event: 'global:unhandled-error',
          meta: appError.toJSON()
        }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}

    // Don't prevent default - let browser handle it normally
    // But we've logged it for debugging
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason || new Error('Unhandled promise rejection');
    const appError = createAppError(error, {
      context: 'global',
      meta: {
        promise: true,
        stack: error?.stack
      }
    });

    log.error('Unhandled promise rejection:', {
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
          event: 'global:unhandled-rejection',
          meta: appError.toJSON()
        }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}

    // Prevent default browser behavior (console error)
    // We've handled it, so mark as handled
    event.preventDefault();
  });

  log.debug('Global error handler initialized');
}

