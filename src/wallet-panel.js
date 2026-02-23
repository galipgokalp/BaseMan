/**
 * Wallet Panel
 * Displays wallet information, network, and balances
 */

import { abbreviateAddress, networkLabel, createElement, setPanelVisible, wirePanelCloseButton, wirePanelOverlay, focusFirstFocusable } from './utils/panel-base.js';
import { createLogger } from './utils/logger.js';

const log = createLogger('UiWalletPanel');
const PANEL_ID = 'baseman-wallet-panel';
const PANEL_TITLE_ID = 'wallet-panel-title';

// Use helpers from panel-base
const abbreviate = abbreviateAddress;
const el = createElement;

function ensurePanel() {
  if (!document.body) {
    log.warn('document.body not ready');
    return null;
  }

  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = el('section', 'wallet-panel');
    panel.id = PANEL_ID;
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', PANEL_TITLE_ID);
    panel.innerHTML = `
    <header class="wallet-header">
      <h2 class="wallet-title" id="${PANEL_TITLE_ID}">Wallet</h2>
      <button type="button" class="wallet-close" data-close>×</button>
    </header>
    <div class="wallet-body">
      <div class="wallet-section">
      <h3 class="wallet-section-title">Connection</h3>
      <div class="wallet-row">
        <span>Status</span>
        <span data-wallet-status class="wallet-status">-</span>
      </div>
      <div class="wallet-row">
        <span>Address</span>
        <span data-wallet-address class="wallet-address">-</span>
      </div>
      </div>
      <div class="wallet-section">
      <h3 class="wallet-section-title">Network</h3>
      <div class="wallet-row">
        <span>Network</span>
        <span data-network>-</span>
      </div>
      <div class="wallet-row">
        <span>Chain ID</span>
        <span data-chain-id>-</span>
      </div>
      </div>
      <div class="wallet-section">
      <h3 class="wallet-section-title">Balances</h3>
      <div class="wallet-row">
        <span>ETH</span>
        <span data-eth-balance>-</span>
      </div>
      <div class="wallet-row">
        <span>USDC</span>
        <span data-usdc-balance>-</span>
      </div>
      </div>
    </div>
    `;
    document.body.appendChild(panel);
  }
  return panel;
}

let isOpen = false;

// Track if elements are already wired to prevent duplicate listeners
const wiredElements = new WeakSet();
let triggerEl = null;
let keydownHandler = null;

function attachEscHandler() {
  if (keydownHandler) return;
  keydownHandler = (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setVisible(false);
    }
  };
  document.addEventListener('keydown', keydownHandler);
}

function detachEscHandler() {
  if (!keydownHandler) return;
  document.removeEventListener('keydown', keydownHandler);
  keydownHandler = null;
}

function setVisible(visible) {
  const panel = ensurePanel();
  if (!panel) return;

  isOpen = !!visible;
  // Show panel immediately (synchronous)
  setPanelVisible(panel, isOpen);
  if (isOpen) {
    requestAnimationFrame(() => focusFirstFocusable(panel));
    attachEscHandler();
  } else {
    detachEscHandler();
    if (triggerEl && typeof triggerEl.focus === 'function') {
      requestAnimationFrame(() => triggerEl.focus());
    }
  }

  if (isOpen) {
    // Refresh in background (non-blocking)
    requestAnimationFrame(() => {
      refresh();
    });
  }
}

