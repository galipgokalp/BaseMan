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
          } else if (window.sdk && window.sdk.wallet && typeof window.sdk.wallet.getEthereumProvider === 'function') {
            try {
              provider = await window.sdk.wallet.getEthereumProvider();
            } catch (e) {
              console.warn('[wallet-panel] Failed to get provider from SDK:', e);
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
          console.warn('[wallet-panel] Failed to fetch ETH balance from provider:', err);
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
              console.warn('[wallet-panel] API fallback failed:', apiErr);
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
              console.warn('[wallet-panel] USDC balance API error:', bal.status, errorText);
              usdcEl.textContent = 'N/A';
            }
          } catch (apiErr) {
            console.warn('[wallet-panel] USDC balance fetch error:', apiErr);
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
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        // Also update bottom nav state
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      });
      // Touch event for mobile
      closeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      }, { passive: false });
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
})();

