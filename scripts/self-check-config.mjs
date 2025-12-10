#!/usr/bin/env node
/**
 * Config Self-Check Script
 * 
 * Checks for inconsistencies between:
 * - Environment variables (.env)
 * - Generated onchain-config.js
 * - CHAIN_METADATA in src/onchain/index.js
 * 
 * This script only logs issues; it does not block builds or runtime.
 * Use it during development to catch configuration mismatches early.
 */

import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const colors = {
  red: (msg) => `\x1b[31m${msg}\x1b[0m`,
  yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
  green: (msg) => `\x1b[32m${msg}\x1b[0m`
};

// Simple logger for this script
const log = {
  error: (...args) => console.error('[SELF-CHECK]', ...args),
  warn: (...args) => console.warn('[SELF-CHECK]', ...args),
  info: (...args) => console.info('[SELF-CHECK]', ...args)
};

/**
 * Read and parse onchain-config.js
 */
function readOnchainConfig() {
  try {
    const configPath = join(ROOT, 'src/onchain-config.js');
    const content = readFileSync(configPath, 'utf-8');
    
    // Extract the config object from the file
    const match = content.match(/window\.BaseManOnchainConfig\s*=\s*({[\s\S]*?});/);
    if (!match) {
      log.warn('Could not parse onchain-config.js');
      return null;
    }
    
    // Evaluate the config object (safe because it's our own generated file)
    const configStr = match[1];
    // Replace single quotes with double quotes for JSON parsing
    const jsonStr = configStr.replace(/'/g, '"');
    try {
      return JSON.parse(jsonStr);
    } catch {
      // Fallback: try to extract values manually
      const chainIdMatch = configStr.match(/chainId["']?\s*:\s*(\d+)/);
      const registryMatch = configStr.match(/registryAddress["']?\s*:\s*["']([^"']+)["']/);
      return {
        chainId: chainIdMatch ? Number(chainIdMatch[1]) : null,
        registryAddress: registryMatch ? registryMatch[1] : null
      };
    }
  } catch (error) {
    log.warn('Failed to read onchain-config.js:', error.message);
    return null;
  }
}

/**
 * Read BaseManRegistry eip712Version from contract
 */
function readContractVersion() {
  try {
    const contractPath = join(ROOT, 'contracts/BaseManRegistry.sol');
    const content = readFileSync(contractPath, 'utf-8');
    const directMatch = content.match(/eip712Version\(\)[^{]*{[^"]*"([^"]+)"/s);
    if (directMatch) return directMatch[1];
    const ctorMatch = content.match(/EIP712\([^,]+,\s*["'`]([^"'`]+)["'`]\)/);
    if (ctorMatch) return ctorMatch[1];
  } catch (error) {
    log.warn('Failed to read contract version:', error.message);
  }
  return null;
}

/**
 * Read typed-data version string from known sources
 */
function readTypedDataVersion() {
  const candidates = [
    join(ROOT, 'src/utils/typed-data.js'),
    join(ROOT, 'api/_lib/registry.js')
  ];
  for (const path of candidates) {
    try {
      if (!existsSync(path)) continue;
      const content = readFileSync(path, 'utf-8');
      const match = content.match(/VERSION[^=]*=\s*["'`]([^"'`]+)["'`]/i) ||
        content.match(/CONTRACT_VERSION[^=]*=\s*["'`]([^"'`]+)["'`]/) ||
        content.match(/CONTRACT_VERSION[^=]*=\s*\([^)]*["'`]([^"'`]+)["'`]\)/);
      if (match) {
        return { version: match[1], path };
      }
    } catch (_) {
      continue;
    }
  }
  return { version: null, path: null };
}

/**
 * Read package.json metadata and optional docs metadata
 */
function readPackageMetadata() {
  try {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
    let docsMeta = null;
    const docsPath = join(ROOT, 'docs/package-metadata.json');
    if (existsSync(docsPath)) {
      try {
        docsMeta = JSON.parse(readFileSync(docsPath, 'utf-8'));
      } catch (error) {
        log.warn('Failed to parse docs/package-metadata.json:', error.message);
      }
    }
    return { pkg, docsMeta };
  } catch (error) {
    log.warn('Failed to read package.json:', error.message);
    return { pkg: null, docsMeta: null };
  }
}

/**
 * Read CHAIN_METADATA from src/onchain/provider.js
 */
function readChainMetadata() {
  try {
    const providerPath = join(ROOT, 'src/onchain/provider.js');
    const content = readFileSync(providerPath, 'utf-8');
    
    // Extract CHAIN_METADATA object
    const match = content.match(/export\s+const\s+CHAIN_METADATA\s*=\s*({[\s\S]*?});/);
    if (!match) {
      log.warn('Could not parse CHAIN_METADATA from provider.js');
      return null;
    }
    
    // Try to extract chain IDs from the metadata
    const chainIds = [];
    const chainIdMatches = match[1].matchAll(/(\d+)\s*:/g);
    for (const m of chainIdMatches) {
      chainIds.push(Number(m[1]));
    }
    
    return { chainIds };
  } catch (error) {
    log.warn('Failed to read CHAIN_METADATA:', error.message);
    return null;
  }
}

/**
 * Get EIP-712 version from env and config
 */
function getEip712Version() {
  const envVersion = process.env.REGISTRY_EIP712_VERSION || process.env.NEXT_PUBLIC_REGISTRY_EIP712_VERSION;
  // EIP-712 version should be "2" per contract
  return { env: envVersion, expected: '2' };
}

/**
 * Main check function
 */
function checkConfig() {
  log.info('Starting config self-check...');
  
  let issuesFound = 0;
  const warnings = [];
  const errors = [];
  
  // 1. Check REGISTRY_CHAIN_ID vs onchain-config.js
  const envChainId = process.env.REGISTRY_CHAIN_ID ? Number(process.env.REGISTRY_CHAIN_ID) : null;
  const onchainConfig = readOnchainConfig();
  
  if (onchainConfig && envChainId !== null) {
    if (onchainConfig.chainId !== envChainId) {
      const msg = `Chain ID mismatch: REGISTRY_CHAIN_ID (env) = ${envChainId}, but onchain-config.js has chainId = ${onchainConfig.chainId}`;
      log.error(colors.red(msg));
      errors.push(msg);
      issuesFound++;
    }
  }
  
  // 2. Check registry addresses
  const baseMainnetReg = process.env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS;
  const baseSepoliaReg = process.env.BASE_SEPOLIA_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_BASE_SEPOLIA_REGISTRY_ADDRESS;
  const defaultReg = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  const anyRegistryEnv = baseMainnetReg || baseSepoliaReg || defaultReg;
  
  if (onchainConfig && onchainConfig.registryAddress && anyRegistryEnv) {
    const expectedReg = onchainConfig.chainId === 8453 ? baseMainnetReg : 
                       (onchainConfig.chainId === 84532 ? baseSepoliaReg : defaultReg);
    
    if (expectedReg && onchainConfig.registryAddress.toLowerCase() !== expectedReg.toLowerCase()) {
      const msg = `Registry address mismatch for chain ${onchainConfig.chainId}: env has ${expectedReg}, but onchain-config.js has ${onchainConfig.registryAddress}`;
      log.error(colors.red(msg));
      errors.push(msg);
      issuesFound++;
    }
  }
  
  // 3. Check CHAIN_METADATA consistency
  const chainMetadata = readChainMetadata();
  if (chainMetadata && chainMetadata.chainIds) {
    const supportedChains = chainMetadata.chainIds;
    
    // Check if env chain IDs are in CHAIN_METADATA
    if (envChainId !== null && !supportedChains.includes(envChainId)) {
      const msg = `REGISTRY_CHAIN_ID (${envChainId}) is not in CHAIN_METADATA. Supported chains: ${supportedChains.join(', ')}`;
      log.warn(colors.yellow(msg));
      warnings.push(msg);
      issuesFound++;
    }
    
    // Check if onchain-config chainId is in CHAIN_METADATA
    if (onchainConfig && onchainConfig.chainId && !supportedChains.includes(onchainConfig.chainId)) {
      const msg = `onchain-config.js chainId (${onchainConfig.chainId}) is not in CHAIN_METADATA. Supported chains: ${supportedChains.join(', ')}`;
      log.warn(colors.yellow(msg));
      warnings.push(msg);
      issuesFound++;
    }
  }
  
  // 4. Check EIP-712 version (env vs contract vs typed-data source)
  const eip712 = getEip712Version();
  const contractVersion = readContractVersion();
  const typedVersionInfo = readTypedDataVersion();

  if (eip712.env && eip712.env !== eip712.expected) {
    const msg = `EIP-712 version mismatch: env has "${eip712.env}", but contract expects "${eip712.expected}"`;
    log.warn(colors.yellow(msg));
    warnings.push(msg);
    issuesFound++;
  }

  if (contractVersion && typedVersionInfo.version && contractVersion !== typedVersionInfo.version) {
    const msg = `Typed-data version mismatch: contract eip712Version="${contractVersion}" vs ${typedVersionInfo.path || 'typed-data source'}="${typedVersionInfo.version}"`;
    log.error(colors.red(msg));
    errors.push(msg);
    issuesFound++;
  } else if (!typedVersionInfo.version) {
    const msg = 'Typed-data version source not found (expected src/utils/typed-data.js or api/_lib/registry.js)';
    log.warn(colors.yellow(msg));
    warnings.push(msg);
    issuesFound++;
  }

  // 5. Check for missing critical env vars
  if (!anyRegistryEnv) {
    const msg = 'No registry address configured in env (NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS, BASE_SEPOLIA_REGISTRY_ADDRESS, or NEXT_PUBLIC_REGISTRY_ADDRESS)';
    log.warn(colors.yellow(msg));
    warnings.push(msg);
    issuesFound++;
  }

  const requiredEnvs = [
    'BASE_URL',
    'ETHEREUM_RPC_URL',
    'BASE_RPC_URL',
    'NEXT_PUBLIC_MINIAPP_ID'
  ];
  requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
      const msg = `Missing recommended env: ${key}`;
      log.warn(colors.red(msg));
      warnings.push(msg);
      issuesFound++;
    }
  });

  if (!process.env.NEYNAR_API_KEY) {
    const msg = 'NEYNAR_API_KEY not set - running in degraded profile mode';
    log.warn(colors.yellow(msg));
    warnings.push(msg);
  }

  if (!process.env.REDIS_URL) {
    const msg = 'REDIS_URL not set - Redis features will be disabled (fallback mode)';
    log.warn(colors.yellow(msg));
    warnings.push(msg);
  }

  // 6. Mini-app auth key validation
  const pk = process.env.MINIAPP_AUTH_PRIVATE_KEY;
  if (pk && !/^0x[0-9a-fA-F]{64}$/.test(pk.trim())) {
    const msg = 'MINIAPP_AUTH_PRIVATE_KEY format invalid - expected 0x + 64 hex chars';
    log.warn(colors.red(msg));
    warnings.push(msg);
    issuesFound++;
  }

  const pub = process.env.MINIAPP_AUTH_PUBLIC_KEY;
  if (pub) {
    const normalized = pub.trim();
    const isValid = /^0x[0-9a-fA-F]{64}$/.test(normalized) || /^0x[0-9a-fA-F]{128}$/.test(normalized);
    if (!isValid) {
      const msg = 'MINIAPP_AUTH_PUBLIC_KEY format looks invalid - expected 0x-prefixed hex';
      log.warn(colors.red(msg));
      warnings.push(msg);
      issuesFound++;
    }
  }

  // 7. package.json consistency with docs metadata (if available)
  const { pkg, docsMeta } = readPackageMetadata();
  if (pkg) {
    if (!pkg.name || !pkg.version || !pkg.description) {
      const msg = 'package.json is missing name/version/description';
      log.warn(colors.red(msg));
      warnings.push(msg);
      issuesFound++;
    }
    if (docsMeta) {
      const mismatches = [];
      if (docsMeta.name && docsMeta.name !== pkg.name) mismatches.push(`name "${pkg.name}" != docs "${docsMeta.name}"`);
      if (docsMeta.version && docsMeta.version !== pkg.version) mismatches.push(`version "${pkg.version}" != docs "${docsMeta.version}"`);
      if (docsMeta.description && docsMeta.description !== pkg.description) mismatches.push('description differs from docs metadata');
      if (mismatches.length) {
        const msg = `package.json metadata differs from docs: ${mismatches.join('; ')}`;
        log.warn(colors.yellow(msg));
        warnings.push(msg);
        issuesFound++;
      }
    } else {
      log.info('No docs/package-metadata.json found; basic package metadata validation only');
    }
  }

  // Summary
  if (issuesFound === 0) {
    log.info(colors.green('✅ Config check passed - no inconsistencies found'));
  } else {
    log.warn(colors.yellow(`⚠️  Config check found ${issuesFound} issue(s). Review the messages above.`));
  }

  if (warnings.length || errors.length) {
    log.info('Summary:');
    warnings.forEach((w) => log.warn(` - ${w}`));
    errors.forEach((e) => log.error(` - ${e}`));
  }
  
  return issuesFound;
}

// Run the check
try {
  const issues = checkConfig();
  const isCI = process.env.CI === 'true';
  if (isCI && issues > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0; // Informational in local dev
  }
} catch (error) {
  log.error('Config check failed with error:', error);
  process.exit(0); // Still exit successfully - this is informational only
}
