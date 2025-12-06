/**
 * Network Status Utility for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Simple network awareness without heavy dependencies
 */

import { createLogger } from '../utils/logger.js';

const log = createLogger('NetworkStatus');

let networkStatusListeners = new Set();
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

/**
 * Get current network status
 * @returns {boolean} - true if online, false if offline
 */
export function getNetworkStatus() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Subscribe to network status changes
 * @param {Function} callback - Callback function (online: boolean) => void
 * @returns {Function} - Unsubscribe function
 */
export function subscribeNetworkStatus(callback) {
  networkStatusListeners.add(callback);
  
  // Call immediately with current status
  callback(isOnline);

  // Return unsubscribe function
  return () => {
    networkStatusListeners.delete(callback);
  };
}

/**
 * Initialize network status monitoring
 * Should be called once at app startup
 */
export function initNetworkStatus() {
  if (typeof window === 'undefined') return;

  const updateStatus = (online) => {
    const wasOnline = isOnline;
    isOnline = online;
    
    if (wasOnline !== isOnline) {
      log.info(`Network status changed: ${online ? 'online' : 'offline'}`);
      networkStatusListeners.forEach(callback => {
        try {
          callback(isOnline);
        } catch (error) {
          log.error('Network status callback error:', error);
        }
      });
    }
  };

  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));

  // Initial status
  isOnline = navigator.onLine;
}

/**
 * React hook-like function for network status (for vanilla JS usage)
 * Returns current status and a way to subscribe
 * @returns {{ isOnline: boolean; subscribe: (callback: (online: boolean) => void) => Function }}
 */
export function useNetworkStatus() {
  return {
    isOnline: getNetworkStatus(),
    subscribe: subscribeNetworkStatus
  };
}

