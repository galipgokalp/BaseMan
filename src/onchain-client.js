(function () {
  // Increase attempts for mobile environments where SDK may load slower
  const MAX_ATTEMPTS = 500; // ~100s at 200ms (increased for mobile)
  const POLL_DELAY_MS = 200;
  let attempts = 0;

  const debug = createDebugOverlay();
  // Use logger if available, fallback to console.log for backward compatibility
  const log = (typeof window !== 'undefined' && window.logger) ? window.logger.log : console.log;
  log("[BaseMan] onchain-client bootstrap");

  function showFailure(message) {
    debug(`HATA: ${message}`);
    if (typeof window.__showModuleFailure === "function") {
      window.__showModuleFailure(message);
    } else {
      // Use logger if available, fallback to console.error for backward compatibility
      const error = (typeof window !== 'undefined' && window.logger) ? window.logger.error : console.error;
      error("[BaseMan] " + message);
    }
  }

  // Use unified SDK detection utility (100% compliance with Unified Wallet Integration Model)
  function resolveSdk() {
    try {
      // Priority 1: Use centralized SDK detection utility
      if (typeof window !== 'undefined' && typeof window.resolveSDK === 'function') {
        const sdk = window.resolveSDK();
        if (sdk) {
          debug("SDK resolved via centralized utility (resolveSDK)");
          return sdk;
        }
      }
      
      // Priority 2: Wait briefly for utility to load (utility loads early in index.html)
      // This is a safety fallback - utility should already be loaded
      let attempts = 0;
      const maxWait = 500; // 500ms max wait
      while (attempts < 10 && typeof window !== 'undefined') {
        if (typeof window.resolveSDK === 'function') {
          const sdk = window.resolveSDK();
          if (sdk) {
            debug("SDK resolved via centralized utility (after wait)");
            return sdk;
          }
        }
        // Small delay before next attempt (non-blocking)
        attempts++;
        if (attempts < 10) {
          // Use setTimeout for non-blocking wait (simplified - in practice, this is called async)
          break; // Exit loop - will retry on next call if needed
        }
      }
      
      // Priority 3: Emergency fallback (should never reach here in normal operation)
      // This fallback is kept for safety but should not be needed
      // Utility loads early in index.html as type="module" script
      debug("WARNING: Using emergency SDK fallback - centralized utility not available");
      const isFarcaster = typeof window !== 'undefined' && 
        typeof window.isFarcasterMiniApp === 'function' && 
        window.isFarcasterMiniApp();
      const isBase = typeof window !== 'undefined' && 
        typeof window.isBaseApp === 'function' && 
        window.isBaseApp();
      
      // Minimal fallback - try most common SDK locations
      if (isFarcaster) {
        if (window.fc && window.fc.miniapp) return window.fc.miniapp;
        if (window.farcaster && window.farcaster.miniapp) return window.farcaster.miniapp;
      } else if (isBase) {
        if (window.MiniKit && (window.MiniKit.sdk || window.MiniKit)) return window.MiniKit.sdk || window.MiniKit;
      }
      
      // Last resort fallback
      if (window.sdk) return window.sdk;
      if (window.MiniAppSDK) return window.MiniAppSDK;
      
      return null;
    } catch (error) {
      debug(`SDK resolution error: ${error?.message || error}`);
      return null;
    }
  }

  function resolveEthers() {
    return window.ethers || window.Ethers || window.ethersjs || null;
  }

  function tryInitialize() {
    const sdk = resolveSdk();
    const ethers = resolveEthers();
    const onchainConfig = window.BaseManOnchainConfig;

    if (sdk && ethers && onchainConfig) {
      initialize(sdk, ethers, onchainConfig);
      return;
    }

    attempts += 1;
    if (attempts % 10 === 0) {
      const hints = Object.keys(window)
        .filter((key) => key.toLowerCase().includes("mini"))
        .slice(0, 10)
        .join(", ");
      debug("SDK/Ethers bekleniyor... deneme #" + attempts + (hints ? " | mini keys: " + hints : ""));
    }

    if (attempts >= MAX_ATTEMPTS) {
      if (!sdk) {
        showFailure("Farcaster Mini App SDK not found.");
      } else if (!ethers) {
        showFailure("ethers.js library not loaded.");
      } else {
        showFailure("On-chain configuration not found.");
      }
      return;
    }

    setTimeout(tryInitialize, POLL_DELAY_MS);
  }

  function initialize(sdk, ethers, config) {
    window.sdk = sdk;
    window.BaseManModuleLoaded = true;
    debug("SDK and ethers found, initializing on-chain integration.");

    window.addEventListener("error", (event) => {
      debug(`Error: ${(event && event.message) || event}`);
    });

    window.addEventListener("unhandledrejection", (event) => {
      debug(`Unhandled rejection: ${event.reason}`);
    });

    const CONTRACT_ABI = [
      // V1
      "function submitScore(address player,uint256 score,uint256 deadline,bytes signature)",
      "function completeQuest(address player,uint256 questId,uint256 deadline,bytes signature)",
      // V2 (adds nonce)
      "function submitScore(address player,uint256 score,uint256 deadline,uint256 nonce,bytes signature)",
      "function completeQuest(address player,uint256 questId,uint256 deadline,uint256 nonce,bytes signature)",
      // Views
      "function getScore(address player) view returns (tuple(uint256 highScore,uint256 totalScore,uint256 lastUpdatedAt))"
    ];

    const CHAIN_METADATA = {
      8453: {
        chainName: "Base",
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https://basescan.org"],
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
      },
      84532: {
        chainName: "Base Sepolia",
        rpcUrls: ["https://sepolia.base.org"],
        blockExplorerUrls: ["https://sepolia.basescan.org"],
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
      }
    };

    const state = {
      signer: null,
      address: null,
      contract: null,
      provider: null,
      runStartedAt: null,
      submitting: false,
      walletReady: false,
      walletError: null
    };

    function emitWalletStatus(ready, error) {
      state.walletReady = !!ready;
      state.walletError = ready ? null : error ? String(error) : null;
      try {
        window.dispatchEvent(
          new CustomEvent("baseman-wallet-status", {
            detail: {
              ready: state.walletReady,
              error: state.walletError,
              address: state.walletReady ? state.address : null
            }
          })
        );
      } catch (eventError) {
        debug(`wallet-status event error: ${eventError?.message || eventError}`);
      }
    }

    function attachProviderEvents(provider) {
      if (!provider || typeof provider !== 'object') return;
      const on = provider.on || provider.addListener;
      if (typeof on === 'function') {
        try {
          on.call(provider, 'accountsChanged', (accounts) => {
            try {
              const next = Array.isArray(accounts) && accounts.length ? ethers.getAddress(accounts[0]) : null;
              if (next && next !== state.address) {
                state.address = next;
                debug(`accountsChanged -> ${state.address}`);
                emitWalletStatus(true, null);
              }
            } catch (_) {}
          });
        } catch (_) {}
        try {
          on.call(provider, 'chainChanged', (chainId) => {
            debug(`chainChanged -> ${String(chainId)}`);
          });
        } catch (_) {}
      }
    }

    // Call ready asynchronously to hide splash screen
    // IMPORTANT: This must be called early to prevent infinite loading screen
    // Also dispatch an event when ready() completes so the game can start
    (async () => {
      try {
        // Wait a bit for SDK to fully initialize (especially on mobile)
        // Increased delay for mobile webview environments
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          // Verify SDK is fully ready by checking for context
          let isReady = false;
          if (typeof sdk.isInMiniApp === 'function') {
            try {
              // Increased timeout for mobile environments
              isReady = await sdk.isInMiniApp({ timeoutMs: 1000 });
            } catch (_) {
              // If isInMiniApp fails, assume we're in mini app if SDK exists
              isReady = true;
            }
          } else {
            // If isInMiniApp not available, assume ready if SDK exists
            isReady = true;
          }
          
          // Additional check: if we're in a mobile webview, assume ready
          if (!isReady) {
            try {
              const ua = navigator.userAgent || '';
              const isMobileWebView = ua.includes('Farcaster') || 
                                     ua.includes('Warpcast') || 
                                     ua.includes('BaseApp') ||
                                     typeof window.ReactNativeWebView !== 'undefined';
              if (isMobileWebView) {
                isReady = true;
              }
            } catch (_) {}
          }
          
          if (isReady) {
            await sdk.actions.ready({ disableNativeGestures: true });
            debug("sdk.actions.ready() called successfully");
            // Dispatch event to signal that SDK is ready and splash screen is hidden
            try {
              window.__basemanSDKReadyFired = true;
              window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk } }));
            } catch (eventError) {
              debug(`Failed to dispatch sdk-ready event: ${eventError?.message || eventError}`);
            }
          } else {
            debug("Warning: SDK detected but not in mini app context");
            // Even if not in mini app, allow game to start
            try {
              window.__basemanSDKReadyFired = true;
              window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk: null } }));
            } catch (eventError) {}
          }
        } else {
          debug("Warning: sdk.actions.ready is not available");
          // If SDK not available, allow game to start anyway (web mode)
          try {
            window.__basemanSDKReadyFired = true;
            window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk: null } }));
          } catch (eventError) {}
        }
      } catch (error) {
        debug(`Error calling sdk.actions.ready: ${error?.message || error}`);
        // Try to call ready anyway if it's a timeout or minor error
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          try {
            await sdk.actions.ready({ disableNativeGestures: true });
            debug("sdk.actions.ready() called after error recovery");
            try {
              window.__basemanSDKReadyFired = true;
              window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk } }));
            } catch (eventError) {}
          } catch (retryError) {
            debug(`Retry ready() failed: ${retryError?.message || retryError}`);
            // Even on error, allow game to start after a delay
            setTimeout(() => {
              try {
                window.__basemanSDKReadyFired = true;
                window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk: null } }));
              } catch (eventError) {}
            }, 500);
          }
        } else {
          // No SDK available, allow game to start
          setTimeout(() => {
            try {
              window.__basemanSDKReadyFired = true;
              window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk: null } }));
            } catch (eventError) {}
          }, 300);
        }
      }
    })();

    // Try to detect supported chains early and reconfigure if needed
    (async () => {
      try {
        let supported = null;
        if (typeof sdk.getChains === 'function') {
          try { supported = await sdk.getChains(); } catch (_) {}
        }
        if (!supported && typeof sdk.getCapabilities === 'function') {
          try {
            const caps = await sdk.getCapabilities();
            // Some hosts expose chains inside capabilities; normalize
            if (caps && typeof caps === 'object') {
              const list = [];
              try { if (Array.isArray(caps.chains)) list.push(...caps.chains); } catch (_) {}
              try { const c = caps?.chains && Object.keys(caps.chains).filter(k=>/^eip155:\d+$/.test(k)); list.push(...c); } catch (_) {}
              supported = list.length ? list : null;
            }
          } catch (_) {}
        }
        const wantSepolia = 84532;
        const wantMainnet = 8453;
        const hasSepolia = Array.isArray(supported) && supported.some((c) => String(c).includes('84532'));
        const hasMainnet = Array.isArray(supported) && supported.some((c) => String(c).includes('8453'));
        if (!hasSepolia && hasMainnet && Number(config.chainId) !== wantMainnet) {
          // Reconfigure to mainnet if we have an address configured at runtime
          const env = (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV : {};
          const mainAddr = (env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS || '').trim();
          if (mainAddr && mainAddr.startsWith('0x') && mainAddr.length === 42) {
            debug('Host does not support Base Sepolia; switching to Base mainnet');
            try {
              await reconfigureNetwork({ chainId: wantMainnet, registryAddress: mainAddr });
            } catch (err) {
              debug(`reconfigure to mainnet failed: ${err?.message || err}`);
            }
          } else {
            debug('Host lacks Sepolia and no mainnet registry configured; staying on Sepolia');
          }
        }
      } catch (err) {
        debug(`chain detection failed: ${err?.message || err}`);
      }
    })();

  // Use centralized platform detection utility (100% compliance with Unified Wallet Integration Model)
  function isMiniAppEnv() {
    try {
      // Priority 1: Use centralized platform detection utility
      if (typeof window !== 'undefined' && typeof window.isMiniAppEnv === 'function') {
        return window.isMiniAppEnv();
      }
      
      // Priority 2: Emergency fallback (should never reach here in normal operation)
      // This fallback is kept for safety but should not be needed
      // Utility loads early in index.html as type="module" script
      if (typeof window !== 'undefined') {
        // Minimal fallback - try most common indicators
        if (window.farcaster || (window.fc && window.fc.miniapp)) return true;
        if (window.MiniKit) return true;
        if (window.ReactNativeWebView) return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

    async function getMiniAppAuthToken() {
      try {
        if (typeof window.__MINIAPP_AUTH_TOKEN__ === 'string' && window.__MINIAPP_AUTH_TOKEN__.length > 8) {
          return window.__MINIAPP_AUTH_TOKEN__;
        }
        // Best-effort: try to get a fresh token via SDK if available
        const fn = sdk?.quickAuth && (sdk.quickAuth.getToken || sdk.quickAuth.token);
        if (typeof fn === 'function') {
          const t = await fn();
          if (typeof t === 'string' && t.length > 8) {
            try { window.__MINIAPP_AUTH_TOKEN__ = t; } catch (_) {}
            return t;
          }
        }
      } catch (_) {}
      return null;
    }

    async function ensureWallet(requestAccounts = false) {
      // If wallet is already fully initialized (has contract), return early
      if (state.contract && state.address) {
        return state;
      }

      // Mini‑app: use SDK EIP‑1193 provider (smart wallet). Avoid proactive signIn to prevent passkey prompts.
      if (isMiniAppEnv()) {
        try {
          // Do NOT call signIn proactively. Some hosts will prompt passkey on signIn.
          // We rely on provider injection and request accounts. If strictly required, enable via env/flag.
          const forceSignIn = Boolean((window.__ENV && String(window.__ENV.NEXT_PUBLIC_REQUIRE_SIGNIN || '') === '1') || new URLSearchParams(window.location.search).has('signin'));
          if (forceSignIn && sdk.actions && typeof sdk.actions.signIn === 'function') {
            await sdk.actions.signIn({ acceptAuthAddress: true });
            debug("sdk.actions.signIn() completed");
          }
        } catch (error) {
          debug(`signIn error: ${error?.message || error}`);
        }

        try {
          // Get Ethereum provider from SDK
          if (!sdk.wallet || typeof sdk.wallet.getEthereumProvider !== 'function') {
            throw new Error("SDK wallet.getEthereumProvider is not available");
          }
          
          const provider = await sdk.wallet.getEthereumProvider();
          if (!provider) throw new Error("Ethereum provider not available.");
          debug("sdk.wallet.getEthereumProvider() returned successfully");
          
          // Mini‑app providers may not support wallet_switchEthereumChain; skip enforcing switch

          let address = null;
          try {
            // First try to get existing accounts (read-only, no passkey prompt)
            // In Base App mini apps, accounts should be available automatically without requesting.
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (Array.isArray(accounts) && accounts.length) {
              address = accounts[0];
              debug(`Found existing account: ${address}`);
            }
          } catch (eaErr) {
            debug(`eth_accounts error: ${eaErr?.message || eaErr}`);
          }
          
          // In mini app environments, only call eth_requestAccounts if explicitly requested (e.g., during transaction).
          // Base App mini apps are automatically connected - if eth_accounts returns nothing,
          // we only request accounts when user initiates a transaction (submitScore/completeQuest).
          // This follows Base App documentation: "Mini Apps are automatically connected to user's Base Account"
          if (!address && isMiniAppEnv()) {
            // If requestAccounts is true (transaction initiated), request account access (may prompt passkey)
            if (requestAccounts) {
              try {
                debug("Transaction initiated - requesting account access (may prompt passkey)...");
                const req = await provider.request({ method: 'eth_requestAccounts' });
                if (Array.isArray(req) && req.length) {
                  address = req[0];
                  debug(`Account access granted for transaction: ${address}`);
                }
              } catch (reqErr) {
                // Handle different error formats
                let errMsg = '';
                if (reqErr && typeof reqErr === 'object') {
                  errMsg = reqErr.message || 
                           (reqErr.error && typeof reqErr.error === 'object' ? reqErr.error.message : null) ||
                           (reqErr.error && typeof reqErr.error !== 'object' ? String(reqErr.error) : null) ||
                           (reqErr.code ? `Error ${reqErr.code}` : null) ||
                           String(reqErr);
                } else {
                  errMsg = String(reqErr);
                }
                
                debug(`eth_requestAccounts error during transaction: ${errMsg}`);
                
                // User might have rejected the request
                if (errMsg.includes('reject') || errMsg.includes('denied') || errMsg.includes('User')) {
                  throw new Error('User rejected wallet connection');
                }
                
                throw new Error(`Failed to request accounts for transaction: ${errMsg}`);
              }
            } else {
              // Not requesting accounts (e.g., panel opened) - return state without address
              debug("No account from eth_accounts in mini app - wallet will be connected on first transaction");
              // Don't throw error - wallet will be connected when needed (on first transaction)
              // Return state with provider but no address - this allows UI to show "Not connected" status
              state.signer = null;
              state.address = null;
              state.contract = { interface: new ethers.Interface(CONTRACT_ABI) };
              state.provider = provider;
              attachProviderEvents(provider);
              emitWalletStatus(false, 'Wallet not connected - will connect on first transaction');
              return state;
            }
          }
          
          // Only request accounts if NOT in mini app environment (web mode)
          if (!address && !isMiniAppEnv()) {
            try {
              debug("Requesting account access...");
              const req = await provider.request({ method: 'eth_requestAccounts' });
              if (Array.isArray(req) && req.length) {
                address = req[0];
                debug(`Account access granted: ${address}`);
              }
            } catch (reqErr) {
              // Handle different error formats
              let errMsg = '';
              if (reqErr && typeof reqErr === 'object') {
                // Safely extract error message from various formats
                errMsg = reqErr.message || 
                         (reqErr.error && typeof reqErr.error === 'object' ? reqErr.error.message : null) ||
                         (reqErr.error && typeof reqErr.error !== 'object' ? String(reqErr.error) : null) ||
                         (reqErr.code ? `Error ${reqErr.code}` : null) ||
                         String(reqErr);
              } else {
                errMsg = String(reqErr);
              }
              
              debug(`eth_requestAccounts error: ${errMsg}`);
              
              // User might have rejected the request
              if (errMsg.includes('reject') || errMsg.includes('denied') || errMsg.includes('User')) {
                throw new Error('User rejected wallet connection');
              }
              
              // Web mode detection - if not in mini app, provide helpful message
              if (!isMiniAppEnv() && (errMsg.includes('Cannot read properties of undefined') || errMsg.includes('undefined'))) {
                throw new Error('Wallet not available in web mode. Please use Farcaster or Base App mobile app.');
              }
              
              throw new Error(`Failed to request accounts: ${errMsg}`);
            }
          }
          
          if (!address) {
            throw new Error('Wallet address unavailable - no accounts returned');
          }

          state.signer = null;
          state.address = ethers.getAddress(address);
          state.contract = { interface: new ethers.Interface(CONTRACT_ABI) };
          state.provider = provider;
          attachProviderEvents(provider);
          debug(`Wallet ready (mini‑app): ${state.address}`);

          // PAYMASTER DISABLED: Sponsorless mode - users pay gas fee
          // Paymaster discovery is disabled until paymaster integration is ready
          // try { await discoverPaymasterUrl(provider, config.chainId); } catch (_) {}
          debug('Paymaster discovery disabled - sponsorless mode (users pay gas fee)');
          emitWalletStatus(true, null);
          return state;
        } catch (error) {
          state.signer = null;
          state.address = null;
          state.contract = null;
          state.provider = null;
          const message = error?.message || error || "Wallet initialization failed";
          emitWalletStatus(false, message);
          throw error instanceof Error ? error : new Error(String(error));
        }
      }

      // Web fallback: injected EOA (browser wallet). No paymaster in this mode.
      try {
        const eth = window.ethereum;
        if (!eth || typeof eth.request !== "function") {
          throw new Error("No injected wallet provider. Use Connect Wallet in UI.");
        }
        try { await eth.request({ method: "eth_requestAccounts" }); } catch (reqErr) {
          throw reqErr instanceof Error ? reqErr : new Error(String(reqErr));
        }
        await ensureChain(eth, config.chainId);

        const browserProvider = new ethers.BrowserProvider(eth);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        state.signer = signer;
        state.address = ethers.getAddress(address);
        state.contract = new ethers.Contract(config.registryAddress, CONTRACT_ABI, signer);
        state.provider = eth;
        attachProviderEvents(eth);
        debug(`Wallet ready (web EOA): ${state.address}`);
        emitWalletStatus(true, null);
        return state;
      } catch (error) {
        state.signer = null;
        state.address = null;
        state.contract = null;
        state.provider = null;
        const message = error?.message || error || "Wallet initialization failed";
        emitWalletStatus(false, message);
        throw error instanceof Error ? error : new Error(String(error));
      }
    }

    async function reconfigureNetwork(next) {
      try {
        const nextChainId = Number(next?.chainId || config.chainId);
        const nextRegistry = next?.registryAddress || config.registryAddress;
        if (!nextRegistry) throw new Error("Missing registryAddress for selected network");

        if (!state.provider) {
          // Will be initialized by ensureWallet
        } else {
          await ensureChain(state.provider, nextChainId);
        }

        // Update live config object
        config.chainId = nextChainId;
        config.registryAddress = nextRegistry;

        // Force rebuild of signer/contract with new network
        state.contract = null;
        await ensureWallet();

        debug(`Reconfigured network to chainId=${config.chainId}, registry=${config.registryAddress}`);
        emitWalletStatus(true, null);
        return { chainId: config.chainId, registryAddress: config.registryAddress };
      } catch (error) {
        const message = error?.message || error || "Network reconfiguration failed";
        emitWalletStatus(false, message);
        throw error instanceof Error ? error : new Error(String(error));
      }
    }

    function toHexChainId(chainId) {
      try {
        if (typeof chainId === "bigint") {
          return ethers.toBeHex(chainId);
        }
        if (typeof chainId === "number") {
          return ethers.toBeHex(chainId);
        }
        if (typeof chainId === "string" && chainId.startsWith("0x")) {
          return ethers.toBeHex(chainId);
        }
        if (typeof chainId === "string" && chainId.trim() !== "") {
          return ethers.toBeHex(BigInt(chainId));
        }
        throw new Error("chainId cannot be empty");
      } catch (error) {
        throw new Error(`Invalid chainId: ${chainId} (${error?.message || error})`);
      }
    }

    async function ensureChain(provider, chainId) {
      const hexChainId = toHexChainId(chainId);
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }]
        });
      } catch (error) {
        if (error?.code === 4902) {
          const metadata = CHAIN_METADATA[chainId] || {
            chainName: `Chain ${chainId}`,
            rpcUrls: [],
            blockExplorerUrls: [],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
          };
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                ...metadata
              }
            ]
          });
          debug(`wallet_addEthereumChain added ${chainId}`);
        } else {
          debug(`wallet_switchEthereumChain error: ${error?.message || error}`);
        }
      }
    }

    async function requestScoreSignature(score, durationMs) {
      let playerAddress = state.address;
      try {
        playerAddress = ethers.getAddress(playerAddress);
      } catch (error) {
        debug(`score-sign address normalization failed: ${error?.message || error}`);
        throw new Error("Invalid wallet address");
      }

      // Derive chain key for backend (matches server-side targets in api/_lib/registry.js)
      const chainKey = config.chainId === 8453 ? 'base' : (config.chainId === 84532 ? 'base-sepolia' : 'base');

      debug(
        `Preparing score-sign request: score=${score.toString()} duration=${durationMs}ms chain=${chainKey}`
      );

      const headers = { "Content-Type": "application/json" };
      if (isMiniAppEnv()) {
        try {
          const t = await getMiniAppAuthToken();
          if (t) { headers['Authorization'] = `Bearer ${t}`; headers['X-MiniApp-Auth-Token'] = t; }
        } catch (_) {}
      }

      const response = await fetch(config.scoreEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          playerAddress,
          score: score.toString(),
          durationMs,
          level: window.level ?? 1,
          chain: chainKey
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error || "Failed to obtain score signature";
        debug(`score-sign failed: ${message}`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score-sign:error', meta: { message: String(message), durationMs } }) }).catch(()=>{});} catch(_) {}
        throw new Error(message);
      }
      debug(`score-sign succeeded: ${score} (duration ${durationMs}ms)`);
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score-sign:ok', meta: { score: score.toString(), durationMs } }) }).catch(()=>{});} catch(_) {}
      return payload;
    }

    async function requestQuestSignature(questId) {
      let playerAddress = state.address;
      try {
        playerAddress = ethers.getAddress(playerAddress);
      } catch (error) {
        debug(`quest-sign address normalization failed: ${error?.message || error}`);
        throw new Error("Invalid wallet address");
      }

      const chainKey = config.chainId === 8453 ? 'base' : (config.chainId === 84532 ? 'base-sepolia' : 'base');

      const headers2 = { "Content-Type": "application/json" };
      if (isMiniAppEnv()) {
        try {
          const t = await getMiniAppAuthToken();
          if (t) { headers2['Authorization'] = `Bearer ${t}`; headers2['X-MiniApp-Auth-Token'] = t; }
        } catch (_) {}
      }
      const response = await fetch(config.questEndpoint, {
        method: "POST",
        headers: headers2,
        body: JSON.stringify({
          playerAddress,
          questId: String(questId),
          chain: chainKey
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error || "Failed to obtain quest signature";
        debug(`quest-sign failed: ${message}`);
        throw new Error(message);
      }
      debug(`quest-sign succeeded: questId=${questId}`);
      return payload;
    }

    function resolveCapabilityUrl(url) {
      if (!url || typeof url !== "string") {
        return null;
      }
      try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }
        return new URL(url, window.location.origin).toString();
      } catch (error) {
        debug(`paymaster URL could not be resolved: ${error?.message || error}`);
        return null;
      }
    }

    // Discover paymaster capability URL via provider (EIP-5792 style)
    async function discoverPaymasterUrl(provider, chainId) {
      try {
        // If a paymaster URL is already configured (e.g., our proxy), do not override.
        if (config.paymasterUrl && String(config.paymasterUrl).trim().length > 0) {
          debug('paymasterUrl preset; skipping capability discovery');
          return null;
        }
        if (!provider || typeof provider.request !== 'function') return null;
        // Try capabilities discovery. Some providers accept no params; some accept [address].
        let caps = null;
        try {
          caps = await provider.request({ method: 'wallet_getCapabilities' });
        } catch (_) {}
        if (!caps) {
          try {
            const addr = state.address || null;
            if (addr) {
              caps = await provider.request({ method: 'wallet_getCapabilities', params: [addr] });
            }
          } catch (_) {}
        }

        const candidates = [
          'paymasterService',
          'org.cdp.paymaster',
          'capabilities.paymasterService',
          'capabilities.org.cdp.paymaster'
        ];

        function pickUrl(obj) {
          if (!obj || typeof obj !== 'object') return null;
          if (typeof obj.url === 'string' && obj.url.length) return obj.url;
          for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val && typeof val === 'object' && typeof val.url === 'string') return val.url;
          }
          return null;
        }

        let url = null;
        if (caps && typeof caps === 'object') {
          for (const path of candidates) {
            try {
              const parts = path.split('.');
              let cur = caps;
              for (const p of parts) cur = cur?.[p];
              const maybe = pickUrl(cur);
              if (maybe) { url = maybe; break; }
            } catch (_) {}
          }
        }

        if (url) {
          config.paymasterUrl = url;
          debug(`Discovered paymaster capability url: ${url}`);
          return url;
        }
        return null;
      } catch (error) {
        debug(`discoverPaymasterUrl error: ${error?.message || error}`);
        return null;
      }
    }

    /**
     * Get wallet capabilities using wallet_getCapabilities (EIP-5792)
     * 
     * According to Farcaster and Base App documentation:
     * - Can be called without params (returns capabilities for current account)
     * - Can be called with address param (returns capabilities for specific account)
     * - Returns capabilities object with chain-specific and global capabilities
     * 
     * @param {Object} provider - Ethereum provider
     * @param {string|null} address - Optional address to check capabilities for
     * @returns {Promise<Object|null>} Capabilities object or null if unavailable
     */
    async function getCapabilities(provider, address) {
      if (!provider || typeof provider.request !== 'function') {
        debug('getCapabilities: Provider not available');
        return null;
      }
      
      let caps = null;
      
      // Try without address first (current account capabilities)
      try {
        caps = await provider.request({ method: 'wallet_getCapabilities' });
        if (caps && typeof caps === 'object') {
          debug(`getCapabilities: Retrieved capabilities (without address): ${Object.keys(caps).join(', ')}`);
          return caps;
        }
      } catch (error) {
        debug(`getCapabilities: Failed to get capabilities (without address): ${error?.message || error}`);
      }
      
      // Try with address if provided
      if (!caps && address && typeof address === 'string' && address.startsWith('0x')) {
        try {
          caps = await provider.request({ method: 'wallet_getCapabilities', params: [address] });
          if (caps && typeof caps === 'object') {
            debug(`getCapabilities: Retrieved capabilities (with address): ${Object.keys(caps).join(', ')}`);
            return caps;
          }
        } catch (error) {
          debug(`getCapabilities: Failed to get capabilities (with address): ${error?.message || error}`);
        }
      }
      
      return caps || null;
    }

    /**
     * Check if paymaster is supported for a given chain
     * 
     * According to Farcaster and Base App documentation:
     * - Farcaster: Paymaster not supported
     * - Base App: Paymaster supported via paymasterService capability
     * - Capabilities can be chain-specific or global
     * 
     * @param {Object} caps - Capabilities object from wallet_getCapabilities
     * @param {number} chainId - Chain ID to check
     * @returns {boolean} True if paymaster is supported
     */
    function isPaymasterSupported(caps, chainId) {
      try {
        if (!caps || typeof caps !== 'object') {
          debug('isPaymasterSupported: No capabilities provided');
          return false;
        }
        
        // Convert chainId to different formats for checking
        const hex = (() => { 
          try { 
            return ethers.toBeHex(chainId); 
          } catch (_) { 
            return null; 
          } 
        })();
        const caip = `eip155:${chainId}`;
        const chainIdStr = String(chainId);
        
        // Check global capabilities (flat structure)
        const byFlat = caps?.paymasterService?.supported === true || 
                      caps?.org?.cdp?.paymaster?.supported === true;
        
        // Check nested capabilities structure
        const byCaps = caps?.capabilities?.paymasterService?.supported === true || 
                      caps?.capabilities?.['org.cdp.paymaster']?.supported === true;
        
        // Check chain-specific capabilities (multiple formats)
        const byChainId = caps?.[chainIdStr]?.paymasterService?.supported === true ||
                         (hex && caps?.[hex]?.paymasterService?.supported === true) ||
                         caps?.[caip]?.paymasterService?.supported === true;
        
        // Check chains object structure
        const byChains = caps?.chains?.[caip]?.paymasterService?.supported === true ||
                        caps?.chains?.[chainIdStr]?.paymasterService?.supported === true ||
                        (hex && caps?.chains?.[hex]?.paymasterService?.supported === true);
        
        const supported = byFlat || byCaps || byChainId || byChains;
        debug(`isPaymasterSupported: chainId=${chainId}, supported=${supported}`);
        
        return supported;
      } catch (error) {
        debug(`isPaymasterSupported: Error checking capabilities: ${error?.message || error}`);
        return false;
      }
    }

    async function submitScoreWithPaymaster(callData) {
      // Farcaster Wallet does not support paymaster yet (per miniapps.farcaster.xyz/docs/guides/wallets)
      // Paymaster is only supported in Base App, not in Farcaster/Warpcast
      // Use centralized platform detection
      const isFarcaster = typeof window !== 'undefined' && 
        typeof window.isFarcasterMiniApp === 'function' && 
        window.isFarcasterMiniApp();
      
      if (isFarcaster) {
        debug('Farcaster Wallet does not support paymaster; attempting wallet_sendCalls without paymaster');
        return await sendCalls(callData, null);
      }
      
      if (!config.paymasterUrl) {
        debug('Paymaster URL not configured; attempting wallet_sendCalls without paymaster');
        return await sendCalls(callData, null);
      }
      if (!state.provider || typeof state.provider.request !== "function") {
        debug("No provider available for paymaster request.");
        return null;
      }
      // Soft‑gate: kontrol et ama başarısızsa yine de dene (cüzdanlar capability bilgisini eksik döndürebilir)
      try {
        const caps = await getCapabilities(state.provider, state.address);
        const supported = isPaymasterSupported(caps, config.chainId);
        debug(`paymaster capability support: ${supported ? 'yes' : 'unknown/no'}`);
      } catch (_) { debug('wallet_getCapabilities failed; proceeding to try wallet_sendCalls'); }

      const capabilityUrl = resolveCapabilityUrl(config.paymasterUrl);
      if (!capabilityUrl) {
        debug("Paymaster capability URL could not be resolved; falling back to wallet_sendCalls without capabilities.");
        return await sendCalls(callData, null);
      }

      const hexChainId = (() => {
        try {
          return ethers.toBeHex(config.chainId);
        } catch (error) {
          debug(`chainId hex conversion error: ${error?.message || error}`);
          return null;
        }
      })();
      if (!hexChainId) return null;

      // Paymaster sadece smart wallet (mini‑app) ile kullanılmalı
      // Base App supports paymaster, Farcaster does not
      if (!isMiniAppEnv()) {
        return null;
      }

      try {
        const result = await sendCalls(callData, capabilityUrl);

        if (result && typeof result === "object") {
          if (result.id) {
            debug(`wallet_sendCalls request sent. id=${result.id}`);
            try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'wallet_sendCalls:sent', meta: { id: result.id } }) }).catch(()=>{});} catch(_) {}
          } else {
            debug(`wallet_sendCalls response: ${JSON.stringify(result)}`);
            try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'wallet_sendCalls:response' }) }).catch(()=>{});} catch(_) {}
          }
        } else {
          debug("wallet_sendCalls response unexpected.");
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'wallet_sendCalls:unexpected' }) }).catch(()=>{});} catch(_) {}
        }

        return result;
      } catch (error) {
        const message = error?.message || error;
        debug(`submitScoreWithPaymaster: wallet_sendCalls (paymaster) failed: ${message}; retrying without capabilities…`);
        try { 
          const retryResult = await sendCalls(callData, null);
          if (retryResult) {
            debug(`submitScoreWithPaymaster: Retry without paymaster succeeded`);
            return retryResult;
          }
        } catch (retryError) {
          debug(`submitScoreWithPaymaster: Retry without paymaster failed: ${retryError?.message || retryError}`);
        }
        debug('submitScoreWithPaymaster: wallet_sendCalls (no paymaster) failed; returning null for outer fallback');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'wallet_sendCalls:error', meta: { message: String(message) } }) }).catch(()=>{});} catch(_) {}
        return null;
      }
    }

    /**
     * Send contract interaction calls using wallet_sendCalls (EIP-5792)
     * 
     * According to Farcaster and Base App documentation:
     * - Farcaster: Sequential execution (atomicRequired: false), version: "1.0"
     * - Base App: Atomic batch supported (atomicRequired: true), version: "2.0.0" (REQUIRED)
     * - Paymaster: paymasterService: { url: "..." } format
     * 
     * @param {string} callData - Encoded contract function call data
     * @param {string|null} paymasterUrl - Paymaster service URL (null for sponsorless mode)
     * @returns {Promise<Object>} Transaction result with id or hash
     */
    async function sendCalls(callData, paymasterUrl) {
      // Validate chainId
      const hexChainId = (() => { 
        try { 
          return ethers.toBeHex(config.chainId); 
        } catch (error) {
          debug(`chainId conversion error: ${error?.message || error}`);
          return null;
        }
      })();
      if (!hexChainId) {
        throw new Error(`Invalid chainId: ${config.chainId}`);
      }
      
      // Validate address
      if (!state.address || typeof state.address !== 'string') {
        throw new Error('Wallet address not available');
      }
      
      // Validate provider
      if (!state.provider || typeof state.provider.request !== 'function') {
        throw new Error('Ethereum provider not available');
      }
      
      // Validate callData
      if (!callData || typeof callData !== 'string' || !callData.startsWith('0x')) {
        throw new Error('Invalid callData format');
      }
      
      // Platform-specific version and atomic batch setting
      // According to docs:
      // - Farcaster: Sequential execution (atomicRequired: false), version: "1.0"
      // - Base App: Atomic batch supported (atomicRequired: true), version: "2.0.0" (REQUIRED)
      const isFarcaster = typeof window !== 'undefined' && 
        typeof window.isFarcasterMiniApp === 'function' && 
        window.isFarcasterMiniApp();
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
      
      debug(`Sending wallet_sendCalls: version=${payload.version}, atomicRequired=${atomicRequired}, paymaster=${paymasterUrl ? 'yes' : 'no'}, chainId=${hexChainId}`);
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
      } catch(_) {}
      
      try {
        // Send transaction using wallet_sendCalls (EIP-5792)
        const result = await state.provider.request({ 
          method: 'wallet_sendCalls', 
          params: [payload] 
        });
        
        // Log success
        debug(`wallet_sendCalls success: ${JSON.stringify(result)}`);
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
        } catch(_) {}
        
        return result;
      } catch (error) {
        const errorMsg = error?.message || String(error);
        const errorCode = error?.code || error?.error?.code || null;
        debug(`wallet_sendCalls error: ${errorMsg} (code: ${errorCode})`);
        console.error('[BaseMan] wallet_sendCalls failed:', error);
        
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
                payload: payload
              } 
            }) 
          }).catch(()=>{}); 
        } catch(_) {}
        
        // Re-throw with additional context
        throw new Error(`Transaction failed: ${errorMsg}${errorCode ? ` (code: ${errorCode})` : ''}`);
      }
    }

    // Last‑resort fallback for hosts without EIP‑5792: try eth_sendTransaction
    async function sendEthTransaction(callData) {
      if (!state.provider || typeof state.provider.request !== 'function') throw new Error('no provider');
      const from = state.address;
      if (!from) throw new Error('no from address');
      const tx = { from, to: config.registryAddress, data: callData, value: '0x0' };
      debug('Sending eth_sendTransaction fallback');
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'eth_sendTransaction:start' }) }).catch(()=>{});} catch(_) {}
      const hash = await state.provider.request({ method: 'eth_sendTransaction', params: [tx] });
      debug(`eth_sendTransaction hash: ${hash}`);
      return { hash };
    }

    async function submitScore() {
      debug('submitScore: Function called');
      console.log('[BaseMan] submitScore: Function called');
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:called', meta: { timestamp: new Date().toISOString(), stack: new Error().stack } }) }).catch(()=>{});} catch(_) {}

      // Check if already submitting
      if (state.submitting) {
        debug('submitScore: Already submitting, skipping');
        console.log('[BaseMan] submitScore: Already submitting, skipping');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:already-submitting', meta: { timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        return;
      }
      
      // Check if getScore function is available
      if (typeof window.getScore !== "function") {
        debug('submitScore: getScore function not available');
        console.warn('[BaseMan] submitScore: getScore function not available');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:getScore-unavailable', meta: { timestamp: new Date().toISOString(), windowGetScore: typeof window.getScore } }) }).catch(()=>{});} catch(_) {}
        return;
      }

      // Get score value
      let score;
      try {
        const scoreValue = window.getScore();
        debug(`submitScore: getScore() returned: ${scoreValue} (type: ${typeof scoreValue})`);
        score = BigInt(scoreValue);
      } catch (scoreError) {
        debug(`submitScore: Error getting score: ${scoreError?.message || scoreError}`);
        console.error('[BaseMan] submitScore: Error getting score:', scoreError);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:getScore-error', meta: { error: scoreError?.message || String(scoreError) } }) }).catch(()=>{});} catch(_) {}
        return;
      }
      
      if (score <= 0n) {
        debug(`submitScore: Score is 0 or negative (${score.toString()}), skipping`);
        console.log(`[BaseMan] submitScore: Score is 0 or negative (${score.toString()}), skipping`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:score-zero', meta: { score: score.toString(), timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        return;
      }

      const durationMs =
        state.runStartedAt !== null
          ? Math.max(0, Math.floor(performance.now() - state.runStartedAt))
          : 0;

      debug(`submitScore: Starting submission - score=${score.toString()}, duration=${durationMs}ms`);
      console.log(`[BaseMan] submitScore: Starting submission - score=${score.toString()}, duration=${durationMs}ms`);
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:starting', meta: { score: score.toString(), durationMs } }) }).catch(()=>{});} catch(_) {}

      try {
        state.submitting = true;

        // Request accounts if needed (may prompt passkey, but user initiated transaction)
        debug('submitScore: Ensuring wallet connection...');
        await ensureWallet(true);
        if (!state.address) {
          const errorMsg = "Wallet connection required";
          debug(`submitScore: ${errorMsg}`);
          throw new Error(errorMsg);
        }
        debug(`submitScore: Wallet connected - address=${state.address}`);

        debug('submitScore: Requesting signature from backend...');
        const { signature, deadline, score: signedScore, nonce } = await requestScoreSignature(
          score,
          durationMs
        );
        debug(`submitScore: Signature received - deadline=${deadline}, nonce=${nonce || 'N/A'}`);

        const scoreValue = signedScore ? BigInt(signedScore) : score;
        const deadlineValue = BigInt(deadline);

        // Check if we have contract interface to encode call data
        const contractInterface = state.contract && state.contract.interface;
        if (!contractInterface || typeof contractInterface.encodeFunctionData !== "function") {
          debug('submitScore: Contract interface not available, cannot encode call data');
          throw new Error("Contract interface not available");
        }

        // Decide EIP-712 version at runtime (prefer env, else introspect contract.eip712Version())
        let eip712v = (window.__ENV && (String(window.__ENV.NEXT_PUBLIC_REGISTRY_EIP712_VERSION || '').trim() || String(window.__ENV.REGISTRY_EIP712_VERSION || '').trim())) || '';
        let isV2 = eip712v === '2' || eip712v === '';
        if (!isV2 && eip712v !== '1') {
          try {
            if (typeof state.contract.eip712Version === 'function') {
              const v = await state.contract.eip712Version();
              if (typeof v === 'string' && v.trim() === '2') {
                isV2 = true;
                debug('submitScore: Detected EIP-712 version from contract: 2');
              }
            }
          } catch (detectErr) {
            debug(`submitScore: EIP-712 version autodetect failed: ${detectErr?.message || detectErr}`);
          }
        }
        
        let callData;
        if (isV2) {
          let nonceValue = null;
          try { nonceValue = BigInt(nonce); } catch (_) { nonceValue = null; }
          if (nonceValue === null) {
            debug('submitScore: V2 requires nonce but none was provided; aborting');
            throw new Error('Missing nonce for V2 signature');
          }
          // Use full function signature to avoid ambiguity with V1
          callData = contractInterface.encodeFunctionData("submitScore(address,uint256,uint256,uint256,bytes)", [
            state.address,
            scoreValue,
            deadlineValue,
            nonceValue,
            signature
          ]);
          debug(`submitScore: Call data encoded (V2) - score=${scoreValue.toString()}, nonce=${nonceValue.toString()}`);
        } else {
          // Use full function signature to avoid ambiguity with V2
          callData = contractInterface.encodeFunctionData("submitScore(address,uint256,uint256,bytes)", [
            state.address,
            scoreValue,
            deadlineValue,
            signature
          ]);
          debug(`submitScore: Call data encoded (V1) - score=${scoreValue.toString()}`);
        }
        
        // SPONSORLESS MODE: Paymaster is disabled, user pays gas fee
        // This is the desired behavior: users pay gas fee with ETH (Base Mainnet) or Test ETH (Base Sepolia)
        // Paymaster integration will be added later
        debug('submitScore: Submitting transaction WITHOUT paymaster (sponsorless mode - user pays gas fee)');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score:submission:sponsorless', meta: { score: scoreValue.toString(), address: state.address, chainId: config.chainId } }) }).catch(()=>{});} catch(_) {}

        // For mini-app environments (Farcaster/Base App), use wallet_sendCalls without paymaster
        if (isMiniAppEnv()) {
          debug("submitScore: Mini-app environment detected - using wallet_sendCalls without paymaster");
          try {
            if (!state.provider || typeof state.provider.request !== "function") {
              debug('submitScore: No provider available for wallet_sendCalls');
              throw new Error("No provider available");
            }
            
            // Send transaction without paymaster (user pays gas)
            const result = await sendCalls(callData, null); // null = no paymaster
            if (result) {
              let identifier = null;
              if (typeof result === "string") {
                identifier = result;
              } else if (typeof result === "object") {
                if (typeof result.id === "string") {
                  identifier = result.id;
                } else if (typeof result.hash === "string") {
                  identifier = result.hash;
                }
              }
              if (identifier) {
                debug(`submitScore: Transaction submitted via wallet_sendCalls (sponsorless - user pays gas) (id: ${identifier})`);
                console.log(`[BaseMan] Score submission transaction started: ${identifier}`);
                try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score:submitted:sponsorless', meta: { identifier, score: scoreValue.toString(), address: state.address, chainId: config.chainId } }) }).catch(()=>{});} catch(_) {}
                
                // Optionally check transaction status after a delay
                if (typeof result === "object" && typeof result.id === "string") {
                  setTimeout(() => {
                    if (!state.provider || typeof state.provider.request !== "function") return;
                    state.provider
                      .request({
                        method: "wallet_getCallsStatus",
                        params: [result.id]
                      })
                      .then((status) => {
                        debug(`submitScore: wallet_getCallsStatus response: ${status ? JSON.stringify(status) : "empty response"}`);
                        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score:transaction:status', meta: { id: result.id, status } }) }).catch(()=>{});} catch(_) {}
                      })
                      .catch((statusError) => {
                        debug(`submitScore: wallet_getCallsStatus error: ${statusError?.message || statusError}`);
                      });
                  }, 3000);
                }
                return;
              } else {
                debug('submitScore: wallet_sendCalls returned result but no identifier found');
                throw new Error("Transaction submitted but no identifier returned");
              }
            } else {
              debug('submitScore: wallet_sendCalls returned null/undefined');
              throw new Error("Transaction submission returned no result");
            }
          } catch (sendCallsError) {
            const errorMsg = sendCallsError?.message || String(sendCallsError);
            debug(`submitScore: wallet_sendCalls failed: ${errorMsg}`);
            console.error('[BaseMan] Score submission failed:', sendCallsError);
            try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score:submission:error', meta: { error: errorMsg, score: scoreValue.toString(), address: state.address } }) }).catch(()=>{});} catch(_) {}
            throw new Error(`Failed to submit score: ${errorMsg}`);
          }
        }
        
        // For web/EOA environments (non-mini-app), this should not happen
        // Mini-app environments are required for BaseMan
        debug('submitScore: Non-mini-app environment detected - this should not happen in BaseMan');
        throw new Error("Mini-app environment required. BaseMan only works in Farcaster or Base App mini-app environments.");
      } catch (error) {
        const errorMsg = error?.message || String(error);
        debug(`submitScore ERROR: ${errorMsg}`);
        console.error('[BaseMan] submitScore failed:', error);
        
        // Log detailed error information
        try { 
          fetch('/api/app-log', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
              event: 'score:submission:error', 
              meta: { 
                error: errorMsg,
                score: score?.toString() || 'unknown',
                address: state.address || 'unknown',
                stack: error?.stack || null
              } 
            }) 
          }).catch(()=>{});
        } catch(_) {}
        
        // TODO: Show user-friendly error message (future improvement)
        // For now, errors are only logged to console and debug overlay
      } finally {
        state.submitting = false;
        state.runStartedAt = null;
        debug('submitScore: Finished (submitting flag cleared)');
      }
    }

    async function completeQuest(questId) {
      if (state.submitting) return;
      try {
        state.submitting = true;
        // Request accounts if needed (may prompt passkey, but user initiated transaction)
        await ensureWallet(true);
        if (!state.address) {
          throw new Error("Wallet connection required");
        }

        const { signature, deadline, questId: signedQuestId, nonce } = await requestQuestSignature(
          questId
        );

        const qid = signedQuestId ? BigInt(signedQuestId) : BigInt(questId);
        const deadlineValue = BigInt(deadline);

        let paymasterHandled = false;
        const contractInterface = state.contract && state.contract.interface;
        if (contractInterface && typeof contractInterface.encodeFunctionData === "function") {
          const eip712v = (window.__ENV && (String(window.__ENV.NEXT_PUBLIC_REGISTRY_EIP712_VERSION || '').trim() || String(window.__ENV.REGISTRY_EIP712_VERSION || '').trim())) || '';
          const isV2 = (eip712v === '2' || eip712v === '');
          let callData;
          if (isV2) {
            let nonceValue = null;
            try { nonceValue = BigInt(nonce); } catch (_) { nonceValue = null; }
            if (nonceValue === null) {
              debug('V2 requires nonce for quest but none was provided; aborting');
              throw new Error('Missing nonce for V2 quest signature');
            }
            // Use full function signature to avoid ambiguity with V1
            callData = contractInterface.encodeFunctionData("completeQuest(address,uint256,uint256,uint256,bytes)", [
              state.address,
              qid,
              deadlineValue,
              nonceValue,
              signature
            ]);
          } else {
            // Use full function signature to avoid ambiguity with V2
            callData = contractInterface.encodeFunctionData("completeQuest(address,uint256,uint256,bytes)", [
              state.address,
              qid,
              deadlineValue,
              signature
            ]);
          }
          
          // SPONSORLESS MODE: Paymaster disabled, user pays gas fee
          debug('completeQuest: Submitting transaction WITHOUT paymaster (sponsorless mode - user pays gas fee)');
          if (isMiniAppEnv()) {
            try {
              if (!state.provider || typeof state.provider.request !== "function") {
                throw new Error("No provider available");
              }
              const result = await sendCalls(callData, null); // null = no paymaster
              if (result) {
                let identifier = null;
                if (typeof result === "string") {
                  identifier = result;
                } else if (typeof result === "object") {
                  if (typeof result.id === "string") {
                    identifier = result.id;
                  } else if (typeof result.hash === "string") {
                    identifier = result.hash;
                  }
                }
                if (identifier) {
                  debug(`completeQuest: Transaction submitted via wallet_sendCalls (sponsorless - user pays gas) (id: ${identifier})`);
                  console.log(`[BaseMan] Quest completion transaction started: ${identifier}`);
                  return;
                }
              }
            } catch (questError) {
              debug(`completeQuest: Transaction failed: ${questError?.message || questError}`);
              throw questError;
            }
          } else {
            throw new Error("Mini-app environment required for quest completion");
          }
          return;
        }

        // Legacy fallback (should not be reached)
        if (!isMiniAppEnv() && state.contract && typeof state.contract.completeQuest === 'function') {
        let eip712v2 = (window.__ENV && (String(window.__ENV.NEXT_PUBLIC_REGISTRY_EIP712_VERSION || '').trim() || String(window.__ENV.REGISTRY_EIP712_VERSION || '').trim()));
        eip712v2 = (eip712v2 === '2' || eip712v2 === '' || eip712v2 == null);
        if (!eip712v2) {
          try {
            if (state.contract && typeof state.contract.eip712Version === 'function') {
              const v = await state.contract.eip712Version();
              eip712v2 = (typeof v === 'string' && v.trim() === '2');
              if (eip712v2) debug('Detected EIP-712 version from contract for quest: 2');
            }
          } catch (detectErr) {
            debug(`EIP-712 version autodetect (quest) failed: ${detectErr?.message || detectErr}`);
          }
        }
        let tx;
        if (eip712v2) {
          let nonceValue = null;
          try { nonceValue = BigInt(nonce); } catch (_) { nonceValue = null; }
          if (nonceValue === null) throw new Error('Missing nonce for V2 quest signature');
          tx = await state.contract.completeQuest(state.address, qid, deadlineValue, nonceValue, signature);
        } else {
          tx = await state.contract.completeQuest(state.address, qid, deadlineValue, signature);
        }
        debug(`completeQuest tx: ${tx.hash}`);
        } else {
          debug('Skipping EOA quest fallback path (mini-app or no Contract instance)');
        }
      } catch (error) {
        debug(`completeQuest error: ${error?.message || error}`);
      } finally {
        state.submitting = false;
      }
    }

    function handleRunStart() {
      state.runStartedAt = performance.now();
      debug("Game start detected");
    }

    function patchStateHooks(attempt = 0) {
      debug(`patchStateHooks: Attempt ${attempt + 1}`);
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:attempt', meta: { attempt: attempt + 1 } }) }).catch(()=>{});} catch(_) {}

      const ensureRunStart = () => {
        if (state.runStartedAt === null) {
          handleRunStart();
        }
      };

        const patchInit = (target, flagKey, hook, label) => {
        if (!target) {
          debug(`${label}: State not available yet`);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:missing', meta: { label } }) }).catch(()=>{});} catch(_) {}
          return false;
        }
        if (!target.init) {
          debug(`${label}: init method not available`);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:no-init', meta: { label } }) }).catch(()=>{});} catch(_) {}
          return false;
        }
        if (target[flagKey]) {
          debug(`${label}: Already patched`);
          return true;
        }
        const original = target.init.bind(target);
        target.init = function patchedInit(...args) {
          debug(`${label}: init called (patched)`);
          console.log(`[BaseMan] ${label}: init called (patched)`);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'state:init:called', meta: { label, timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
          
          // Execute hook BEFORE original init (important for submitScore)
          try {
            debug(`${label}: Executing hook BEFORE original init...`);
            console.log(`[BaseMan] ${label}: Executing hook...`);
            const hookResult = hook?.apply(this, args);
            debug(`${label}: hook executed successfully, result:`, hookResult);
            console.log(`[BaseMan] ${label}: hook executed successfully`);
            try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'state:init:hook:success', meta: { label, timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
          } catch (error) {
            const errorMsg = error?.message || String(error);
            debug(`${label} hook error: ${errorMsg}`);
            console.error(`[BaseMan] ${label} hook error:`, error);
            try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'state:init:hook:error', meta: { label, error: errorMsg, stack: error?.stack, timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
            // Don't throw - continue with original init even if hook fails
          }
          
          // Execute original init AFTER hook
          debug(`${label}: Executing original init...`);
          try {
            const originalResult = original(...args);
            debug(`${label}: original init executed, result:`, originalResult);
            return originalResult;
          } catch (originalError) {
            debug(`${label}: original init error: ${originalError?.message || originalError}`);
            console.error(`[BaseMan] ${label}: original init error:`, originalError);
            throw originalError;
          }
        };
        target[flagKey] = true;
        debug(`${label} patched successfully`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:patched', meta: { label } }) }).catch(()=>{});} catch(_) {}
        return true;
      };

      const results = {
        newGameState: patchInit(window.newGameState, "_patchedForOnchain", handleRunStart, "newGameState.init"),
        readyState: patchInit(window.readyState, "_patchedForOnchainReady", ensureRunStart, "readyState.init"),
        readyNewState: patchInit(window.readyNewState, "_patchedForOnchainReadyNew", ensureRunStart, "readyNewState.init"),
        readyRestartState: patchInit(window.readyRestartState, "_patchedForOnchainReadyRestart", ensureRunStart, "readyRestartState.init"),
        overState: patchInit(window.overState, "_patchedForOnchain", submitScore, "overState.init"),
        finishState: patchInit(window.finishState, "_patchedForOnchainFinish", submitScore, "finishState.init"),
      };

      const allPatched = Object.values(results).every(r => r === true);
      
      if (allPatched) {
        debug('patchStateHooks: All states patched successfully');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:success', meta: { attempt: attempt + 1 } }) }).catch(()=>{});} catch(_) {}
      } else {
        const missing = Object.entries(results).filter(([_, patched]) => !patched).map(([name, _]) => name);
        debug(`patchStateHooks: Some states not patched yet: ${missing.join(', ')}`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:partial', meta: { attempt: attempt + 1, missing } }) }).catch(()=>{});} catch(_) {}
        
        if (attempt < 20) { // Increased from 10 to 20 attempts
          setTimeout(() => patchStateHooks(attempt + 1), 500); // Increased from 250ms to 500ms
        } else {
          debug('patchStateHooks: Max attempts reached, some states may not be patched');
          console.warn('[BaseMan] patchStateHooks: Max attempts reached. Missing states:', missing);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:max-attempts', meta: { missing } }) }).catch(()=>{});} catch(_) {}
        }
      }
    }

    // Try to patch game states after they are loaded
    // pacman.js loads in <head> and initializes states on window load event
    // We need to wait for that to complete before patching
    
    function schedulePatchStateHooks() {
      // Try immediately (states might already be available)
      patchStateHooks();
      
      // Also try after a delay to ensure states are loaded
      setTimeout(() => patchStateHooks(), 100);
      setTimeout(() => patchStateHooks(), 500);
      setTimeout(() => patchStateHooks(), 1000);
      setTimeout(() => patchStateHooks(), 2000);
      setTimeout(() => patchStateHooks(), 3000);
    }
    
    // If window is already loaded, schedule immediately
    if (document.readyState === 'complete') {
      // Window load event already fired
      schedulePatchStateHooks();
    } else if (document.readyState === 'interactive') {
      // DOM is ready but resources might still be loading
      schedulePatchStateHooks();
      // Also wait for load event
      window.addEventListener('load', () => {
        setTimeout(() => patchStateHooks(), 500);
        setTimeout(() => patchStateHooks(), 1000);
        setTimeout(() => patchStateHooks(), 2000);
      }, { once: true });
    } else {
      // Wait for DOMContentLoaded first
      document.addEventListener('DOMContentLoaded', () => {
        schedulePatchStateHooks();
      }, { once: true });
      
      // Then wait for window load event (when pacman.js initializes states)
      window.addEventListener('load', () => {
        debug('Window load event fired - scheduling patchStateHooks');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'window:load', meta: { timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        // Try multiple times with increasing delays
        setTimeout(() => patchStateHooks(), 100);
        setTimeout(() => patchStateHooks(), 500);
        setTimeout(() => patchStateHooks(), 1000);
        setTimeout(() => patchStateHooks(), 2000);
        setTimeout(() => patchStateHooks(), 3000);
      }, { once: true });
    }

    window.BaseManOnchain = {
      ensureWallet,
      setNetwork: reconfigureNetwork,
      submitScore,
      completeQuest,
      handleRunStart,
      log: debug,
      isWalletReady: () => state.walletReady,
      getWalletError: () => state.walletError,
      getWalletAddress: () => state.address
    };

    // In mini app environments, prepare wallet in background (but don't request accounts to avoid passkey prompts).
    // Wallet will be fully connected on first on‑chain action (submitScore/completeQuest) or when user opens profile panel.
    // Menu buttons work regardless of wallet status - wallet is only needed for on-chain interactions.
    if (isMiniAppEnv()) {
      // Background wallet preparation: try to get provider but don't request accounts yet
      (async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for SDK to be fully ready
          if (sdk && sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function' && !state.contract) {
            try {
              const provider = await sdk.wallet.getEthereumProvider();
              if (provider) {
                // Try to get accounts without requesting (read-only check)
                try {
                  const accounts = await provider.request({ method: 'eth_accounts' });
                  if (Array.isArray(accounts) && accounts.length > 0) {
                    // Accounts already available - connect immediately
                    await ensureWallet();
                  }
                } catch (_) {
                  // eth_accounts not available or failed - wallet will be connected on first use
                  debug('Wallet will be connected on first on-chain action');
                }
              }
            } catch (_) {
              // Provider not available yet - will be connected on first use
            }
          }
        } catch (err) {
          debug(`Background wallet preparation: ${err?.message || err}`);
        }
      })();
    }
  }

  function createDebugOverlay() {
    // Disabled by default. Enable only if NEXT_PUBLIC_DEBUG_OVERLAY=1 or ?debug present.
    try {
      const enabledByEnv =
        (window.__ENV && String(window.__ENV.NEXT_PUBLIC_DEBUG_OVERLAY) === '1') ||
        new URLSearchParams(window.location.search).has('debug');
      if (!enabledByEnv) {
        return function () {};
      }
    } catch (_) {
      // no-op
      return function () {};
    }
    const containerId = "baseman-debug";
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.left = "8px";
    container.style.right = "8px";
    container.style.bottom = "8px";
    container.style.maxHeight = "45vh";
    container.style.overflowY = "auto";
    container.style.background = "rgba(0, 0, 0, 0.75)";
    container.style.color = "#0f0";
    container.style.font = "12px monospace";
    container.style.padding = "6px";
    container.style.zIndex = "9999";
    container.style.pointerEvents = "none";
    container.style.whiteSpace = "pre-wrap";
    container.style.display = "none";

    const buffer = [];
    const flush = () => {
      if (container.parentElement || !document.body) return;
      document.body.appendChild(container);
      if (buffer.length) {
        container.textContent = buffer.join("\n") + "\n";
        container.style.display = "block";
        buffer.length = 0;
      }
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      flush();
    } else {
      document.addEventListener("DOMContentLoaded", flush, { once: true });
    }

    return (message) => {
      const entry = `[${new Date().toISOString().split("T")[1].split(".")[0]}] ${message}`;
      if (container.parentElement && document.body) {
        container.style.display = "block";
        container.textContent += entry + "\n";
      } else {
        buffer.push(entry);
        flush();
      }
    };
  }

  tryInitialize();
})();

    
