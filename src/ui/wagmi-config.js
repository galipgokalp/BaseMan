import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

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

  const transports = {};
  if (mainnetUrl) transports[base.id] = http(mainnetUrl);
  if (sepoliaUrl) transports[baseSepolia.id] = http(sepoliaUrl);

  return createConfig({
    chains: [baseSepolia, base],
    transports
  });
}

export function pickChainById(chainId) {
  return Number(chainId) === base.id ? base : baseSepolia;
}

