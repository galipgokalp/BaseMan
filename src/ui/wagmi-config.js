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
  return Number(chainId) === base.id ? base : baseSepolia;
}

// Convenience export mirroring docs usage
export const config = makeWagmiConfig();
