#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copy(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  console.log(`[minikit] Copied ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dst)}`);
}

function tryPaths(base, candidates) {
  for (const rel of candidates) {
    const p = path.join(base, rel);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function main() {
  // Prefer official MiniKit when/if published. Fallback to miniapp-sdk.
  const nm = path.join(ROOT, 'node_modules');
  const targets = [
    {
      pkg: '@farcaster/minikit',
      base: path.join(nm, '@farcaster', 'minikit'),
      dist: ['dist/index.min.js', 'dist/index.umd.js', 'dist/index.js']
    },
    {
      pkg: '@farcaster/miniapp-sdk',
      base: path.join(nm, '@farcaster', 'miniapp-sdk'),
      dist: ['dist/index.min.js', 'dist/index.js']
    }
  ];

  let picked = null;
  for (const t of targets) {
    const src = tryPaths(t.base, t.dist);
    if (src) {
      picked = { pkg: t.pkg, src };
      break;
    }
  }
  if (!picked) {
    console.error('[minikit] ERROR: Could not find MiniKit or MiniApp SDK in node_modules.');
    process.exit(1);
  }

  const dst = path.join(ROOT, 'vendor', 'miniapp-sdk', 'index.min.js');
  copy(picked.src, dst);
  console.log(`[minikit] Bundled from ${picked.pkg}`);
}

main();

