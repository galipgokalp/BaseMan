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
import { initPlatformDetection } from '../utils/platform-detection.js';

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
  
  // CRITICAL: Initialize platform detection early (non-blocking)
  // This ensures platform is detected before leaderboard loads, especially important for mobile MiniApp environments
  // where SDK may load slowly. We don't await this to avoid blocking app startup.
  // Wrap in try-catch to prevent any errors from blocking app initialization
  try {
    initPlatformDetection().catch(err => {
      // Silent fail - platform detection will retry when needed
      // Don't log to console in production to avoid noise
      if (typeof window !== 'undefined' && window.__ENV?.NODE_ENV !== 'production') {
        console.debug('Early platform detection failed (non-critical):', err?.message);
      }
    });
  } catch (_err) {
    // Catch sync errors (shouldn't happen, but safety first)
    // Silent fail - platform detection will retry when needed
  }
}

// Auto-initialize if this module is loaded directly
if (typeof window !== 'undefined') {
  bootstrap();
}
