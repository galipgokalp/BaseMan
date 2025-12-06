/**
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems - Test Suite
 * 
 * Tests:
 * - Error model (AppError, Result<T>)
 * - Safe fetch utilities
 * - Safe contract read utilities
 * - Network status utilities
 * - Error handling in leaderboard, score submission, profile panel
 * - Global error handlers
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function log(ok, msg) {
  if (ok) {
    console.log(`✅ ${msg}`);
    testsPassed++;
  } else {
    console.log(`❌ ${msg}`);
    testsFailed++;
    failures.push(msg);
  }
}

function testFileExists(filePath, description) {
  const fullPath = join(rootDir, filePath);
  const exists = existsSync(fullPath);
  log(exists, `${description}: ${filePath}`);
  return exists;
}

function testFileContent(filePath, patterns, description) {
  const fullPath = join(rootDir, filePath);
  if (!existsSync(fullPath)) {
    log(false, `${description}: File not found: ${filePath}`);
    return false;
  }
  
  const content = readFileSync(fullPath, 'utf-8');
  let allMatch = true;
  
  for (const pattern of patterns) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const matches = regex.test(content);
    if (!matches) {
      log(false, `${description}: Pattern not found in ${filePath}: ${pattern}`);
      allMatch = false;
    } else {
      log(true, `${description}: Pattern found: ${pattern}`);
    }
  }
  
  return allMatch;
}

console.log('\n🧪 Phase 6: Mini-App Stability, Error Handling & Fallback Systems - Test Suite\n');
console.log('='.repeat(80));

// ============================================
// 1. Error Model Tests
// ============================================
console.log('\n📦 1. Error Model (src/lib/errors.js)');
console.log('-'.repeat(80));

testFileExists('src/lib/errors.js', 'Error model file exists');
testFileContent('src/lib/errors.js', [
  /export class AppError/,
  /export function ok\(/,
  /export function err\(/,
  /export function createAppError/,
  /NETWORK_ERROR|TIMEOUT|BAD_RESPONSE|UNAUTHORIZED|WALLET_METHOD_UNSUPPORTED|CONTRACT_REVERT|USER_REJECTED|UNKNOWN/
], 'Error model exports and error kinds');

// ============================================
// 2. Safe Fetch Tests
// ============================================
console.log('\n🌐 2. Safe Fetch Utility (src/lib/safe-fetch.js)');
console.log('-'.repeat(80));

testFileExists('src/lib/safe-fetch.js', 'Safe fetch file exists');
testFileContent('src/lib/safe-fetch.js', [
  /export async function safeFetchJson/,
  /AbortController/,
  /timeoutMs/,
  /export function isOffline/,
  /export function requireOnline/
], 'Safe fetch exports and timeout handling');

// ============================================
// 3. Safe Contract Read Tests
// ============================================
console.log('\n📜 3. Safe Contract Read Utility (src/lib/safe-contract-read.js)');
console.log('-'.repeat(80));

testFileExists('src/lib/safe-contract-read.js', 'Safe contract read file exists');
testFileContent('src/lib/safe-contract-read.js', [
  /export async function safeContractRead/,
  /WALLET_METHOD_UNSUPPORTED/,
  /CONTRACT_REVERT/,
  /errorCode === 4200/,
  /export async function isContractReadSupported/
], 'Safe contract read exports and eth_call handling');

// ============================================
// 4. Network Status Tests
// ============================================
console.log('\n📡 4. Network Status Utility (src/lib/network-status.js)');
console.log('-'.repeat(80));

testFileExists('src/lib/network-status.js', 'Network status file exists');
testFileContent('src/lib/network-status.js', [
  /export function getNetworkStatus/,
  /export function subscribeNetworkStatus/,
  /export function initNetworkStatus/,
  /navigator\.onLine/,
  /addEventListener\('online'|'offline'/
], 'Network status exports and event handling');

// ============================================
// 5. Error Boundary Tests
// ============================================
console.log('\n🛡️ 5. Error Boundary (src/lib/error-boundary.jsx)');
console.log('-'.repeat(80));

testFileExists('src/lib/error-boundary.jsx', 'Error boundary file exists');
testFileContent('src/lib/error-boundary.jsx', [
  /export class ErrorBoundary/,
  /componentDidCatch/,
  /getDerivedStateFromError/
], 'Error boundary React component');

// ============================================
// 6. Global Error Handler Tests
// ============================================
console.log('\n🌍 6. Global Error Handler (src/lib/global-error-handler.js)');
console.log('-'.repeat(80));

testFileExists('src/lib/global-error-handler.js', 'Global error handler file exists');
testFileContent('src/lib/global-error-handler.js', [
  /export function initGlobalErrorHandler/,
  /addEventListener\('error'/,
  /addEventListener\('unhandledrejection'/
], 'Global error handler exports and event listeners');

// ============================================
// 7. Leaderboard API Integration Tests
// ============================================
console.log('\n📊 7. Leaderboard API Integration');
console.log('-'.repeat(80));

testFileContent('src/leaderboard/api.js', [
  /import.*safeFetchJson/,
  /import.*requireOnline/,
  /safeFetchJson\(/,
  /context: 'leaderboard'/
], 'Leaderboard API uses safeFetchJson');

// ============================================
// 8. Leaderboard UI Tests
// ============================================
console.log('\n📋 8. Leaderboard UI (Loading/Error/Empty States)');
console.log('-'.repeat(80));

testFileContent('src/leaderboard/dom.js', [
  /export function renderError/,
  /export function renderEmpty/,
  /export function renderLoading/,
  /onRetry/
], 'Leaderboard DOM rendering functions');

testFileContent('src/leaderboard-panel.js', [
  /renderEmpty/,
  /renderLoading/,
  /renderLoading\(/,
  /renderEmpty\(/,
  /onRetry:/
], 'Leaderboard panel uses new rendering functions');

// ============================================
// 9. Profile Panel Integration Tests
// ============================================
console.log('\n👤 9. Profile Panel (eth_call Handling)');
console.log('-'.repeat(80));

testFileContent('src/profile-panel.js', [
  /safeContractRead/,
  /import.*safe-contract-read/,
  /WALLET_METHOD_UNSUPPORTED/
], 'Profile panel uses safeContractRead');

// ============================================
// 10. Score Submission Integration Tests
// ============================================
console.log('\n🎮 10. Score Submission (Error Handling)');
console.log('-'.repeat(80));

testFileContent('src/onchain/score-service.js', [
  /import.*safeFetchJson/,
  /import.*requireOnline/,
  /import.*createAppError/,
  /safeFetchJson\(/,
  /requireOnline\(/
], 'Score service uses safeFetchJson');

testFileContent('src/onchain-client.js', [
  /errorKind/,
  /USER_REJECTED/,
  /NETWORK_ERROR|TIMEOUT/,
  /state\.submitting = false/
], 'Score submission has enhanced error handling');

// ============================================
// 11. MiniApp Auth Integration Tests
// ============================================
console.log('\n🔐 11. MiniApp Auth Integration');
console.log('-'.repeat(80));

testFileContent('src/miniapp-auth.js', [
  /safeFetchJson/,
  /import.*safe-fetch/,
  /context: 'auth'/
], 'MiniApp auth uses safeFetchJson');

// ============================================
// 12. Index.html Integration Tests
// ============================================
console.log('\n📄 12. Index.html (Initialization)');
console.log('-'.repeat(80));

testFileContent('index.html', [
  /initNetworkStatus/,
  /initGlobalErrorHandler/
], 'Index.html initializes network status and error handler');

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(80));
console.log('\n📊 Test Summary\n');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}`);

if (failures.length > 0) {
  console.log('\n❌ Failures:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 All Phase 6 tests passed!');
  process.exit(0);
}

