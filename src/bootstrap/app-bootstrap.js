/**
 * Application Bootstrap Module
 * 
 * Initializes core application services:
 * - Network status monitoring
 * - Global error handling
 * - Rollbar error tracking
 * 
 * This module should be loaded early in the application lifecycle.
 */

import { initNetworkStatus } from '../lib/network-status.js';
import { initGlobalErrorHandler } from '../lib/global-error-handler.js';
import { initRollbar } from './rollbar-init.js';

/**
 * Initialize all bootstrap services
 */
export function bootstrap() {
  // Initialize network status monitoring
  initNetworkStatus();
  
  // Initialize global error handler
  initGlobalErrorHandler();
  
  // Initialize Rollbar (after __ENV is loaded)
  initRollbar();
}

// Auto-initialize if this module is loaded directly
if (typeof window !== 'undefined') {
  bootstrap();
}

