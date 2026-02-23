import { abbreviateAddress, networkLabel, networkName, getEnv, createElement, setPanelVisible, wirePanelCloseButton, wirePanelOverlay, focusFirstFocusable } from './utils/panel-base.js';
import { createLogger } from './utils/logger.js';

const log = createLogger('UiProfilePanel');
const PANEL_ID = 'baseman-profile-panel';
const PANEL_TITLE_ID = 'profile-panel-title';

// Use helpers from panel-base
const abbreviate = abbreviateAddress;
const el = createElement;

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

function createBaseLogo() {
    // Base logo: Blue square (#0000FF) - Base's official brand color
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '16');
    rect.setAttribute('height', '16');
    rect.setAttribute('rx', '2');
    rect.setAttribute('fill', '#0000FF');
    
    svg.appendChild(rect);
    return svg;
}

function setupNetworkLogos(panel) {
    const logoElements = panel.querySelectorAll('.profile-network-logo');
    logoElements.forEach((logoEl) => {
      // Only create logo if it doesn't already have one
      if (logoEl.children.length === 0) {
        const svg = createBaseLogo();
        logoEl.appendChild(svg);
      }
    });
}

// Track if a dialog is currently open to prevent multiple dialogs
let currentDialog = null;
let isDialogHandling = false;
let dialogCloseTimeout = null;
let triggerEl = null;
let keydownHandler = null;

function showNetworkConfirmDialog(targetChainId, onConfirm, onCancel) {
    // If a dialog is already open, close it first
    if (currentDialog && document.body.contains(currentDialog)) {
      currentDialog.remove();
      currentDialog = null;
      isDialogHandling = false;
      if (dialogCloseTimeout) {
        clearTimeout(dialogCloseTimeout);
        dialogCloseTimeout = null;
      }
    }
    
    // If we're already handling a dialog action, ignore
    if (isDialogHandling) {
      return;
    }
    
    const targetNetworkName = networkName(targetChainId);
    const dialog = document.createElement('div');
    dialog.className = 'network-confirm-dialog';
    
    // Build dialog content using safe DOM APIs
    const content = document.createElement('div');
    content.className = 'network-confirm-content';
    
    const title = document.createElement('h3');
    title.className = 'network-confirm-title';
    title.textContent = targetNetworkName;
    content.appendChild(title);
    
    const message = document.createElement('p');
    message.className = 'network-confirm-message';
    message.textContent = 'Do you want to switch to this network?';
    content.appendChild(message);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'network-confirm-buttons';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'network-confirm-btn confirm';
    confirmBtn.setAttribute('data-action', 'confirm');
    confirmBtn.textContent = 'Switch';
    buttonsDiv.appendChild(confirmBtn);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'network-confirm-btn cancel';
    cancelBtn.setAttribute('data-action', 'cancel');
    cancelBtn.textContent = 'Cancel';
    buttonsDiv.appendChild(cancelBtn);
    
    content.appendChild(buttonsDiv);
    dialog.appendChild(content);
    
    document.body.appendChild(dialog);
    currentDialog = dialog;
    
    let dialogClosed = false;
    let actionExecuted = false;
    
    const closeDialog = () => {
      if (dialogClosed) return;
      dialogClosed = true;
      isDialogHandling = true;
      
      // Remove dialog from DOM immediately
      if (document.body.contains(dialog)) {
        dialog.remove();
      }
      currentDialog = null;
      
      // Reset flag after a longer delay to prevent immediate re-triggering
      if (dialogCloseTimeout) {
        clearTimeout(dialogCloseTimeout);
      }
      dialogCloseTimeout = setTimeout(() => {
        isDialogHandling = false;
        dialogCloseTimeout = null;
      }, 500);
    };
    
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (dialogClosed || actionExecuted) return;
      actionExecuted = true;
      
      const action = e.target.getAttribute('data-action');
      
      // Close dialog immediately and synchronously
      closeDialog();
      
      // Execute action after a microtask to ensure dialog is closed
      Promise.resolve().then(() => {
        if (action === 'confirm') {
          onConfirm();
        } else if (action === 'cancel') {
          onCancel();
        }
      });
    };
    
    const handleBackdrop = (e) => {
      if (e.target === dialog && !dialogClosed && !actionExecuted) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        actionExecuted = true;
        closeDialog();
        Promise.resolve().then(() => {
          onCancel();
        });
      }
    };
    
    dialog.querySelectorAll('.network-confirm-btn').forEach(btn => {
      btn.addEventListener('click', handleClick, { once: true, capture: true });
      btn.addEventListener('touchend', handleClick, { once: true, passive: false, capture: true });
    });
    
    dialog.addEventListener('click', handleBackdrop, { once: true, capture: true });
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !dialogClosed && !actionExecuted) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        actionExecuted = true;
        closeDialog();
        document.removeEventListener('keydown', handleEscape);
        Promise.resolve().then(() => {
          onCancel();
        });
      }
    };
    document.addEventListener('keydown', handleEscape, { once: true, capture: true });
}