async function refresh() {
  const panel = ensurePanel();
  if (!panel) return;

  try {
    const onchain = window.BaseManOnchain;
    if (!onchain) {
      updateStatus('Not available', 'disconnected');
      return;
    }

    // Best-effort: sync wallet state without prompting (read-only)
    try {
      if (typeof onchain.ensureWallet === 'function') {
        await onchain.ensureWallet(false);
      }
    } catch (_) {
      // Ignore silent failures; UI will reflect actual readiness below
    }

    const isReady = onchain.isWalletReady && onchain.isWalletReady();
    if (!isReady) {
      updateStatus('Not connected', 'disconnected');
    // Clear address and balances when not ready
    const addrEl = panel.querySelector('[data-wallet-address]');
    if (addrEl) {
      addrEl.textContent = '-';
      addrEl.title = '';
    }
    const ethEl = panel.querySelector('[data-eth-balance]');
    const usdcEl = panel.querySelector('[data-usdc-balance]');
    if (ethEl) ethEl.textContent = '-';
    if (usdcEl) usdcEl.textContent = '-';
    return;
    }

    // Get address first to verify connection
    const address = onchain.getWalletAddress && onchain.getWalletAddress();
    
    // Verify address is valid
    if (!address || typeof address !== 'string' || address.length !== 42 || !address.startsWith('0x')) {
      updateStatus('Connected (Invalid Address)', 'disconnected');
    const addrEl = panel.querySelector('[data-wallet-address]');
    if (addrEl) {
      addrEl.textContent = '-';
      addrEl.title = '';
    }
    return;
    }

    // Address is valid - show connected status
    updateStatus('Connected', 'connected');
    
    // Update address display
    const addrEl = panel.querySelector('[data-wallet-address]');
    if (addrEl) {
      addrEl.textContent = abbreviate(address);
      addrEl.title = address;
    }

    // Get network and chain ID
    let chainId = null;
    // Try multiple methods to get chain ID
    if (onchain.getChainId && typeof onchain.getChainId === 'function') {
      chainId = onchain.getChainId();
    } else if (window.BaseManOnchainConfig && window.BaseManOnchainConfig.chainId) {
      chainId = Number(window.BaseManOnchainConfig.chainId);
    } else if (window.ethereum && window.ethereum.chainId) {
      chainId = Number(window.ethereum.chainId);
    } else if (onchain._chainId) {
      chainId = Number(onchain._chainId);
    }
    
    const networkEl = panel.querySelector('[data-network]');
    const chainIdEl = panel.querySelector('[data-chain-id]');
    
    if (chainId) {
      if (networkEl) networkEl.textContent = networkLabel(chainId);
      if (chainIdEl) chainIdEl.textContent = String(chainId);
    } else {
      if (networkEl) networkEl.textContent = '-';
      if (chainIdEl) chainIdEl.textContent = '-';
    }

    // Get balances
    const ethEl = panel.querySelector('[data-eth-balance]');
    const usdcEl = panel.querySelector('[data-usdc-balance]');
    
    if (address) {
      // Initialize with loading state
      if (ethEl) ethEl.textContent = 'Loading...';
      if (usdcEl) usdcEl.textContent = 'Loading...';
      
      // Try to get ETH balance from provider first
      let ethBalance = null;
      try {
        // Try multiple provider sources
        let provider = null;
        if (onchain.provider) {
          provider = onchain.provider;
        } else if (onchain._provider) {
          provider = onchain._provider;
        } else if (window.ethereum) {
          provider = window.ethereum;
        } else {
          // Only try SDK provider if we're in MiniApp context
          const inMiniApp = (window !== window.parent) || (typeof window.ReactNativeWebView !== 'undefined');
          if (inMiniApp && window.sdk && window.sdk.wallet && typeof window.sdk.wallet.getEthereumProvider === 'function') {
            try {
              provider = await window.sdk.wallet.getEthereumProvider();
            } catch (e) {
              log.warn('Failed to get provider from SDK:', e?.message || e);
            }
          }
        }
        
        if (provider) {
          if (typeof provider.request === 'function') {
            // EIP-1193 provider
            const balance = await provider.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            if (balance && typeof balance === 'string') {
              ethBalance = parseFloat(balance) / 1e18;
            }
          } else if (typeof provider.getBalance === 'function') {
            // Ethers.js provider
            const balance = await provider.getBalance(address);
            if (balance) {
              ethBalance = parseFloat(balance.toString()) / 1e18;
            }
          }
        }
      } catch (err) {
        log.warn('Failed to fetch ETH balance from provider:', err);
      }
      
      // Update ETH balance display
      if (ethEl) {
        if (ethBalance !== null && !isNaN(ethBalance)) {
          ethEl.textContent = ethBalance.toFixed(6) + ' ETH';
        } else {
          // Try API fallback for ETH
          try {
        const network = chainId ? (chainId === 8453 ? 'base' : 'base-sepolia') : 'base-sepolia';
        const q = new URLSearchParams({ address: address, network }).toString();
        const bal = await fetch(`/api/token-balances?${q}`);
        if (bal.ok) {
          const payload = await bal.json();
          if (payload && payload.balances && Array.isArray(payload.balances)) {
            // Look for native ETH (might be listed as native token or ETH)
            const eth = payload.balances.find((b) => {
              const symbol = b.token?.symbol?.toUpperCase();
              return symbol === 'ETH' || symbol === 'NATIVE' || !b.token?.contractAddress;
            }) || null;
            
            if (eth && eth.amount) {
              const amount = Number(eth.amount.amount) / (10 ** (eth.amount.decimals || 18));
              ethEl.textContent = `${amount.toFixed(6)} ETH`;
            } else {
              // If no ETH in API response, try provider one more time or show 0
              ethEl.textContent = '0 ETH';
            }
          } else {
            ethEl.textContent = '0 ETH';
          }
        } else {
          // If API fails but we have provider balance, use that
          if (ethBalance !== null && !isNaN(ethBalance)) {
            ethEl.textContent = ethBalance.toFixed(6) + ' ETH';
          } else {
            ethEl.textContent = 'N/A';
          }
        }
      } catch (apiErr) {
        log.warn('API fallback failed:', apiErr);
        // If API fails but we have provider balance, use that
        if (ethBalance !== null && !isNaN(ethBalance)) {
          ethEl.textContent = ethBalance.toFixed(6) + ' ETH';
        } else {
          ethEl.textContent = 'N/A';
        }
      }
      }
    }
    
      // USDC balance from API
      if (usdcEl) {
        try {
          const network = chainId ? (chainId === 8453 ? 'base' : 'base-sepolia') : 'base-sepolia';
          const q = new URLSearchParams({ address: address, network }).toString();
          const bal = await fetch(`/api/token-balances?${q}`);
          if (bal.ok) {
            const payload = await bal.json();
            if (payload && payload.balances && Array.isArray(payload.balances)) {
              const usdc = payload.balances.find((b) => {
                const symbol = b.token?.symbol?.toUpperCase();
                return symbol === 'USDC';
              }) || null;
              
              if (usdc && usdc.amount) {
                const amount = Number(usdc.amount.amount) / (10 ** (usdc.amount.decimals || 6));
                usdcEl.textContent = `${amount.toFixed(2)} USDC`;
              } else {
                usdcEl.textContent = '0 USDC';
              }
            } else {
              usdcEl.textContent = '0 USDC';
            }
          } else {
            const errorText = await bal.text().catch(() => '');
            log.warn('USDC balance API error:', bal.status, errorText);
            usdcEl.textContent = 'N/A';
          }
        } catch (apiErr) {
          log.warn('USDC balance fetch error:', apiErr);
          usdcEl.textContent = 'N/A';
        }
      }
    } else {
      if (ethEl) ethEl.textContent = '-';
      if (usdcEl) usdcEl.textContent = '-';
    }

  } catch (error) {
    log.error('refresh error', error);
  }
}

