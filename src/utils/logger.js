/**
 * Logger Utility
 * 
 * Provides centralized logging with production/development mode support.
 * In production, debug logs are suppressed to improve performance and security.
 * 
 * Usage:
 *   import { logger } from './utils/logger.js';
 *   logger.log('Debug message');
 *   logger.warn('Warning message');
 *   logger.error('Error message');
 *   logger.debug('Detailed debug message');
 */

/**
 * Determines if the app is running in development mode
 * @returns {boolean}
 */
function isDev() {
  try {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.includes('localhost') ||
           hostname.includes('127.0.0.1');
  } catch (_) {
    return false;
  }
}

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Logs a message (only in development mode)
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDev()) {
      console.log(...args);
    }
  },
  
  /**
   * Logs a warning message (always shown, important)
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    console.warn(...args);
    // Warnings are always shown because they're important
  },
  
  /**
   * Logs an error message (always shown, critical)
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    console.error(...args);
    // Errors are always shown because they're critical
    // Could also send to error tracking service here
  },
  
  /**
   * Logs a debug message (only in development mode)
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDev()) {
      console.debug(...args);
    }
  },
  
  /**
   * Groups log messages (only in development mode)
   * @param {...any} args - Arguments for group label
   */
  group: (...args) => {
    if (isDev()) {
      console.group(...args);
    }
  },
  
  /**
   * Ends a log group (only in development mode)
   */
  groupEnd: () => {
    if (isDev()) {
      console.groupEnd();
    }
  },
  
  /**
   * Logs a table (only in development mode)
   * @param {...any} args - Arguments to log as table
   */
  table: (...args) => {
    if (isDev()) {
      console.table(...args);
    }
  },
  
  /**
   * Logs info message (only in development mode)
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (isDev()) {
      console.info(...args);
    }
  },
  
  /**
   * Checks if logger is in development mode
   * @returns {boolean}
   */
  isDev: () => isDev()
};

// Expose globally for backward compatibility and ease of use
if (typeof window !== 'undefined') {
  window.logger = logger;
}

