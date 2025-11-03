#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

function usage() {
  console.error('Usage: node scripts/dedup-md.mjs <input.md>');
  process.exit(1);
}

const inPath = process.argv[2];
if (!inPath || !inPath.endsWith('.md')) usage();

const src = readFileSync(inPath, 'utf8');
const lines = src.split(/\r?\n/);

const out = [];
const seenH1 = new Set();

let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const m = line.match(/^#\s+(.+)$/);
  if (m) {
    const title = m[1].trim().toLowerCase();
    if (seenH1.has(title)) {
      // skip until next H1 or EOF
      i++;
      while (i < lines.length && !lines[i].startsWith('# ')) {
        i++;
      }
      continue; // do not emit duplicate block
    }
    seenH1.add(title);
    out.push(line);
    i++;
    continue;
  }
  out.push(line);
  i++;
}

const dir = dirname(inPath);
const base = basename(inPath, '.md');
const outPath = join(dir, `${base}.cleaned.md`);
writeFileSync(outPath, out.join('\n'));
console.log(`Wrote cleaned file: ${outPath}`);

