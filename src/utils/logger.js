/**
 * Enterprise-grade Logger Utility for BaseMan
 * 
 * Features:
 * - Environment-aware log levels (DEBUG, INFO, WARN, ERROR, SILENT)
 * - Namespace-based child loggers via createLogger()
 * - Lazy evaluation for expensive debug logs (debugLazy)
 * - warnOnce/errorOnce to prevent duplicate spam
 * - Optional timestamps
 * - Graceful fallback when console isn't available
 * - Global access via window.BaseManLogger
 * 
 * Usage:
 *   import { createLogger } from './utils/logger.js';
 *   const log = createLogger('Leaderboard');
 *   log.debug('Loading items...');
 *   log.info('Loaded', count, 'items');
 *   log.warnOnce('no-data', 'No data available');
 * 
 * NOTE: This is separate from src/console-logger.js which captures
 * all console output for remote debugging. This logger controls
 * what gets logged in the first place.
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

/**
 * Get current timestamp in ISO format
 * @returns {string}
 */
function nowTs() {
  try {
    return new Date().toISOString();
  } catch {
    return "";
  }
}

/**
 * Get environment variables from window.__ENV or process.env
 * @returns {Object}
 */
function getEnv() {
  if (typeof window !== "undefined" && window.__ENV) {
    return window.__ENV;
  }
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env;
    }
  } catch {
    // Ignore - process may not be defined in browser
  }
  return {};
}

/**
 * Resolve log level from environment variables
 * @returns {number}
 */
function resolveLogLevel() {
  const env = getEnv();
  const raw = env.LOG_LEVEL || env.NEXT_PUBLIC_LOG_LEVEL || env.BASEMAN_LOG_LEVEL || "";
  const normalized = String(raw).trim().toLowerCase();

  if (normalized === "debug") return LogLevel.DEBUG;
  if (normalized === "info") return LogLevel.INFO;
  if (normalized === "warn") return LogLevel.WARN;
  if (normalized === "error") return LogLevel.ERROR;
  if (normalized === "silent") return LogLevel.SILENT;

  // Default based on NODE_ENV
  const nodeEnv = String(env.NODE_ENV || env.NEXT_PUBLIC_NODE_ENV || "").toLowerCase();
  return nodeEnv === "production" ? LogLevel.INFO : LogLevel.DEBUG;
}

// Current log level (can be changed at runtime)
let CURRENT_LEVEL = resolveLogLevel();

// Check if timestamps should be shown
const SHOW_TIMESTAMPS = getEnv().BASEMAN_LOG_TIMESTAMPS !== "false";

// Set to track logged-once keys
const loggedOnce = new Set();

// Maximum size for loggedOnce to prevent memory leaks
const MAX_ONCE_CACHE = 1000;

/**
 * Set the current log level
 * @param {string|number} level - Log level name or number
 */
export function setLogLevel(level) {
  if (typeof level === "string") {
    const map = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      silent: LogLevel.SILENT,
    };
    const key = level.toLowerCase().trim();
    if (map[key] !== undefined) {
      CURRENT_LEVEL = map[key];
      return;
    }
  }
  if (typeof level === "number") {
    CURRENT_LEVEL = level;
  }
}

/**
 * Check if a log level should be output
 * @param {number} level - Log level to check
 * @returns {boolean}
 */
function shouldLog(level) {
  return level >= CURRENT_LEVEL && CURRENT_LEVEL !== LogLevel.SILENT;
}

/**
 * Safely call console method
 * @param {string} method - Console method name
 * @param {...any} args - Arguments to pass
 */
function safeConsole(method, ...args) {
  if (typeof console === "undefined") return;
  const fn = console[method] || console.log;
  try {
    fn.apply(console, args);
  } catch {
    // Ignore console failures (can happen in some edge cases)
  }
}

/**
 * Format arguments with optional timestamp
 * @param {...any} args - Arguments to format
 * @returns {Array}
 */
function formatArgs(...args) {
  return SHOW_TIMESTAMPS ? [nowTs(), ...args] : args;
}

/**
 * Main logger object
 */
