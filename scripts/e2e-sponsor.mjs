#!/usr/bin/env node
/*
 e2e sponsor test via local paymaster proxy
 - Uses /api/score-sign to get a valid signature (v1 or v2)
 - Encodes Registry.submitScore callData
 - Wraps into smart wallet execute(...) callData
 - Calls /api/paymaster-proxy?auth=basic with pm_getPaymasterStubData
 - Expects 200 and result.paymasterAndData

 Env:
  - BASE_URL (default http://127.0.0.1:5173)
  - CHAIN (default base-sepolia; allowed base-sepolia|base)
*/

import process from 'node:process';
import { ethers } from 'ethers';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const CHAIN = (process.env.CHAIN || 'base-sepolia').trim();

function log(ok, msg) {
  const tag = ok ? '[OK] ' : '[ERR]';
  console.log(`${tag} ${msg}`);
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  return r;
}

function parseEnvFromScriptTag(text) {
  // __env.js returns: window.__ENV = {...};
  const jsonStr = (text.split('window.__ENV = ')[1] || '{}').replace(/;\s*$/, '');
  return JSON.parse(jsonStr);
}

async function main() {
  let fail = 0;

  // 1) Root
  try {
    const r = await get('/');
    log(r.status === 200, `/ -> ${r.status}`);
    if (r.status !== 200) fail++;
  } catch (e) { log(false, `/ error: ${e.message}`); fail++; }

  // 2) env.js
  let env = {};
  try {
    const r = await get('/api/env.js');
    env = parseEnvFromScriptTag(await r.text());
    const hasAddr = typeof env.NEXT_PUBLIC_REGISTRY_ADDRESS === 'string' && env.NEXT_PUBLIC_REGISTRY_ADDRESS.startsWith('0x');
    log(hasAddr, `__env.js registry address present`);
    if (!hasAddr) fail++;
  } catch (e) { log(false, `__env.js error: ${e.message}`); fail++; }

  // 3) score-sign
  let sign = null;
  try {
    const res = await fetch(`${BASE}/api/score-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerAddress: '0x8132C74c2774935e4CCa5c9B709E381c143b98f7',
        score: 42,
        durationMs: 5000,
        chain: CHAIN
      })
    });
    const t = await res.text();
    try { sign = JSON.parse(t); } catch {}
    const ok = res.status === 200 && sign?.signature && sign?.deadline && sign?.contractAddress && sign?.chainId;
    log(ok, `score-sign(${CHAIN}) -> status ${res.status}${ok ? '' : ` body=${t.slice(0,180)}`}`);
    if (!ok) fail++;
  } catch (e) { log(false, `score-sign error: ${e.message}`); fail++; }

  // 4) Build registry callData (V1 or V2)
  let registryCallData = null;
  try {
    const abi = [
      'function submitScore(address player,uint256 score,uint256 deadline,bytes signature)',
      'function submitScore(address player,uint256 score,uint256 deadline,uint256 nonce,bytes signature)'
    ];
    const iface = new ethers.Interface(abi);
    const isV2 = typeof sign?.nonce === 'string' || typeof sign?.nonce === 'number';
    if (isV2) {
      const sig = 'submitScore(address,uint256,uint256,uint256,bytes)';
      registryCallData = iface.encodeFunctionData(sig, [
        '0x8132C74c2774935e4CCa5c9B709E381c143b98f7',
        BigInt(sign.score || 42n),
        BigInt(sign.deadline),
        BigInt(sign.nonce),
        sign.signature
      ]);
    } else {
      const sig = 'submitScore(address,uint256,uint256,bytes)';
      registryCallData = iface.encodeFunctionData(sig, [
        '0x8132C74c2774935e4CCa5c9B709E381c143b98f7',
        BigInt(sign.score || 42n),
        BigInt(sign.deadline),
        sign.signature
      ]);
    }
    log(true, `registry callData encoded (${isV2 ? 'v2' : 'v1'})`);
  } catch (e) { log(false, `encode registry callData error: ${e.message}`); fail++; }

  // 5) Wrap into smart wallet execute
  let callData = null;
  try {
    const walletIface = new ethers.Interface(['function execute(address target,uint256 value,bytes data)']);
    callData = walletIface.encodeFunctionData('execute', [sign.contractAddress, 0, registryCallData]);
    log(true, 'smart wallet callData encoded');
  } catch (e) { log(false, `encode execute callData error: ${e.message}`); fail++; }

  // 6) pm_getPaymasterStubData via proxy
  try {
    const chainHex = '0x' + Number(sign.chainId).toString(16);
    const payload = {
      jsonrpc: '2.0', id: 1, method: 'pm_getPaymasterStubData',
      params: [
        {
          sender: '0xF7DCa789B08Ed2F7995D9bC22c500A8CA715D0A8',
          nonce: '0x0',
          initCode: '0x',
          callData,
          callGasLimit: '0x0',
          verificationGasLimit: '0x0',
          preVerificationGas: '0x0',
          maxFeePerGas: '0x0',
          maxPriorityFeePerGas: '0x0',
          paymasterAndData: '0x',
          signature: '0x'
        },
        '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
        chainHex,
        {}
      ]
    };
    const r = await fetch(`${BASE}/api/paymaster-proxy?auth=basic`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const txt = await r.text();
    let j; try { j = JSON.parse(txt); } catch {}
    const ok = r.status === 200 && j && j.result && typeof j.result.paymasterAndData === 'string' && j.result.paymasterAndData.startsWith('0x');
    log(ok, `pm_getPaymasterStubData -> status ${r.status}${ok ? '' : ` body=${txt.slice(0,180)}`}`);
    if (!ok) fail++;
  } catch (e) {
    log(false, `pm_getPaymasterStubData error: ${e.message}`);
    fail++;
  }

  if (fail > 0) {
    console.log(`---\nFAIL=${fail}`);
    process.exit(1);
  } else {
    console.log('---\nPASS=3 FAIL=0');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
