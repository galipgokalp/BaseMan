/**
 * Safe Contract Read Utility for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Handles eth_call limitations gracefully (e.g., Farcaster Wallet doesn't support it)
 */

import { ok, err, createAppError } from './errors.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('SafeContractRead');

const DEFAULT_TIMEOUT_MS = 5000; // 5 seconds

/**
 * Safe contract read that handles eth_call limitations
 * @template T
 * @param {Function} readFn - Function that performs the contract read
 * @param {Object} [options]
 * @param {number} [options.timeoutMs] - Timeout in milliseconds
 * @param {string} [options.context] - Error context
 * @param {Object} [options.meta] - Additional metadata for errors
 * @returns {Promise<import('./errors.js').Result<T>>}
 */
export async function safeContractRead(readFn, { timeoutMs = DEFAULT_TIMEOUT_MS, context = 'contract-read', meta = {} } = {}) {
  try {
    // Race against timeout
    const result = await Promise.race([
      Promise.resolve(readFn()),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Contract read timeout')), timeoutMs)
      )
    ]);

    return ok(result);
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code || error?.error?.code || null;

    // Check if wallet doesn't support eth_call (Farcaster Wallet)
    if (
      errorCode === 4200 ||
      errorMsg.includes('does not support the requested method') ||
      errorMsg.includes('eth_call') && errorMsg.includes('not supported') ||
      errorMsg.includes('UnsupportedMethodError')
    ) {
      log.debug('Contract read not supported (eth_call unavailable):', errorMsg);
      return err(createAppError(error, {
        kind: 'WALLET_METHOD_UNSUPPORTED',
        message: 'On-chain profile details are not supported by this wallet. You can still play and submit scores.',
        technicalMessage: `eth_call not supported: ${errorMsg}`,
        context,
        meta: {
          ...meta,
          errorCode,
          method: 'eth_call'
        }
      }));
    }

    // Check for contract revert / CALL_EXCEPTION
    // Note: "missing revert data" is common when contract function reverts without reason
    // This is expected when data doesn't exist (e.g., user hasn't submitted a score yet)
    if (
      errorMsg.includes('revert') ||
      errorMsg.includes('CALL_EXCEPTION') ||
      errorMsg.includes('execution reverted') ||
      errorMsg.includes('missing revert data') ||
      errorCode === 'CALL_EXCEPTION' ||
      (error?.kind === 'CONTRACT_REVERT')
    ) {
      // Don't log as warning for missing revert data - this is expected for new users
      const isMissingRevertData = errorMsg.includes('missing revert data');
      if (isMissingRevertData) {
        log.debug('Contract read reverted (no data available - expected for new users):', errorMsg);
      } else {
        log.debug('Contract read reverted:', errorMsg);
      }
      return err(createAppError(error, {
        kind: 'CONTRACT_REVERT',
        message: isMissingRevertData 
          ? 'No score data available yet. Submit a score to see your on-chain stats!'
          : 'Contract read failed. This may be expected if the data is not available.',
        technicalMessage: `Contract revert: ${errorMsg}`,
        context,
        meta: {
          ...meta,
          errorCode,
          isMissingRevertData
        }
      }));
    }

    // Timeout
    if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
      return err(createAppError(error, {
        kind: 'TIMEOUT',
        message: 'Contract read timed out. Please try again.',
        technicalMessage: `Contract read timeout after ${timeoutMs}ms`,
        context,
        meta: {
          ...meta,
          timeoutMs
        }
      }));
    }

    // Other errors
    return err(createAppError(error, {
      kind: 'UNKNOWN',
      message: 'Contract read failed. Please try again.',
      technicalMessage: errorMsg,
      context,
      meta: {
        ...meta,
        errorCode
      }
    }));
  }
}

/**
 * Check if contract reads are supported by the current provider
 * This is a best-effort check - actual support may vary
 * @param {Object} provider - Ethereum provider
 * @returns {Promise<boolean>}
 */
export async function isContractReadSupported(provider) {
  if (!provider || typeof provider.request !== 'function') {
    return false;
  }

  try {
    // Try to get capabilities (EIP-6963)
    const caps = await Promise.race([
      provider.request({ method: 'wallet_getCapabilities' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
    ]);

    // If capabilities exist, check if eth_call is listed as unsupported
    if (caps && typeof caps === 'object') {
      // Some wallets explicitly list unsupported methods
      const unsupported = caps.unsupportedMethods || [];
      if (Array.isArray(unsupported) && unsupported.includes('eth_call')) {
        return false;
      }
    }

    return true;
  } catch {
    // If we can't determine, assume it might be supported (optimistic)
    // Actual calls will fail gracefully via safeContractRead
    return true;
  }
}

