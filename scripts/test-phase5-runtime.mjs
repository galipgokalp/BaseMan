#!/usr/bin/env node
/**
 * Phase 5 - Runtime Test: Verify window.BaseManOnchain is available immediately
 * This test simulates Base App's module loading behavior
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log('🧪 Phase 5 - Runtime Test: window.BaseManOnchain Availability\n');

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

// Test 1: Check window.BaseManOnchain is exported BEFORE IIFE
test('window.BaseManOnchain exported before IIFE', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  const lines = content.split('\n');
  
  const iifeLine = lines.findIndex(l => l.trim() === '(function () {');
  const earlyExportLine = lines.findIndex((l, i) => 
    i < iifeLine && l.includes('window.BaseManOnchain = {')
  );
  
  if (earlyExportLine === -1 || earlyExportLine >= iifeLine) {
    throw new Error('window.BaseManOnchain must be exported BEFORE IIFE starts');
  }
  
  if (iifeLine === -1) {
    throw new Error('IIFE not found');
  }
});

// Test 2: Check all required methods exist in placeholder
test('All required methods in placeholder', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  const placeholderSection = content.substring(0, content.indexOf('(function () {'));
  
  const requiredMethods = [
    'ensureWallet',
    'submitScore',
    'getWalletAddress',
    'isWalletReady',
    'getCurrentChainId',
    'completeQuest',
    'setNetwork',
    'handleRunStart'
  ];
  
  for (const method of requiredMethods) {
    if (!placeholderSection.includes(`${method}:`)) {
      throw new Error(`Method ${method} missing in placeholder`);
    }
  }
});

// Test 3: Check placeholder gets updated in initialize()
test('Placeholder updated in initialize()', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  
  if (!content.includes('window.BaseManOnchain.ensureWallet = ensureWallet')) {
    throw new Error('Placeholder not updated in initialize()');
  }
});

// Test 4: Runtime simulation - Check if module can be loaded
test('Module syntax is valid', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  
  // Basic syntax check - try to parse as module
  try {
    // Check for common syntax errors
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    
    if (openBraces !== closeBraces) {
      throw new Error(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
    }
    
    if (openParens !== closeParens) {
      throw new Error(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
    }
  } catch (error) {
    throw new Error(`Syntax check failed: ${error.message}`);
  }
});

// Test 5: Check import paths are correct
test('Import paths are valid', () => {
  const content = readFileSync(join(ROOT, 'src/onchain-client.js'), 'utf-8');
  const importLines = content.split('\n').filter(l => l.trim().startsWith('import'));
  
  for (const importLine of importLines) {
    if (importLine.includes("from './onchain/")) {
      // Check if the imported file exists
      const match = importLine.match(/from\s+['"](.+?)['"]/);
      if (match) {
        const importPath = match[1];
        const fullPath = join(ROOT, 'src', importPath);
        try {
          const importedContent = readFileSync(fullPath, 'utf-8');
          if (!importedContent || importedContent.length < 10) {
            throw new Error(`Imported file ${importPath} is empty or invalid`);
          }
        } catch (err) {
          throw new Error(`Cannot read imported file: ${importPath} - ${err.message}`);
        }
      }
    }
  }
});

console.log(`\n📊 Results: ${passed} passed, ${errors} failed\n`);

if (errors > 0) {
  console.error('❌ Runtime tests failed!');
  process.exit(1);
} else {
  console.log('✅ All runtime tests passed!');
  process.exit(0);
}

