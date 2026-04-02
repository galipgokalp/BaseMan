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

import process from 'node:process';
import { ethers } from 'ethers';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const SMOKE_PLAYER_ADDRESS = process.env.SMOKE_PLAYER_ADDRESS || '0x8132c74c2774935e4cca5c9b709e381c143b98f7';
const SMOKE_ALT_PLAYER_ADDRESS = process.env.SMOKE_ALT_PLAYER_ADDRESS || '0x8132c74c2774935e4cca5c9b709e381c143b98f8';

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
        playerAddress: SMOKE_PLAYER_ADDRESS,
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

  let registry = null;
  try {
    const r = await get('/api/score-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerAddress: SMOKE_ALT_PLAYER_ADDRESS,
        score: 4321,
        durationMs: 5000,
        chain: 'base-sepolia'
      })
    });
    const t = await r.text();
    try {
      const j = JSON.parse(t);
      if (/^0x[0-9a-fA-F]{40}$/.test(j?.contractAddress || '')) {
        registry = j.contractAddress;
      }
    } catch {}
  } catch {}

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
    const signRes = await get('/api/score-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerAddress: SMOKE_ALT_PLAYER_ADDRESS,
        score: 5678,
        durationMs: 5000,
        chain: 'base-sepolia'
      })
    });
    const signTxt = await signRes.text();
    let signJson; try { signJson = JSON.parse(signTxt); } catch {}
    if (signRes.status !== 200 || !signJson?.signature || !signJson?.deadline || !signJson?.contractAddress) {
      throw new Error(`score-sign precondition failed: status ${signRes.status}`);
    }

    const registryIface = new ethers.Interface([
      'function submitScore(address player,uint256 score,uint256 deadline,bytes signature)',
      'function submitScore(address player,uint256 score,uint256 deadline,uint256 nonce,bytes signature)'
    ]);
    const player = SMOKE_ALT_PLAYER_ADDRESS;
    const registryCallData = signJson?.nonce != null
      ? registryIface.encodeFunctionData('submitScore(address,uint256,uint256,uint256,bytes)', [
          player,
          BigInt(signJson.score || 5678),
          BigInt(signJson.deadline),
          BigInt(signJson.nonce),
          signJson.signature
        ])
      : registryIface.encodeFunctionData('submitScore(address,uint256,uint256,bytes)', [
          player,
          BigInt(signJson.score || 5678),
          BigInt(signJson.deadline),
          signJson.signature
        ]);

    const walletIface = new ethers.Interface(['function execute(address target,uint256 value,bytes data)']);
    const goodcd = walletIface.encodeFunctionData('execute', [signJson.contractAddress || registry, 0, registryCallData]);
    const chainIdHex = '0x' + Number(signJson.chainId || 84532).toString(16);
    const r = await get('/api/paymaster-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'pm_getPaymasterStubData',
        params: [
          {
            sender: '0xF7DCa789B08Ed2F7995D9bC22c500A8CA715D0A8',
            nonce: '0x0',
            initCode: '0x',
            callData: goodcd,
            callGasLimit: '0x0',
            verificationGasLimit: '0x0',
            preVerificationGas: '0x0',
            maxFeePerGas: '0x0',
            maxPriorityFeePerGas: '0x0',
            paymasterAndData: '0x',
            signature: '0x'
          },
          '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
          chainIdHex,
          {}
        ]
      })
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
