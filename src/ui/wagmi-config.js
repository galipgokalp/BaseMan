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

export function makeWagmiConfig() {
  // Safely check if chain objects are available
  // Note: Checking for existence first before accessing properties
  try {
    // Try to access chain properties to see if they're available
    const baseId = base?.id;
    const baseSepoliaId = baseSepolia?.id;
    
    if (!base || typeof baseId === 'undefined' || !baseSepolia || typeof baseSepoliaId === 'undefined') {
      console.error('[wagmi-config] Chain objects not available. Wagmi chains may not be loaded properly.');
      console.error('[wagmi-config] base:', base, 'baseSepolia:', baseSepolia);
      // Don't try to create config with empty chains - wagmi requires at least one chain
      // Return null to signal that config cannot be created
      return null;
    }
  } catch (e) {
    console.error('[wagmi-config] Error checking chain objects:', e);
    return null;
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
  transports[base.id] = mainnetUrl ? http(mainnetUrl) : http();
  transports[baseSepolia.id] = sepoliaUrl ? http(sepoliaUrl) : http();

  const baseConfig = {
    chains: [baseSepolia, base],
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
  if (!base || typeof base.id === 'undefined' || !baseSepolia || typeof baseSepolia.id === 'undefined') {
    console.warn('[wagmi-config] pickChainById: Chain objects not available');
    return null;
  }
  return Number(chainId) === base.id ? base : baseSepolia;
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