export const logger = {
  /**
   * Get current log level
   * @returns {number}
   */
  level: () => CURRENT_LEVEL,

  /**
   * Set log level
   * @param {string|number} level
   */
  setLevel: setLogLevel,

  /**
   * Log debug message (only when DEBUG level)
   * @param {...any} args
   */
  debug(...args) {
    if (shouldLog(LogLevel.DEBUG)) {
      safeConsole("debug", ...formatArgs(...args));
    }
  },

  /**
   * Log debug message with lazy evaluation
   * The function is only called if DEBUG level is active
   * @param {Function} fn - Function that returns the message
   */
  debugLazy(fn) {
    if (shouldLog(LogLevel.DEBUG)) {
      try {
        const result = typeof fn === "function" ? fn() : fn;
        safeConsole("debug", ...formatArgs(result));
      } catch {
        // Ignore errors in lazy evaluation
      }
    }
  },

  /**
   * Conditional debug log
   * @param {boolean} condition - Only log if true
   * @param {...any} args
   */
  debugIf(condition, ...args) {
    if (condition && shouldLog(LogLevel.DEBUG)) {
      safeConsole("debug", ...formatArgs(...args));
    }
  },

  /**
   * Log info message (INFO level and above)
   * @param {...any} args
   */
  info(...args) {
    if (shouldLog(LogLevel.INFO)) {
      safeConsole("info", ...formatArgs(...args));
    }
  },

  /**
   * Log message (alias for info, INFO level)
   * @param {...any} args
   */
  log(...args) {
    if (shouldLog(LogLevel.INFO)) {
      safeConsole("log", ...formatArgs(...args));
    }
  },

  /**
   * Log warning message (WARN level and above)
   * @param {...any} args
   */
  warn(...args) {
    if (shouldLog(LogLevel.WARN)) {
      safeConsole("warn", ...formatArgs(...args));
    }
  },

  /**
   * Log error message (ERROR level and above)
   * @param {...any} args
   */
  error(...args) {
    if (shouldLog(LogLevel.ERROR)) {
      safeConsole("error", ...formatArgs(...args));
    }
  },

  /**
   * Log warning only once per key
   * @param {string} key - Unique key for this warning
   * @param {...any} args
   */
  warnOnce(key, ...args) {
    if (loggedOnce.has(key)) return;
    // Prevent unbounded growth
    if (loggedOnce.size > MAX_ONCE_CACHE) {
      loggedOnce.clear();
    }
    loggedOnce.add(key);
    this.warn(...args);
  },

  /**
   * Log error only once per key
   * @param {string} key - Unique key for this error
   * @param {...any} args
   */
  errorOnce(key, ...args) {
    if (loggedOnce.has(key)) return;
    // Prevent unbounded growth
    if (loggedOnce.size > MAX_ONCE_CACHE) {
      loggedOnce.clear();
    }
    loggedOnce.add(key);
    this.error(...args);
  },

  /**
   * Start a console group (DEBUG level)
   * @param {string} label
   */
  group(label) {
    if (shouldLog(LogLevel.DEBUG)) {
      safeConsole("group", label);
    }
  },

  /**
   * End a console group (DEBUG level)
   */
  groupEnd() {
    if (shouldLog(LogLevel.DEBUG)) {
      safeConsole("groupEnd");
    }
  },

  /**
   * Start a timer (DEBUG level)
   * @param {string} label
   */
  time(label) {
    if (shouldLog(LogLevel.DEBUG)) {
      safeConsole("time", label);
    }
  },

  /**
   * End a timer (DEBUG level)
   * @param {string} label
   */
  timeEnd(label) {
    if (shouldLog(LogLevel.DEBUG)) {
      safeConsole("timeEnd", label);
    }
  },

  /**
   * Log a table (DEBUG level)
   * @param {any} data
   */
  table(data) {
    if (shouldLog(LogLevel.DEBUG)) {
      safeConsole("table", data);
    }
  },

  /**
   * Clear the once-logged cache
   * Call this on major state transitions (e.g., game restart)
   */
  clearOnceCache() {
    loggedOnce.clear();
  },

  /**
   * Check if running in development mode
   * @returns {boolean}
   */
  isDev() {
    return CURRENT_LEVEL === LogLevel.DEBUG;
  },
};

/**
 * Create a namespaced logger
 * @param {string} namespace - Namespace for the logger (e.g., "Leaderboard")
 * @returns {Object} Namespaced logger instance
 * 
 * @example
 * const log = createLogger('Leaderboard');
 * log.info('Loaded'); // Output: [timestamp] [Leaderboard] Loaded
 */
export function createLogger(namespace) {
  const prefix = namespace ? `[${namespace}]` : "";
  
  return {
    debug: (...args) => logger.debug(prefix, ...args),
    
    debugLazy: (fn) => {
      if (CURRENT_LEVEL <= LogLevel.DEBUG) {
        const result = typeof fn === "function" ? fn() : fn;
        logger.debug(prefix, result);
      }
    },
    
    debugIf: (condition, ...args) => logger.debugIf(condition, prefix, ...args),
    
    info: (...args) => logger.info(prefix, ...args),
    
    log: (...args) => logger.log(prefix, ...args),
    
    warn: (...args) => logger.warn(prefix, ...args),
    
    error: (...args) => logger.error(prefix, ...args),
    
    warnOnce: (key, ...args) => logger.warnOnce(`${namespace}:${key}`, prefix, ...args),
    
    errorOnce: (key, ...args) => logger.errorOnce(`${namespace}:${key}`, prefix, ...args),
    
    group: (label) => logger.group(`${prefix} ${label}`),
    
    groupEnd: () => logger.groupEnd(),
    
    time: (label) => logger.time(`${prefix} ${label}`),
    
    timeEnd: (label) => logger.timeEnd(`${prefix} ${label}`),
    
    table: (data) => logger.table(data),
  };
}

// Default export for convenience
export default logger;

// Expose globally for non-module scripts and debugging
if (typeof window !== "undefined") {
  window.BaseManLogger = logger;
  window.BaseManCreateLogger = createLogger;
  
  // Keep backward compatibility with old window.logger
  window.logger = logger;
}

