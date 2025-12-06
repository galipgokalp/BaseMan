/**
 * Provider & Network Management Module
 * 
 * Handles:
 * - Chain metadata (Base, Base Sepolia)
 * - Chain ID conversion utilities
 * - Provider chain switching
 */

import { createLogger } from '../utils/logger.js';

const log = createLogger('OnchainProvider');

/**
 * Chain metadata for supported networks
 */
export const CHAIN_METADATA = {
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

/**
 * Convert chainId to hex format
 * @param {number|string|bigint} chainId - Chain ID in various formats
 * @returns {string} Hex chain ID (0x...)
 */
export function toHexChainId(chainId) {
  try {
    if (typeof chainId === "bigint") {
      return window.ethers.toBeHex(chainId);
    }
    if (typeof chainId === "number") {
      return window.ethers.toBeHex(chainId);
    }
    if (typeof chainId === "string" && chainId.startsWith("0x")) {
      return window.ethers.toBeHex(chainId);
    }
    if (typeof chainId === "string" && chainId.trim() !== "") {
      return window.ethers.toBeHex(BigInt(chainId));
    }
    throw new Error("chainId cannot be empty");
  } catch (error) {
    throw new Error(`Invalid chainId: ${chainId} (${error?.message || error})`);
  }
}

/**
 * Ensure provider is on the correct chain, switch if needed
 * @param {Object} provider - Ethereum provider
 * @param {number} chainId - Target chain ID
 * @param {Function} debug - Debug logging function
 */
export async function ensureChain(provider, chainId, debug = () => {}) {
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

/**
 * Get chain key for backend API (matches server-side targets in api/_lib/registry.js)
 * @param {number} chainId - Chain ID
 * @returns {string} Chain key ('base' or 'base-sepolia')
 */
export function getChainKey(chainId) {
  return chainId === 8453 ? 'base' : (chainId === 84532 ? 'base-sepolia' : 'base');
}

