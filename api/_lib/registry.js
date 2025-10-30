import { ethers } from "ethers";

const CONTRACT_NAME = "BaseManRegistry";
// EIP-712 domain version (matches on-chain EIP712 constructor). Default: 1
// Default to V2 for latest contract; can be forced via REGISTRY_EIP712_VERSION
const CONTRACT_VERSION = (process.env.REGISTRY_EIP712_VERSION || "2").toString();

function normalizeTarget(raw) {
  return (raw || "").trim().toLowerCase().replace(/_/g, "-");
}

const DEFAULT_TARGET = normalizeTarget(process.env.REGISTRY_DEFAULT_TARGET || "base-sepolia");

const CHAIN_SOURCES = {
  base: {
    addressEnv: ["NEXT_PUBLIC_REGISTRY_ADDRESS"],
    chainIdEnv: ["REGISTRY_CHAIN_ID"],
    defaultChainId: "8453"
  },
  "base-sepolia": {
    addressEnv: ["BASE_SEPOLIA_REGISTRY_ADDRESS", "NEXT_PUBLIC_REGISTRY_ADDRESS"],
    chainIdEnv: ["BASE_SEPOLIA_REGISTRY_CHAIN_ID", "REGISTRY_CHAIN_ID"],
    defaultChainId: "84532"
  },
  appchain: {
    addressEnv: ["APPCHAIN_REGISTRY_ADDRESS"],
    chainIdEnv: ["APPCHAIN_REGISTRY_CHAIN_ID"],
    defaultChainId: null
  }
};

const CHAIN_ALIASES = {
  base: "base",
  "base-mainnet": "base",
  "base-sepolia": "base-sepolia",
  basesepolia: "base-sepolia",
  "base-testnet": "base-sepolia",
  appchain: "appchain"
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[BaseManRegistry] ${message}`);
  }
}

function resolveChainKey(target) {
  const normalized = normalizeTarget(target || DEFAULT_TARGET);
  const aliased = CHAIN_ALIASES[normalized] || normalized;
  const source = CHAIN_SOURCES[aliased];
  assert(source, `Unsupported registry target "${target || normalized}"`);
  return { key: aliased, source };
}

function readFirstEnv(keys = []) {
  for (const key of keys) {
    if (key && typeof process.env[key] === 'string') {
      const v = process.env[key];
      try { return v.trim(); } catch (_) { return v; }
    }
  }
  return undefined;
}

const registryCache = new Map();

function buildDomain(address, chainId) {
  return {
    name: CONTRACT_NAME,
    version: CONTRACT_VERSION,
    chainId,
    verifyingContract: address
  };
}

function parseRegistryConfig(target) {
  const { key, source } = resolveChainKey(target);
  if (registryCache.has(key)) {
    return registryCache.get(key);
  }

  const rawAddress = readFirstEnv(source.addressEnv);
  assert(
    rawAddress,
    `${source.addressEnv.join(" / ")} env variable is required for target "${key}"`
  );
  assert(ethers.isAddress(rawAddress), `${source.addressEnv[0]} must be a valid address`);
  const address = ethers.getAddress(rawAddress);

  const rawChainId =
    readFirstEnv(source.chainIdEnv) ??
    (source.defaultChainId !== null ? source.defaultChainId : undefined);
  assert(
    rawChainId !== undefined,
    `${source.chainIdEnv.join(" / ")} env variable is required for target "${key}"`
  );

  let chainId;
  try {
    chainId = BigInt(rawChainId);
  } catch (error) {
    throw new Error(`[BaseManRegistry] ${source.chainIdEnv[0]} must be a valid integer value`);
  }

  const config = {
    target: key,
    address,
    chainId,
    chainIdNumber: Number(chainId),
    domain: buildDomain(address, chainId)
  };

  registryCache.set(key, config);
  return config;
}

export function getRegistryContext(target = DEFAULT_TARGET) {
  return parseRegistryConfig(target);
}

export function getRegistryTargets() {
  return Object.keys(CHAIN_SOURCES);
}

const defaultContext = getRegistryContext();

export const registryAddress = defaultContext.address;
export const registryChainId = defaultContext.chainId;
export const registryChainIdNumber = defaultContext.chainIdNumber;
export const registryDomain = defaultContext.domain;

const V1_scoreTypes = {
  Score: [
    { name: "player", type: "address" },
    { name: "score", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

const V1_questTypes = {
  Quest: [
    { name: "player", type: "address" },
    { name: "questId", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

const V2_scoreTypes = {
  Score: [
    { name: "player", type: "address" },
    { name: "score", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" }
  ]
};

const V2_questTypes = {
  Quest: [
    { name: "player", type: "address" },
    { name: "questId", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" }
  ]
};

export const scoreTypes = CONTRACT_VERSION === "2" ? V2_scoreTypes : V1_scoreTypes;
export const questTypes = CONTRACT_VERSION === "2" ? V2_questTypes : V1_questTypes;

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
