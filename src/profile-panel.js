(() => {
  const PANEL_ID = 'baseman-profile-panel';
  const BTN_ID = 'baseman-profile-btn';

  function $(sel) { return document.querySelector(sel); }

  function abbreviate(addr) {
    if (!addr || typeof addr !== 'string') return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function getEnv() {
    return (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV : {};
  }

  function registryFor(chainId) {
    const env = getEnv();
    if (Number(chainId) === 8453) {
      return env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS || env.NEXT_PUBLIC_REGISTRY_ADDRESS || null;
    }
    if (Number(chainId) === 84532) {
      return env.NEXT_PUBLIC_BASE_SEPOLIA_REGISTRY_ADDRESS || env.BASE_SEPOLIA_REGISTRY_ADDRESS || env.NEXT_PUBLIC_REGISTRY_ADDRESS || null;
    }
    return env.NEXT_PUBLIC_REGISTRY_ADDRESS || null;
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

  function ensureShell() {
    // Ensure body exists before appending
    if (!document.body) {
      console.warn('[profile-panel] document.body not ready');
      return null;
    }

    // Profile button removed - now controlled by bottom nav
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = el('section', 'profile-panel');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <header class="profile-header">
          <div class="profile-user-info">
            <img class="profile-avatar" data-avatar src="" alt="Profile" style="display: none;" />
            <div class="profile-user-details">
              <h2 class="profile-username" data-username>-</h2>
            </div>
          </div>
          <button type="button" class="profile-close" data-close>×</button>
        </header>
        <div class="profile-body">
          <div class="profile-section">
            <h3 class="profile-section-title">Wallet Information</h3>
            <div class="profile-row"><span>Address</span><span data-address>-</span></div>
            <div class="profile-row"><span>Network</span><span data-network>-</span></div>
            <div class="profile-row"><span>ETH Balance</span><span data-eth>-</span></div>
          </div>
          <div class="profile-section">
            <h3 class="profile-section-title">Game Statistics</h3>
            <div class="profile-row"><span>Total Score</span><span data-score>-</span></div>
            <div class="profile-row"><span>Games Played</span><span data-games-played>-</span></div>
            <div class="profile-row"><span>Best Score</span><span data-best-score>-</span></div>
            <div class="profile-row"><span>Average Score</span><span data-avg-score>-</span></div>
            <div class="profile-row"><span>Total Interactions</span><span data-interactions>-</span></div>
          </div>
          <div class="profile-actions">
            <button type="button" class="profile-action" data-switch="8453">Base Mainnet</button>
            <button type="button" class="profile-action" data-switch="84532">Base Sepolia</button>
          </div>
          <div class="profile-history">
            <div class="profile-history__title">Recent Activity</div>
            <ol class="profile-history__list" data-history></ol>
          </div>
        </div>
      `;
      document.body.appendChild(panel);
    }
    return { btn: null, panel };
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  function currentNetworkKey(chainId) {
    return Number(chainId) === 8453 ? 'base' : 'base-sepolia';
  }

  async function refresh(panel) {
    const addrEl = panel.querySelector('[data-address]');
    const netEl = panel.querySelector('[data-network]');
    const ethEl = panel.querySelector('[data-eth]');
    const scoreEl = panel.querySelector('[data-score]');
    const interEl = panel.querySelector('[data-interactions]');
    const gamesPlayedEl = panel.querySelector('[data-games-played]');
    const bestScoreEl = panel.querySelector('[data-best-score]');
    const avgScoreEl = panel.querySelector('[data-avg-score]');
    const avatarEl = panel.querySelector('[data-avatar]');
    const usernameEl = panel.querySelector('[data-username]');

    // Load Farcaster user profile
    try {
      if (window.sdk && window.sdk.context) {
        const context = await window.sdk.context;
        const user = context?.user;
        if (user) {
          // Set profile picture
          if (user.pfpUrl && avatarEl) {
            avatarEl.src = user.pfpUrl;
            avatarEl.style.display = 'block';
            avatarEl.onerror = () => {
              avatarEl.style.display = 'none';
            };
          } else if (avatarEl) {
            avatarEl.style.display = 'none';
          }
          
          // Set username/display name
          if (usernameEl) {
            if (user.displayName) {
              usernameEl.textContent = user.displayName;
            } else if (user.username) {
              usernameEl.textContent = `@${user.username}`;
            } else {
              usernameEl.textContent = '-';
            }
          }
        } else {
          // Fallback if no user info
          if (avatarEl) avatarEl.style.display = 'none';
          if (usernameEl) usernameEl.textContent = 'Your Profile';
        }
      } else {
        // Fallback if SDK not available
        if (avatarEl) avatarEl.style.display = 'none';
        if (usernameEl) usernameEl.textContent = 'Your Profile';
      }
    } catch (err) {
      console.warn('[profile] Failed to load Farcaster user info:', err);
      if (avatarEl) avatarEl.style.display = 'none';
      if (usernameEl) usernameEl.textContent = 'Your Profile';
    }

    try {
      if (!window.BaseManOnchain || typeof window.BaseManOnchain.ensureWallet !== 'function') {
        addrEl.textContent = '-';
        netEl.textContent = '-';
        return;
      }
      await window.BaseManOnchain.ensureWallet();
      const cfg = window.BaseManOnchainConfig || {};
      const chainId = Number(cfg.chainId || 84532);
      netEl.textContent = networkLabel(chainId);

      const ready = window.BaseManOnchain.isWalletReady && window.BaseManOnchain.isWalletReady();
      if (!ready) {
        addrEl.textContent = 'Not connected';
        return;
      }
      const address = window.BaseManOnchain.getWalletAddress ? window.BaseManOnchain.getWalletAddress() : (window.BaseManOnchain._address || null);
      // fallback: try reading from global hints
      const effectiveAddress = address || (window.ethers && window.ethers.getAddress ? null : null);
      addrEl.textContent = effectiveAddress ? abbreviate(effectiveAddress) : '-';

      const network = currentNetworkKey(chainId);
      // Balances (requires CDP keys in server env)
      try {
        if (effectiveAddress) {
          const q = new URLSearchParams({ address: effectiveAddress, network }).toString();
          const bal = await fetchJson(`/api/token-balances?${q}`);
          const eth = (bal.balances || []).find((b) => (b.token && b.token.symbol === 'ETH')) || null;
          ethEl.textContent = eth ? `${(Number(eth.amount.amount) / 10 ** eth.amount.decimals).toFixed(6)}` : '-';
        }
      } catch (_) {
        ethEl.textContent = '-';
      }

      // Address history / interactions
      try {
        if (effectiveAddress) {
          const q = new URLSearchParams({ player: effectiveAddress, network, limit: '10' }).toString();
          const hist = await fetchJson(`/api/address-history?${q}`);
          interEl.textContent = String(hist.totalEvents || 0);
          const list = panel.querySelector('[data-history]');
          if (list) {
            list.innerHTML = '';
            (hist.items || []).forEach((item) => {
              const li = document.createElement('li');
              const label = item.type === 'score' ? `Score: ${item.score}` : `Quest: ${item.questId}`;
              const t = item.blockTimestamp || item.emittedAt || null;
              const when = t ? new Date(t * 1000).toLocaleString() : '';
              li.textContent = `${label} — ${when}`;
              list.appendChild(li);
            });
          }
        }
      } catch (_) {
        interEl.textContent = '-';
      }

      // Contract read: getScore
      try {
        if (window.ethers && window.BaseManOnchain && window.BaseManOnchain.ensureWallet) {
          // Use onchain-client's state if exposed; otherwise, call via RPC if needed.
          const reg = (window.BaseManOnchainConfig && window.BaseManOnchainConfig.registryAddress) || null;
          if (reg && window.ethers && window.sdk) {
            const provider = await window.sdk.wallet.getEthereumProvider();
            const browser = new window.ethers.BrowserProvider(provider);
            const signer = await browser.getSigner();
            const contract = new window.ethers.Contract(reg, [
              'function getScore(address player) view returns (tuple(uint256 highScore,uint256 totalScore,uint256 lastUpdatedAt))'
            ], signer);
            const result = await contract.getScore(effectiveAddress);
            const total = result?.totalScore ? BigInt(result.totalScore).toString() : '0';
            const high = result?.highScore ? BigInt(result.highScore).toString() : '0';
            scoreEl.textContent = total;
            if (bestScoreEl) bestScoreEl.textContent = high;
            // Games played and average would need additional contract calls or API
            if (gamesPlayedEl) gamesPlayedEl.textContent = '-'; // TODO: Calculate from history
            if (avgScoreEl) avgScoreEl.textContent = total !== '0' ? (Number(total) / 1).toFixed(0) : '-'; // TODO: Calculate properly
          }
        }
      } catch (_) {
        scoreEl.textContent = '-';
        if (bestScoreEl) bestScoreEl.textContent = '-';
        if (gamesPlayedEl) gamesPlayedEl.textContent = '-';
        if (avgScoreEl) avgScoreEl.textContent = '-';
      }
    } catch (err) {
      console.error('[profile] refresh error', err);
    }
  }

  async function handleSwitch(chainId) {
    const nextRegistry = registryFor(chainId);
    if (!nextRegistry) {
      alert('Registry address not configured for selected network');
      return;
    }
    
    const targetChainId = Number(chainId);
    const currentChainId = window.BaseManOnchainConfig?.chainId ? Number(window.BaseManOnchainConfig.chainId) : null;
    
    // If already on target chain, skip
    if (currentChainId === targetChainId) {
      console.log(`[profile] Already on chain ${targetChainId}`);
      return;
    }
    
    try {
      // First, try to switch chain via SDK wallet if available
      if (window.sdk && window.sdk.wallet && typeof window.sdk.wallet.switchEthereumChain === 'function') {
        try {
          const hexChainId = '0x' + targetChainId.toString(16);
          await window.sdk.wallet.switchEthereumChain({ chainId: hexChainId });
        } catch (sdkErr) {
          console.warn('[profile] SDK switchEthereumChain failed:', sdkErr);
          // Continue with provider-based switch
        }
      }
      
      // Also try via window.ethereum if available
      if (window.ethereum && typeof window.ethereum.request === 'function') {
        try {
          const hexChainId = '0x' + targetChainId.toString(16);
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }]
          });
        } catch (ethErr) {
          // If chain not added, try to add it
          if (ethErr?.code === 4902) {
            try {
              const chainMetadata = {
                chainId: '0x' + targetChainId.toString(16),
                chainName: targetChainId === 8453 ? 'Base Mainnet' : 'Base Sepolia',
                rpcUrls: targetChainId === 8453 ? ['https://mainnet.base.org'] : ['https://sepolia.base.org'],
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: targetChainId === 8453 ? ['https://basescan.org'] : ['https://sepolia.basescan.org']
              };
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [chainMetadata]
              });
            } catch (addErr) {
              console.warn('[profile] wallet_addEthereumChain failed:', addErr);
            }
          } else {
            console.warn('[profile] wallet_switchEthereumChain failed:', ethErr);
          }
        }
      }
      
      // Update config
      window.BaseManOnchainConfig = Object.assign({}, window.BaseManOnchainConfig || {}, {
        chainId: targetChainId,
        registryAddress: nextRegistry
      });
      
      // Update onchain client
      if (window.BaseManOnchain && typeof window.BaseManOnchain.setNetwork === 'function') {
        await window.BaseManOnchain.setNetwork({ chainId: targetChainId, registryAddress: nextRegistry });
      }
      
      // Refresh panel to show new network
      const panel = document.getElementById(PANEL_ID);
      if (panel) {
        await refresh(panel);
      }
    } catch (err) {
      console.error('[profile] switch error', err);
      alert('Failed to switch network: ' + (err?.message || err));
    }
  }

  let isOpen = false;

  function setVisible(visible) {
    const shell = ensureShell();
    if (!shell || !shell.panel) return;

    isOpen = !!visible;
    // Show panel immediately (synchronous)
    shell.panel.classList.toggle('open', isOpen);
    shell.panel.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      // Refresh panel in background (non-blocking)
      requestAnimationFrame(() => {
        refresh(shell.panel);
      });
      
      // Ensure wallet is connected in background (non-blocking)
      requestAnimationFrame(() => {
        (async () => {
          try {
            if (window.BaseManOnchain && typeof window.BaseManOnchain.ensureWallet === 'function') {
              await window.BaseManOnchain.ensureWallet();
              // Refresh after wallet connection
              refresh(shell.panel);
            } else if (window.sdk && window.sdk.actions && typeof window.sdk.actions.signIn === 'function') {
              await window.sdk.actions.signIn({ acceptAuthAddress: true });
              refresh(shell.panel);
            }
          } catch (err) {
            // Silent fail - don't block UI
          }
        })();
      });
    }
  }

  function wire(panel, btn) {
    if (!panel) {
      console.error('[profile-panel] wire: panel missing');
      return;
    }

    // If button exists, wire it (for backward compatibility)
    if (btn) {
      btn.addEventListener('click', async () => {
        setVisible(!isOpen);
      });
    }

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
          panel.querySelectorAll('[data-switch]').forEach((el) => {
            el.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const id = Number(el.getAttribute('data-switch'));
              if (!isNaN(id)) {
                el.disabled = true;
                el.textContent = 'Switching...';
                try {
                  await handleSwitch(id);
                } catch (err) {
                  console.error('[profile] switch button error:', err);
                } finally {
                  el.disabled = false;
                  const label = id === 8453 ? 'Base Mainnet' : 'Base Sepolia';
                  el.textContent = label;
                }
              }
            }, { passive: false });
            // Touch event for mobile
            el.addEventListener('touchend', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const id = Number(el.getAttribute('data-switch'));
              if (!isNaN(id)) {
                el.disabled = true;
                el.textContent = 'Switching...';
                try {
                  await handleSwitch(id);
                } catch (err) {
                  console.error('[profile] switch button error:', err);
                } finally {
                  el.disabled = false;
                  const label = id === 8453 ? 'Base Mainnet' : 'Base Sepolia';
                  el.textContent = label;
                }
              }
            }, { passive: false });
          });

    // Complete Quest section removed - no longer needed
  }

  function init() {
    try {
      const shell = ensureShell();
      if (!shell) {
        // Retry multiple times for mobile environments where body may load slower
        let retries = 0;
        const maxRetries = 10;
        const retryInterval = setInterval(() => {
          retries++;
          const retry = ensureShell();
          if (retry) {
            clearInterval(retryInterval);
            wire(retry.panel, retry.btn);
          } else if (retries >= maxRetries) {
            clearInterval(retryInterval);
            console.warn('[profile-panel] Max retries reached, profile panel may not work');
          }
        }, 200);
        return;
      }
      // Button may be null now (controlled by bottom nav)
      wire(shell.panel, shell.btn);
    } catch (error) {
      console.error('[profile-panel] init error', error);
    }
  }

  // Wait for both DOM ready and SDK ready (if in mini app)
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      // Also wait for SDK ready event in mini app environments
      if (window.__basemanSDKReadyFired) {
        setTimeout(init, 100);
      } else {
        window.addEventListener('baseman-sdk-ready', () => {
          setTimeout(init, 100);
        }, { once: true });
        // Fallback: init after a delay even if SDK ready event doesn't fire
        setTimeout(init, 1000);
      }
    }
  }

  // Public API
  window.ProfilePanel = {
    show: () => setVisible(true),
    hide: () => setVisible(false),
    toggle: () => setVisible(!isOpen),
    refresh: () => {
      const shell = ensureShell();
      if (shell && shell.panel) refresh(shell.panel);
    },
    isOpen: () => isOpen
  };

  initWhenReady();
})();
