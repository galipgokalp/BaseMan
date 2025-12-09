import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { injected, walletConnect, metaMask, safe, baseAccount } from 'wagmi/connectors';
import { isFarcasterMiniApp, isBaseApp, isMiniAppHost } from '../utils/platform-detection.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('WagmiConfig');

function readEnv(key) {
  if (typeof window !== 'undefined') {
    if (window.__ENV && typeof window.__ENV === 'object' && window.__ENV[key]) return window.__ENV[key];
    if (window[key]) return window[key];
  }
  return undefined;
}

// Fallback chain definitions in case imports fail during bundling
function getFallbackBaseChain() {
  return {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
      public: { http: ['https://mainnet.base.org'] }
    },
    blockExplorers: {
      default: { name: 'Basescan', url: 'https://basescan.org' }
    },
    contracts: {
      multicall3: { address: '0xca11bde05977b3631167028862be2a173976ca11' }
    }
  };
}

function getFallbackBaseSepoliaChain() {
  return {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://sepolia.base.org'] },
      public: { http: ['https://sepolia.base.org'] }
    },
    blockExplorers: {
      default: { name: 'Basescan', url: 'https://sepolia.basescan.org' }
    },
    contracts: {
      multicall3: { address: '0xca11bde05977b3631167028862be2a173976ca11' }
    },
    testnet: true
  };
}

// Re-export platform detection functions for backward compatibility
// All platform detection now uses centralized utility from utils/platform-detection.js
export { isFarcasterMiniApp, isBaseApp, isMiniAppHost } from '../utils/platform-detection.js';

