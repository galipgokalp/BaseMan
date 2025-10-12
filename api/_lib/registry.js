import { ethers } from "ethers";

const CONTRACT_NAME = "BaseManRegistry";
const CONTRACT_VERSION = "1";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[BaseManRegistry] ${message}`);
  }
}

function parseRegistryConfig() {
  const rawAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  assert(rawAddress, "NEXT_PUBLIC_REGISTRY_ADDRESS env variable is required");
  assert(ethers.isAddress(rawAddress), "NEXT_PUBLIC_REGISTRY_ADDRESS must be a valid address");
  const address = ethers.getAddress(rawAddress);

  const rawChainId = process.env.REGISTRY_CHAIN_ID ?? "84532";
  let chainId;
  try {
    chainId = BigInt(rawChainId);
  } catch (error) {
    throw new Error(`[BaseManRegistry] REGISTRY_CHAIN_ID must be a valid integer value`);
  }

  return { address, chainId };
}

const registryConfig = parseRegistryConfig();

export const registryAddress = registryConfig.address;
export const registryChainId = registryConfig.chainId;
export const registryChainIdNumber = Number(registryConfig.chainId);

export const registryDomain = {
  name: CONTRACT_NAME,
  version: CONTRACT_VERSION,
  chainId: registryConfig.chainId,
  verifyingContract: registryConfig.address
};

export const scoreTypes = {
  Score: [
    { name: "player", type: "address" },
    { name: "score", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

export const questTypes = {
  Quest: [
    { name: "player", type: "address" },
    { name: "questId", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

export function getSigner(envKey = "SCORE_SIGNER_PRIVATE_KEY") {
  const fallback = process.env.SCORE_SIGNER_PRIVATE_KEY;
  const privateKey = process.env[envKey] || fallback;
  assert(privateKey, `Missing ${envKey} env variable`);
  return new ethers.Wallet(privateKey);
}

export function normalizeAddress(value) {
  assert(ethers.isAddress(value), "Invalid address provided");
  return ethers.getAddress(value);
}

