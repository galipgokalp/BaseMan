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
  transports[baseChain.id] = mainnetUrl ? http(mainnetUrl) : http();
  transports[baseSepoliaChain.id] = sepoliaUrl ? http(sepoliaUrl) : http();

  const baseConfig = {
    chains: [baseSepoliaChain, baseChain],
    transports
  };

  if (isMiniAppHost()) {
    return createConfig({
      ...baseConfig,
      connectors: [miniAppConnector()]
    });
  }

  const webConnectors = [
    injected(),
    metaMask(),
    safe()
  ];
  if (wcProjectId) webConnectors.push(walletConnect({ projectId: wcProjectId }));

  return createConfig({
    ...baseConfig,
    connectors: webConnectors
  });
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
  }
} catch (error) {
  console.error('[wagmi-config] Failed to create config:', error);
  config = null;
}
export { config };
