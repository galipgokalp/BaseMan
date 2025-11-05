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
      return env.BASE_SEPOLIA_REGISTRY_ADDRESS || env.NEXT_PUBLIC_REGISTRY_ADDRESS || null;
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

    let btn = document.getElementById(BTN_ID);
    if (!btn) {
      btn = el('button', 'profile-btn');
      btn.id = BTN_ID;
      btn.type = 'button';
      btn.textContent = 'Profile';
      btn.setAttribute('aria-label', 'Open profile panel');
      document.body.appendChild(btn);
    }
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = el('section', 'profile-panel');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <header class="profile-header">
          <h2 class="profile-title">Your Profile</h2>
          <button type="button" class="profile-close" data-close>×</button>
        </header>
        <div class="profile-body">
          <div class="profile-row"><span>Address</span><span data-address>-</span></div>
          <div class="profile-row"><span>Network</span><span data-network>-</span></div>
          <div class="profile-row"><span>ETH Balance</span><span data-eth>-</span></div>
          <div class="profile-row"><span>Total Score</span><span data-score>-</span></div>
          <div class="profile-row"><span>Interactions</span><span data-interactions>-</span></div>
          <div class="profile-actions">
            <button type="button" class="profile-action" data-switch="84532">Switch to Base Sepolia</button>
            <button type="button" class="profile-action" data-switch="8453">Switch to Base Mainnet</button>
          </div>
          <div class="profile-divider"></div>
          <div class="profile-actions">
            <input type="number" min="0" step="1" value="1" class="profile-input" data-quest-id placeholder="Quest ID" />
            <button type="button" class="profile-action" data-complete-quest>Complete Quest</button>
          </div>
          <div class="profile-history">
            <div class="profile-history__title">Recent Activity</div>
            <ol class="profile-history__list" data-history></ol>
          </div>
        </div>
      `;
      document.body.appendChild(panel);
    }
    return { btn, panel };
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
          ethEl.textContent = eth ? `${Number(eth.amount.amount) / 10 ** eth.amount.decimals}` : '-';
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
            scoreEl.textContent = total;
          }
        }
      } catch (_) {
        scoreEl.textContent = '-';
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
    try {
      window.BaseManOnchainConfig = Object.assign({}, window.BaseManOnchainConfig || {}, {
        chainId: Number(chainId),
        registryAddress: nextRegistry
      });
      if (window.BaseManOnchain && typeof window.BaseManOnchain.setNetwork === 'function') {
        await window.BaseManOnchain.setNetwork({ chainId: Number(chainId), registryAddress: nextRegistry });
      }
    } catch (err) {
      console.error('[profile] switch error', err);
      alert('Failed to switch network');
    }
  }

  function wire(panel, btn) {
    if (!panel || !btn) {
      console.error('[profile-panel] wire: panel or btn missing');
      return;
    }

    btn.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', String(!panel.classList.contains('open')));
      if (!isOpen && panel.classList.contains('open')) {
        refresh(panel);
      }
    });
    // If not connected, clicking Profile triggers sign-in first
    btn.addEventListener('click', async () => {
      try {
        if (window.BaseManOnchain && typeof window.BaseManOnchain.ensureWallet === 'function') {
          await window.BaseManOnchain.ensureWallet();
        } else if (window.sdk && window.sdk.actions && typeof window.sdk.actions.signIn === 'function') {
          await window.sdk.actions.signIn({ acceptAuthAddress: true });
        }
      } catch (_) {}
    }, { once: true });
    panel.querySelector('[data-close]')?.addEventListener('click', () => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    });
    panel.querySelectorAll('[data-switch]').forEach((el) => {
      el.addEventListener('click', async () => {
        const id = Number(el.getAttribute('data-switch'));
        await handleSwitch(id);
        await refresh(panel);
      });
    });

    const completeBtn = panel.querySelector('[data-complete-quest]');
    const questInput = panel.querySelector('[data-quest-id]');
    if (completeBtn) {
      completeBtn.addEventListener('click', async () => {
        const raw = questInput && questInput.value ? questInput.value : '1';
        const qid = Math.max(0, parseInt(String(raw), 10) || 0);
        try {
          if (window.BaseManOnchain && typeof window.BaseManOnchain.completeQuest === 'function') {
            await window.BaseManOnchain.completeQuest(qid);
            await refresh(panel);
          }
        } catch (err) {
          console.error('[profile] complete quest error', err);
          alert('Failed to complete quest');
        }
      });
    }
  }

  function init() {
    try {
      const shell = ensureShell();
      if (!shell) {
        // Retry after a short delay if body isn't ready
        setTimeout(() => {
          const retry = ensureShell();
          if (retry) wire(retry.panel, retry.btn);
        }, 100);
        return;
      }
      wire(shell.panel, shell.btn);
    } catch (error) {
      console.error('[profile-panel] init error', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    // Use setTimeout to ensure body is fully available
    setTimeout(init, 0);
  }
})();
