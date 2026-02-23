/**
 * Toast Integration for BaseMan On-Chain Operations
 * 
 * Integrates toast notifications with the on-chain client
 * by listening to window events and providing user feedback.
 * 
 * This module does NOT modify onchain-client.js - it's event-driven.
 */

import { toast, showToast } from './toast.js';
import { createLogger } from './logger.js';

const log = createLogger('ToastIntegration');

// Track active loading toasts for score submission
let scoreSubmissionToast = null;

/**
 * Initialize toast integration
 * Sets up event listeners for on-chain operations
 */
export function initToastIntegration() {
  log.debug('Initializing toast integration...');

  // Listen for wallet connection events
  window.addEventListener('baseman:wallet:connected', handleWalletConnected);
  window.addEventListener('baseman:wallet:disconnected', handleWalletDisconnected);
  window.addEventListener('baseman:wallet:error', handleWalletError);

  // Listen for score submission events
  window.addEventListener('baseman:score:submitting', handleScoreSubmitting);
  window.addEventListener('baseman:score:submitted', handleScoreSubmitted);
  window.addEventListener('baseman:score:confirmed', handleScoreConfirmed);
  window.addEventListener('baseman:score:error', handleScoreError);

  // Listen for network events
  window.addEventListener('baseman:network:changed', handleNetworkChanged);
  window.addEventListener('baseman:network:error', handleNetworkError);

  // Listen for generic transaction events
  window.addEventListener('baseman:tx:pending', handleTxPending);
  window.addEventListener('baseman:tx:success', handleTxSuccess);
  window.addEventListener('baseman:tx:error', handleTxError);

  log.debug('Toast integration initialized');
}

// ===== Event Handlers =====

function handleWalletConnected(event) {
  const { address } = event.detail || {};
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  toast.success(`Wallet connected${shortAddress ? `: ${shortAddress}` : ''}`, { duration: 2000 });
}

function handleWalletDisconnected() {
  toast.info('Wallet disconnected', { duration: 2000 });
}

function handleWalletError(event) {
  const { message } = event.detail || {};
  const errorMsg = message || 'Wallet connection failed';
  
  // Don't show toast for user rejection - it's expected behavior
  if (errorMsg.toLowerCase().includes('reject') || errorMsg.toLowerCase().includes('denied')) {
    log.debug('Wallet connection rejected by user - no toast shown');
    return;
  }
  
  toast.error(errorMsg, { duration: 4000 });
}

function handleScoreSubmitting(event) {
  const { score } = event.detail || {};
  const scoreStr = score ? Number(score).toLocaleString() : '';
  
  // Show loading toast that stays until dismissed
  scoreSubmissionToast = toast.loading(`Saving score${scoreStr ? `: ${scoreStr}` : ''}...`);
  log.debug(`Score submission started: ${scoreStr}`);
}

function handleScoreSubmitted(event) {
  const { score, txHash, identifier } = event.detail || {};
  const scoreStr = score ? Number(score).toLocaleString() : '';
  
  // Update loading toast to success
  if (scoreSubmissionToast) {
    scoreSubmissionToast.update(`Score submitted${scoreStr ? `: ${scoreStr}` : ''}! Confirming...`, {
      type: 'info',
      duration: 5000
    });
    scoreSubmissionToast = null;
  } else {
    toast.info(`Score submitted! Confirming...`, { duration: 3000 });
  }
  
  log.debug(`Score submitted: ${scoreStr}, tx: ${txHash || identifier}`);
}

function handleScoreConfirmed(event) {
  const { score, txHash: _txHash } = event.detail || {};
  const scoreStr = score ? Number(score).toLocaleString() : '';
  
  // Dismiss any lingering loading toast
  if (scoreSubmissionToast) {
    scoreSubmissionToast.dismiss();
    scoreSubmissionToast = null;
  }
  
  toast.success(`Score saved: ${scoreStr || 'Success!'}`, { duration: 4000 });
  log.debug(`Score confirmed: ${scoreStr}`);
}