export function makeWagmiConfig() {
  // Get chain objects, with fallback if imports failed
  let baseChain, baseSepoliaChain;
  
  try {
    // Try to use imported chains first
    if (base && typeof base.id !== 'undefined' && baseSepolia && typeof baseSepolia.id !== 'undefined') {
      baseChain = base;
      baseSepoliaChain = baseSepolia;
    } else {
      // Fallback to manual definitions if imports failed
      log.warn('Chain imports unavailable, using fallback definitions');
      baseChain = getFallbackBaseChain();
      baseSepoliaChain = getFallbackBaseSepoliaChain();
    }
  } catch (e) {
    log.error('Error checking chain objects:', e);
    // Use fallback chains
    baseChain = getFallbackBaseChain();
    baseSepoliaChain = getFallbackBaseSepoliaChain();
  }

  // Validate chain objects have required properties
  if (!baseChain || !baseChain.id || !baseSepoliaChain || !baseSepoliaChain.id) {
    log.error('Invalid chain objects:', { baseChain, baseSepoliaChain });
    throw new Error('Failed to create valid chain objects');
  }

  const sepoliaUrl = readEnv('NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL') || readEnv('BASE_SEPOLIA_RPC_URL') || '';
  const mainnetUrl = readEnv('NEXT_PUBLIC_BASE_MAINNET_RPC_URL') || readEnv('BASE_MAINNET_RPC_URL') || '';
  const wcProjectId = (readEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') || readEnv('WALLETCONNECT_PROJECT_ID') || '').trim();

  const transports = {};
  // Provide explicit transports for each chain; fall back to default http() if no env URL
  try {
    transports[baseChain.id] = mainnetUrl ? http(mainnetUrl) : http();
    transports[baseSepoliaChain.id] = sepoliaUrl ? http(sepoliaUrl) : http();
  } catch (transportError) {
    log.error('Error creating transports:', transportError);
    // Fallback to default http() for both
    transports[baseChain.id] = http();
    transports[baseSepoliaChain.id] = http();
  }

  const baseConfig = {
    chains: [baseSepoliaChain, baseChain],
    transports
  };

  // Try to create config with proper error handling
  try {
    if (isMiniAppHost()) {
      // Platform-specific connector selection based on official docs:
      // - Farcaster: @farcaster/miniapp-wagmi-connector
      // - Base App: baseAccount connector (wagmi/connectors) - recommended by docs.base.org
      
      if (isFarcasterMiniApp()) {
        // Farcaster Mini App - use Farcaster connector
        try {
          const connector = miniAppConnector();
          return createConfig({
            ...baseConfig,
            connectors: [connector]
          });
        } catch (connectorError) {
          log.warn('Farcaster connector failed, using injected() fallback:', connectorError?.message || connectorError);
          // Fallback: use injected() connector
          // This works because miniapp-ethereum-shim.js exposes window.ethereum from SDK
          try {
            return createConfig({
              ...baseConfig,
              connectors: [injected()]
            });
          } catch (fallbackError) {
            log.error('Fallback config creation failed:', fallbackError);
            // Last resort: create config with empty connectors
            try {
              return createConfig({
                ...baseConfig,
                connectors: []
              });
            } catch (emptyConnectorError) {
              log.error('Empty connector config also failed:', emptyConnectorError);
              throw fallbackError;
            }
          }
        }
      } else if (isBaseApp()) {
        // Base App - use both farcasterMiniApp() and baseAccount() connectors
        // Per docs.base.org/mini-apps/core-concepts/base-account:
        // "The farcasterMiniApp() connector automatically connects to the user's Base Account
        //  when the Mini App launches within the Base App."
        // Both connectors should be included for full Base Account support
        const connectors = [];
        
        try {
          // Farcaster connector automatically connects to Base Account in Base App
          const farcasterConnector = miniAppConnector();
          connectors.push(farcasterConnector);
        } catch (farcasterError) {
          log.warn('Farcaster connector failed in Base App:', farcasterError?.message || farcasterError);
        }
        
        try {
          // Base Account connector for explicit Base Account features
          const baseAccountConnector = baseAccount({
            appName: 'BaseMan',
            appLogoUrl: 'https://base-man.vercel.app/icon.png'
          });
          connectors.push(baseAccountConnector);
        } catch (baseAccountError) {
          log.warn('Base Account connector failed:', baseAccountError?.message || baseAccountError);
        }
        
        if (connectors.length > 0) {
          return createConfig({
            ...baseConfig,
            connectors
          });
        }
        
        // Fallback: use injected() connector
        // This works because miniapp-ethereum-shim.js exposes window.ethereum from SDK
        try {
          return createConfig({
            ...baseConfig,
            connectors: [injected()]
          });
        } catch (fallbackError) {
          log.error('Fallback config creation failed:', fallbackError);
          // Last resort: create config with empty connectors
          try {
            return createConfig({
              ...baseConfig,
              connectors: []
            });
          } catch (emptyConnectorError) {
            log.error('Empty connector config also failed:', emptyConnectorError);
            throw fallbackError;
          }
        }
      } else {
        // Generic mini app - use injected() as fallback
        try {
          return createConfig({
            ...baseConfig,
            connectors: [injected()]
          });
        } catch (fallbackError) {
          log.error('Generic mini app config creation failed:', fallbackError);
          try {
            return createConfig({
              ...baseConfig,
              connectors: []
            });
          } catch (emptyConnectorError) {
            log.error('Empty connector config also failed:', emptyConnectorError);
            throw fallbackError;
          }
        }
      }
    }

    const webConnectors = [];
    try {
      webConnectors.push(injected());
      webConnectors.push(metaMask());
      webConnectors.push(safe());
      if (wcProjectId) {
        webConnectors.push(walletConnect({ projectId: wcProjectId }));
      }
    } catch (connectorError) {
      log.warn('Some connectors failed to initialize:', connectorError);
      // Continue with whatever connectors we have
      if (webConnectors.length === 0) {
        webConnectors.push(injected());
      }
    }

    return createConfig({
      ...baseConfig,
      connectors: webConnectors
    });
  } catch (createError) {
    log.error('createConfig failed:', createError);
    log.error('Config params:', {
      chains: baseConfig.chains.map(c => ({ id: c.id, name: c.name })),
      transports: Object.keys(baseConfig.transports),
      isMiniApp: isMiniAppHost()
    });
    throw createError;
  }
}

export function pickChainById(chainId) {
  try {
    // Try to use imported chains first
    if (base && typeof base.id !== 'undefined' && baseSepolia && typeof baseSepolia.id !== 'undefined') {
      return Number(chainId) === base.id ? base : baseSepolia;
    } else {
      // Fallback to manual definitions
      const baseChain = getFallbackBaseChain();
      const baseSepoliaChain = getFallbackBaseSepoliaChain();
      return Number(chainId) === baseChain.id ? baseChain : baseSepoliaChain;
    }
  } catch (e) {
    log.warn('pickChainById error:', e);
    const baseChain = getFallbackBaseChain();
    const baseSepoliaChain = getFallbackBaseSepoliaChain();
    return Number(chainId) === baseChain.id ? baseChain : baseSepoliaChain;
  }
}

// Lazy initialization for mobile app environments
// In mobile apps, SDK may not be ready when module loads
// So we delay config creation until it's actually needed
let config = null;
let configInitialized = false;
let configInitializing = false;

// Wait for SDK to be ready (especially important for Farcaster)
async function waitForSDK(maxWait = 10000) {
  const start = Date.now();
  
  while (Date.now() - start < maxWait) {
    // Platform-specific SDK readiness check
    if (isFarcasterMiniApp()) {
      // Check for Farcaster SDK
      const sdk = 
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniAppSDK ||
        window.sdk;
      
      if (sdk) {
        // For Farcaster, wait for ready() if available
        if (sdk.actions && typeof sdk.actions.ready === 'function') {
          try {
            await Promise.race([
              sdk.actions.ready(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('ready timeout')), 2000))
            ]);
          } catch (e) {
            // If ready() fails or times out, continue anyway
            log.warn('SDK ready() failed or timed out, continuing...');
          }
        }
        return true;
      }
    } else if (isBaseApp()) {
      // For Base App, check for window.ethereum (shim may have set it)
      // Base App SDK typically exposes provider immediately
      if (window.ethereum) {
        return true;
      }
    }
    
    // Generic check for window.ethereum (shim may have set it for any platform)
    if (window.ethereum) {
      return true;
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

// Initialize config with proper SDK readiness check
async function initializeConfig() {
  if (configInitialized || configInitializing) {
    return config;
  }
  
  configInitializing = true;
  
  try {
    // In mini app environments, wait for SDK
    const isMiniApp = isMiniAppHost();
    if (isMiniApp) {
      log.debug('Mini app detected, waiting for SDK...');
      const sdkReady = await waitForSDK(10000);
      if (!sdkReady) {
        log.warn('SDK not ready after timeout, proceeding anyway...');
      } else {
        log.debug('SDK ready, creating config...');
      }
      
      // Also wait for window.ethereum if shim is setting it
      let ethereumWaits = 0;
      while (!window.ethereum && ethereumWaits < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        ethereumWaits++;
      }
    }
    
    config = makeWagmiConfig();
    if (!config) {
      log.warn('Config is null - chain objects may not be available.');
    } else {
      log.debug('Config created successfully');
    }
  } catch (error) {
    log.error('Failed to create config:', error);
    log.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    // Try minimal config as fallback
    try {
      log.warn('Attempting minimal config as fallback...');
      const minimalBase = getFallbackBaseChain();
      const minimalSepolia = getFallbackBaseSepoliaChain();
      config = createConfig({
        chains: [minimalSepolia, minimalBase],
        transports: {
          [minimalBase.id]: http(),
          [minimalSepolia.id]: http()
        },
        connectors: []
      });
      log.debug('Minimal config created successfully');
    } catch (fallbackError) {
      log.error('Fallback config also failed:', fallbackError);
      config = null;
    }
  } finally {
    configInitialized = true;
    configInitializing = false;
  }
  
  return config;
}

// Get config (lazy initialization)
export async function getConfig() {
  if (!configInitialized && !configInitializing) {
    return await initializeConfig();
  }
  
  // If already initializing, wait for it
  if (configInitializing) {
    let waits = 0;
    while (configInitializing && waits < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waits++;
    }
  }
  
  return config;
}

// Sync export for compatibility (may return null in mobile apps if SDK not ready)
// Prefer using getConfig() in async contexts
export { config };
