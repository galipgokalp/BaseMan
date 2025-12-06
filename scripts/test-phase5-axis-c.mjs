#!/usr/bin/env node
/**
 * Phase 5 - Axis C Test: PacMan Engine Modularization
 * Tests that game core modules exist and are structured correctly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log('🧪 Phase 5 - Axis C Test: PacMan Engine Modularization\n');

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

// Test 1: Check core module files exist
test('Core module files exist', () => {
  const modules = [
    'src/game/core/game-mode.js',
    'src/game/core/score-manager.js',
    'src/game/core/index.js'
  ];
  
  for (const module of modules) {
    const path = join(ROOT, module);
    const content = readFileSync(path, 'utf-8');
    if (!content || content.length < 100) {
      throw new Error(`Module ${module} is empty or too small`);
    }
  }
});

// Test 2: Check game-mode module exports
test('Game mode module exports correctly', () => {
  const content = readFileSync(join(ROOT, 'src/game/core/game-mode.js'), 'utf-8');
  const requiredExports = [
    'GAME_PACMAN',
    'GAME_MSPACMAN',
    'getGameMode',
    'setGameMode',
    'getGameName',
    'getGhostNames'
  ];
  
  for (const exp of requiredExports) {
    if (!content.includes(`export`) || !content.includes(exp)) {
      throw new Error(`Game mode module missing export: ${exp}`);
    }
  }
});

// Test 3: Check score-manager module exports
test('Score manager module exports correctly', () => {
  const content = readFileSync(join(ROOT, 'src/game/core/score-manager.js'), 'utf-8');
  const requiredExports = [
    'getScore',
    'setScore',
    'getHighScore',
    'setHighScore',
    'addScore',
    'loadHighScores',
    'saveHighScores'
  ];
  
  for (const exp of requiredExports) {
    if (!content.includes(`export`) || !content.includes(exp)) {
      throw new Error(`Score manager module missing export: ${exp}`);
    }
  }
});

// Test 4: Check score-manager exposes window.getScore
test('Score manager exposes window.getScore', () => {
  const content = readFileSync(join(ROOT, 'src/game/core/score-manager.js'), 'utf-8');
  if (!content.includes('window.getScore = getScore')) {
    throw new Error('Score manager does not expose window.getScore');
  }
});

// Test 5: Check game.js maintains backward compatibility
test('game.js maintains backward compatibility', () => {
  const content = readFileSync(join(ROOT, 'src/game.js'), 'utf-8');
  // Check that original functions still exist (even if they're wrappers)
  const requiredFunctions = [
    'var getScore',
    'var setScore',
    'var getHighScore',
    'var addScore',
    'var getGameName',
    'var getGhostNames'
  ];
  
  for (const fn of requiredFunctions) {
    if (!content.includes(fn)) {
      throw new Error(`game.js missing function: ${fn}`);
    }
  }
});

console.log(`\n📊 Results: ${passed} passed, ${errors} failed\n`);

if (errors > 0) {
  console.error('❌ Axis C tests failed!');
  process.exit(1);
} else {
  console.log('✅ All Axis C tests passed!');
  process.exit(0);
}

