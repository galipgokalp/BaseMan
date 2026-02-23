#!/usr/bin/env node
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import crypto from 'node:crypto';

function usage() {
  console.error('Usage: node scripts/merge-md.mjs <input.md> [--inplace]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 1) usage();
const inPath = args[0];
const inplace = args.includes('--inplace');

const src = readFileSync(inPath, 'utf8');
const lines = src.split(/\r?\n/);

// Split by top-level H1 sections: lines starting exactly with "# "
const preface = [];
const sections = []; // { title, body }
let i = 0;
// collect preface (before first H1)
while (i < lines.length && !lines[i].startsWith('# ')) {
  preface.push(lines[i]);
  i++;
}
let current = null;
for (; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('# ')) {
    if (current) sections.push(current);
    current = { title: line.slice(2).trim(), body: [] };
  } else if (current) {
    current.body.push(line);
  } else {
    // Rare: lines before first H1; already collected in preface
    preface.push(line);
  }
}
if (current) sections.push(current);

// Merge sections by title, keeping unique body variants and preserving first-seen order
const order = [];
const byTitle = new Map(); // title -> { seenHashes:Set, bodies:string[] }
for (const s of sections) {
  const key = s.title;
  if (!byTitle.has(key)) {
    byTitle.set(key, { seen: new Set(), bodies: [] });
    order.push(key);
  }
  const bodyStr = s.body.join('\n');
  const hash = crypto.createHash('sha256').update(bodyStr).digest('hex');
  const entry = byTitle.get(key);
  if (!entry.seen.has(hash)) {
    entry.seen.add(hash);
    entry.bodies.push(bodyStr);
  }
}

// Reconstruct merged document
const out = [];
if (preface.length) out.push(preface.join('\n'));
for (const title of order) {
  out.push(`# ${title}`);
  const { bodies } = byTitle.get(title);
  if (bodies.length > 0) {
    // First variant as-is
    out.push(bodies[0]);
    // Additional variants separated by a small comment marker
    for (let idx = 1; idx < bodies.length; idx++) {
      out.push(`\n\n<!-- MERGED: additional variant ${idx + 1} for \"${title}\" -->\n`);
      out.push(bodies[idx]);
    }
  } else {
    out.push('');
  }
}

const merged = out.join('\n');
const outPath = inplace ? `${inPath}.merged.md` : `${inPath}.merged.md`;
writeFileSync(outPath, merged);

if (inplace) {
  // Replace the original file atomically
  const backup = `${inPath}.bak`;
  writeFileSync(backup, src);
  renameSync(outPath, inPath);
  console.log(`Merged in-place: ${inPath} (backup saved: ${backup})`);
} else {
  console.log(`Wrote merged file: ${outPath}`);
}
