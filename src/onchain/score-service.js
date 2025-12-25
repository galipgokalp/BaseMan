/**
 * Score Service Module
 * 
 * Handles:
 * - Score signature requests
 * - Transaction sending (wallet_sendCalls, eth_sendTransaction)
 * - Paymaster integration (currently disabled - sponsorless mode)
 * 
 * Phase 6: Error handling & stability
 * - Uses safeFetchJson for robust error handling
 */

import { createLogger } from '../utils/logger.js';
import { safeFetchJson, requireOnline } from '../lib/safe-fetch.js';
import { createAppError } from '../lib/errors.js';
import { getChainKey } from './provider.js';

const log = createLogger('OnchainScoreService');

/**
 * Request score signature from backend
 * @param {Object} params - Parameters
 * @param {string} params.address - Player wallet address
 * @param {bigint} params.score - Score value
 * @param {number} params.durationMs - Game duration in milliseconds
 * @param {number} params.chainId - Chain ID
 * @param {string} params.scoreEndpoint - Backend score endpoint URL
 * @param {Function} params.isMiniAppEnv - Function to check if in mini app environment
 * @param {Function} params.getMiniAppAuthToken - Function to get mini app auth token
 * @param {string} params.platform - Platform identifier ('farcaster' or 'base-app')
 * @param {Function} params.debug - Debug logging function
 * @returns {Promise<Object>} Signature payload with signature, deadline, score, nonce
 */
export async function requestScoreSignature({
  address,
  score,
  durationMs,
  chainId,
  scoreEndpoint,
  isMiniAppEnv,
  getMiniAppAuthToken,
  platform,
  debug = () => {}
}) {
  let playerAddress = address;
  try {
    playerAddress = window.ethers.getAddress(playerAddress);
  } catch (error) {
    debug(`requestScoreSignature: address normalization failed: ${error?.message || error}`);
    throw new Error("Invalid wallet address");
  }

  // Derive chain key for backend (matches server-side targets in api/_lib/registry.js)
  const chainKey = getChainKey(chainId);

  debug(
    `requestScoreSignature: Preparing score-sign request: score=${score.toString()} duration=${durationMs}ms chain=${chainKey}`
  );

  const headers = { "Content-Type": "application/json" };
  if (isMiniAppEnv && isMiniAppEnv()) {
    // QuickAuth token varsa ekle (profil için), yoksa isteği engelleme
    try {
      const t = await getMiniAppAuthToken();
      if (t) {
        headers['Authorization'] = `Bearer ${t}`;
        headers['X-MiniApp-Auth-Token'] = t;
      }
    } catch (error) {
      debug(`requestScoreSignature: Failed to get auth token: ${error?.message || error}`);
    }
  }

  // Phase 6: Check if online before making request
  const offlineCheck = requireOnline('requestScoreSignature', 'submitScore');
  if (offlineCheck) {
    throw createAppError(offlineCheck.error, {
      context: 'submitScore',
      meta: { score: score.toString(), durationMs, chainKey }
    });
  }

  // Phase 6: Use safeFetchJson for robust error handling
  const result = await safeFetchJson(scoreEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      playerAddress,
      score: score.toString(),
      durationMs,
      level: window.level ?? 1,
      chain: chainKey,
      platform: platform || null // 'farcaster' or 'base-app'
    })
  }, {
    context: 'submitScore',
    timeoutMs: 10000 // 10 seconds for score signature
  });

  if (!result.ok) {
    const error = result.error;
    const message = error.message || "Failed to obtain score signature";
    debug(`requestScoreSignature: score-sign failed: ${message}`);
    log.error('Score signature request failed:', {
      kind: error.kind,
      message: error.technicalMessage,
      context: error.context,
      meta: error.meta
    });
    try { 
      fetch('/api/app-log', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ event: 'score-sign:error', meta: { message: String(message), durationMs, errorKind: error.kind } }) 
      }).catch(()=>{});
    } catch {}
    throw error;
  }

  const payload = result.data;
  debug(`requestScoreSignature: score-sign succeeded: ${score} (duration ${durationMs}ms)`);
  try { 
    fetch('/api/app-log', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ event: 'score-sign:ok', meta: { score: score.toString(), durationMs } }) 
    }).catch(()=>{});
  } catch {}
  return payload;
}

/**
 * Send contract interaction calls using wallet_sendCalls (EIP-5792)
 * @param {Object} params - Parameters
 * @param {string} params.callData - Encoded contract function call data
 * @param {string|null} params.paymasterUrl - Paymaster service URL (null for sponsorless mode)
 * @param {Object} params.state - State object with address, provider
 * @param {Object} params.config - Config object with chainId, registryAddress
 * @param {Function} params.debug - Debug logging function
 * @returns {Promise<Object>} Transaction result with id or hash
 */
