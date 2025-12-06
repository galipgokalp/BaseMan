/**
 * Score Management Module
 * Handles score tracking, high scores, and persistence
 */

import { getGameMode, getPracticeMode, getTurboMode } from './game-mode.js';

// Score arrays: [pacman-normal, pacman-turbo, mspac-normal, mspac-turbo, cookie-normal, cookie-turbo, otto-normal, otto-turbo, practice]
let scores = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let highScores = [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000];

/**
 * Get score index for current game mode
 * @returns {number} Score index
 */
function getScoreIndex() {
  if (getPracticeMode()) {
    return 8;
  }
  return getGameMode() * 2 + (getTurboMode() ? 1 : 0);
}

/**
 * Get current score
 * @returns {number} Current score
 */
export function getScore() {
  return scores[getScoreIndex()];
}

/**
 * Set current score
 * @param {number} score - Score value
 */
export function setScore(score) {
  scores[getScoreIndex()] = score;
}

/**
 * Get high score
 * @returns {number} High score
 */
export function getHighScore() {
  return highScores[getScoreIndex()];
}

/**
 * Set high score
 * @param {number} highScore - High score value
 */
export function setHighScore(highScore) {
  highScores[getScoreIndex()] = highScore;
  saveHighScores();
}

/**
 * Add score points
 * @param {number} points - Points to add
 * @param {Function} onExtraLife - Callback when extra life is earned (at 10000 points)
 * @param {Function} onMapRedraw - Callback to redraw map
 */
export function addScore(points, onExtraLife, onMapRedraw) {
  const score = getScore();
  
  // Handle extra life at 10000 points
  if (score < 10000 && score + points >= 10000) {
    if (onExtraLife) {
      onExtraLife();
    }
    if (onMapRedraw) {
      onMapRedraw();
    }
  }
  
  const newScore = score + points;
  setScore(newScore);
  
  if (!getPracticeMode()) {
    if (newScore > getHighScore()) {
      setHighScore(newScore);
    }
  }
}

/**
 * Load high scores from localStorage
 */
export function loadHighScores() {
  if (typeof localStorage === 'undefined' || !localStorage) {
    return;
  }
  
  try {
    if (localStorage.highScores) {
      const hs = JSON.parse(localStorage.highScores);
      const hslen = hs.length;
      for (let i = 0; i < hslen && i < highScores.length; i++) {
        highScores[i] = Math.max(highScores[i], hs[i]);
      }
    }
  } catch (err) {
    console.warn('Failed to load high scores:', err);
  }
}

/**
 * Save high scores to localStorage
 */
export function saveHighScores() {
  if (typeof localStorage === 'undefined' || !localStorage) {
    return;
  }
  
  try {
    localStorage.highScores = JSON.stringify(highScores);
  } catch (err) {
    console.warn('Failed to save high scores:', err);
  }
}

/**
 * Expose getScore to window for backward compatibility
 * This maintains the public API: window.getScore()
 */
if (typeof window !== "undefined") {
  window.getScore = getScore;
  window.setScore = setScore;
}

