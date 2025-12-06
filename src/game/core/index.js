/**
 * Game Core Modules - Facade
 * Central export point for core game modules
 */

// Game Mode
export {
  GAME_PACMAN,
  GAME_MSPACMAN,
  GAME_COOKIE,
  GAME_OTTO,
  setGameMode,
  getGameMode,
  setPracticeMode,
  getPracticeMode,
  setTurboMode,
  getTurboMode,
  getGameName,
  getGameDescription,
  getGhostNames
} from './game-mode.js';

// Score Manager
export {
  getScore,
  setScore,
  getHighScore,
  setHighScore,
  addScore,
  loadHighScores,
  saveHighScores
} from './score-manager.js';

