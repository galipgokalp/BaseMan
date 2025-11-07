import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { injected, walletConnect, metaMask, safe } from 'wagmi/connectors';

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
      console.warn('[wagmi-config] Chain imports unavailable, using fallback definitions');
      baseChain = getFallbackBaseChain();
      baseSepoliaChain = getFallbackBaseSepoliaChain();
    }
  } catch (e) {
    console.error('[wagmi-config] Error checking chain objects:', e);
    // Use fallback chains
    baseChain = getFallbackBaseChain();
    baseSepoliaChain = getFallbackBaseSepoliaChain();
  }

  // Validate chain objects have required properties
  if (!baseChain || !baseChain.id || !baseSepoliaChain || !baseSepoliaChain.id) {
    console.error('[wagmi-config] Invalid chain objects:', { baseChain, baseSepoliaChain });
    throw new Error('Failed to create valid chain objects');
  }

  const sepoliaUrl = readEnv('NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL') || readEnv('BASE_SEPOLIA_RPC_URL') || '';
  const mainnetUrl = readEnv('NEXT_PUBLIC_BASE_MAINNET_RPC_URL') || readEnv('BASE_MAINNET_RPC_URL') || '';
  const wcProjectId = (readEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') || readEnv('WALLETCONNECT_PROJECT_ID') || '').trim();

  function isMiniAppHost() {
    try {
      return Boolean(
        (typeof window !== 'undefined') && (
          (window.fc && window.fc.miniapp) ||
          (window.farcaster && window.farcaster.miniapp) ||
          window.MiniAppSDK || window.MiniApp?.sdk ||
          window.MiniKit || window.ReactNativeWebView
        )
      );
    } catch (_) { return false; }
  }

  const transports = {};
  // Provide explicit transports for each chain; fall back to default http() if no env URL
  try {
    transports[baseChain.id] = mainnetUrl ? http(mainnetUrl) : http();
    transports[baseSepoliaChain.id] = sepoliaUrl ? http(sepoliaUrl) : http();
  } catch (transportError) {
    console.error('[wagmi-config] Error creating transports:', transportError);
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
      // In mini app, we can use injected() connector since miniapp-ethereum-shim.js
      // already exposes window.ethereum from the SDK
      // This is more reliable than miniAppConnector() which may fail if SDK isn't ready
      try {
        // Try mini app connector first (preferred)
        const connector = miniAppConnector();
        return createConfig({
          ...baseConfig,
          connectors: [connector]
        });
      } catch (connectorError) {
        console.warn('[wagmi-config] Mini app connector failed, using injected() fallback:', connectorError?.message || connectorError);
        // Fallback: use injected() connector
        // This works because miniapp-ethereum-shim.js exposes window.ethereum from SDK
        try {
          return createConfig({
            ...baseConfig,
            connectors: [injected()]
          });
        } catch (fallbackError) {
          console.error('[wagmi-config] Fallback config creation failed:', fallbackError);
          // Last resort: create config with empty connectors (won't connect but won't crash)
          try {
            return createConfig({
              ...baseConfig,
              connectors: []
            });
          } catch (emptyConnectorError) {
            console.error('[wagmi-config] Empty connector config also failed:', emptyConnectorError);
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
      console.warn('[wagmi-config] Some connectors failed to initialize:', connectorError);
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
    console.error('[wagmi-config] createConfig failed:', createError);
    console.error('[wagmi-config] Config params:', {
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
    console.warn('[wagmi-config] pickChainById error:', e);
    const baseChain = getFallbackBaseChain();
    const baseSepoliaChain = getFallbackBaseSepoliaChain();
    return Number(chainId) === baseChain.id ? baseChain : baseSepoliaChain;
  }
}

// Convenience export mirroring docs usage
// Wrap in try-catch to handle initialization errors gracefully
let config;
try {
  config = makeWagmiConfig();
  if (!config) {
    console.warn('[wagmi-config] Config is null - chain objects may not be available. Connect menu may not work.');
  } else {
    console.log('[wagmi-config] Config created successfully');
  }
} catch (error) {
  console.error('[wagmi-config] Failed to create config:', error);
  console.error('[wagmi-config] Error details:', {
    message: error?.message,
    stack: error?.stack,
    name: error?.name
  });
  // Try one more time with minimal config as last resort
  try {
    console.warn('[wagmi-config] Attempting minimal config as fallback...');
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
    console.log('[wagmi-config] Minimal config created successfully');
  } catch (fallbackError) {
    console.error('[wagmi-config] Fallback config also failed:', fallbackError);
    config = null;
  }
}
export { config };
