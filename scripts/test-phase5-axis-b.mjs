#!/usr/bin/env node
/**
 * Phase 5 - Axis B Test: Leaderboard Modularization
 * Tests that leaderboard modules work correctly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log('🧪 Phase 5 - Axis B Test: Leaderboard Modularization\n');

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

// Test 1: Check service module files exist
test('Service module files exist', () => {
  const modules = [
    'src/leaderboard/services/user-detection.js',
    'src/leaderboard/services/profile-mapping.js',
    'src/leaderboard/services/rank-calculation.js',
    'src/leaderboard/services/index.js'
  ];
  
  for (const module of modules) {
    const path = join(ROOT, module);
    const content = readFileSync(path, 'utf-8');
    if (!content || content.length < 100) {
      throw new Error(`Module ${module} is empty or too small`);
    }
  }
});

// Test 2: Check api.js imports services
test('api.js imports service modules', () => {
  const content = readFileSync(join(ROOT, 'src/leaderboard/api.js'), 'utf-8');
  if (!content.includes("from './services/")) {
    throw new Error('api.js does not import from services modules');
  }
});

// Test 3: Check leaderboard-panel.js imports services
test('leaderboard-panel.js imports service modules', () => {
  const content = readFileSync(join(ROOT, 'src/leaderboard-panel.js'), 'utf-8');
  if (!content.includes("from './leaderboard/services/")) {
    throw new Error('leaderboard-panel.js does not import from services modules');
  }
});

// Test 4: Check public API is preserved
test('Public API preserved (window.BaseManLeaderboard)', () => {
  const content = readFileSync(join(ROOT, 'src/leaderboard-panel.js'), 'utf-8');
  const requiredMethods = ['show', 'hide', 'setVisible', 'refresh'];
  
  if (!content.includes(`window.BaseManLeaderboard = {`)) {
    throw new Error('window.BaseManLeaderboard not found');
  }
  
  for (const method of requiredMethods) {
    // Check for method definition (can be method() or method:)
    const hasMethod = content.includes(`${method}()`) || 
                      content.includes(`${method}:`) ||
                      content.includes(`${method}(`);
    if (!hasMethod) {
      throw new Error(`Public API method ${method} not found in window.BaseManLeaderboard`);
    }
  }
});

// Test 5: Check user-detection module exports
test('User detection module exports correctly', () => {
  const content = readFileSync(join(ROOT, 'src/leaderboard/services/user-detection.js'), 'utf-8');
  const requiredExports = [
    'getCachedUserInfo',
    'clearUserInfoCache',
    'isMyEntry'
  ];
  
  for (const exp of requiredExports) {
    if (!content.includes(`export`) || !content.includes(exp)) {
      throw new Error(`User detection module missing export: ${exp}`);
    }
  }
});

console.log(`\n📊 Results: ${passed} passed, ${errors} failed\n`);

if (errors > 0) {
  console.error('❌ Axis B tests failed!');
  process.exit(1);
} else {
  console.log('✅ All Axis B tests passed!');
  process.exit(0);
}

