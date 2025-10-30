#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), '.');
const ENV_IN = path.join(ROOT, '.env');
const ENV_OUT = path.join(ROOT, '.env.v2.staging');

function parseEnv(content) {
  const map = new Map();
  const order = [];
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(raw);
    if (m) {
      const key = m[1];
      let val = m[2];
      // Preserve as-is (including quotes) to avoid breaking formats like JSON headers
      map.set(key, val);
      order.push(key);
    }
  }
  return { map, order };
}

function get(map, key, fallback = '') {
  return map.has(key) ? map.get(key) : fallback;
}

function set(map, key, val) {
  map.set(key, val);
}

function serialize(map, keepKeys = []) {
  const lines = [];
  lines.push('# Auto-generated V2 staging env (do not commit secrets)');
  lines.push('# After deploying BaseManRegistryV2, replace <V2_ADDRESS> placeholders and move to .env');
  lines.push('');

  // Critical versioning
  lines.push(`REGISTRY_EIP712_VERSION=2`);
  lines.push(`NEXT_PUBLIC_REGISTRY_EIP712_VERSION=2`);

  // Chain defaults (keep existing if present)
  lines.push(`REGISTRY_DEFAULT_TARGET=${get(map,'REGISTRY_DEFAULT_TARGET','base-sepolia')}`);
  lines.push(`REGISTRY_CHAIN_ID=${get(map,'REGISTRY_CHAIN_ID','84532')}`);
  lines.push(`BASE_SEPOLIA_REGISTRY_CHAIN_ID=${get(map,'BASE_SEPOLIA_REGISTRY_CHAIN_ID','84532')}`);

  // Addresses (to be filled post-deploy)
  lines.push(`NEXT_PUBLIC_REGISTRY_ADDRESS=0x<V2_ADDRESS>`);
  lines.push(`BASE_SEPOLIA_REGISTRY_ADDRESS=0x<V2_ADDRESS>`);

  // Paymaster / Bundler (preserve existing where applicable)
  lines.push(`NEXT_PUBLIC_PAYMASTER_URL=${get(map,'NEXT_PUBLIC_PAYMASTER_URL','/api/paymaster-proxy')}`);
  lines.push(`PAYMASTER_SERVICE_URL=${get(map,'PAYMASTER_SERVICE_URL','')}`);
  lines.push(`NEXT_PUBLIC_BUNDLER_URL=${get(map,'NEXT_PUBLIC_BUNDLER_URL','')}`);

  // Allowed targets: append placeholder V2 address
  const currentTargets = String(get(map,'PAYMASTER_ALLOWED_TARGETS','')).trim();
  const placeholder = '0x<V2_ADDRESS>';
  let targetsOut = placeholder;
  if (currentTargets && !currentTargets.split(',').map(s=>s.trim().toLowerCase()).includes(placeholder.toLowerCase())) {
    targetsOut = `${currentTargets},${placeholder}`;
  }
  lines.push(`PAYMASTER_ALLOWED_TARGETS=${targetsOut}`);

  // Allowed selectors: V2 only (submitScore, completeQuest)
  lines.push(`PAYMASTER_ALLOWED_SELECTORS=0x42a252f6,0xa12020e8`);

  // Keep common security/limits
  lines.push(`PAYMASTER_ENFORCE_ALLOWLIST=${get(map,'PAYMASTER_ENFORCE_ALLOWLIST','true')}`);
  lines.push(`PAYMASTER_MAX_CALLS=${get(map,'PAYMASTER_MAX_CALLS','1')}`);

  // Backend signer(s)
  lines.push(`SCORE_SIGNER_PRIVATE_KEY=${get(map,'SCORE_SIGNER_PRIVATE_KEY','')}`);
  lines.push(`BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY=${get(map,'BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY','')}`);
  lines.push(`QUEST_SIGNER_PRIVATE_KEY=${get(map,'QUEST_SIGNER_PRIVATE_KEY','')}`);
  lines.push(`BASE_SEPOLIA_QUEST_SIGNER_PRIVATE_KEY=${get(map,'BASE_SEPOLIA_QUEST_SIGNER_PRIVATE_KEY','')}`);

  // CDP/SQL and RPCs (preserve)
  const preserveKeys = [
    'CDP_API_KEY_ID','CDP_API_KEY_SECRET','CDP_SQL_API_KEY','CDP_SQL_API_BASE_URL',
    'BASE_SEPOLIA_RPC_URL','BASE_SEPOLIA_RPC_HEADERS','BASE_MAINNET_RPC_URL','BASESCAN_API_KEY',
    'ADDRESS_HISTORY_RPC_URL','ADDRESS_HISTORY_CACHE_TTL_MS','LEADERBOARD_FALLBACK_WINDOW_BLOCKS','LEADERBOARD_FALLBACK_CHUNK_SIZE',
    'NEXT_PUBLIC_SHOW_LEADERBOARD','LEADERBOARD_DISABLE','BASE_BUILDER_ALLOWED_ADDRESSES','MANIFEST_REQUIRED_CHAINS',
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID','CDP_WEBHOOK_SECRET','CDP_WEBHOOK_MAX_DRIFT_MS','CDP_WEBHOOK_CACHE_TTL_MS','CDP_WEBHOOK_CACHE_SIZE','CDP_WEBHOOK_LOG_ENDPOINT',
    'ALLOWED_QUEST_IDS'
  ];
  for (const key of preserveKeys) {
    if (map.has(key)) lines.push(`${key}=${map.get(key)}`);
  }

  lines.push('');
  lines.push('# Notes:');
  lines.push('# - Replace 0x<V2_ADDRESS> with the deployed V2 contract address (Sepolia/Mainnet).');
  lines.push('# - After updating, run: npm run onchain:config');
  lines.push('# - Consider removing V1 selectors from PAYMASTER_ALLOWED_SELECTORS after verifying V2 e2e.');
  return lines.join('\n');
}

function main() {
  let content = '';
  try { content = fs.readFileSync(ENV_IN, 'utf8'); }
  catch { content = ''; }
  const { map } = parseEnv(content);
  const out = serialize(map);
  fs.writeFileSync(ENV_OUT, out, 'utf8');
  console.log(`Written ${path.relative(ROOT, ENV_OUT)}`);
}

main();

