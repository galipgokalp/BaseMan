/**
 * SDK Context Caching Module
 * 
 * Handles:
 * - SDK context caching with TTL
 * - Context retrieval (cached or fresh)
 */

import { createLogger } from '../utils/logger.js';

const log = createLogger('OnchainSDKContext');

/**
 * SDK context cache configuration
 */
const SDK_CONTEXT_CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Cached SDK context state
 */
let cachedSDKContext = null;
let cachedSDKContextTimestamp = 0;

/**
 * Get cached SDK context or fetch fresh
 * @param {Object} sdk - Mini App SDK instance
 * @param {Function} debug - Debug logging function
 * @returns {Promise<Object|null>} SDK context or null
 */
export async function getCachedSDKContext(sdk, debug = () => {}) {
  const now = Date.now();
  if (cachedSDKContext && (now - cachedSDKContextTimestamp) < SDK_CONTEXT_CACHE_TTL_MS) {
    return cachedSDKContext;
  }
  
  if (sdk && sdk.context) {
    try {
      cachedSDKContext = await sdk.context;
      cachedSDKContextTimestamp = now;
    } catch (error) {
      debug(`getCachedSDKContext: Failed to fetch context: ${error?.message || error}`);
      cachedSDKContext = null;
    }
  }
  return cachedSDKContext;
}

/**
 * Get fresh SDK context (bypass cache)
 * @param {Object} sdk - Mini App SDK instance
 * @param {Function} debug - Debug logging function
 * @returns {Promise<Object|null>} Fresh SDK context or null
 */
export async function getFreshSDKContext(sdk, debug = () => {}) {
  if (!sdk || !sdk.context) {
    return null;
  }
  
  try {
    const context = await sdk.context;
    // Update cache with fresh context
    cachedSDKContext = context;
    cachedSDKContextTimestamp = Date.now();
    return context;
  } catch (error) {
    debug(`getFreshSDKContext: Failed to fetch context: ${error?.message || error}`);
    return null;
  }
}

/**
 * Clear SDK context cache
 */
export function clearSDKContextCache() {
  cachedSDKContext = null;
  cachedSDKContextTimestamp = 0;
}

