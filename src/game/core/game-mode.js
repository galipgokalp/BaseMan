/**
 * Game Mode Management Module
 * Handles game mode constants, names, descriptions, and related utilities
 */

// Game mode constants
export const GAME_PACMAN = 0;
export const GAME_MSPACMAN = 1;
export const GAME_COOKIE = 2;
export const GAME_OTTO = 3;

// Current game mode (will be set by game.js)
let gameMode = GAME_PACMAN;
let practiceMode = false;
let turboMode = false;

/**
 * Set game mode
 * @param {number} mode - Game mode constant
 */
export function setGameMode(mode) {
  gameMode = mode;
}

/**
 * Get current game mode
 * @returns {number} Current game mode
 */
export function getGameMode() {
  return gameMode;
}

/**
 * Set practice mode
 * @param {boolean} value - Practice mode state
 */
export function setPracticeMode(value) {
  practiceMode = Boolean(value);
}

/**
 * Get practice mode
 * @returns {boolean} Practice mode state
 */
export function getPracticeMode() {
  return practiceMode;
}

/**
 * Set turbo mode
 * @param {boolean} value - Turbo mode state
 */
export function setTurboMode(value) {
  turboMode = Boolean(value);
}

/**
 * Get turbo mode
 * @returns {boolean} Turbo mode state
 */
export function getTurboMode() {
  return turboMode;
}

/**
 * Get game name for a mode
 * @param {number} mode - Game mode (optional, uses current if not provided)
 * @returns {string} Game name
 */
export function getGameName(mode) {
  if (mode === undefined) {
    mode = gameMode;
  }
  const names = ["PAC-MAN", "MS PAC-MAN", "COOKIE-MAN", "CRAZY OTTO"];
  return names[mode] || names[0];
}

/**
 * Get game description for a mode
 * @param {number} mode - Game mode (optional, uses current if not provided)
 * @returns {Array<string>} Game description lines
 */
export function getGameDescription(mode) {
  if (mode === undefined) {
    mode = gameMode;
  }
  const desc = [
    [
      "ORIGINAL ARCADE:",
      "NAMCO (C) 1980",
      "",
      "REVERSE-ENGINEERING:",
      "JAMEY PITTMAN",
      "",
      "REMAKE:",
      "SHAUN WILLIAMS",
    ],
    [
      "ORIGINAL ARCADE ADDON:",
      "MIDWAY/GCC (C) 1981",
      "",
      "REVERSE-ENGINEERING:",
      "BART GRANTHAM",
      "",
      "REMAKE:",
      "SHAUN WILLIAMS",
    ],
    [
      "A NEW PAC-MAN GAME",
      "WITH RANDOM MAZES:",
      "SHAUN WILLIAMS (C) 2012",
      "",
      "COOKIE MONSTER DESIGN:",
      "JIM HENSON",
      "",
      "PAC-MAN CROSSOVER CONCEPT:",
      "TANG YONGFA",
    ],
    [
      "THE UNRELEASED",
      "MS. PAC-MAN PROTOTYPE:",
      "GCC (C) 1981",
      "",
      "SPRITES REFERENCED FROM",
      "STEVE GOLSON'S",
      "CAX 2012 PRESENTATION",
      "",
      "REMAKE:",
      "SHAUN WILLIAMS",
    ],
  ];
  return desc[mode] || desc[0];
}

/**
 * Get ghost names for a mode
 * @param {number} mode - Game mode (optional, uses current if not provided)
 * @returns {Array<string>} Ghost names
 */
export function getGhostNames(mode) {
  if (mode === undefined) {
    mode = gameMode;
  }
  if (mode === GAME_OTTO) {
    return ["plato", "darwin", "freud", "newton"];
  } else if (mode === GAME_MSPACMAN) {
    return ["blinky", "pinky", "inky", "sue"];
  } else if (mode === GAME_PACMAN) {
    return ["blinky", "pinky", "inky", "clyde"];
  } else if (mode === GAME_COOKIE) {
    return ["elmo", "piggy", "rosita", "zoe"];
  }
  return ["blinky", "pinky", "inky", "clyde"];
}

