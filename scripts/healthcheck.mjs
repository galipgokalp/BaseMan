#!/usr/bin/env node
import 'dotenv/config';

const REQUIRED_STRICT = [
  'REGISTRY_DEFAULT_TARGET',
  'NEXT_PUBLIC_REGISTRY_ADDRESS',
  // Zincir ID'yi iki seçenekten biri sağlar
  // 'REGISTRY_CHAIN_ID' veya 'BASE_SEPOLIA_REGISTRY_CHAIN_ID'
  'SCORE_SIGNER_PRIVATE_KEY',
  'PAYMASTER_SERVICE_URL',
  'PAYMASTER_ENFORCE_ALLOWLIST',
  'NEXT_PUBLIC_BUNDLER_URL'
];

function has(key) {
  return typeof process.env[key] === 'string' && process.env[key].trim().length > 0;
}

const results = [];
for (const key of REQUIRED_STRICT) results.push({ key, ok: has(key) });

// Zincir ID özel durumu
const hasChainId = has('REGISTRY_CHAIN_ID') || has('BASE_SEPOLIA_REGISTRY_CHAIN_ID');
results.push({ key: 'REGISTRY_CHAIN_ID|BASE_SEPOLIA_REGISTRY_CHAIN_ID', ok: hasChainId });

// PAYMASTER auth: either PAYMASTER_API_KEY exists OR (CDP_API_KEY_ID & CDP_API_KEY_SECRET)
const hasPaymasterApiKey = has('PAYMASTER_API_KEY');
const hasBasicCreds = has('CDP_API_KEY_ID') && has('CDP_API_KEY_SECRET');
results.push({ key: 'PAYMASTER_AUTH (PAYMASTER_API_KEY or CDP_API_KEY_ID+CDP_API_KEY_SECRET)', ok: hasPaymasterApiKey || hasBasicCreds });

// SQL key is optional (RPC fallback çalışır); raporda göster ama zorunlu tutma
results.push({ key: 'CDP_SQL_API_KEY (optional)', ok: has('CDP_SQL_API_KEY') });

const ok = results.every((r) => r.ok || r.key.includes('(optional)'));

console.log('BaseMan Healthcheck (Env)');
for (const r of results) console.log(`${r.ok ? '✅' : '❌'} ${r.key}`);

if (!ok) {
  console.log('\nEksik env değişkenleri var. `.env.example` ve ops/04-Backend-Vercel.md dosyasına bakın.');
  process.exitCode = 1;
}