function ensureShell() {
    // Ensure body exists before appending
    if (!document.body) {
      log.warn('document.body not ready');
      return null;
    }

    // Profile button removed - now controlled by bottom nav
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = el('section', 'profile-panel');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', PANEL_TITLE_ID);
      panel.innerHTML = `
        <header class="profile-header">
          <div class="profile-user-info">
            <img class="profile-avatar" data-avatar src="" alt="Profile" style="display: none;" />
            <div class="profile-user-details">
              <h2 class="profile-username" data-username id="${PANEL_TITLE_ID}">-</h2>
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
            <span class="profile-network-link" data-switch="8453">
              <span class="profile-network-logo" data-network="8453"></span>
              <span class="profile-network-text">Base Mainnet</span>
            </span>
            <span class="profile-network-link" data-switch="84532">
              <span class="profile-network-logo" data-network="84532"></span>
              <span class="profile-network-text">Base Sepolia</span>
            </span>
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

          // Send profile mapping to backend for leaderboard enrichment
          // Using leaderboard endpoint to avoid Vercel function limit
          try {
            const address = window.BaseManOnchain?.getWalletAddress?.() || null;
            if (address && user.fid) {
              // Send asynchronously, don't block UI
              fetch('/api/leaderboard?action=profile-mapping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  address: address.toLowerCase(),
                  fid: user.fid,
                  username: user.username || null,
                  displayName: user.displayName || null,
                  avatarUrl: user.pfpUrl || null
                })
              }).catch(() => {
                // Silently fail - not critical for UI
              });
            }
          } catch (_mappingErr) {
            // Silently fail - not critical for UI
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
      log.warn('Failed to load Farcaster user info:', err);
      if (avatarEl) avatarEl.style.display = 'none';
      if (usernameEl) usernameEl.textContent = 'Your Profile';
    }

    try {
      if (!window.BaseManOnchain) {
        addrEl.textContent = '-';
        netEl.textContent = '-';
        return;
      }
      // NOTE: Do NOT call ensureWallet() here to avoid passkey prompts.
      // Base App mini apps are automatically connected - wallet info is available without requesting.
      // Only check current wallet status (if already connected).
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
            list.textContent = ''; // Clear safely
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
      // Phase 6: Use safeContractRead for graceful eth_call handling
      // NOTE: Farcaster Wallet does not support eth_call, so this will fail gracefully
      // This is expected behavior - we show '-' when contract read is unavailable
      try {
        if (window.ethers && window.BaseManOnchain && window.BaseManOnchain.ensureWallet) {
          // Use onchain-client's state if exposed; otherwise, call via RPC if needed.
          const reg = (window.BaseManOnchainConfig && window.BaseManOnchainConfig.registryAddress) || null;
          // Check if we're in MiniApp context before calling SDK methods
          const inMiniApp = (typeof window !== 'undefined' && window !== window.parent) || 
                            (typeof window.ReactNativeWebView !== 'undefined');
          if (reg && window.ethers && window.sdk && inMiniApp) {
            let provider;
            try {
              provider = await window.sdk.wallet.getEthereumProvider();
            } catch (providerError) {
              const errorMsg = providerError?.message || String(providerError);
              const isNonCritical = errorMsg.includes('Request failed') || 
                                    errorMsg.includes('result') ||
                                    providerError?.name === 'RequestFailedError' ||
                                    providerError?.name === 'TypeError' ||
                                    providerError?.status === 400;
              
              if (isNonCritical) {
                log.warn('SDK getEthereumProvider failed (non-critical):', errorMsg);
                throw new Error(`Failed to get provider: ${errorMsg}`);
              } else {
                throw providerError; // Re-throw non-request errors
              }
            }
            if (!provider) {
              throw new Error('Provider not available');
            }
            
            // Phase 6: Use safeContractRead for graceful error handling
            const browser = new window.ethers.BrowserProvider(provider);
            const signer = await browser.getSigner();
            const contract = new window.ethers.Contract(reg, [
              'function getScore(address player) view returns (tuple(uint256 highScore,uint256 totalScore,uint256 lastUpdatedAt))'
            ], signer);
            
            // Import safeContractRead dynamically to avoid circular dependencies
            const { safeContractRead } = await import('./lib/safe-contract-read.js');
            
            const result = await safeContractRead(
              () => contract.getScore(effectiveAddress),
              {
                context: 'profile',
                timeoutMs: 5000,
                meta: {
                  address: effectiveAddress,
                  registry: reg
                }
              }
            );
            
            if (result.ok) {
              const data = result.data;
              const total = data?.totalScore ? BigInt(data.totalScore).toString() : '0';
              const high = data?.highScore ? BigInt(data.highScore).toString() : '0';
              scoreEl.textContent = total;
              if (bestScoreEl) bestScoreEl.textContent = high;
              // Games played and average would need additional contract calls or API
              if (gamesPlayedEl) gamesPlayedEl.textContent = '-'; // TODO: Calculate from history
              if (avgScoreEl) avgScoreEl.textContent = total !== '0' ? (Number(total) / 1).toFixed(0) : '-'; // TODO: Calculate properly
            } else {
              // Contract read failed - handle gracefully
              if (result.error.kind === 'WALLET_METHOD_UNSUPPORTED') {
                log.debug('Contract read not supported (eth_call unavailable):', result.error.technicalMessage);
                // Show user-friendly message if there's a UI element for it
                // For now, just show '-' for scores (expected behavior)
              } else if (result.error.kind === 'CONTRACT_REVERT') {
                // Contract revert is expected for users who haven't submitted scores yet
                // Don't log as warning - this is normal behavior
                const isMissingData = result.error.meta?.isMissingRevertData;
                if (isMissingData) {
                  log.debug('Contract read: No score data available yet (expected for new users)');
                } else {
                  log.debug('Contract read reverted:', result.error.technicalMessage);
                }
              } else {
                // Other errors (timeout, network, etc.) - log as warning
                log.warn('Contract read failed:', {
                  kind: result.error.kind,
                  message: result.error.technicalMessage,
                  context: result.error.context
                });
              }
              scoreEl.textContent = '-';
              if (bestScoreEl) bestScoreEl.textContent = '-';
              if (gamesPlayedEl) gamesPlayedEl.textContent = '-';
              if (avgScoreEl) avgScoreEl.textContent = '-';
            }
          }
        }
      } catch (err) {
        // Provider or SDK not available - show '-' for scores
        log.debug('Contract read error:', err?.message || err);
        scoreEl.textContent = '-';
        if (bestScoreEl) bestScoreEl.textContent = '-';
        if (gamesPlayedEl) gamesPlayedEl.textContent = '-';
        if (avgScoreEl) avgScoreEl.textContent = '-';
      }
    } catch (err) {
      log.error('refresh error', err);
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
      log.debug('Already on chain', targetChainId);
      return;
    }
    
    try {
      // First, try to switch chain via SDK wallet if available
      if (window.sdk && window.sdk.wallet && typeof window.sdk.wallet.switchEthereumChain === 'function') {
        try {
          const hexChainId = '0x' + targetChainId.toString(16);
          await window.sdk.wallet.switchEthereumChain({ chainId: hexChainId });
        } catch (sdkErr) {
          log.warn('SDK switchEthereumChain failed:', sdkErr);
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
              log.warn('wallet_addEthereumChain failed:', addErr);
            }
          } else {
            log.warn('wallet_switchEthereumChain failed:', ethErr);
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
      
      // Refresh panel to show new network (but don't trigger any events)
      const panel = document.getElementById(PANEL_ID);
      if (panel) {
        // Keep dialog handling flag active during refresh to prevent event listeners from firing
        // This prevents the dialog from reopening after network switch
        const wasHandling = isDialogHandling;
        if (!wasHandling) {
          isDialogHandling = true;
        }
        try {
          await refresh(panel);
        } finally {
          // Only reset if we weren't already handling
          // Use a longer delay to ensure refresh completes and no events fire
          if (!wasHandling) {
            if (dialogCloseTimeout) {
              clearTimeout(dialogCloseTimeout);
            }
            dialogCloseTimeout = setTimeout(() => {
              isDialogHandling = false;
              dialogCloseTimeout = null;
            }, 1000);
          }
        }
      }
    } catch (err) {
      log.error('switch error', err);
      alert('Failed to switch network: ' + (err?.message || err));
      // Reset flag on error after a delay
      if (dialogCloseTimeout) {
        clearTimeout(dialogCloseTimeout);
      }
      dialogCloseTimeout = setTimeout(() => {
        isDialogHandling = false;
        dialogCloseTimeout = null;
      }, 500);
    }
}

let isOpen = false;

// Track if elements are already wired to prevent duplicate listeners
const wiredElements = new WeakSet();

function attachEscListener() {
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

function detachEscListener() {
    if (!keydownHandler) return;
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
}

function setVisible(visible) {
    const shell = ensureShell();
    if (!shell || !shell.panel) return;

    isOpen = !!visible;
    // Show panel immediately (synchronous)
    setPanelVisible(shell.panel, isOpen);
    if (isOpen) {
      // Focus first interactive element after open for accessibility
      requestAnimationFrame(() => focusFirstFocusable(shell.panel));
      attachEscListener();
    } else {
      detachEscListener();
      if (triggerEl && typeof triggerEl.focus === 'function') {
        requestAnimationFrame(() => triggerEl.focus());
      }
    }

    if (isOpen) {
      // Refresh panel in background (non-blocking)
      // NOTE: Do NOT call ensureWallet() or signIn() here to avoid passkey prompts.
      // Base App mini apps are automatically connected - wallet info is available without requesting.
      // Only refresh panel to show current wallet status (if already connected).
      requestAnimationFrame(() => {
        refresh(shell.panel);
      });
    }
  }

function wire(panel, btn) {
    if (!panel) {
      log.error('wire: panel missing');
      return;
    }

    // If button exists, wire it (for backward compatibility)
    if (btn && !wiredElements.has(btn)) {
      wiredElements.add(btn);
      btn.addEventListener('click', async () => {
        setVisible(!isOpen);
      });
    }

    // Wire close button using shared helper
    wirePanelCloseButton(panel, () => setVisible(false), wiredElements);
    
    // Wire overlay click using shared helper
    wirePanelOverlay(panel, () => setVisible(false), wiredElements);
    
    // Setup network logos
    setupNetworkLogos(panel);
    
    // Track if event listeners are already attached
          const switchElements = panel.querySelectorAll('[data-switch]');
          switchElements.forEach((el) => {
            // Check if event listeners are already attached (using a data attribute)
            if (el.dataset.switchWired === 'true') {
              return; // Already wired, skip
            }
            
            // Mark as wired
            el.dataset.switchWired = 'true';
            
            const handleSwitchClick = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Prevent multiple clicks while dialog is open or switching
              if (isDialogHandling || currentDialog) {
                return;
              }
              
              const id = Number(el.getAttribute('data-switch'));
              if (isNaN(id)) return;
              
              const currentChainId = window.BaseManOnchainConfig?.chainId ? Number(window.BaseManOnchainConfig.chainId) : null;
              
              // If already on target chain, skip (don't show dialog)
              if (currentChainId === id) {
                return;
              }
              
              const textEl = el.querySelector('.profile-network-text');
              const originalText = textEl ? textEl.textContent : el.textContent;
              let isSwitching = false;
              
              // Show confirmation dialog
              showNetworkConfirmDialog(
                id,
                async () => {
                  // User confirmed - proceed with switch
                  if (isSwitching) return; // Prevent double execution
                  isSwitching = true;
                  
                  el.style.opacity = '0.6';
                  if (textEl) {
                    textEl.textContent = 'Switching...';
                  } else {
                    el.textContent = 'Switching...';
                  }
                  el.style.pointerEvents = 'none';
                  
                  try {
                    await handleSwitch(id);
                  } catch (err) {
                    log.error('switch button error:', err);
                    alert('Failed to switch network: ' + (err?.message || err));
                  } finally {
                    el.style.opacity = '';
                    if (textEl) {
                      textEl.textContent = originalText;
                    } else {
                      el.textContent = originalText;
                    }
                    el.style.pointerEvents = '';
                    isSwitching = false;
                  }
                },
                () => {
                  // User cancelled - do nothing, dialog already closed
                }
              );
            };
            
            el.addEventListener('click', handleSwitchClick, { passive: false });
            // Touch event for mobile
            el.addEventListener('touchend', handleSwitchClick, { passive: false });
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
            log.warn('Max retries reached, profile panel may not work');
          }
        }, 200);
        return;
      }
      // Button may be null now (controlled by bottom nav)
      wire(shell.panel, shell.btn);
    } catch (error) {
      log.error('init error', error);
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
    setTriggerElement: (el) => { if (el instanceof HTMLElement) triggerEl = el; },
    refresh: () => {
      const shell = ensureShell();
      if (shell && shell.panel) refresh(shell.panel);
    },
    isOpen: () => isOpen
};

initWhenReady();
