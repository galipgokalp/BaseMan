#!/usr/bin/env node
import 'dotenv/config';

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
      const probe = {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_sendCalls',
        params: [
          {
            version: '1.0.0',
            from: '0x0000000000000000000000000000000000000001',
            chainId: '0x14a74', // 84532
            atomicRequired: true,
            calls: [
              { to: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000', data: '0x', value: '0x0' }
            ],
            capabilities: { paymasterService: { url: process.env.PAYMASTER_SERVICE_URL || process.env.PAYMASTER_URL, optional: false } }
          }
        ]
      };
      results.paymasterProxy = await getJson(`${BASE}/api/paymaster-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(probe)
      });
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
