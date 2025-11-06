/**
 * Wallet Panel
 * Displays wallet information, network, and balances
 */

(function() {
  'use strict';

  const PANEL_ID = 'baseman-wallet-panel';

  function $(sel) { return document.querySelector(sel); }

  function abbreviate(addr) {
    if (!addr || typeof addr !== 'string') return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function getEnv() {
    return (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV : {};
  }

  function networkLabel(chainId) {
    return Number(chainId) === 8453 ? 'Base' : (Number(chainId) === 84532 ? 'Base Sepolia' : `Chain ${chainId}`);
  }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function ensurePanel() {
    if (!document.body) {
      console.warn('[wallet-panel] document.body not ready');
      return null;
    }

    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = el('section', 'wallet-panel');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <header class="wallet-header">
          <h2 class="wallet-title">Wallet</h2>
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

  function setVisible(visible) {
    const panel = ensurePanel();
    if (!panel) return;

    isOpen = !!visible;
    // Show panel immediately (synchronous)
    panel.classList.toggle('open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));

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

      const isReady = onchain.isWalletReady && onchain.isWalletReady();
      if (!isReady) {
        updateStatus('Not connected', 'disconnected');
        return;
      }

      updateStatus('Connected', 'connected');

      // Get address
      const address = onchain.getWalletAddress && onchain.getWalletAddress();
      if (address) {
        const addrEl = panel.querySelector('[data-wallet-address]');
        if (addrEl) {
          addrEl.textContent = abbreviate(address);
          addrEl.title = address;
        }
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
        // Try to get ETH balance from provider
        let ethBalance = null;
        try {
          // Try multiple provider sources
          const provider = onchain.provider || onchain._provider || window.ethereum;
          if (provider && typeof provider.request === 'function') {
            const balance = await provider.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            ethBalance = parseFloat(balance) / 1e18;
          } else if (provider && typeof provider.getBalance === 'function') {
            // Ethers.js provider
            const balance = await provider.getBalance(address);
            ethBalance = parseFloat(balance.toString()) / 1e18;
          }
        } catch (err) {
          console.warn('[wallet-panel] Failed to fetch ETH balance:', err);
        }
        
        if (ethEl) {
          if (ethBalance !== null) {
            ethEl.textContent = ethBalance.toFixed(6) + ' ETH';
          } else {
            ethEl.textContent = 'Loading...';
            // Try API fallback
            try {
              const network = chainId ? (chainId === 8453 ? 'base' : 'base-sepolia') : 'base-sepolia';
              const q = new URLSearchParams({ address: address, network }).toString();
              const bal = await fetch(`/api/token-balances?${q}`);
              if (bal.ok) {
                const payload = await bal.json();
                const eth = (payload.balances || []).find((b) => (b.token && b.token.symbol === 'ETH')) || null;
                if (eth) {
                  ethEl.textContent = `${(Number(eth.amount.amount) / 10 ** eth.amount.decimals).toFixed(6)} ETH`;
                } else {
                  ethEl.textContent = '0 ETH';
                }
              } else {
                ethEl.textContent = 'N/A';
              }
            } catch (apiErr) {
              ethEl.textContent = 'N/A';
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
              const usdc = (payload.balances || []).find((b) => (b.token && b.token.symbol === 'USDC')) || null;
              if (usdc) {
                usdcEl.textContent = `${(Number(usdc.amount.amount) / 10 ** usdc.amount.decimals).toFixed(2)} USDC`;
              } else {
                usdcEl.textContent = '0 USDC';
              }
            } else {
              usdcEl.textContent = 'N/A';
            }
          } catch (apiErr) {
            usdcEl.textContent = 'N/A';
          }
        }
      } else {
        if (ethEl) ethEl.textContent = '-';
        if (usdcEl) usdcEl.textContent = '-';
      }

    } catch (error) {
      console.error('[wallet-panel] refresh error', error);
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
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        setVisible(false);
      });
    }

    // Close on overlay click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        setVisible(false);
      }
    });
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
      console.error('[wallet-panel] init error', error);
    }
  }

  // Public API
  window.WalletPanel = {
    show: () => setVisible(true),
    hide: () => setVisible(false),
    toggle: () => setVisible(!isOpen),
    refresh: () => refresh(),
    isOpen: () => isOpen
  };

  // Wait for DOM and SDK ready
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (window.__basemanSDKReadyFired) {
          setTimeout(init, 100);
        } else {
          window.addEventListener('baseman-sdk-ready', () => {
            setTimeout(init, 100);
          }, { once: true });
          setTimeout(init, 1000);
        }
      }, { once: true });
    } else {
      if (window.__basemanSDKReadyFired) {
        setTimeout(init, 100);
      } else {
        window.addEventListener('baseman-sdk-ready', () => {
          setTimeout(init, 100);
        }, { once: true });
        setTimeout(init, 1000);
      }
    }
  }

  initWhenReady();
})();

