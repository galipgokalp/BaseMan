/**
 * Central Error Model for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Provides typed error abstraction and Result<T> pattern for safe error handling
 */

/**
 * Error kinds for discriminated union
 * @typedef {'NETWORK_ERROR' | 'TIMEOUT' | 'BAD_RESPONSE' | 'UNAUTHORIZED' | 'WALLET_METHOD_UNSUPPORTED' | 'CONTRACT_REVERT' | 'USER_REJECTED' | 'UNKNOWN'} ErrorKind
 */

/**
 * Context where error occurred
 * @typedef {'leaderboard' | 'profile' | 'submitScore' | 'auth' | 'contract-read' | 'wallet' | 'unknown'} ErrorContext
 */

/**
 * AppError class for structured error handling
 */
export class AppError extends Error {
  /**
   * @param {Object} options
   * @param {ErrorKind} options.kind - Error kind
   * @param {string} options.message - User-friendly message
   * @param {string} [options.technicalMessage] - Technical details for logs
   * @param {Error} [options.cause] - Original error
   * @param {ErrorContext} [options.context] - Where error occurred
   * @param {Object} [options.meta] - Additional metadata
   */
  constructor({ kind, message, technicalMessage, cause, context = 'unknown', meta = {} }) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.message = message;
    this.technicalMessage = technicalMessage || message;
    this.cause = cause;
    this.context = context;
    this.meta = meta;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert to plain object for logging
   * @returns {Object}
   */
  toJSON() {
    return {
      kind: this.kind,
      message: this.message,
      technicalMessage: this.technicalMessage,
      context: this.context,
      meta: this.meta,
      stack: this.stack,
      cause: this.cause ? (this.cause instanceof Error ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : String(this.cause)) : undefined
    };
  }
}

/**
 * Result type for safe error handling
 * @template T
 * @typedef {{ ok: true; data: T } | { ok: false; error: AppError }} Result
 */

/**
 * Create a success result
 * @template T
 * @param {T} data
 * @returns {{ ok: true; data: T }}
 */
export function ok(data) {
  return { ok: true, data };
}

/**
 * Create an error result
 * @param {AppError} error
 * @returns {{ ok: false; error: AppError }}
 */
export function err(error) {
  return { ok: false, error };
}

/**
 * Create an AppError from various error sources
 * @param {Error | string | unknown} error - Original error
 * @param {Object} options
 * @param {ErrorContext} [options.context] - Context
 * @param {Object} [options.meta] - Additional metadata
 * @returns {AppError}
 */
export function createAppError(error, { context = 'unknown', meta = {} } = {}) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message || 'An error occurred';
    let kind = 'UNKNOWN';
    let technicalMessage = error.message;

    // Detect error kind from error message/code
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      kind = 'TIMEOUT';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      kind = 'NETWORK_ERROR';
    } else if (error.code === 4200 || error.message?.includes('does not support the requested method')) {
      kind = 'WALLET_METHOD_UNSUPPORTED';
    } else if (error.message?.includes('revert') || error.message?.includes('CALL_EXCEPTION')) {
      kind = 'CONTRACT_REVERT';
    } else if (error.message?.includes('reject') || error.message?.includes('denied') || error.message?.includes('User rejected')) {
      kind = 'USER_REJECTED';
    } else if (error.status === 401 || error.message?.includes('unauthorized')) {
      kind = 'UNAUTHORIZED';
    }

    return new AppError({
      kind,
      message: getUserFriendlyMessage(kind, message),
      technicalMessage,
      cause: error,
      context,
      meta
    });
  }

  if (typeof error === 'string') {
    return new AppError({
      kind: 'UNKNOWN',
      message: getUserFriendlyMessage('UNKNOWN', error),
      technicalMessage: error,
      context,
      meta
    });
  }

  return new AppError({
    kind: 'UNKNOWN',
    message: 'An unexpected error occurred',
    technicalMessage: String(error),
    context,
    meta
  });
}

/**
 * Get user-friendly error message
 * @param {ErrorKind} kind
 * @param {string} [fallback] - Fallback message
 * @returns {string}
 */
function getUserFriendlyMessage(kind, fallback = 'An error occurred') {
  const messages = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet and try again.',
    TIMEOUT: 'Request timed out. Please try again.',
    BAD_RESPONSE: 'Invalid response from server. Please try again.',
    UNAUTHORIZED: 'Authentication failed. Please try again.',
    WALLET_METHOD_UNSUPPORTED: 'This feature is not supported by your wallet. You can still play and submit scores.',
    CONTRACT_REVERT: 'Transaction failed. Please try again.',
    USER_REJECTED: 'Transaction was cancelled.',
    UNKNOWN: fallback || 'Something went wrong. Please try again.'
  };

  return messages[kind] || messages.UNKNOWN;
}