function updateStatus(status, className) {
  const panel = ensurePanel();
  if (!panel) return;

  const statusEl = panel.querySelector('[data-wallet-status]');
  if (statusEl) {
    statusEl.textContent = status;
    statusEl.className = `wallet-status ${className}`;
  }
}

function wire(panel) {
  // Wire close button using shared helper
  wirePanelCloseButton(panel, () => setVisible(false), wiredElements);
  
  // Wire overlay click using shared helper
  wirePanelOverlay(panel, () => setVisible(false), wiredElements);
}

function init() {
  try {
    const panel = ensurePanel();
    if (!panel) {
      setTimeout(() => {
        const retry = ensurePanel();
        if (retry) wire(retry);
      }, 100);
      return;
    }
    wire(panel);
  } catch (error) {
    log.error('init error', error);
  }
}

// Public API
window.WalletPanel = {
  show: () => setVisible(true),
  hide: () => setVisible(false),
  toggle: () => setVisible(!isOpen),
  setTriggerElement: (el) => { if (el instanceof HTMLElement) triggerEl = el; },
  refresh: () => refresh(),
  isOpen: () => isOpen
};

// Initialize immediately - don't wait for SDK
// Panel should be available as soon as DOM is ready
function initWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize immediately
      init();
    }, { once: true });
    // Fallback: init immediately if DOMContentLoaded takes too long
    setTimeout(init, 100);
  } else {
    // DOM already ready - init immediately
    init();
  }
}

initWhenReady();
