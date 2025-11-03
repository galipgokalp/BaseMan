#!/usr/bin/env node
/*
 Simple bundler health check using NEXT_PUBLIC_BUNDLER_URL
 - Reads /__env.js from local dev to find NEXT_PUBLIC_BUNDLER_URL
 - Performs eth_chainId with Basic auth if CDP creds present in process.env
*/

import process from 'node:process';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';

function log(ok, msg) {
  const tag = ok ? '[OK] ' : '[ERR]';
  console.log(`${tag} ${msg}`);
}

function parseEnvFromScriptTag(text) {
  const jsonStr = (text.split('window.__ENV = ')[1] || '{}').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

async function main() {
  let fail = 0;
  let env = {};
  try {
    const r = await fetch(`${BASE}/api/env.js`);
    env = parseEnvFromScriptTag(await r.text());
    log(true, '__env.js loaded');
  } catch (e) {
    log(false, `__env.js error: ${e.message}`);
    process.exit(1);
  }

  const url = env.NEXT_PUBLIC_BUNDLER_URL;
  if (!url) {
    console.log('SKIP: NEXT_PUBLIC_BUNDLER_URL not set');
    return;
  }

  // Prepare headers (Basic if CDP creds provided to this process)
  const headers = { 'Content-Type': 'application/json' };
  const id = process.env.CDP_API_KEY_ID || '';
  const secret = process.env.CDP_API_KEY_SECRET || '';
  if (id && secret) {
    const token = Buffer.from(`${id}:${secret}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }

  try {
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }) });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch {}
    const ok = r.status === 200 && j && (j.result === '0x14a34' || j.result === '0x2105' || typeof j.result === 'string');
    log(ok, `bundler eth_chainId -> status ${r.status}${ok ? ` result=${j?.result}` : ` body=${t.slice(0,180)}`}`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `bundler call error: ${e.message}`);
    fail++;
  }

  if (fail > 0) {
    console.log(`---\nFAIL=${fail}`);
    process.exit(1);
  } else {
    console.log('---\nPASS=1 FAIL=0');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
