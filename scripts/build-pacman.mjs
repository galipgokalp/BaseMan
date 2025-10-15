#!/usr/bin/env node
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "src");
const OUTPUT_FILE = path.join(ROOT, "pacman.js");

const FILE_ORDER = [
  "inherit.js",
  "sound.js",
  "random.js",
  "game.js",
  "direction.js",
  "Map.js",
  "colors.js",
  "mapgen.js",
  "atlas.js",
  "renderers.js",
  "hud.js",
  "galagaStars.js",
  "Button.js",
  "Menu.js",
  "inGameMenu.js",
  "sprites.js",
  "Actor.js",
  "Ghost.js",
  "Player.js",
  "actors.js",
  "targets.js",
  "ghostCommander.js",
  "ghostReleaser.js",
  "elroyTimer.js",
  "energizer.js",
  "fruit.js",
  "executive.js",
  "states.js",
  "input.js",
  "cutscenes.js",
  "maps.js",
  "vcr.js",
  "main.js"
];

const DEFAULT_HEADER = `// Copyright 2012 Shaun Williams
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License Version 3 as 
//  published by the Free Software Foundation.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.

// ==========================================================================
// PAC-MAN
// an accurate remake of the original arcade game

// Based on original works by Namco, GCC, and Midway.
// Research by Jamey Pittman and Bart Grantham
// Developed by Shaun Williams, Mason Borda

// ==========================================================================

(function(){

`;

function ensureSourceFiles(order) {
  for (const relativePath of order) {
    const fullPath = path.join(SRC_DIR, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Beklenen kaynak bulunamadı: ${relativePath}`);
    }
  }
}

function resolveHeader(existingContent) {
  if (!existingContent) return DEFAULT_HEADER;

  const markerIndex = existingContent.indexOf("//@line");
  if (markerIndex === -1) return DEFAULT_HEADER;

  const header = existingContent.slice(0, markerIndex);
  return header.trimEnd().endsWith("(function(){") ? header : DEFAULT_HEADER;
}

function buildBundle(order) {
  ensureSourceFiles(order);

  const existing = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : "";
  const header = resolveHeader(existing);

  const chunks = [header];

  for (const file of order) {
    const sourcePath = path.join(SRC_DIR, file);
    const contents = fs.readFileSync(sourcePath, "utf8");
    chunks.push(`//@line 1 "src/${file}"\n${contents}\n`);
  }

  chunks.push("})();\n");

  return chunks.join("");
}

function main() {
  const bundle = buildBundle(FILE_ORDER);
  fs.writeFileSync(OUTPUT_FILE, bundle, "utf8");
  console.log(`Bundle üretildi: ${path.relative(ROOT, OUTPUT_FILE)}`);
}

try {
  main();
} catch (error) {
  console.error("[build-pacman] Hata:", error.message);
  process.exit(1);
}

