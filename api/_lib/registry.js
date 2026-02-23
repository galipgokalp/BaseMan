import { ethers } from "ethers";
import { getEnv } from "./env.js";

const CONTRACT_NAME = "BaseManRegistry";
// EIP-712 domain version (matches on-chain EIP712 constructor). Default: 1
// Default to V2 for latest contract; can be forced via REGISTRY_EIP712_VERSION

// Lazy cached getters to avoid import-time env access
let _contractVersion;
function getContractVersion() {
  if (_contractVersion === undefined) {
    const env = getEnv();
    _contractVersion = env.registry.eip712Version;
  }
  return _contractVersion;
}

function normalizeTarget(raw) {
  return (raw || "").trim().toLowerCase().replace(/_/g, "-");
}

let _defaultTarget;
function getDefaultTarget() {
  if (_defaultTarget === undefined) {
    const env = getEnv();
    _defaultTarget = normalizeTarget(env.registry.defaultTarget);
  }
  return _defaultTarget;
}

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
  const normalized = normalizeTarget(target || getDefaultTarget());
  const aliased = CHAIN_ALIASES[normalized] || normalized;
  const source = CHAIN_SOURCES[aliased];
  assert(source, `Unsupported registry target "${target || normalized}"`);
  return { key: aliased, source };
}

function readFirstEnv(keys = []) {
  // Try to use env module first, fallback to direct process.env for backward compatibility
  try {
    const env = getEnv();
    for (const key of keys) {
      if (key === 'BASE_MAINNET_REGISTRY_ADDRESS' || key === 'NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS' || key === 'NEXT_PUBLIC_REGISTRY_ADDRESS') {
        if (env.registry.baseMainnetAddress) return env.registry.baseMainnetAddress;
      }
      if (key === 'BASE_SEPOLIA_REGISTRY_ADDRESS') {
        if (env.registry.baseSepoliaAddress) return env.registry.baseSepoliaAddress;
      }
      if (key === 'REGISTRY_CHAIN_ID') {
        if (env.registry.chainId) return env.registry.chainId;
      }
      if (key === 'BASE_SEPOLIA_REGISTRY_CHAIN_ID') {
        if (env.registry.baseSepoliaChainId) return env.registry.baseSepoliaChainId;
      }
    }
  } catch {
    // Fallback to direct process.env if env module fails
  }
  
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
    version: getContractVersion(),
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
  } catch (_error) {
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

export function getRegistryContext(target = null) {
  return parseRegistryConfig(target || getDefaultTarget());
}

export function getRegistryTargets() {
  return Object.keys(CHAIN_SOURCES);
}

// Lazy initialization to avoid errors when env vars are missing
let _defaultContext = null;
let _defaultContextError = null;

function getDefaultContext() {
  if (_defaultContext) return _defaultContext;
  if (_defaultContextError) {
    // Return fallback context if we've already errored
    return {
      target: 'base',
      address: null,
      chainId: null,
      chainIdNumber: null,
      domain: null
    };
  }
  
  try {
    _defaultContext = getRegistryContext();
    return _defaultContext;
  } catch (error) {
    _defaultContextError = error;
    // Return a fallback context instead of throwing
    // This allows the API to handle missing env vars gracefully
    // Use a safe default target instead of calling getDefaultTarget() which might throw
    return {
      target: 'base',
      address: null,
      chainId: null,
      chainIdNumber: null,
      domain: null
    };
  }
}

export function getRegistryAddress() {
  const ctx = getDefaultContext();
  return ctx.address;
}

export function getRegistryChainId() {
  const ctx = getDefaultContext();
  return ctx.chainId;
}

export function getRegistryChainIdNumber() {
  const ctx = getDefaultContext();
  return ctx.chainIdNumber;
}

export function getRegistryDomain() {
  const ctx = getDefaultContext();
  return ctx.domain;
}

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

// Lazy getters for scoreTypes and questTypes to avoid import-time env access
let _cachedScoreTypes;
let _cachedQuestTypes;

function getLazyScoreTypes() {
  if (_cachedScoreTypes === undefined) {
    _cachedScoreTypes = getContractVersion() === "2" ? V2_scoreTypes : V1_scoreTypes;
  }
  return _cachedScoreTypes;
}

function getLazyQuestTypes() {
  if (_cachedQuestTypes === undefined) {
    _cachedQuestTypes = getContractVersion() === "2" ? V2_questTypes : V1_questTypes;
  }
  return _cachedQuestTypes;
}

export function getScoreTypes() {
  return getLazyScoreTypes();
}

export function getQuestTypes() {
  return getLazyQuestTypes();
}

export function getSigner(envKey = "SCORE_SIGNER_PRIVATE_KEY") {
  const env = getEnv();
  let privateKey;
  
  // Map env key names to config paths
  const keyMap = {
    "SCORE_SIGNER_PRIVATE_KEY": env.signing.scoreSignerPrivateKey,
    "QUEST_SIGNER_PRIVATE_KEY": env.signing.questSignerPrivateKey,
    "BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY": env.signing.baseSepoliaScoreSignerPrivateKey,
    "BASE_SEPOLIA_QUEST_SIGNER_PRIVATE_KEY": env.signing.baseSepoliaQuestSignerPrivateKey,
  };
  
  privateKey = keyMap[envKey] || env.signing.scoreSignerPrivateKey;
  
  assert(privateKey, `Missing ${envKey} env variable`);
  return new ethers.Wallet(privateKey);
}

export function normalizeAddress(value) {
  assert(ethers.isAddress(value), "Invalid address provided");
  return ethers.getAddress(value);
}
