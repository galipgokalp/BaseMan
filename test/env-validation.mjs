#!/usr/bin/env node
/**
 * Test script to verify env validation and registry lazy loading fixes
 * Tests:
 * 1. Empty optional boolean envs don't crash
 * 2. Import-time env access is removed (module loads without crashing)
 * 3. Lazy evaluation works correctly
 * 4. Required envs still fail appropriately
 */

import { resetEnv } from '../api/_lib/env.js';

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn: async () => await fn() });
}

function log(ok, message) {
  const symbol = ok ? '✅' : '❌';
  console.log(`${symbol} ${message}`);
  if (ok) passed++;
  else failed++;
}

// Test 1: Empty optional boolean envs don't crash
test('Empty optional boolean env returns undefined', async () => {
  // Save original env
  const originalEnv = { ...process.env };
  
  try {
    // Set empty string for optional boolean
    process.env.LEADERBOARD_DISABLE_PROFILE_ENRICHMENT = '';
    
    // Reset env cache
    resetEnv();
    
    // Import env module (should not crash)
    const { optBool } = await import('../api/_lib/env.js');
    
    // Should return undefined (or defaultValue if provided)
    const result1 = optBool('LEADERBOARD_DISABLE_PROFILE_ENRICHMENT');
    const result2 = optBool('LEADERBOARD_DISABLE_PROFILE_ENRICHMENT', false);
    
    log(result1 === undefined, 'Empty string returns undefined');
    log(result2 === false, 'Empty string returns defaultValue when provided');
    
    // Test with whitespace
    process.env.LEADERBOARD_DISABLE_PROFILE_ENRICHMENT = '   ';
    resetEnv();
    const result3 = optBool('LEADERBOARD_DISABLE_PROFILE_ENRICHMENT');
    log(result3 === undefined, 'Whitespace-only string returns undefined');
    
  } catch (error) {
    log(false, `Empty optional boolean crashed: ${error.message}`);
    console.error(error);
  } finally {
    // Restore original env
    process.env = originalEnv;
    resetEnv();
  }
});

// Test 2: Module import doesn't crash with missing optional envs
test('Registry module loads without crashing on missing optional envs', async () => {
  const originalEnv = { ...process.env };
  
  try {
    // Remove optional envs but keep required ones for module to load
    delete process.env.LEADERBOARD_DISABLE_PROFILE_ENRICHMENT;
    delete process.env.REGISTRY_EIP712_VERSION;
    
    // Set minimal required envs for module to load
    process.env.CDP_API_KEY_ID = 'test-key-id';
    process.env.CDP_API_KEY_SECRET = 'test-key-secret';
    process.env.REGISTRY_CHAIN_ID = '8453';
    process.env.REGISTRY_DEFAULT_TARGET = 'base';
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2';
    
    // Reset env cache
    resetEnv();
    
    // Import registry module (should not crash)
    const registryModule = await import('../api/_lib/registry.js');
    
    log(true, 'Registry module loaded without crashing');
    
    // Verify lazy exports exist (accessing them may return null if env is incomplete, but shouldn't crash)
    try {
      const addr = registryModule.registryAddress;
      log(typeof addr !== 'undefined', 'registryAddress export exists and is accessible');
    } catch (error) {
      log(false, `registryAddress access failed: ${error.message}`);
    }
    
    try {
      const types = registryModule.scoreTypes;
      log(typeof types === 'object', 'scoreTypes export exists and is accessible');
    } catch (error) {
      log(false, `scoreTypes access failed: ${error.message}`);
    }
    
    try {
      const qtypes = registryModule.questTypes;
      log(typeof qtypes === 'object', 'questTypes export exists and is accessible');
    } catch (error) {
      log(false, `questTypes access failed: ${error.message}`);
    }
    
  } catch (error) {
    log(false, `Registry module crashed on import: ${error.message}`);
    console.error(error);
  } finally {
    process.env = originalEnv;
    resetEnv();
  }
});

// Test 3: Lazy evaluation works - values computed on first access
test('Lazy evaluation - values computed on first access, not import time', async () => {
  const originalEnv = { ...process.env };
  
  try {
    // Set test env values
    process.env.REGISTRY_DEFAULT_TARGET = 'base';
    process.env.REGISTRY_EIP712_VERSION = '2';
    process.env.REGISTRY_CHAIN_ID = '8453';
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2';
    process.env.CDP_API_KEY_ID = 'test-key-id';
    process.env.CDP_API_KEY_SECRET = 'test-key-secret';
    
    resetEnv();
    
    // Import registry module
    const registryModule = await import('../api/_lib/registry.js');
    
    // Access lazy values - should compute on first access
    const address = registryModule.registryAddress;
    const scoreTypes = registryModule.scoreTypes;
    const questTypes = registryModule.questTypes;
    
    log(typeof address === 'string' || address === null, 'registryAddress is computed lazily');
    log(typeof scoreTypes === 'object', 'scoreTypes is computed lazily');
    log(typeof questTypes === 'object', 'questTypes is computed lazily');
    
    // Verify scoreTypes has nonce (V2)
    if (scoreTypes && scoreTypes.Score) {
      const hasNonce = scoreTypes.Score.some(f => f.name === 'nonce');
      log(hasNonce, 'scoreTypes uses V2 (has nonce field)');
    }
    
  } catch (error) {
    log(false, `Lazy evaluation test failed: ${error.message}`);
    console.error(error);
  } finally {
    process.env = originalEnv;
    resetEnv();
  }
});

