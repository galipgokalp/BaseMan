import {
  ensureChain as ensureChainUtil,
  getChainKey,
  sendProfileMapping,
  requestScoreSignature as requestScoreSignatureUtil,
  sendCalls as sendCallsUtil,
  sendEthTransaction as sendEthTransactionUtil,
  isUnsupportedMethodError,
  selectSubmissionTransport,
  ensureOnchainPlaceholder,
  bindPublicOnchainApi,
  createEventBridge,
  runSdkReadyLifecycle,
  scheduleBackgroundMiniAppWallet,
  resolveCapabilityUrl,
  getCapabilities,
  isPaymasterSupported,
  scheduleStateHookPatching
} from './onchain/index.js';
import { createLogger } from './utils/logger.js';
import { createDebugOverlay } from './onchain/debug-overlay.js';

// CRITICAL: Export window.BaseManOnchain immediately (before async initialization)
// Base App Mini-App SDK requires this to be available synchronously
ensureOnchainPlaceholder();

(function () {
  // SDK polling with optimized backoff for better mobile performance
  // Fast initial attempts (50ms) for quick SDK detection, then exponential backoff
  const MAX_ATTEMPTS = 50; // Reduced - faster detection with optimized delays
  const INITIAL_DELAY_MS = 50; // Faster initial delay for quick SDK detection
  const FAST_ATTEMPTS = 5; // First 5 attempts are fast (50ms each)
  const MAX_DELAY_MS = 2000;
  let attempts = 0;
  let currentDelay = INITIAL_DELAY_MS;

  const debug = createDebugOverlay();
  
  // Use logger from utils/logger.js
  const log = createLogger('UtilOnchainClient');
  log.debug("onchain-client bootstrap");

  async function safeProviderRequest(provider, params, fallback = null) {
    if (!provider || typeof provider.request !== 'function') return fallback;
    try {
      return await provider.request(params);
    } catch (error) {
      log.error('rpc-failed', { method: params?.method || 'unknown', reason: error?.message || error });
      return fallback;
    }
  }

  function showFailure(message) {
    debug(`HATA: ${message}`);
    if (typeof window.__showModuleFailure === "function") {
      window.__showModuleFailure(message);
    } else {
      log.error(message);
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
      const _maxWait = 500; // 500ms max wait
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
      const isFarcaster = (() => {
        try {
          if (typeof window === 'undefined') return false;
          if (typeof window.isFarcasterMiniAppSync === 'function') {
            return window.isFarcasterMiniAppSync();
          }
          if (typeof window.isFarcasterMiniApp === 'function') {
            const detected = window.isFarcasterMiniApp();
            return typeof detected === 'boolean' ? detected : false;
          }
          return false;
        } catch (_) {
          return false;
        }
      })();
      const isBase = (() => {
        try {
          if (typeof window === 'undefined') return false;
          if (typeof window.isBaseAppSync === 'function') {
            return window.isBaseAppSync();
          }
          if (typeof window.isBaseApp === 'function') {
            const detected = window.isBaseApp();
            return typeof detected === 'boolean' ? detected : false;
          }
          return false;
        } catch (_) {
          return false;
        }
      })();
      
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
    if (attempts === 0) {
      // Mark SDK detection start on first attempt
      if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
        try {
          window.performance.mark('sdk-detection-start');
        } catch (_e) {}
      }
    }
    
    const sdk = resolveSdk();
    const ethers = resolveEthers();
    const onchainConfig = window.BaseManOnchainConfig;

    // Enhanced debugging for mobile environments (log every 5 attempts)
    if (attempts > 0 && attempts % 5 === 0) {
      const debugInfo = {
        attempt: attempts,
        hasSDK: !!sdk,
        hasEthers: !!ethers,
        hasConfig: !!onchainConfig,
        hasResolveSDK: typeof window !== 'undefined' && typeof window.resolveSDK === 'function',
        isMiniApp: typeof window !== 'undefined' && (
          (window !== window.parent) || 
          (typeof window.ReactNativeWebView !== 'undefined') ||
          (typeof window.isMiniAppEnvSync === 'function' && window.isMiniAppEnvSync())
        ),
        sdkKeys: typeof window !== 'undefined' ? Object.keys(window).filter(k => 
          k.toLowerCase().includes('sdk') || 
          k.toLowerCase().includes('miniapp') || 
          k.toLowerCase().includes('farcaster') ||
          k.toLowerCase().includes('minikit')
        ).slice(0, 10).join(', ') : 'N/A'
      };
      log.debug('SDK detection attempt:', debugInfo);
      debug(`SDK detection #${attempts}: ${JSON.stringify(debugInfo)}`);
    }

    if (sdk && ethers && onchainConfig) {
      log.info('✅ SDK, ethers, and config found - initializing');
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
      // Enhanced error reporting with diagnostic information
      const diagnostics = {
        attempts: attempts,
        hasSDK: !!sdk,
        hasEthers: !!ethers,
        hasConfig: !!onchainConfig,
        hasResolveSDK: typeof window !== 'undefined' && typeof window.resolveSDK === 'function',
        isMiniApp: typeof window !== 'undefined' && (
          (window !== window.parent) || 
          (typeof window.ReactNativeWebView !== 'undefined') ||
          (typeof window.isMiniAppEnvSync === 'function' && window.isMiniAppEnvSync())
        ),
        sdkKeys: typeof window !== 'undefined' ? Object.keys(window).filter(k => k.toLowerCase().includes('sdk') || k.toLowerCase().includes('miniapp') || k.toLowerCase().includes('farcaster')).join(', ') : 'N/A'
      };
      
      log.error('SDK initialization failed after max attempts:', diagnostics);
      
      if (!sdk) {
        const errorMsg = `Farcaster Mini App SDK not found. Diagnostics: ${JSON.stringify(diagnostics)}`;
        showFailure(errorMsg);
        log.error('SDK not found. Available window keys:', typeof window !== 'undefined' ? Object.keys(window).slice(0, 20) : 'N/A');
      } else if (!ethers) {
        showFailure(`ethers.js library not loaded. Diagnostics: ${JSON.stringify(diagnostics)}`);
      } else {
        showFailure(`On-chain configuration not found. Diagnostics: ${JSON.stringify(diagnostics)}`);
      }
      return;
    }

    // Optimized backoff: fast initial attempts, then exponential backoff
    // Pattern: 50, 50, 50, 50, 50, 75, 112, 168, 252, 378, 567, 850, 1275, 2000, 2000...
    setTimeout(tryInitialize, currentDelay);
    if (attempts < FAST_ATTEMPTS) {
      // Keep fast delay for first few attempts
      currentDelay = INITIAL_DELAY_MS;
    } else {
      // Exponential backoff after fast attempts
      currentDelay = Math.min(currentDelay * 1.5, MAX_DELAY_MS);
    }
  }

  function initialize(sdk, ethers, config) {
    // Mark SDK detection complete
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      try {
        window.performance.mark('sdk-detection-complete');
        if (window.performance.measure) {
          window.performance.measure('sdk-detection-time', 'sdk-detection-start', 'sdk-detection-complete');
        }
      } catch (_e) {}
    }
    
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

    // CHAIN_METADATA is now imported from onchain/provider module

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

    // ============================================
    // CACHING & DEDUPLICATION - Phase 4.3
    // ============================================
    
    // In-flight ensureWallet deduplication
    // Note: Profile mapping deduplication is now handled by onchain/profile-service module
    let _inflightEnsureWallet = null;
    
    // SDK context caching and profile mapping are now handled by onchain modules
    // These functions are imported and used directly - no local implementation needed

    const { emitToastEvent, emitWalletStatus } = createEventBridge({ state, debug });

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
    runSdkReadyLifecycle({ sdk, debug, log });

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
        const _wantSepolia = 84532;
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
      // Priority 1: Use centralized platform detection utility (sync-only)
      if (typeof window !== 'undefined') {
        if (typeof window.isMiniAppEnvSync === 'function') {
          const result = window.isMiniAppEnvSync();
          if (result === true) {
            debug('isMiniAppEnv: Detected via centralized utility (sync)');
            return true;
          }
        }
        if (typeof window.isMiniAppHostSync === 'function') {
          const result = window.isMiniAppHostSync();
          if (result === true) {
            debug('isMiniAppEnv: Detected via centralized utility (host sync)');
            return true;
          }
        }
        if (typeof window.isMiniAppEnv === 'function') {
          const result = window.isMiniAppEnv();
          if (result === true) {
            debug('isMiniAppEnv: Detected via centralized utility');
            return true;
          }
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

    // Best-effort: prefetch mini app auth token once at init to minimize delays during score submit
    (async () => {
      try {
        const t = await getMiniAppAuthToken();
        if (t) {
          debug('Mini app auth token prefetched');
        }
      } catch {}
    })();

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
              log.error('rpc-failed', { step: 'getEthereumProvider', reason: errorMsg });
              throw new Error(`Failed to get Ethereum provider: ${errorMsg}`);
            } else {
              throw providerError; // Re-throw non-request errors
            }
          }
          
          // Mini‑app providers may not support wallet_switchEthereumChain; skip enforcing switch

          // Detect Base App specifically
          const _isBaseAppDetected = (() => {
            try {
              if (typeof window !== 'undefined') {
                if (typeof window.isBaseAppSync === 'function') {
                  return window.isBaseAppSync();
                }
                if (typeof window.isBaseApp === 'function') {
                  const detected = window.isBaseApp();
                  if (typeof detected === 'boolean') return detected;
                }
                return Boolean(window.MiniKit || window.ReactNativeWebView);
              }
              return false;
            } catch (_) {
              return false;
            }
          })();

          let address = null;
          // First try to get existing accounts (read-only, no passkey prompt)
          // In Base App mini apps, accounts should be available automatically without requesting.
          const accounts = await safeProviderRequest(provider, { method: 'eth_accounts' }, []);
          if (Array.isArray(accounts) && accounts.length) {
            address = accounts[0];
            debug(`Found existing account: ${address}`);
          }
          
          // In mini app environments, only call eth_requestAccounts when explicitly requested (tx initiation).
          // Base App bağlanmış olsa da, açılışta passkey istememek için requestAccounts=false iken istek yapma.
          const isMiniAppCheck = isMiniAppEnv() || hasSDK;
          if (!address && isMiniAppCheck) {
            // Sadece işlem akışında passkey tetikle
            if (requestAccounts) {
              try {
                debug("Transaction initiated - requesting account access (may prompt passkey)...");
                log.debug('Requesting wallet connection for transaction...');
                // Add timeout to prevent hanging
                const requestPromise = provider.request({ method: 'eth_requestAccounts' });
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Wallet connection request timed out after 30 seconds')), 30000)
                );
                const req = await Promise.race([requestPromise, timeoutPromise]);
                if (Array.isArray(req) && req.length) {
                  address = req[0];
                  debug(`Account access granted for transaction: ${address}`);
                  log.debug(`Wallet connected: ${address}`);
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
                log.error(`Wallet connection failed: ${errMsg}`, reqErr);
                
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
        await ensureChainUtil(eth, config.chainId, debug);

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
          await ensureChainUtil(state.provider, nextChainId, debug);
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

    // toHexChainId and ensureChain are now imported from onchain/provider module
    // Using imported functions: toHexChainId, ensureChainUtil

    // requestScoreSignature is now imported from onchain/score-service module
    async function requestScoreSignature(score, durationMs) {
      // Determine platform for profile tracking
      let platform = null;
      try {
        if (typeof window.isFarcasterMiniApp === 'function') {
          const isFarcaster = await window.isFarcasterMiniApp();
          if (isFarcaster) {
            platform = 'farcaster';
          }
        }
        if (!platform && typeof window.isBaseApp === 'function') {
          const isBase = await window.isBaseApp();
          if (isBase) {
            platform = 'base-app';
          }
        }
      } catch (e) {
        debug(`Platform detection failed: ${e?.message || e}`);
      }
      
      return await requestScoreSignatureUtil({
        address: state.address,
        score,
        durationMs,
        chainId: config.chainId,
        scoreEndpoint: config.scoreEndpoint,
        isMiniAppEnv,
        getMiniAppAuthToken,
        platform,
        debug
      });
    }

    async function requestQuestSignature(questId) {
      let playerAddress = state.address;
      try {
        playerAddress = ethers.getAddress(playerAddress);
      } catch (error) {
        debug(`quest-sign address normalization failed: ${error?.message || error}`);
        throw new Error("Invalid wallet address");
      }

      const chainKey = getChainKey(config.chainId);

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

    async function _submitScoreWithPaymaster(callData) {
      // Farcaster Wallet does not support paymaster yet (per miniapps.farcaster.xyz/docs/guides/wallets)
      // Paymaster is only supported in Base App, not in Farcaster/Warpcast
      // Use centralized platform detection
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
      } catch (_) {
        isFarcaster = false;
      }
      
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
        const caps = await getCapabilities(state.provider, state.address, debug);
        const supported = isPaymasterSupported(caps, config.chainId, { ethers, debug });
        debug(`paymaster capability support: ${supported ? 'yes' : 'unknown/no'}`);
      } catch (_) { debug('wallet_getCapabilities failed; proceeding to try wallet_sendCalls'); }

      const capabilityUrl = resolveCapabilityUrl(config.paymasterUrl, debug);
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

    // sendCalls is now imported from onchain/score-service module
    async function sendCalls(callData, paymasterUrl) {
      return await sendCallsUtil({
        callData,
        paymasterUrl,
        state,
        config,
        debug
      });
    }
    
    // Legacy implementation removed - using imported function above
    /*
    async function sendCalls_OLD(callData, paymasterUrl) {
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
        log.error('wallet_sendCalls failed:', error);
        
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
    */

    // sendEthTransaction is now imported from onchain/score-service module
    async function sendEthTransaction(callData) {
      const result = await sendEthTransactionUtil({
        callData,
        state,
        config,
        debug
      });
      // Return in expected format
      return typeof result === 'string' ? { hash: result } : result;
    }

    async function resolveSubmissionPlatform() {
      try {
        if (typeof window !== 'undefined' && typeof window.getPlatform === 'function') {
          const platform = await window.getPlatform();
          if (platform === 'base') return 'base-app';
          if (platform === 'farcaster') return 'farcaster';
        }
      } catch (error) {
        debug(`resolveSubmissionPlatform: getPlatform failed: ${error?.message || error}`);
      }

      try {
        if (typeof window !== 'undefined') {
          if (typeof window.isBaseAppSync === 'function' && window.isBaseAppSync()) {
            return 'base-app';
          }
          if (typeof window.isFarcasterMiniAppSync === 'function' && window.isFarcasterMiniAppSync()) {
            return 'farcaster';
          }
          if (window.MiniKit || window.BaseAppSDK || window.MiniApp) {
            return 'base-app';
          }
          if (window.fc?.miniapp || window.farcaster?.miniapp) {
            return 'farcaster';
          }
        }
      } catch (error) {
        debug(`resolveSubmissionPlatform: sync detection failed: ${error?.message || error}`);
      }

      return 'unknown';
    }

    function extractSubmissionIdentifier(result) {
      if (typeof result === 'string') {
        return result;
      }
      if (result && typeof result === 'object') {
        if (typeof result.id === 'string') {
          return result.id;
        }
        if (typeof result.hash === 'string') {
          return result.hash;
        }
      }
      return null;
    }

    async function submitSponsorlessCall(callData, actionLabel) {
      const platform = await resolveSubmissionPlatform();
      const preferredTransport = selectSubmissionTransport(platform);

      debug(`submitSponsorlessCall: platform=${platform}, transport=${preferredTransport}, action=${actionLabel}`);
      try {
        fetch('/api/app-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'submission_transport_selected',
            meta: { action: actionLabel, platform, transport: preferredTransport, chainId: config.chainId, address: state.address || null }
          })
        }).catch(()=>{});
      } catch (_) {}

      const runTransport = async (transport) => {
        if (transport === 'eth_sendTransaction') {
          const result = await sendEthTransaction(callData);
          return {
            result,
            identifier: extractSubmissionIdentifier(result),
            transport,
            statusId: null,
            platform
          };
        }

        const result = await sendCalls(callData, null);
        return {
          result,
          identifier: extractSubmissionIdentifier(result),
          transport,
          statusId: typeof result?.id === 'string' ? result.id : null,
          platform
        };
      };

      try {
        const submission = await runTransport(preferredTransport);
        try {
          fetch('/api/app-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'submission_transport_success',
              meta: {
                action: actionLabel,
                platform,
                transport: submission.transport,
                identifier: submission.identifier || null,
                chainId: config.chainId,
                address: state.address || null
              }
            })
          }).catch(()=>{});
        } catch (_) {}
        return submission;
      } catch (error) {
        if (preferredTransport === 'wallet_sendCalls' && isUnsupportedMethodError(error)) {
          debug(`submitSponsorlessCall: wallet_sendCalls unsupported for ${platform}; falling back to eth_sendTransaction`);
          try {
            fetch('/api/app-log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'submission_transport_fallback',
                meta: {
                  action: actionLabel,
                  platform,
                  from: 'wallet_sendCalls',
                  to: 'eth_sendTransaction',
                  chainId: config.chainId,
                  address: state.address || null
                }
              })
            }).catch(()=>{});
          } catch (_) {}

          const submission = await runTransport('eth_sendTransaction');
          try {
            fetch('/api/app-log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'submission_transport_success',
                meta: {
                  action: actionLabel,
                  platform,
                  transport: submission.transport,
                  identifier: submission.identifier || null,
                  chainId: config.chainId,
                  address: state.address || null
                }
              })
            }).catch(()=>{});
          } catch (_) {}
          return submission;
        }

        try {
          fetch('/api/app-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'submission_transport_error',
              meta: {
                action: actionLabel,
                platform,
                transport: preferredTransport,
                error: error?.message || String(error),
                code: error?.code || error?.error?.code || null,
                chainId: config.chainId,
                address: state.address || null
              }
            })
          }).catch(()=>{});
        } catch (_) {}

        throw error;
      }
    }

    async function submitScore() {
      debug('submitScore: Function called');
      log.debug('submitScore: Function called - START');
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
        log.debug('submitScore: Already submitting, skipping');
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:already-submitting', meta: { timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        return;
      }
      
      // Check if getScore function is available
      if (typeof window.getScore !== "function") {
        debug('submitScore: getScore function not available');
        log.warn(' submitScore: getScore function not available');
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
        log.error(' submitScore: Error getting score:', scoreError);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:getScore-error', meta: { error: scoreError?.message || String(scoreError) } }) }).catch(()=>{});} catch(_) {}
        return;
      }
      
      if (score <= 0n) {
        debug(`submitScore: Score is 0 or negative (${score.toString()}), skipping`);
        log.debug(`submitScore: Score is 0 or negative (${score.toString()}), skipping`);
        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:score-zero', meta: { score: score.toString(), timestamp: new Date().toISOString() } }) }).catch(()=>{});} catch(_) {}
        return;
      }

      const durationMs =
        state.runStartedAt !== null
          ? Math.max(0, Math.floor(performance.now() - state.runStartedAt))
          : 0;

      debug(`submitScore: Starting submission - score=${score.toString()}, duration=${durationMs}ms`);
      log.debug(`submitScore: Starting submission - score=${score.toString()}, duration=${durationMs}ms`);
      try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'submitScore:starting', meta: { score: score.toString(), durationMs } }) }).catch(()=>{});} catch(_) {}
      
      // Emit toast event for UI feedback
      emitToastEvent('score:submitting', { score: score.toString(), durationMs });

      try {
        state.submitting = true;

        // Request accounts if needed (may prompt passkey, but user initiated transaction)
        // For Base App users, always request accounts to ensure wallet connection
        debug('submitScore: Ensuring wallet connection...');
        log.debug(' submitScore: Ensuring wallet connection for score submission...');
        try {
          await ensureWallet(true); // Always request accounts for transaction
        } catch (walletError) {
          const walletErrorMsg = walletError?.message || String(walletError);
          debug(`submitScore: Wallet connection failed: ${walletErrorMsg}`);
          log.error(`submitScore: Wallet connection failed: ${walletErrorMsg}`);
          
          // If wallet connection fails, provide helpful error message
          if (walletErrorMsg.includes('reject') || walletErrorMsg.includes('denied') || walletErrorMsg.includes('User rejected')) {
            throw new Error('Wallet connection was rejected. Please approve the connection request to submit your score.');
          }
          throw new Error(`Failed to connect wallet: ${walletErrorMsg}`);
        }
        
        if (!state.address) {
          const errorMsg = "Wallet connection required - no address available";
          debug(`submitScore: ${errorMsg}`);
          log.error(`submitScore: ${errorMsg}`);
          throw new Error(errorMsg);
        }
        debug(`submitScore: Wallet connected - address=${state.address}`);
        log.debug(`submitScore: Wallet connected successfully - address=${state.address}`);

        // Send profile mapping to backend for leaderboard enrichment
        // This ensures user profile data is available for other users viewing the leaderboard
        // Phase 4.3: Skip if already sent this session to avoid duplicate network calls
        // Now using onchain/profile-service module
        try {
          await sendProfileMapping({
            sdk,
            address: state.address,
            debug
          });
        } catch (profileErr) {
          // Silently fail - profile mapping is not critical for score submission
          debug(`submitScore: Profile mapping error (non-critical): ${profileErr?.message || profileErr}`);
          log.warn(' submitScore: Profile mapping error (non-critical):', profileErr?.message || profileErr);
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

        // For mini-app environments (Farcaster/Base App), use platform-selected sponsorless transport
        const hasSDK = sdk && sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function';
        const isMiniApp = isMiniAppEnv() || hasSDK;
        
        if (isMiniApp) {
          if (hasSDK && !isMiniAppEnv()) {
            debug("submitScore: SDK detected but isMiniAppEnv() returned false - using SDK anyway");
          }
          debug("submitScore: Mini-app environment detected - selecting sponsorless transport");
          try {
            if (!state.provider || typeof state.provider.request !== "function") {
              debug('submitScore: No provider available for sponsorless transaction');
              throw new Error("No provider available");
            }

            const submission = await submitSponsorlessCall(callData, 'score');
            if (submission?.result) {
              if (submission.identifier) {
                debug(`submitScore: Transaction submitted via ${submission.transport} (sponsorless - user pays gas) (id: ${submission.identifier})`);
                log.debug(`Score submission transaction started: ${submission.identifier}`);
                try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score:submitted:sponsorless', meta: { identifier: submission.identifier, score: scoreValue.toString(), address: state.address, chainId: config.chainId, transport: submission.transport, platform: submission.platform } }) }).catch(()=>{});} catch(_) {}
                
                // Emit toast event for UI feedback - score submitted
                emitToastEvent('score:submitted', { 
                  score: scoreValue.toString(), 
                  identifier: submission.identifier, 
                  txHash: submission.identifier,
                  address: state.address 
                });
                
                // Invalidate leaderboard cache immediately so next load gets fresh data
                try {
                  import('./leaderboard/api.js').then(({ invalidateLeaderboardCache }) => {
                    if (invalidateLeaderboardCache) invalidateLeaderboardCache();
                  }).catch(() => {});
                } catch (_) {}

                // Optionally check transaction status after a delay
                if (submission.transport === 'wallet_sendCalls' && submission.statusId) {
                setTimeout(() => {
                  if (!state.provider || typeof state.provider.request !== "function") return;
                  state.provider
                    .request({
                      method: "wallet_getCallsStatus",
                        params: [submission.statusId]
                    })
                    .then((status) => {
                        debug(`submitScore: wallet_getCallsStatus response: ${status ? JSON.stringify(status) : "empty response"}`);
                        try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'score:transaction:status', meta: { id: submission.statusId, status } }) }).catch(()=>{});} catch(_) {}
                    })
                    .catch((statusError) => {
                        debug(`submitScore: wallet_getCallsStatus error: ${statusError?.message || statusError}`);
                    });
                }, 3000);
              }
                return;
              } else {
                debug('submitScore: sponsorless submission returned result but no identifier found');
                throw new Error("Transaction submitted but no identifier returned");
              }
            } else {
              debug('submitScore: sponsorless submission returned null/undefined');
              throw new Error("Transaction submission returned no result");
            }
          } catch (submissionError) {
            const errorMsg = submissionError?.message || String(submissionError);
            const errorCode = submissionError?.code || submissionError?.error?.code || null;
            const platform = await resolveSubmissionPlatform();
            debug(`submitScore: sponsorless submission failed:`, {
              message: errorMsg,
              code: errorCode,
              error: submissionError,
              platform
            });
            log.error(' Score submission failed:', submissionError);
            try { 
              fetch('/api/app-log', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                  event: 'score:submission:error', 
                  meta: { 
                    error: errorMsg,
                    code: errorCode,
                    score: scoreValue.toString(), 
                    address: state.address,
                    chainId: config.chainId,
                    platform,
                    stack: submissionError?.stack || null
                  } 
                }) 
              }).catch(()=>{});
            } catch(_) {}
            
            // Emit toast event for error
            emitToastEvent('score:error', { 
              message: errorMsg, 
              code: errorCode,
              score: scoreValue.toString()
            });
            
            throw new Error(`Failed to submit score: ${errorMsg}${errorCode ? ` (code: ${errorCode})` : ''}`);
          }
        }
        
        // For web/EOA environments (non-mini-app), this should not happen
        // Mini-app environments are required for BaseMan
        debug('submitScore: Non-mini-app environment detected - this should not happen in BaseMan');
        throw new Error("Mini-app environment required. BaseMan only works in Farcaster or Base App mini-app environments.");
      } catch (error) {
        // Phase 6: Enhanced error handling with AppError
        const errorMsg = error?.message || String(error);
        const errorKind = error?.kind || 'UNKNOWN';
        debug(`submitScore ERROR: ${errorMsg}`);
        log.error(' submitScore failed:', error);
        
        // Log detailed error information
        try { 
          fetch('/api/app-log', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
              event: 'score:submission:error', 
              meta: { 
                error: errorMsg,
                errorKind,
                score: score?.toString() || 'unknown',
                address: state.address || null,
                chainId: config.chainId || null,
                platform: isMiniAppEnv() ? 'miniapp' : 'web',
                stack: error?.stack || null,
                context: error?.context || 'submitScore'
              } 
            }) 
          }).catch(()=>{});
        } catch(_) {}
        
        // Phase 6: Show user-friendly error message
        // Don't show error if user rejected (that's expected behavior)
        if (errorKind !== 'USER_REJECTED' && !errorMsg.includes('reject') && !errorMsg.includes('denied') && !errorMsg.includes('User rejected')) {
          // Map error kind to user-friendly message
          let userMessage = "Score submission failed. Please try again.";
          if (errorKind === 'NETWORK_ERROR' || errorKind === 'TIMEOUT') {
            userMessage = "Network error. Please check your connection and try again.";
          } else if (errorKind === 'UNAUTHORIZED') {
            userMessage = "Authentication failed. Please try again.";
          } else if (errorKind === 'CONTRACT_REVERT') {
            userMessage = "Transaction failed. Please try again.";
          }
          
          // Log user-friendly message
          log.error(`Score submission failed: ${userMessage}`);
          
          // Emit toast event for error
          emitToastEvent('score:error', { 
            message: userMessage, 
            originalError: errorMsg,
            errorKind,
            score: score?.toString() || null
          });
        }
      } finally {
        // Phase 6: Always return to idle state
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

        let _paymasterHandled = false;
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
              const submission = await submitSponsorlessCall(callData, 'quest');
              if (submission?.identifier) {
                debug(`completeQuest: Transaction submitted via ${submission.transport} (sponsorless - user pays gas) (id: ${submission.identifier})`);
                log.debug(`Quest completion transaction started: ${submission.identifier}`);
                try {
                  fetch('/api/app-log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      event: 'quest:submitted:sponsorless',
                      meta: {
                        identifier: submission.identifier,
                        questId: qid.toString(),
                        address: state.address,
                        chainId: config.chainId,
                        transport: submission.transport,
                        platform: submission.platform
                      }
                    })
                  }).catch(()=>{});
                } catch (_) {}
                return;
              }
              throw new Error("Quest transaction submitted but no identifier returned");
            } catch (questError) {
              debug(`completeQuest: Transaction failed: ${questError?.message || questError}`);
              throw questError;
            }
          } else {
            throw new Error("Mini-app environment required for quest completion");
          }
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

    scheduleStateHookPatching({ state, debug, log, submitScore, handleRunStart });

    // getCurrentChainId function
    function getCurrentChainId() {
      return config?.chainId || null;
    }

    bindPublicOnchainApi({
      ensureWallet,
      setNetwork: reconfigureNetwork,
      submitScore,
      completeQuest,
      handleRunStart,
      getCurrentChainId
    }, state, debug);

    // Mini app'te açılışta passkey tetiklemeden read-only bağlanmayı dene.
    // Sadece eth_accounts çağrısı yap; hesap varsa ensureWallet(false) ile state'i güncelle.
    if (isMiniAppEnv()) {
      scheduleBackgroundMiniAppWallet({ sdk, state, ensureWallet, safeProviderRequest, debug });
    }
  }

  tryInitialize();
})();

    