export async function sendCalls({
  callData,
  paymasterUrl,
  state,
  config,
  debug = () => {}
}) {
  // Validate chainId
  const hexChainId = (() => { 
    try { 
      return window.ethers.toBeHex(config.chainId); 
    } catch (error) {
      debug(`sendCalls: chainId conversion error: ${error?.message || error}`);
      return null;
    }
  })();
  if (!hexChainId) {
    throw new Error(`Invalid chainId: ${config.chainId}`);
  }
  
  // Validate address
  if (!state.address || typeof state.address !== 'string') {
    throw new Error('sendCalls: Wallet address not available');
  }
  
  // Validate provider
  if (!state.provider || typeof state.provider.request !== 'function') {
    throw new Error('sendCalls: Ethereum provider not available');
  }
  
  // Validate callData
  if (!callData || typeof callData !== 'string' || !callData.startsWith('0x')) {
    throw new Error('sendCalls: Invalid callData format');
  }
  
  // Platform-specific version and atomic batch setting
  // According to docs:
  // - Farcaster: Sequential execution (atomicRequired: false), version: "1.0"
  // - Base App: Atomic batch supported (atomicRequired: true), version: "2.0.0" (REQUIRED)
  let isFarcaster = false;
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.isFarcasterMiniAppSync === 'function') {
        isFarcaster = window.isFarcasterMiniAppSync();
      }
      if (!isFarcaster && typeof window.isFarcasterMiniApp === 'function') {
        const detected = await window.isFarcasterMiniApp();
        if (typeof detected === 'boolean') {
          isFarcaster = detected;
        }
      }
    }
  } catch {
    isFarcaster = false;
  }
  const atomicRequired = !isFarcaster; // Farcaster: false, Base App: true
  const version = isFarcaster ? "1.0" : "2.0.0"; // Base App requires "2.0.0"
  
  // Build payload according to EIP-5792 and platform documentation
  const payload = {
    version: version, // Platform-specific version: Farcaster "1.0", Base App "2.0.0"
    from: state.address,
    chainId: hexChainId,
    atomicRequired: atomicRequired,
    calls: [ 
      { 
        to: config.registryAddress, 
        data: callData, 
        value: "0x0" 
      } 
    ]
  };
  
  // Add paymaster capabilities if provided (sponsorless mode: paymasterUrl is null)
  // According to docs: paymasterService: { url: "..." } format
  if (paymasterUrl && typeof paymasterUrl === 'string' && paymasterUrl.trim().length > 0) {
    payload.capabilities = { 
      paymasterService: { 
        url: paymasterUrl,
        optional: false // Required paymaster for sponsored transactions
      } 
    };
  }
  
  debug(`sendCalls: Sending wallet_sendCalls: version=${payload.version}, atomicRequired=${atomicRequired}, paymaster=${paymasterUrl ? 'yes' : 'no'}, chainId=${hexChainId}`);
  try { 
    fetch('/api/app-log', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        event: 'wallet_sendCalls:start', 
        meta: { 
          version: payload.version,
          chainId: hexChainId, 
          atomicRequired: atomicRequired,
          url: paymasterUrl || null,
          from: state.address,
          to: config.registryAddress
        } 
      }) 
    }).catch(()=>{}); 
  } catch {}
  
  try {
    // Send transaction using wallet_sendCalls (EIP-5792)
    const result = await state.provider.request({ 
      method: 'wallet_sendCalls', 
      params: [payload] 
    });
    
    // Log success
    debug(`sendCalls: wallet_sendCalls success: ${JSON.stringify(result)}`);
    try { 
      fetch('/api/app-log', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          event: 'wallet_sendCalls:success', 
          meta: { 
            result: result,
            version: payload.version,
            chainId: hexChainId 
          } 
        }) 
      }).catch(()=>{});
    } catch {}
    
    return result;
  } catch (error) {
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code || error?.error?.code || null;
    debug(`sendCalls: wallet_sendCalls error: ${errorMsg} (code: ${errorCode})`);
    log.error('sendCalls: wallet_sendCalls failed:', error);
    
    // Log error with details
    try { 
      fetch('/api/app-log', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          event: 'wallet_sendCalls:error', 
          meta: { 
            error: errorMsg,
            code: errorCode,
            version: payload.version,
            chainId: hexChainId,
            address: state.address || null,
            payload: payload
          } 
        }) 
      }).catch(()=>{});
    } catch {}
    
    // Re-throw with additional context
    throw new Error(`sendCalls: Transaction failed: ${errorMsg}${errorCode ? ` (code: ${errorCode})` : ''}`);
  }
}

/**
 * Last-resort fallback for hosts without EIP-5792: try eth_sendTransaction
 * @param {Object} params - Parameters
 * @param {string} params.callData - Encoded contract function call data
 * @param {Object} params.state - State object with address, provider
 * @param {Object} params.config - Config object with registryAddress
 * @param {Function} params.debug - Debug logging function
 * @returns {Promise<string>} Transaction hash
 */
export async function sendEthTransaction({
  callData,
  state,
  config,
  debug = () => {}
}) {
  if (!state.provider || typeof state.provider.request !== 'function') {
    throw new Error('sendEthTransaction: no provider');
  }
  const from = state.address;
  if (!from) {
    throw new Error('sendEthTransaction: no from address');
  }
  const tx = { from, to: config.registryAddress, data: callData, value: '0x0' };
  debug('sendEthTransaction: Sending eth_sendTransaction fallback');
  try { 
    fetch('/api/app-log', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ event: 'eth_sendTransaction:start' }) 
    }).catch(()=>{});
  } catch {}
  const hash = await state.provider.request({ method: 'eth_sendTransaction', params: [tx] });
  debug(`sendEthTransaction: eth_sendTransaction hash: ${hash}`);
  try { 
    fetch('/api/app-log', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ event: 'eth_sendTransaction:success', meta: { hash } }) 
    }).catch(()=>{});
  } catch {}
  return hash;
}