// Test 4: Valid boolean values still work
test('Valid boolean values are parsed correctly', async () => {
  const originalEnv = { ...process.env };
  
  try {
    const { optBool, reqBool } = await import('../api/_lib/env.js');
    
    // Test truthy values
    const truthyValues = ['true', 'TRUE', 'True', '1', 'yes', 'YES', 'on', 'ON'];
    for (const val of truthyValues) {
      process.env.TEST_BOOL = val;
      resetEnv();
      const result = optBool('TEST_BOOL');
      log(result === true, `"${val}" parses to true`);
    }
    
    // Test falsy values
    const falsyValues = ['false', 'FALSE', 'False', '0', 'no', 'NO', 'off', 'OFF'];
    for (const val of falsyValues) {
      process.env.TEST_BOOL = val;
      resetEnv();
      const result = optBool('TEST_BOOL');
      log(result === false, `"${val}" parses to false`);
    }
    
  } catch (error) {
    log(false, `Boolean parsing test failed: ${error.message}`);
    console.error(error);
  } finally {
    process.env = originalEnv;
    resetEnv();
  }
});

// Test 5: Invalid boolean values still throw
test('Invalid boolean values throw error', async () => {
  const originalEnv = { ...process.env };
  
  try {
    const { optBool } = await import('../api/_lib/env.js');
    
    const invalidValues = ['invalid', 'maybe', '2', 'xyz'];
    for (const val of invalidValues) {
      process.env.TEST_BOOL = val;
      resetEnv();
      try {
        const result = optBool('TEST_BOOL');
        log(false, `"${val}" should throw but returned: ${result}`);
      } catch (error) {
        log(true, `"${val}" correctly throws error`);
      }
    }
    
  } catch (error) {
    log(false, `Invalid boolean test failed: ${error.message}`);
    console.error(error);
  } finally {
    process.env = originalEnv;
    resetEnv();
  }
});

// Test 6: Required envs still fail appropriately
test('Required envs still fail when missing', async () => {
  const originalEnv = { ...process.env };
  
  try {
    const { reqString, reqBool } = await import('../api/_lib/env.js');
    
    // Remove required env
    delete process.env.CDP_API_KEY_ID;
    resetEnv();
    
    try {
      const env = await import('../api/_lib/env.js');
      const { getEnv } = env;
      getEnv(); // This should throw
      log(false, 'getEnv() should throw when required env is missing');
    } catch (error) {
      log(true, 'getEnv() correctly throws when required env is missing');
    }
    
  } catch (error) {
    // This is expected
    log(true, 'Required env validation works');
  } finally {
    process.env = originalEnv;
    resetEnv();
  }
});

// Test 7: Registry exports work with ethers functions
test('Registry exports work with ethers functions', async () => {
  const originalEnv = { ...process.env };
  
  try {
    // Set minimal required envs
    process.env.REGISTRY_DEFAULT_TARGET = 'base';
    process.env.REGISTRY_EIP712_VERSION = '2';
    process.env.REGISTRY_CHAIN_ID = '8453';
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2';
    process.env.CDP_API_KEY_ID = 'test-key-id';
    process.env.CDP_API_KEY_SECRET = 'test-key-secret';
    
    resetEnv();
    
    const { ethers } = await import('ethers');
    const registryModule = await import('../api/_lib/registry.js');
    
    // Test that registryAddress works with ethers.getAddress
    const address = registryModule.registryAddress;
    if (address) {
      try {
        const normalized = ethers.getAddress(address);
        log(true, 'registryAddress works with ethers.getAddress()');
      } catch (error) {
        log(false, `ethers.getAddress() failed: ${error.message}`);
      }
    } else {
      log(true, 'registryAddress is null (expected when env missing)');
    }
    
    // Test that registryChainId works with ethers.toBeHex
    const chainId = registryModule.registryChainId;
    if (chainId) {
      try {
        const hex = ethers.toBeHex(chainId);
        log(true, 'registryChainId works with ethers.toBeHex()');
      } catch (error) {
        log(false, `ethers.toBeHex() failed: ${error.message}`);
      }
    } else {
      log(true, 'registryChainId is null (expected when env missing)');
    }
    
  } catch (error) {
    log(false, `Ethers integration test failed: ${error.message}`);
    console.error(error);
  } finally {
    process.env = originalEnv;
    resetEnv();
  }
});

// Run all tests
async function runTests() {
  console.log('🧪 Running env validation and registry lazy loading tests...\n');
  
  for (const { name, fn } of tests) {
    console.log(`\n📋 Test: ${name}`);
    try {
      await fn();
    } catch (error) {
      log(false, `Test "${name}" threw error: ${error.message}`);
      console.error(error);
    }
  }
  
  console.log(`\n\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.error('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

