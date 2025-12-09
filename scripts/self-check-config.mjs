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
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

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
  
  // 1. Check REGISTRY_CHAIN_ID vs onchain-config.js
  const envChainId = process.env.REGISTRY_CHAIN_ID ? Number(process.env.REGISTRY_CHAIN_ID) : null;
  const onchainConfig = readOnchainConfig();
  
  if (onchainConfig && envChainId !== null) {
    if (onchainConfig.chainId !== envChainId) {
      log.error(`Chain ID mismatch: REGISTRY_CHAIN_ID (env) = ${envChainId}, but onchain-config.js has chainId = ${onchainConfig.chainId}`);
      issuesFound++;
    }
  }
  
  // 2. Check registry addresses
  const baseMainnetReg = process.env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS;
  const baseSepoliaReg = process.env.BASE_SEPOLIA_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_BASE_SEPOLIA_REGISTRY_ADDRESS;
  const defaultReg = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  
  if (onchainConfig && onchainConfig.registryAddress) {
    const expectedReg = onchainConfig.chainId === 8453 ? baseMainnetReg : 
                       (onchainConfig.chainId === 84532 ? baseSepoliaReg : defaultReg);
    
    if (expectedReg && onchainConfig.registryAddress.toLowerCase() !== expectedReg.toLowerCase()) {
      log.error(`Registry address mismatch for chain ${onchainConfig.chainId}: env has ${expectedReg}, but onchain-config.js has ${onchainConfig.registryAddress}`);
      issuesFound++;
    }
  }
  
  // 3. Check CHAIN_METADATA consistency
  const chainMetadata = readChainMetadata();
  if (chainMetadata && chainMetadata.chainIds) {
    const supportedChains = chainMetadata.chainIds;
    
    // Check if env chain IDs are in CHAIN_METADATA
    if (envChainId !== null && !supportedChains.includes(envChainId)) {
      log.warn(`REGISTRY_CHAIN_ID (${envChainId}) is not in CHAIN_METADATA. Supported chains: ${supportedChains.join(', ')}`);
      issuesFound++;
    }
    
    // Check if onchain-config chainId is in CHAIN_METADATA
    if (onchainConfig && onchainConfig.chainId && !supportedChains.includes(onchainConfig.chainId)) {
      log.warn(`onchain-config.js chainId (${onchainConfig.chainId}) is not in CHAIN_METADATA. Supported chains: ${supportedChains.join(', ')}`);
      issuesFound++;
    }
  }
  
  // 4. Check EIP-712 version
  const eip712 = getEip712Version();
  if (eip712.env && eip712.env !== eip712.expected) {
    log.warn(`EIP-712 version mismatch: env has "${eip712.env}", but contract expects "${eip712.expected}"`);
    issuesFound++;
  }
  
  // 5. Check for missing critical env vars
  if (!baseMainnetReg && !baseSepoliaReg && !defaultReg) {
    log.warn('No registry address configured in env (NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS, BASE_SEPOLIA_REGISTRY_ADDRESS, or NEXT_PUBLIC_REGISTRY_ADDRESS)');
    issuesFound++;
  }
  
  // Summary
  if (issuesFound === 0) {
    log.info('✅ Config check passed - no inconsistencies found');
  } else {
    log.warn(`⚠️  Config check found ${issuesFound} issue(s). Review the messages above.`);
  }
  
  // Never exit with error code - this is informational only
  return issuesFound;
}

// Run the check
try {
  const issues = checkConfig();
  process.exit(0); // Always exit successfully
} catch (error) {
  log.error('Config check failed with error:', error);
  process.exit(0); // Still exit successfully - this is informational only
}

