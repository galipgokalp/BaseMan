#!/usr/bin/env node
/**
 * Phase 5 - Axis A Test: Onchain Client Modularization
 * Tests that onchain modules work correctly and public API is preserved
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log('🧪 Phase 5 - Axis A Test: Onchain Client Modularization\n');

let errors = 0;
let passed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    errors++;
  }
}

// Test 1: Check module files exist
test('Module files exist', () => {
  const modules = [
    'src/onchain/provider.js',
    'src/onchain/sdk-context.js',
    'src/onchain/score-service.js',
    'src/onchain/profile-service.js',
    'src/onchain/index.js'
  ];
  
  for (const module of modules) {
    const path = join(ROOT, module);
    const content = readFileSync(path, 'utf-8');
    if (!content || content.length < 100) {
      throw new Error(`Module ${module} is empty or too small`);
    }
  }
});

// Test 2: Check onchain-client.js imports modules
test('onchain-client.js imports modules', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  if (!content.includes("from './onchain/index.js'")) {
    throw new Error('onchain-client.js does not import from onchain/index.js');
  }
});

// Test 3: Check public API is preserved
test('Public API preserved (window.BaseManOnchain)', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  const requiredMethods = [
    'ensureWallet',
    'setNetwork',
    'submitScore',
    'completeQuest',
    'isWalletReady',
    'getWalletAddress'
  ];
  
  for (const method of requiredMethods) {
    if (!content.includes(`window.BaseManOnchain = {`) || 
        !content.includes(`${method}`)) {
      throw new Error(`Public API method ${method} not found in window.BaseManOnchain`);
    }
  }
});

// Test 4: Check provider module exports
test('Provider module exports correctly', () => {
  const content = readFileSync(join(ROOT, 'src/onchain/provider.js'), 'utf-8');
  const requiredExports = [
    'CHAIN_METADATA',
    'toHexChainId',
    'ensureChain',
    'getChainKey'
  ];
  
  for (const exp of requiredExports) {
    if (!content.includes(`export`) || !content.includes(exp)) {
      throw new Error(`Provider module missing export: ${exp}`);
    }
  }
});

// Test 5: Check index.html uses type="module"
test('index.html uses type="module" for onchain-client.js', () => {
  const content = readFileSync(join(ROOT, 'index.html'), 'utf-8');
  if (!content.includes('type="module"') || 
      !content.includes('src/onchain-client.js')) {
    throw new Error('index.html does not use type="module" for onchain-client.js');
  }
});

console.log(`\n📊 Results: ${passed} passed, ${errors} failed\n`);

if (errors > 0) {
  console.error('❌ Axis A tests failed!');
  process.exit(1);
} else {
  console.log('✅ All Axis A tests passed!');
  process.exit(0);
}