function handleScoreError(event) {
  const { message, code: _code } = event.detail || {};
  
  // Dismiss loading toast
  if (scoreSubmissionToast) {
    scoreSubmissionToast.dismiss();
    scoreSubmissionToast = null;
  }
  
  // User-friendly error messages
  let errorMsg = 'Failed to save score';
  
  if (message) {
    if (message.toLowerCase().includes('reject') || message.toLowerCase().includes('denied')) {
      errorMsg = 'Transaction cancelled';
    } else if (message.toLowerCase().includes('insufficient') || message.toLowerCase().includes('balance')) {
      errorMsg = 'Insufficient balance for gas fee';
    } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
      errorMsg = 'Network error - please try again';
    } else if (message.toLowerCase().includes('timeout')) {
      errorMsg = 'Request timed out - please try again';
    } else if (message.length < 50) {
      errorMsg = message;
    }
  }
  
  toast.error(errorMsg, { duration: 5000 });
  log.error(`Score submission error: ${message || 'Unknown error'}`);
}

function handleNetworkChanged(event) {
  const { chainId, networkName } = event.detail || {};
  const name = networkName || `Chain ${chainId}`;
  toast.info(`Switched to ${name}`, { duration: 2000 });
}

function handleNetworkError(event) {
  const { message } = event.detail || {};
  toast.error(message || 'Network error', { duration: 4000 });
}

function handleTxPending(event) {
  const { message } = event.detail || {};
  toast.loading(message || 'Transaction pending...', { duration: 0 });
}

function handleTxSuccess(event) {
  const { message } = event.detail || {};
  toast.success(message || 'Transaction successful!', { duration: 3000 });
}

function handleTxError(event) {
  const { message } = event.detail || {};
  
  // Don't show for user rejection
  if (message && (message.toLowerCase().includes('reject') || message.toLowerCase().includes('denied'))) {
    return;
  }
  
  toast.error(message || 'Transaction failed', { duration: 4000 });
}

// ===== Manual Toast Triggers =====

/**
 * Show a score saving toast (can be called directly)
 */
export function showScoreSaving(score) {
  const scoreStr = score ? Number(score).toLocaleString() : '';
  scoreSubmissionToast = toast.loading(`Saving score${scoreStr ? `: ${scoreStr}` : ''}...`);
  return scoreSubmissionToast;
}

/**
 * Show a score saved toast (can be called directly)
 */
export function showScoreSaved(score) {
  if (scoreSubmissionToast) {
    scoreSubmissionToast.dismiss();
    scoreSubmissionToast = null;
  }
  const scoreStr = score ? Number(score).toLocaleString() : '';
  return toast.success(`Score saved${scoreStr ? `: ${scoreStr}` : ''}!`, { duration: 4000 });
}

/**
 * Show a score error toast (can be called directly)
 */
export function showScoreError(message) {
  if (scoreSubmissionToast) {
    scoreSubmissionToast.dismiss();
    scoreSubmissionToast = null;
  }
  return toast.error(message || 'Failed to save score', { duration: 5000 });
}

/**
 * Emit a custom event that toast integration will handle
 */
export function emitToastEvent(eventName, detail = {}) {
  const event = new CustomEvent(`baseman:${eventName}`, { detail });
  window.dispatchEvent(event);
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToastIntegration);
  } else {
    // DOM already loaded
    initToastIntegration();
  }
}

// Export for manual usage
export { toast, showToast };

// Make available globally
if (typeof window !== 'undefined') {
  window.toastIntegration = {
    showScoreSaving,
    showScoreSaved,
    showScoreError,
    emitToastEvent,
    toast
  };
}

export default {
  init: initToastIntegration,
  showScoreSaving,
  showScoreSaved,
  showScoreError,
  emitToastEvent,
  toast
};

