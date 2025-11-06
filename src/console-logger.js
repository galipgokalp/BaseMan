/**
 * Console Log Collector
 * Captures all console logs, errors, and warnings for debugging
 */

(function() {
  'use strict';

  const LOG_BUFFER = [];
  const MAX_BUFFER_SIZE = 500;
  const LOG_TYPES = ['log', 'error', 'warn', 'info', 'debug'];

  // Store original console methods
  const originalConsole = {};
  LOG_TYPES.forEach(type => {
    originalConsole[type] = console[type];
  });

  // Capture console methods
  LOG_TYPES.forEach(type => {
    console[type] = function(...args) {
      // Call original method
      originalConsole[type].apply(console, args);
      
      // Capture log
      const logEntry = {
        type: type,
        timestamp: new Date().toISOString(),
        message: args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '),
        args: args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }),
        stack: type === 'error' ? (args[0]?.stack || new Error().stack) : null
      };
      
      LOG_BUFFER.push(logEntry);
      
      // Keep buffer size manageable
      if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
        LOG_BUFFER.shift();
      }
      
      // Send to server if available
      if (typeof fetch !== 'undefined') {
        try {
          fetch('/api/app-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logEntry),
            keepalive: true
          }).catch(() => {}); // Ignore fetch errors
        } catch (e) {}
      }
    };
  });

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    const errorEntry = {
      type: 'error',
      timestamp: new Date().toISOString(),
      message: `Unhandled Error: ${event.message}`,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || null,
      error: event.error ? {
        name: event.error.name,
        message: event.error.message,
        stack: event.error.stack
      } : null
    };
    
    LOG_BUFFER.push(errorEntry);
    
    if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
      LOG_BUFFER.shift();
    }
    
    // Send to server
    if (typeof fetch !== 'undefined') {
      try {
        fetch('/api/app-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorEntry),
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    }
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorEntry = {
      type: 'error',
      timestamp: new Date().toISOString(),
      message: `Unhandled Promise Rejection: ${event.reason}`,
      reason: event.reason ? String(event.reason) : null,
      stack: event.reason?.stack || null
    };
    
    LOG_BUFFER.push(errorEntry);
    
    if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
      LOG_BUFFER.shift();
    }
    
    // Send to server
    if (typeof fetch !== 'undefined') {
      try {
        fetch('/api/app-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorEntry),
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    }
  });

  // Public API
  window.ConsoleLogger = {
    getLogs: () => LOG_BUFFER.slice(),
    getErrors: () => LOG_BUFFER.filter(log => log.type === 'error'),
    getWarnings: () => LOG_BUFFER.filter(log => log.type === 'warn'),
    clear: () => {
      LOG_BUFFER.length = 0;
    },
    export: () => {
      const logs = LOG_BUFFER.slice();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `console-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    print: () => {
      console.table(LOG_BUFFER);
    },
    printErrors: () => {
      const errors = LOG_BUFFER.filter(log => log.type === 'error');
      console.group('🔴 Errors');
      errors.forEach((error, index) => {
        console.group(`Error ${index + 1}`);
        console.log('Timestamp:', error.timestamp);
        console.log('Message:', error.message);
        if (error.stack) console.log('Stack:', error.stack);
        if (error.filename) console.log('File:', error.filename, `Line: ${error.lineno}:${error.colno}`);
        console.groupEnd();
      });
      console.groupEnd();
    }
  };

  console.log('[ConsoleLogger] Initialized - use window.ConsoleLogger to access logs');
  console.log('[ConsoleLogger] Available methods:', Object.keys(window.ConsoleLogger).join(', '));
})();

