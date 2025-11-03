#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const docsDir = join(process.cwd(), 'docs');
const files = readdirSync(docsDir).filter((f) => f.endsWith('.md') && !['link_fix_suggestions.md','link_report_summary.md'].includes(f));

const allowed = new Set([200, 201, 202, 203, 204, 205, 206, 301, 302, 303, 307, 308, 400, 403, 405, 429]);

const cleanTrailing = (u) => {
  // Remove trailing unmatched ), ', ", . and stray parens at end
  let v = u.replace(/[)\]'".,:;!?*]+$/g, '');
  // Fix accidental "](...](...)" concatenations at the tail
  v = v.replace(/\]\((https?:[^\s)]+)\)\]$/g, '$1');
  return v;
};

const extractLinks = (md) => {
  const links = new Set();
  const mdLink = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
  const bare = /(https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+)/g;
  let m;
  while ((m = mdLink.exec(md))) links.add(cleanTrailing(m[1]));
  while ((m = bare.exec(md))) links.add(cleanTrailing(m[1]));
  return [...links];
};

// Load ignore patterns from docs/link-ignore.json if present
// Shape: { patterns: ["regex", ...] }
const loadIgnore = () => {
  const p = join(process.cwd(), 'docs', 'link-ignore.json');
  const defaults = [
    '^https?://(localhost|127\\.0\\.0\\.1|::1)(?::\\d+)?(?:/|$)',
    '^https?://([a-z0-9-]+\\.)*example\\.com(?::\\d+)?(?:/|$)',
    '^https?://your[^/]*\\.com(?::\\d+)?(?:/|$)',
    '<[^>]+>'
  ];
  let patterns = defaults;
  if (existsSync(p)) {
    try {
      const cfg = JSON.parse(readFileSync(p, 'utf8'));
      if (Array.isArray(cfg.patterns) && cfg.patterns.length) patterns = cfg.patterns;
    } catch {}
  }
  return patterns.map((s) => new RegExp(s));
};
const ignoreRegexes = loadIgnore();
const shouldIgnore = (u) => ignoreRegexes.some((re) => re.test(u));

const head = async (url, signal) => {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal });
    return r;
  } catch (e) {
    return { ok: false, status: 0 };
  }
};

const get = async (url, signal) => {
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal });
    return r;
  } catch (e) {
    return { ok: false, status: 0 };
  }
};

const checkUrl = async (url, timeoutMs = 10000) => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    let r = await head(url, ac.signal);
    if (r.status === 405 || r.status === 400 || r.status === 0) {
      r = await get(url, ac.signal);
    }
    return r.status;
  } finally {
    clearTimeout(t);
  }
};

const pLimit = (n) => {
  const q = [];
  let active = 0;
  const next = () => {
    if (active >= n || q.length === 0) return;
    const { fn, resolve, reject } = q.shift();
    active++;
    fn().then((v) => { active--; resolve(v); next(); }).catch((e) => { active--; reject(e); next(); });
  };
  return (fn) => new Promise((resolve, reject) => { q.push({ fn, resolve, reject }); next(); });
};

let failed = 0;
const limit = pLimit(8);
for (const f of files) {
  const path = join(docsDir, f);
  const md = readFileSync(path, 'utf8');
  const urls = extractLinks(md)
    .filter((u) => u.startsWith('http://') || u.startsWith('https://'))
    .filter((u) => !shouldIgnore(u));
  const unique = [...new Set(urls)];
  const results = await Promise.all(unique.map((u) => limit(() => checkUrl(u))));
  const broken = [];
  unique.forEach((u, i) => {
    const s = results[i];
    if (!allowed.has(s)) broken.push({ url: u, status: s });
  });
  if (broken.length) {
    console.error(`Broken links in ${f}:`);
    for (const b of broken.slice(0, 20)) {
      console.error(`  - ${b.url} (${b.status || 'error'})`);
    }
    if (broken.length > 20) console.error(`  ... and ${broken.length - 20} more`);
    failed++;
  } else {
    console.log(`OK: ${f}`);
  }
}

process.exit(failed ? 1 : 0);
