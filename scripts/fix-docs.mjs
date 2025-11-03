#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.cwd();
const docsDir = join(root, 'docs');

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (st.isFile() && extname(p) === '.md') yield p;
  }
}

function titleCase(s) {
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function deriveLabel(urlStr) {
  try {
    const u = new URL(urlStr);
    let segs = u.pathname.split('/').filter(Boolean);
    if (segs.length === 0) return titleCase(u.hostname.replace(/^www\./, ''));
    let last = segs[segs.length - 1];
    if (!last || last.length < 2) last = segs.findLast((x) => x && x.length > 1) || last;
    last = last.replace(/\.(html?|md)$/i, '');
    last = decodeURIComponent(last).replace(/[-_]+/g, ' ');
    const label = titleCase(last);
    return label || titleCase(u.hostname.replace(/^www\./, ''));
  } catch {
    return 'Link';
  }
}

function fixInlineCodeSpaces(text) {
  return text.replace(/`\s+([^`]*?)\s+`/g, '`$1`');
}

function ensureTablesSeparated(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let i = 0;
  let inFence = false;
  while (i < lines.length) {
    let line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      i++;
      continue;
    }
    const isTableRow = !inFence && /^\s*\|.*\|\s*$/.test(line);
    if (isTableRow) {
      if (out.length && out[out.length - 1].trim() !== '') out.push('');
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        out.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim() !== '') out.push('');
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

function trimLinkText(text) {
  return text.replace(/\[\s*([^\]\n][^\]]*?)\s*\]\((https?:[^)\s]+)\)/g, (_m, t, u) => `[${t.trim()}](${u})`);
}

function fixMissingClosingParen(text) {
  return text.replace(/(\[[^\]]+\]\(https?:[^\s)]+)(\s*$)/gm, '$1)$2');
}

function removeDiscord(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    if (/reach out on Discord\]\[Discord\]/i.test(line)) continue;
    if (/^\s*[-*]\s*\[Discord\]\s*$/i.test(line)) continue;
    if (/^\s*\[Discord\]:/i.test(line)) continue;
    out.push(line);
  }
  return out.join('\n');
}

function replaceHereLinks(text) {
  const re = /\[(here)\]\((https?:[^\s)]+)(\))?/gi;
  return text.replace(re, (_m, _h, url) => {
    const label = deriveLabel(url);
    return `[${label}](${url})`;
  });
}

function splitFenceAfterLink(text) {
  // If a link is immediately followed by a code fence marker on same line, split into a new line.
  return text.replace(/(\[[^\]]+\]\([^\)]+\))\s*```([a-zA-Z0-9_-]*)/g, (_m, link, lang) => `${link}\n\`\`\`${lang}`);
}

function moveClosingParenBeforeFence(text) {
  // Fix cases like 
  //   [Label](https://example.com/path```lang)
  // -> [Label](https://example.com/path)\n```lang
  return text.replace(/(\[[^\]]+\]\(https?:[^)\s]+)```([a-zA-Z0-9_-]*)\)/g, (_m, start, lang) => `${start})\n\`\`\`${lang}`);
}

let changedFiles = 0;
for (const file of walk(docsDir)) {
  const src = readFileSync(file, 'utf8');
  let out = src;
  out = removeDiscord(out);
  out = replaceHereLinks(out);
  out = trimLinkText(out);
  out = fixInlineCodeSpaces(out);
  out = fixMissingClosingParen(out);
  out = splitFenceAfterLink(out);
  out = moveClosingParenBeforeFence(out);
  out = ensureTablesSeparated(out);
  if (out !== src) {
    writeFileSync(file, out);
    changedFiles++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`Done. Files changed: ${changedFiles}`);
