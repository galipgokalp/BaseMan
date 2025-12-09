/**
 * Rollbar Error Tracking Initialization
 * 
 * Initializes Rollbar error tracking service with SDK context integration
 * for Farcaster/Base App mini-apps.
 */

import { createLogger } from '../utils/logger.js';

const log = createLogger('RollbarInit');

/**
 * Initialize Rollbar error tracking
 * Should be called after __ENV is loaded
 */
export function initRollbar() {
  if (typeof window === 'undefined') return;
  
  // Wait for __ENV to be available
  function tryInit() {
    if (typeof window.__ENV === 'undefined') {
      // Retry after a short delay
      setTimeout(tryInit, 50);
      return;
    }
    
    // Support both Vercel Marketplace format and standard format
    const token = window.__ENV.NEXT_PUBLIC_ROLLBAR_BASE_MAN_CLIENT_TOKEN_1764367657 
      || window.__ENV.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN;
    if (!token) {
      log.warn('Client token not found in environment variables');
      return;
    }
    
    // Initialize Rollbar config
    window._rollbarConfig = {
      accessToken: token,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: window.__ENV.VERCEL_ENV || 'production',
        client: {
          javascript: {
            code_version: '1.0'
          }
        }
      }
    };
    
    // Load Rollbar script
    const script = document.createElement('script');
    script.src = 'https://cdn.rollbar.com/rollbarjs/refs/tags/latest/rollbar.min.js';
    script.async = true;
    script.onload = function() {
      // After Rollbar loads, set person tracking and custom data if available
      if (window.Rollbar && window.sdk && window.sdk.context) {
        window.sdk.context.then(context => {
          const user = context?.user;
          const client = context?.client;
          const location = context?.location;
          
          // Build custom data payload
          const customData = {};
          if (client) {
            customData.platform = client.platformType || 'unknown';
            customData.clientFid = client.clientFid || undefined;
            customData.added = client.added || false;
          }
          if (location) {
            customData.locationType = location.type || undefined;
            if (location.referrerDomain) {
              customData.referrerDomain = location.referrerDomain;
            }
          }
          
          // Configure Rollbar with person and custom data
          const rollbarConfig = {};
          if (user && user.fid) {
            rollbarConfig.person = {
              id: String(user.fid), // Required: person ID
              username: user.username || undefined,
              email: undefined // Not available from Farcaster
            };
          }
          if (Object.keys(customData).length > 0) {
            rollbarConfig.custom = customData;
          }
          
          if (Object.keys(rollbarConfig).length > 0) {
            window.Rollbar.configure({
              payload: rollbarConfig
            });
          }
        }).catch(() => {
          // Ignore errors if context is not available
        });
      }
    };
    document.head.appendChild(script);
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
}

