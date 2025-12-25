#!/usr/bin/env node
import 'dotenv/config';
import { ethers } from 'ethers';

const BASE = process.env.SELF_CHECK_BASE || 'http://127.0.0.1:5173';

async function getJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, headers: Object.fromEntries(res.headers.entries()) };
}

async function main() {
  const results = {};

  // NEXT_PUBLIC_* güvenliği: hassas anahtarların yanlış yerde olmadığını kontrol et
  const sensitiveKeys = [
    'PRIVATE_KEY', 'SECRET', 'API_KEY', 'DEPLOYER', 'SIGNER', 'CDP_API_KEY_SECRET', 'CDP_API_KEY_ID'
  ];
  try {
    const res = await fetch(`${BASE}/__env.js`);
    const txt = await res.text();
    const jsonStr = (txt.split('window.__ENV = ')[1] || '{}').replace(/;\s*$/, '');
    const pub = JSON.parse(jsonStr);
    const offenders = Object.entries(pub)
      .filter(([k, v]) => k.startsWith('NEXT_PUBLIC_') && sensitiveKeys.some(s => k.includes(s) || String(v).includes(s)));
    if (offenders.length) {
      console.warn('[self-check] WARNING: Potential sensitive values in NEXT_PUBLIC_*:', offenders.map(([k]) => k));
    }
  } catch (_) {}
  try {
    results.env = await getJson(`${BASE}/api/env.js`);
  } catch (e) { results.env = { error: String(e) }; }

  try {
    results.leaderboard = await getJson(`${BASE}/api/leaderboard?limit=3`);
  } catch (e) { results.leaderboard = { error: String(e) }; }

  try {
    const payload = {
      playerAddress: '0x0000000000000000000000000000000000000001',
      score: 1,
      durationMs: 4000
    };
    results.scoreSign = await getJson(`${BASE}/api/score-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) { results.scoreSign = { error: String(e) }; }

  // Paymaster proxy probe (only if configured)
  try {
    if (process.env.PAYMASTER_SERVICE_URL || process.env.PAYMASTER_URL) {
      const sign = results.scoreSign?.body || null;
      if (!sign?.contractAddress || !sign?.chainId || !sign?.signature || !sign?.deadline) {
        results.paymasterProxy = { skipped: true, reason: 'score-sign missing required fields for paymaster probe' };
      } else {
        const abi = [
          'function submitScore(address player,uint256 score,uint256 deadline,bytes signature)',
          'function submitScore(address player,uint256 score,uint256 deadline,uint256 nonce,bytes signature)'
        ];
        const iface = new ethers.Interface(abi);
        const isV2 = typeof sign?.nonce === 'string' || typeof sign?.nonce === 'number';
        const scoreValue = sign?.score != null ? BigInt(sign.score) : 1n;
        const deadline = BigInt(sign.deadline);
        const player = '0x0000000000000000000000000000000000000001';
        const registryCallData = isV2
          ? iface.encodeFunctionData('submitScore(address,uint256,uint256,uint256,bytes)', [
              player,
              scoreValue,
              deadline,
              BigInt(sign.nonce),
              sign.signature
            ])
          : iface.encodeFunctionData('submitScore(address,uint256,uint256,bytes)', [
              player,
              scoreValue,
              deadline,
              sign.signature
            ]);

        const walletIface = new ethers.Interface(['function execute(address target,uint256 value,bytes data)']);
        const callData = walletIface.encodeFunctionData('execute', [sign.contractAddress, 0, registryCallData]);
        const chainHex = '0x' + Number(sign.chainId).toString(16);
        const probe = {
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_getPaymasterStubData',
          params: [
            {
              sender: '0x0000000000000000000000000000000000000002',
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
        results.paymasterProxy = await getJson(`${BASE}/api/paymaster-proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(probe)
        });
      }
    } else {
      results.paymasterProxy = { skipped: true, reason: 'PAYMASTER_SERVICE_URL not set' };
    }
  } catch (e) { results.paymasterProxy = { error: String(e) }; }

  const summary = {
    base: BASE,
    env: results.env.status,
    leaderboard: results.leaderboard.status,
    scoreSign: results.scoreSign.status,
    paymasterProxy: results.paymasterProxy?.status ?? 'n/a'
  };

  console.log('[self-check] summary:', summary);
  if (Number(results.scoreSign?.status) !== 200) {
    console.warn('[self-check] score-sign did not return 200; check env and logs');
  }
}

main().catch((e) => { console.error('[self-check] fatal', e); process.exit(1); });
