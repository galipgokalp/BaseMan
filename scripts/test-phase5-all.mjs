#!/usr/bin/env node
/**
 * Phase 5 - Complete Test Suite
 * Runs all axis tests sequentially
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log('🧪 Phase 5 - Complete Test Suite\n');
console.log('=' .repeat(60) + '\n');

const tests = [
  { name: 'Axis A - Onchain Client', script: 'test-phase5-axis-a.mjs' },
  { name: 'Axis B - Leaderboard', script: 'test-phase5-axis-b.mjs' },
  { name: 'Axis C - PacMan Engine', script: 'test-phase5-axis-c.mjs' }
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const test of tests) {
  console.log(`\n📋 Running: ${test.name}\n`);
  console.log('-'.repeat(60));
  
  const result = await new Promise((resolve) => {
    const proc = spawn('node', [join(__dirname, test.script)], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: false
    });
    
    proc.on('close', (code) => {
      resolve(code === 0);
    });
  });
  
  if (result) {
    totalPassed++;
    results.push({ name: test.name, status: '✅ PASSED' });
  } else {
    totalFailed++;
    results.push({ name: test.name, status: '❌ FAILED' });
  }
  
  console.log('-'.repeat(60));
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 FINAL RESULTS\n');
console.log('='.repeat(60) + '\n');

for (const result of results) {
  console.log(`${result.status} ${result.name}`);
}

console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed\n`);

if (totalFailed > 0) {
  console.error('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('✅ All Phase 5 tests passed!');
  process.exit(0);
}

