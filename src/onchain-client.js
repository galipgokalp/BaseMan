(function () {
  // Increase attempts for mobile environments where SDK may load slower
  const MAX_ATTEMPTS = 500; // ~100s at 200ms (increased for mobile)
  const POLL_DELAY_MS = 200;
  let attempts = 0;

  const debug = createDebugOverlay();
  
  // Use BaseManLogger if available (from utils/logger.js), else fallback to console
  const _getLog = () => {
    if (typeof window !== 'undefined' && window.BaseManCreateLogger) {
      return window.BaseManCreateLogger('Onchain');
    }
    if (typeof window !== 'undefined' && window.BaseManLogger) {
      return window.BaseManLogger;
    }
    // Fallback to console wrapper
    return {
      debug: (...args) => console.debug('[Onchain]', ...args),
      log: (...args) => console.log('[Onchain]', ...args),
      info: (...args) => console.info('[Onchain]', ...args),
      warn: (...args) => console.warn('[Onchain]', ...args),
      error: (...args) => console.error('[Onchain]', ...args),
      warnOnce: (key, ...args) => console.warn('[Onchain]', ...args),
      errorOnce: (key, ...args) => console.error('[Onchain]', ...args)
    };
  };
  let _log = null;
  const log = () => {
    if (!_log) _log = _getLog();
    return _log;
  };
  log().debug("onchain-client bootstrap");

  // Best-effort: prefetch mini app auth token once at startup to minimize delays during score submit
  (async () => {
    try {
      const t = await getMiniAppAuthToken();
      if (t) {
        debug('Mini app auth token prefetched');
      }
    } catch (_) {}
  })();

  function showFailure(message) {
    debug(`HATA: ${message}`);
    if (typeof window.__showModuleFailure === "function") {
      window.__showModuleFailure(message);
    } else {
      log().error(message);
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
            try {
              await sdk.actions.ready({ disableNativeGestures: true });
              debug("sdk.actions.ready() called successfully");
              // Dispatch event to signal that SDK is ready and splash screen is hidden
              try {
                window.__basemanSDKReadyFired = true;
                window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk } }));
              } catch (eventError) {
                debug(`Failed to dispatch sdk-ready event: ${eventError?.message || eventError}`);
              }
            } catch (readyError) {
              // Handle SDK ready errors gracefully
              const errorMsg = readyError?.message || String(readyError);
              const isRequestError = errorMsg.includes('Request failed') || 
                                    readyError?.name === 'RequestFailedError' ||
                                    readyError?.status === 400;
              
              if (isRequestError) {
                debug(`SDK ready request failed (non-critical): ${errorMsg}`);
                // Log but don't block - allow game to continue
                log().error(`SDK ready request failed: ${errorMsg}`, readyError);
              } else {
                debug(`Error calling sdk.actions.ready: ${errorMsg}`);
                throw readyError; // Re-throw non-request errors
              }
              
              // Still dispatch event even if ready failed (for non-critical errors)
              try {
                window.__basemanSDKReadyFired = true;
                window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail: { sdk, error: errorMsg } }));
              } catch (eventError) {}
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
        const result = window.isMiniAppEnv();
        if (result) {
          debug('isMiniAppEnv: Detected via centralized utility');
          return result;
        }
      }
      
      // Priority 2: Check for SDK presence (more reliable indicator)
      if (typeof window !== 'undefined') {
        // Check for Farcaster SDK
        if (window.fc && window.fc.miniapp) {
          debug('isMiniAppEnv: Detected Farcaster SDK');
          return true;
        }
        if (window.farcaster && window.farcaster.miniapp) {
          debug('isMiniAppEnv: Detected Farcaster SDK (alternative)');
          return true;
        }
        
        // Check for Base App SDK
        if (window.MiniKit) {
          debug('isMiniAppEnv: Detected Base App SDK (MiniKit)');
          return true;
        }
        
        // Check for ReactNative WebView (Base App indicator)
        if (window.ReactNativeWebView) {
          debug('isMiniAppEnv: Detected ReactNativeWebView (Base App)');
          return true;
        }
        
        // Check for generic SDK indicators
        if (window.MiniAppSDK || window.FarcasterMiniAppSDK || (window.sdk && window.sdk.wallet)) {
          debug('isMiniAppEnv: Detected generic SDK');
          return true;
        }
        
        // Check user agent as last resort
        if (window.navigator && window.navigator.userAgent) {
          const ua = window.navigator.userAgent;
          if ((ua.includes('Farcaster') || ua.includes('Warpcast') || ua.includes('BaseApp')) && 
              !ua.includes('Chrome') && !ua.includes('Safari') && !ua.includes('Firefox')) {
            debug('isMiniAppEnv: Detected via user agent');
            return true;
          }
        }
      }
      
      debug('isMiniAppEnv: No mini app environment detected');
      return false;
    } catch (error) {
      debug(`isMiniAppEnv error: ${error?.message || error}`);
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

      // Check if SDK is available (more reliable than isMiniAppEnv for some cases)
      const hasSDK = sdk && sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function';
      const isMiniApp = isMiniAppEnv() || hasSDK; // Use SDK presence as fallback
      
      if (isMiniApp) {
        if (hasSDK && !isMiniAppEnv()) {
          debug('ensureWallet: SDK detected but isMiniAppEnv() returned false - using SDK anyway');
        }
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
          
          let provider;
          try {
            provider = await sdk.wallet.getEthereumProvider();
            if (!provider) throw new Error("Ethereum provider not available.");
            debug("sdk.wallet.getEthereumProvider() returned successfully");
          } catch (providerError) {
            const errorMsg = providerError?.message || String(providerError);
            const isRequestError = errorMsg.includes('Request failed') || 
                                  providerError?.name === 'RequestFailedError' ||
                                  providerError?.status === 400;
            
            if (isRequestError) {
              debug(`SDK getEthereumProvider request failed: ${errorMsg}`);
              // Log error but try to continue with fallback
              log().error(`SDK getEthereumProvider request failed: ${errorMsg}`, providerError);
              throw new Error(`Failed to get Ethereum provider: ${errorMsg}`);
            } else {
              throw providerError; // Re-throw non-request errors
            }
          }
          
          // Mini‑app providers may not support wallet_switchEthereumChain; skip enforcing switch

          // Detect Base App specifically
          const isBaseAppDetected = (() => {
            try {
              if (typeof window !== 'undefined' && typeof window.isBaseApp === 'function') {
                return window.isBaseApp();
              }
              return Boolean(window.MiniKit || window.ReactNativeWebView);
            } catch (_) {
              return false;
            }
          })();

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
          
          // In mini app environments, only call eth_requestAccounts when explicitly requested (tx initiation).
          // Base App bağlanmış olsa da, açılışta passkey istememek için requestAccounts=false iken istek yapma.
          const isMiniAppCheck = isMiniAppEnv() || hasSDK;
          if (!address && isMiniAppCheck) {
            // Sadece işlem akışında passkey tetikle
            if (requestAccounts) {
              try {
                debug("Transaction initiated - requesting account access (may prompt passkey)...");
                log().debug('Requesting wallet connection for transaction...');
                // Add timeout to prevent hanging
                const requestPromise = provider.request({ method: 'eth_requestAccounts' });
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Wallet connection request timed out after 30 seconds')), 30000)
                );
                const req = await Promise.race([requestPromise, timeoutPromise]);
                if (Array.isArray(req) && req.length) {
                  address = req[0];
                  debug(`Account access granted for transaction: ${address}`);
                  log().debug(`Wallet connected: ${address}`);
                } else {
                  throw new Error('No accounts returned from eth_requestAccounts');
                }
              } catch (reqErr) {
                // Handle different error formats SAFELY
                let errMsg = '';
                try {
                  if (reqErr && typeof reqErr === 'object') {
                    // Try message first
                    if (reqErr.message) {
                      errMsg = String(reqErr.message);
                    } 
                    // Try error object safely
                    else if (reqErr.error) {
                      if (typeof reqErr.error === 'object') {
                        errMsg = reqErr.error.message || String(reqErr.error);
                      } else {
                        errMsg = String(reqErr.error);
                      }
                    }
                    // Try code
                    else if (reqErr.code !== undefined) {
                      errMsg = `Error ${reqErr.code}`;
                    }
                    // Fallback to string conversion
                    else {
                      errMsg = String(reqErr);
                    }
                  } else {
                    errMsg = String(reqErr);
                  }
                } catch (parseError) {
                  // If parsing fails, use a safe fallback
                  errMsg = `Wallet connection error: ${String(reqErr)}`;
                  debug(`Error parsing reqErr: ${parseError?.message || parseError}`);
                }
                
                debug(`eth_requestAccounts error during transaction: ${errMsg}`);
                log().error(`Wallet connection failed: ${errMsg}`, reqErr);
                
                // User might have rejected the request - this is OK, don't throw error
                if (errMsg && (errMsg.includes('reject') || errMsg.includes('denied') || errMsg.includes('User rejected') || errMsg.includes('User cancelled'))) {
                  throw new Error('User rejected wallet connection');
                }
                
                // For other errors, provide more context
                if (errMsg && errMsg.includes('timeout')) {
                  throw new Error('Wallet connection timed out. Please try again.');
                }
                
                throw new Error(`Failed to connect wallet: ${errMsg || 'Unknown error'}`);
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
              // Handle different error formats SAFELY
              let errMsg = '';
              try {
                if (reqErr && typeof reqErr === 'object') {
                  // Try message first
                  if (reqErr.message) {
                    errMsg = String(reqErr.message);
                  } 
                  // Try error object safely
                  else if (reqErr.error) {
                    if (typeof reqErr.error === 'object') {
                      errMsg = reqErr.error.message || String(reqErr.error);
                    } else {
                      errMsg = String(reqErr.error);
                    }
                  }
                  // Try code
                  else if (reqErr.code !== undefined) {
                    errMsg = `Error ${reqErr.code}`;
                  }
                  // Fallback to string conversion
                  else {
                    errMsg = String(reqErr);
                  }
                } else {
                  errMsg = String(reqErr);
                }
              } catch (parseError) {
                // If parsing fails, use a safe fallback
                errMsg = `Wallet connection error: ${String(reqErr)}`;
                debug(`Error parsing reqErr (web mode): ${parseError?.message || parseError}`);
              }
              
              debug(`eth_requestAccounts error: ${errMsg}`);
              
              // User might have rejected the request
              if (errMsg && (errMsg.includes('reject') || errMsg.includes('denied') || errMsg.includes('User rejected') || errMsg.includes('User cancelled'))) {
                throw new Error('User rejected wallet connection');
              }
              
              // Web mode detection - if not in mini app, provide helpful message
              if (!isMiniAppEnv() && errMsg && (errMsg.includes('Cannot read properties of undefined') || errMsg.includes('undefined'))) {
                throw new Error('Wallet not available in web mode. Please use Farcaster or Base App mobile app.');
              }
              
              throw new Error(`Failed to request accounts: ${errMsg || 'Unknown error'}`);
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
        // QuickAuth token varsa ekle (profil için), yoksa isteği engelleme
          const t = await getMiniAppAuthToken();
        if (t) {
          headers['Authorization'] = `Bearer ${t}`;
          headers['X-MiniApp-Auth-Token'] = t;
        }
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
        log().error('wallet_sendCalls failed:', error);
        
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
                address: state.address || null, // Add address for filtering
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
      log().debug('submitScore: Function called - START');
      try { 
        fetch('/api/app-log', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            event: 'submitScore:called', 
            meta: { 
              timestamp: new Date().toISOString(), 
              stack: new Error().stack,
              userAgent: navigator.userAgent,
              url: window.location.href,
              isMiniApp: isMiniAppEnv(),
              hasSDK: !!(sdk && sdk.wallet),
              address: state.address || null, // Use 'address' for consistent filtering
              stateAddress: state.address || null // Keep for backward compatibility
            } 
          }) 
        }).catch(()=>{});
      } catch(_) {}

      // Check if already submitting
      if (state.submitting) {
        debug('submitScore: Already submitting, skipping');
        log().debug('submitScore: Already submitting, skipping');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:already-submitting', meta: { timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        return;
      }
      
      // Check if getScore function is available
      if (typeof window.getScore !== "function") {
        debug('submitScore: getScore function not available');
        log().warn(' submitScore: getScore function not available');
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
        log().error(' submitScore: Error getting score:', scoreError);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:getScore-error', meta: { error: scoreError?.message || String(scoreError) } }) }).catch(()=>{});} catch(_) {}
        return;
      }
      
      if (score <= 0n) {
        debug(`submitScore: Score is 0 or negative (${score.toString()}), skipping`);
        log().debug(`submitScore: Score is 0 or negative (${score.toString()}), skipping`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:score-zero', meta: { score: score.toString(), timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        return;
      }

      const durationMs =
        state.runStartedAt !== null
          ? Math.max(0, Math.floor(performance.now() - state.runStartedAt))
          : 0;

      debug(`submitScore: Starting submission - score=${score.toString()}, duration=${durationMs}ms`);
      log().debug(`submitScore: Starting submission - score=${score.toString()}, duration=${durationMs}ms`);
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:starting', meta: { score: score.toString(), durationMs } }) }).catch(()=>{});} catch(_) {}

      try {
        state.submitting = true;

        // Request accounts if needed (may prompt passkey, but user initiated transaction)
        // For Base App users, always request accounts to ensure wallet connection
        debug('submitScore: Ensuring wallet connection...');
        log().debug(' submitScore: Ensuring wallet connection for score submission...');
        try {
          await ensureWallet(true); // Always request accounts for transaction
        } catch (walletError) {
          const walletErrorMsg = walletError?.message || String(walletError);
          debug(`submitScore: Wallet connection failed: ${walletErrorMsg}`);
          log().error(`submitScore: Wallet connection failed: ${walletErrorMsg}`);
          
          // If wallet connection fails, provide helpful error message
          if (walletErrorMsg.includes('reject') || walletErrorMsg.includes('denied') || walletErrorMsg.includes('User rejected')) {
            throw new Error('Wallet connection was rejected. Please approve the connection request to submit your score.');
          }
          throw new Error(`Failed to connect wallet: ${walletErrorMsg}`);
        }
        
        if (!state.address) {
          const errorMsg = "Wallet connection required - no address available";
          debug(`submitScore: ${errorMsg}`);
          log().error(`submitScore: ${errorMsg}`);
          throw new Error(errorMsg);
        }
        debug(`submitScore: Wallet connected - address=${state.address}`);
        log().debug(`submitScore: Wallet connected successfully - address=${state.address}`);

        // Send profile mapping to backend for leaderboard enrichment
        // This ensures user profile data is available for other users viewing the leaderboard
        try {
          if (window.sdk && window.sdk.context && state.address) {
            const context = await window.sdk.context;
            const user = context?.user;
            if (user && user.fid) {
              // OFFICIAL METHOD: Detect platform using clientFid (per Base App docs)
              // Base App clientFid is 309857, Farcaster clientFid is typically 9152 (Warpcast)
              let platform = null;
              
              // Check clientFid (OFFICIAL METHOD per Base App documentation)
              if (context?.client?.clientFid === 309857) {
                debug('submitScore: ✅ Base App detected via clientFid (309857) - OFFICIAL METHOD');
                platform = 'base-app';
              } else if (context?.client?.clientFid) {
                // If clientFid exists but is not 309857, it's Farcaster
                debug(`submitScore: ✅ Farcaster detected via clientFid (${context.client.clientFid}) - OFFICIAL METHOD`);
                platform = 'farcaster';
              }
              
              // If clientFid not available, use centralized utility (which also uses clientFid)
              if (!platform) {
                try {
                  if (typeof window.getPlatform === 'function') {
                    platform = await window.getPlatform();
                    // Convert 'base' to 'base-app' for consistency
                    if (platform === 'base') {
                      platform = 'base-app';
                    }
                    debug(`submitScore: Platform detected via centralized utility: ${platform}`);
                  } else {
                    debug('submitScore: getPlatform() not available, platform will be null');
                  }
                } catch (err) {
                  debug(`submitScore: Error using centralized platform detection: ${err?.message || err}`);
                }
              }
              
              debug(`submitScore: Detected platform: ${platform || 'unknown'}`);
              
              // CRITICAL: Platform bilgisi olmadan skor gönderilmemeli
              // Çünkü leaderboard'da her kullanıcının yanında, o kullanıcının skorunu gönderdiği platformun logosu görünmeli
              if (!platform) {
                log().warn(' submitScore: ⚠️ Platform detection failed - profile mapping will be saved without platform info');
                log().warn(' submitScore: Platform detection details:', {
                  hasGetPlatform: typeof window.getPlatform === 'function',
                  hasIsFarcasterMiniApp: typeof window.isFarcasterMiniApp === 'function',
                  hasIsBaseApp: typeof window.isBaseApp === 'function',
                  hasMiniKit: !!window.MiniKit,
                  hasFc: !!window.fc?.miniapp,
                  hasFarcaster: !!window.farcaster?.miniapp,
                  hasReactNativeWebView: !!window.ReactNativeWebView,
                  userAgent: window.navigator?.userAgent?.substring(0, 100) || 'unknown'
                });
              } else {
                log().debug(' submitScore: ✅ Platform detected successfully:', platform);
              }
              
              const profileMapping = {
                address: state.address.toLowerCase(),
                fid: user.fid,
                username: user.username || null,
                displayName: user.displayName || null,
                avatarUrl: user.pfpUrl || null,
                platform: platform || null // CRITICAL: Include platform for correct logo display
              };
              
              debug(`submitScore: Sending profile mapping for leaderboard: ${profileMapping.username || profileMapping.displayName || 'unnamed'} (platform: ${platform || 'unknown'})`);
              log().debug(' submitScore: Sending profile mapping for leaderboard enrichment:', {
                address: profileMapping.address.substring(0, 10) + '...',
                fid: profileMapping.fid,
                username: profileMapping.username,
                displayName: profileMapping.displayName,
                platform: profileMapping.platform || '⚠️ NULL - logo will not be displayed'
              });
              
              // Send profile mapping asynchronously, don't block score submission
              fetch('/api/leaderboard?action=profile-mapping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileMapping)
              }).then((response) => {
                if (response.ok) {
                  debug('submitScore: Profile mapping sent successfully');
                  log().debug(' submitScore: ✅ Profile mapping sent successfully for leaderboard enrichment');
                } else {
                  debug(`submitScore: Profile mapping failed with status ${response.status}`);
                  log().warn(' submitScore: Profile mapping failed with status:', response.status);
                }
              }).catch((err) => {
                // Silently fail - profile mapping is not critical for score submission
                debug(`submitScore: Profile mapping failed (non-critical): ${err?.message || err}`);
                log().warn(' submitScore: Profile mapping failed (non-critical):', err?.message || err);
              });
            } else {
              debug('submitScore: Skipping profile mapping - no user FID available');
              log().debug(' submitScore: Skipping profile mapping - no user FID available');
            }
          } else {
            debug('submitScore: Skipping profile mapping - SDK context or address not available');
            log().debug(' submitScore: Skipping profile mapping - SDK context or address not available');
          }
        } catch (profileErr) {
          // Silently fail - profile mapping is not critical for score submission
          debug(`submitScore: Profile mapping error (non-critical): ${profileErr?.message || profileErr}`);
          log().warn(' submitScore: Profile mapping error (non-critical):', profileErr?.message || profileErr);
        }

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
        // Check SDK presence as fallback if isMiniAppEnv() returns false
        // Also check for Base App specifically
        const hasSDK = sdk && sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function';
        const isBaseAppSpecific = (() => {
          try {
            if (typeof window !== 'undefined' && typeof window.isBaseApp === 'function') {
              return window.isBaseApp();
            }
            return Boolean(window.MiniKit || window.ReactNativeWebView);
          } catch (_) {
            return false;
          }
        })();
        const isFarcasterSpecific = (() => {
          try {
            if (typeof window !== 'undefined' && typeof window.isFarcasterMiniApp === 'function') {
              return window.isFarcasterMiniApp();
            }
            return Boolean(window.fc || (window.farcaster && window.farcaster.miniapp));
          } catch (_) {
            return false;
          }
        })();
        const isMiniApp = isMiniAppEnv() || hasSDK || isBaseAppSpecific || isFarcasterSpecific;
        
        if (isMiniApp) {
          if (hasSDK && !isMiniAppEnv()) {
            debug("submitScore: SDK detected but isMiniAppEnv() returned false - using SDK anyway");
          }
          if (isBaseAppSpecific) {
            debug("submitScore: Base App detected - attempting wallet_sendCalls first, will fallback to eth_sendTransaction if unsupported");
          }
          if (isFarcasterSpecific) {
            debug("submitScore: Farcaster detected - using wallet_sendCalls without paymaster");
          }
          debug("submitScore: Mini-app environment detected - attempting wallet_sendCalls without paymaster");
          try {
            if (!state.provider || typeof state.provider.request !== "function") {
              debug('submitScore: No provider available for wallet_sendCalls');
              throw new Error("No provider available");
            }
            
            // Try wallet_sendCalls first (EIP-5792)
            let result = null;
            try {
              debug("submitScore: Attempting wallet_sendCalls (EIP-5792)...");
              result = await sendCalls(callData, null); // null = no paymaster
            } catch (sendCallsError) {
              const sendCallsErrorMsg = sendCallsError?.message || String(sendCallsError);
              const sendCallsErrorCode = sendCallsError?.code || sendCallsError?.error?.code || null;
              
              // Check if error is "unsupported method" - Base App may not support wallet_sendCalls
              if (sendCallsErrorCode === 4200 || sendCallsErrorMsg.includes('UnsupportedMethodError') || sendCallsErrorMsg.includes('does not support the requested method')) {
                debug(`submitScore: wallet_sendCalls not supported (code: ${sendCallsErrorCode}), falling back to eth_sendTransaction`);
                log().warn(`submitScore: wallet_sendCalls not supported, using eth_sendTransaction fallback`);
                
                // Fallback to eth_sendTransaction for Base App
                if (isBaseAppSpecific || !isFarcasterSpecific) {
                  try {
                    debug("submitScore: Using eth_sendTransaction fallback for Base App");
                    result = await sendEthTransaction(callData);
                    if (result) {
                      debug(`submitScore: eth_sendTransaction success: ${JSON.stringify(result)}`);
                      log().debug(`Score submission transaction started via eth_sendTransaction: ${result.hash || result.id}`);
                    }
                  } catch (ethTxError) {
                    const ethTxErrorMsg = ethTxError?.message || String(ethTxError);
                    debug(`submitScore: eth_sendTransaction also failed: ${ethTxErrorMsg}`);
                    throw new Error(`Both wallet_sendCalls and eth_sendTransaction failed: ${ethTxErrorMsg}`);
                  }
                } else {
                  // For Farcaster, re-throw the original error
                  throw sendCallsError;
                }
              } else {
                // For other errors, re-throw
                throw sendCallsError;
              }
            }
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
                log().debug(`Score submission transaction started: ${identifier}`);
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
            log().error(' Score submission failed:', sendCallsError);
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
        log().error(' submitScore failed:', error);
        
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
                address: state.address || null, // Use null instead of 'unknown' for filtering
                stateAddress: state.address || null, // Keep for backward compatibility
                stack: error?.stack || null
              } 
            }) 
          }).catch(()=>{});
        } catch(_) {}
        
        // Show user-friendly error message for critical errors
        // Don't show error if user rejected (that's expected behavior)
        if (!errorMsg.includes('reject') && !errorMsg.includes('denied') && !errorMsg.includes('User rejected')) {
          // Show error in console (already done above)
          // In the future, we could show a toast notification here
          // For now, errors are logged to console and debug overlay
          log().error(`Score submission failed: ${errorMsg}`);
        }
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
                  log().debug(`Quest completion transaction started: ${identifier}`);
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

        const patchInit = (target, flagKey, hook, label, isAsync = false) => {
        if (!target) {
          const errorMsg = `${label}: State not available yet (target is ${typeof target})`;
          debug(errorMsg);
          log().warn(`${errorMsg}`);
          log().warn(`Available window states:`, {
            overState: typeof window.overState,
            finishState: typeof window.finishState,
            newGameState: typeof window.newGameState,
            readyState: typeof window.readyState
          });
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:missing', meta: { label, targetType: typeof target, availableStates: { overState: !!window.overState, finishState: !!window.finishState } } }) }).catch(()=>{});} catch(_) {}
          return false;
        }
        if (!target.init) {
          const errorMsg = `${label}: init method not available (target type: ${typeof target})`;
          debug(errorMsg);
          log().warn(`${errorMsg}`);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:no-init', meta: { label, targetType: typeof target } }) }).catch(()=>{});} catch(_) {}
          return false;
        }
        if (target[flagKey]) {
          debug(`${label}: Already patched`);
          return true;
        }
        
        // Validate hook function exists
        if (!hook || typeof hook !== 'function') {
          const errorMsg = `${label}: Hook function is not available (hook type: ${typeof hook})`;
          debug(errorMsg);
          log().error(`${errorMsg}`);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:no-hook', meta: { label, hookType: typeof hook } }) }).catch(()=>{});} catch(_) {}
          return false;
        }
        const original = target.init.bind(target);
        target.init = function patchedInit(...args) {
          debug(`${label}: init called (patched)`);
          log().debug(`${label}: init called (patched)`);
          try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'state:init:called', meta: { label, timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
          
          // Execute hook BEFORE original init (important for submitScore)
          // Handle async hooks properly
          if (isAsync) {
            // For async hooks, execute asynchronously and don't block original init
            // BUT: Log immediately that we're starting the async hook
            debug(`${label}: Starting async hook BEFORE original init...`);
            log().debug(`${label}: Starting async hook (submitScore)...`);
            try { 
              fetch('/api/app-log', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                  event: 'state:init:hook:start', 
                  meta: { label, timestamp: new Date().toISOString(), stack: new Error().stack } 
                }) 
              }).catch(()=>{});
            } catch(_) {}
            
            // Execute async hook in background
            (async () => {
              try {
                debug(`${label}: Executing async hook (awaiting)...`);
                log().debug(`${label}: Executing async hook (awaiting)...`);
                
                // IMPORTANT: Actually call the hook function and await it
                const hookResult = await hook?.apply(this, args);
                
                debug(`${label}: async hook completed successfully, result:`, hookResult);
                log().debug(`${label}: async hook completed successfully`);
                try { 
                  fetch('/api/app-log', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ 
                      event: 'state:init:hook:success', 
                      meta: { label, timestamp: new Date().toISOString(), result: hookResult ? 'success' : 'no-result' } 
                    }) 
                  }).catch(()=>{});
                } catch(_) {}
          } catch (error) {
                const errorMsg = error?.message || String(error);
                const errorStack = error?.stack || new Error().stack;
                debug(`${label} async hook ERROR: ${errorMsg}`);
                log().error(`${label} async hook ERROR:`, error);
                log().error(`${label} async hook ERROR stack:`, errorStack);
                try { 
                  fetch('/api/app-log', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ 
                      event: 'state:init:hook:error', 
                      meta: { 
                        label, 
                        error: errorMsg, 
                        stack: errorStack, 
                        timestamp: new Date().toISOString(),
                        errorName: error?.name || 'Error',
                        errorCode: error?.code || null
                      } 
                    }) 
                  }).catch(()=>{});
                } catch(_) {}
                // Show user-friendly error message for critical errors
                if (label.includes('overState') || label.includes('finishState')) {
                  // Only show error if it's a wallet connection issue (not user rejection)
                  if (!errorMsg.includes('reject') && !errorMsg.includes('denied') && !errorMsg.includes('User rejected')) {
                    try {
                      // Try to show error in a non-blocking way
                      setTimeout(() => {
                        log().error(`Score submission failed: ${errorMsg}`);
                        // Could show a toast notification here in the future
                      }, 100);
                    } catch (_) {}
                  }
                }
              }
            })();
          } else {
            // For sync hooks, execute synchronously
            try {
              debug(`${label}: Executing hook BEFORE original init...`);
              log().debug(`${label}: Executing hook...`);
              const hookResult = hook?.apply(this, args);
              debug(`${label}: hook executed successfully, result:`, hookResult);
              log().debug(`${label}: hook executed successfully`);
              try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'state:init:hook:success', meta: { label, timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
            } catch (error) {
              const errorMsg = error?.message || String(error);
              debug(`${label} hook error: ${errorMsg}`);
              log().error(`${label} hook error:`, error);
              try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'state:init:hook:error', meta: { label, error: errorMsg, stack: error?.stack, timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
              // Don't throw - continue with original init even if hook fails
            }
          }
          
          // Execute original init AFTER hook (don't wait for async hooks)
          debug(`${label}: Executing original init...`);
          try {
            const originalResult = original(...args);
            debug(`${label}: original init executed, result:`, originalResult);
            return originalResult;
          } catch (originalError) {
            debug(`${label}: original init error: ${originalError?.message || originalError}`);
            log().error(`${label}: original init error:`, originalError);
            throw originalError;
          }
        };
        target[flagKey] = true;
        debug(`${label} patched successfully`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:state:patched', meta: { label } }) }).catch(()=>{});} catch(_) {}
        return true;
      };

      // CRITICAL: Check if states are available before patching
      const stateCheck = {
        newGameState: !!window.newGameState,
        readyState: !!window.readyState,
        readyNewState: !!window.readyNewState,
        readyRestartState: !!window.readyRestartState,
        overState: !!window.overState,
        finishState: !!window.finishState
      };
      
      debug(`patchStateHooks: State availability check:`, stateCheck);
      log().debug(' patchStateHooks: State availability:', stateCheck);
      
      if (!stateCheck.overState || !stateCheck.finishState) {
        const missing = Object.entries(stateCheck).filter(([_, available]) => !available).map(([name]) => name);
        debug(`patchStateHooks: CRITICAL - Missing states: ${missing.join(', ')}`);
        log().warn(`patchStateHooks: CRITICAL - Missing states: ${missing.join(', ')}`);
        log().warn(`window keys containing 'state':`, Object.keys(window).filter(k => k.toLowerCase().includes('state')));
        try { 
          fetch('/api/app-log', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
              event: 'patchStateHooks:critical-missing-states', 
              meta: { 
                attempt: attempt + 1,
                missing,
                available: stateCheck,
                windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('state'))
              } 
            }) 
          }).catch(()=>{});
        } catch(_) {}
      }

      const results = {
        newGameState: patchInit(window.newGameState, "_patchedForOnchainNewGame", handleRunStart, "newGameState.init", false),
        readyState: patchInit(window.readyState, "_patchedForOnchainReady", ensureRunStart, "readyState.init", false),
        readyNewState: patchInit(window.readyNewState, "_patchedForOnchainReadyNew", ensureRunStart, "readyNewState.init", false),
        readyRestartState: patchInit(window.readyRestartState, "_patchedForOnchainReadyRestart", ensureRunStart, "readyRestartState.init", false),
        overState: patchInit(window.overState, "_patchedForOnchainOver", submitScore, "overState.init", true), // async hook - UNIQUE FLAG KEY
        finishState: patchInit(window.finishState, "_patchedForOnchainFinish", submitScore, "finishState.init", true), // async hook
      };

      const allPatched = Object.values(results).every(r => r === true);

      // Log which states were successfully patched for debugging
      const patchedStates = Object.entries(results).filter(([_, patched]) => patched).map(([name]) => name);
      const failedStates = Object.entries(results).filter(([_, patched]) => !patched).map(([name]) => name);

      debug(`patchStateHooks: Results - Patched: [${patchedStates.join(', ')}], Failed: [${failedStates.join(', ')}]`);
      log().debug(`patchStateHooks: Patched states: [${patchedStates.join(', ')}], Failed: [${failedStates.join(', ')}]`);

      if (allPatched) {
        debug('patchStateHooks: All states patched successfully (including overState and finishState for score submission)');
        log().debug('patchStateHooks: ✅ All states patched successfully - score submission hooks active');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:success', meta: { attempt: attempt + 1, patchedStates } }) }).catch(()=>{});} catch(_) {}
      } else {
        const missing = Object.entries(results).filter(([_, patched]) => !patched).map(([name, _]) => name);
        debug(`patchStateHooks: Some states not patched yet: ${missing.join(', ')}`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'patchStateHooks:partial', meta: { attempt: attempt + 1, missing } }) }).catch(()=>{});} catch(_) {}
        
        if (attempt < 20) { // Increased from 10 to 20 attempts
          setTimeout(() => patchStateHooks(attempt + 1), 500); // Increased from 250ms to 500ms
        } else {
          debug('patchStateHooks: Max attempts reached, some states may not be patched');
          log().warn(' patchStateHooks: Max attempts reached. Missing states:', missing);
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

    // Mini app'te açılışta passkey tetiklemeden read-only bağlanmayı dene.
    // Sadece eth_accounts çağrısı yap; hesap varsa ensureWallet(false) ile state'i güncelle.
    if (isMiniAppEnv()) {
      (async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (sdk?.wallet && typeof sdk.wallet.getEthereumProvider === "function" && !state.contract) {
            let provider;
            try {
              provider = await sdk.wallet.getEthereumProvider();
            } catch (providerError) {
              const errorMsg = providerError?.message || String(providerError);
              const isRequestError = errorMsg.includes('Request failed') || 
                                    providerError?.name === 'RequestFailedError' ||
                                    providerError?.status === 400;
              
              if (isRequestError) {
                debug(`Background wallet: SDK getEthereumProvider request failed (non-critical): ${errorMsg}`);
                return; // Silently fail for background check
              } else {
                throw providerError; // Re-throw non-request errors
              }
            }
            if (provider) {
              try {
                const accounts = await provider.request({ method: "eth_accounts" });
                if (Array.isArray(accounts) && accounts.length > 0) {
                  debug("Background wallet: accounts already available, connecting without request");
                  await ensureWallet(false);
                } else {
                  debug("Background wallet: no accounts yet, will connect on first on-chain action");
                }
              } catch (err) {
                debug(`Background wallet eth_accounts failed: ${err?.message || err}`);
              }
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

    
