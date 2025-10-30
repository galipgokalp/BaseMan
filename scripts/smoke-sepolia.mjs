#!/usr/bin/env node
/*
 Sepolia smoke test for BaseMan dev server
 Checks:
  1) GET / -> 200
  2) GET /.well-known/farcaster.json has eip155:84532
  3) GET /__env.js has NEXT_PUBLIC_REGISTRY_ADDRESS, NEXT_PUBLIC_PAYMASTER_URL=/api/paymaster-proxy
  4) POST /api/score-sign returns JSON with chainId=84532 and contractAddress
  5) POST /api/paymaster-proxy blocks non-allowlisted target (403)
  6) POST /api/paymaster-proxy forwards allowlisted registry+selector (status != 403)
*/

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { ethers } from 'ethers';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5180';

function log(ok, msg) {
  const tag = ok ? '[OK] ' : '[ERR]';
  console.log(`${tag} ${msg}`);
}

async function get(path, opts) {
  const res = await fetch(`${BASE}${path}`, opts);
  return res;
}

async function getJson(path) {
  const r = await get(path);
  const t = await r.text();
  try { return { status: r.status, json: JSON.parse(t) }; } catch {
    return { status: r.status, text: t };
  }
}

async function getRuntimeEnv() {
  // Prefer dev helper /__env.js; fall back to serverless /api/env.js
  let r = await get('/__env.js');
  let txt = await r.text();
  try {
    const jsonStr = (txt.split('window.__ENV = ')[1] || '{}').replace(/;\s*$/, '');
    const env = JSON.parse(jsonStr);
    return { ok: r.status === 200 && Object.keys(env).length > 0, env, status: r.status };
  } catch (_) {}
  r = await get('/api/env.js');
  txt = await r.text();
  try {
    const jsonStr = (txt.split('window.__ENV = ')[1] || '{}').replace(/;\s*$/, '');
    const env = JSON.parse(jsonStr);
    return { ok: r.status === 200 && Object.keys(env).length > 0, env, status: r.status };
  } catch (_) { return { ok: false, env: {}, status: r.status }; }
}

async function main() {
  let fail = 0;

  // 1) Root
  try {
    const r = await get('/');
    const ok = r.status === 200;
    log(ok, `/ -> ${r.status}`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `/ fetch error: ${e.message}`); fail++;
  }

  // 2) Manifest
  try {
    const { status, json } = await getJson('/.well-known/farcaster.json');
    const reqChains = json?.miniapp?.requiredChains || [];
    const ok = status === 200 && Array.isArray(reqChains) && reqChains.includes('eip155:84532');
    log(ok, `manifest requiredChains includes eip155:84532 (status ${status})`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `manifest error: ${e.message}`); fail++;
  }

  // 3) __env.js
  try {
    const rt = await getRuntimeEnv();
    const a = typeof rt.env.NEXT_PUBLIC_REGISTRY_ADDRESS === 'string' && rt.env.NEXT_PUBLIC_REGISTRY_ADDRESS.startsWith('0x');
    const b = rt.env.NEXT_PUBLIC_PAYMASTER_URL === '/api/paymaster-proxy';
    log(a, '__env exposes NEXT_PUBLIC_REGISTRY_ADDRESS'); if (!a) fail++;
    log(b, '__env paymaster url is proxy'); if (!b) fail++;
  } catch (e) { log(false, `__env error: ${e.message}`); fail++; }

  // 4) score-sign
  try {
    const r = await get('/api/score-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerAddress: '0x8132C74c2774935e4CCa5c9B709E381c143b98f7',
        score: 1234,
        durationMs: 5000,
        chain: 'base-sepolia'
      })
    });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch {}
    const ok = r.status === 200 && j?.chainId === 84532 && /^0x[0-9a-fA-F]{40}$/.test(j?.contractAddress || '');
    log(ok, `score-sign -> status ${r.status}, chainId=${j?.chainId}, contract=${j?.contractAddress || 'n/a'}`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `score-sign error: ${e.message}`); fail++;
  }

  // Helper: registry address
  function getRegistryFromOnchainConfig() {
    try {
      const p = resolve('src/onchain-config.js');
      const s = readFileSync(p, 'utf8');
      const m = s.match(/registryAddress\"\s*:\s*\"(0x[0-9a-fA-F]{40})\"/);
      return m ? m[1] : null;
    } catch { return null; }
  }

  let registry = getRegistryFromOnchainConfig();
  if (!registry) {
    // Fallback to __env.js
    const r = await get('/__env.js');
    const txt = await r.text();
    try {
      const env = JSON.parse((txt.split('window.__ENV = ')[1] || '{}').replace(/;\s*$/, ''));
      registry = env.NEXT_PUBLIC_REGISTRY_ADDRESS || null;
    } catch {}
  }
  if (!registry) {
    log(false, 'could not resolve registryAddress');
    fail++;
  }

  // 5) paymaster-proxy negative (non-allowlisted target)
  try {
    const iface = new ethers.Interface(['function execute(address target,uint256 value,bytes data)']);
    const badcd = iface.encodeFunctionData('execute', ['0x1111111111111111111111111111111111111111', 0, '0xdeadbeef']);
    const chainIdHex = '0x' + (84532).toString(16);
    const r = await get('/api/paymaster-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_sendUserOperation', params: [{ callData: badcd, chainId: chainIdHex }] })
    });
    const ok = r.status === 403;
    log(ok, `paymaster-proxy rejects non-allowlisted target (status ${r.status})`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `paymaster negative error: ${e.message}`); fail++;
  }

  // 6) paymaster-proxy positive (registry + allowlisted selector)
  try {
    const selector = (process.env.PAYMASTER_ALLOWED_SELECTORS || '0x42a252f6').split(',').map(s => s.trim()).filter(Boolean)[0] || '0x42a252f6';
    const iface = new ethers.Interface(['function execute(address target,uint256 value,bytes data)']);
    const goodcd = iface.encodeFunctionData('execute', [registry, 0, selector]);
    const chainIdHex = '0x' + (84532).toString(16);
    const r = await get('/api/paymaster-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'eth_sendUserOperation', params: [{ callData: goodcd, chainId: chainIdHex }] })
    });
    const ok = r.status !== 403; // forwarded to upstream (may be 200 with error JSON)
    log(ok, `paymaster-proxy forwards allowlisted call (status ${r.status})`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `paymaster positive error: ${e.message}`); fail++;
  }

  if (fail > 0) {
    console.log(`---\nFAIL=${fail}`);
    process.exit(1);
  } else {
    console.log('---\nPASS=6 FAIL=0');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
