#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { id as keccakId, getAddress } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function env(k) {
  const v = process.env[k];
  return typeof v === 'string' ? v.trim() : '';
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return null;
  }
}

function findRegistryAddress() {
  const candidates = [
    'NEXT_PUBLIC_REGISTRY_ADDRESS',
    'BASE_SEPOLIA_REGISTRY_ADDRESS',
    'BASE_MAINNET_REGISTRY_ADDRESS',
    'REGISTRY_ADDRESS'
  ];
  for (const k of candidates) {
    const v = env(k);
    if (v) return v;
  }
  return '';
}

function normalizeAddr(v) {
  try { return getAddress(v); } catch { return null; }
}

function computeSelector(signature) {
  return keccakId(signature).slice(0, 10).toLowerCase();
}

function parseSelectors(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((s) => (s.startsWith('0x') ? s : `0x${s}`))
    .map((s) => s.slice(0, 10));
}

async function main() {
  const registryRaw = findRegistryAddress();
  const registry = normalizeAddr(registryRaw);
  const sigs = [
    'submitScore(address,uint256,uint256,uint256,bytes)',
    'completeQuest(address,uint256,uint256,uint256,bytes)'
  ];
  const selectors = sigs.map((s) => ({ sig: s, sel: computeSelector(s) }));

  console.log('— BaseMan Paymaster Policy Check —');
  console.log('Registry address (env):', registry || '(missing)');
  console.log('Required function selectors:');
  for (const { sig, sel } of selectors) console.log('  ', sig, '->', sel);

  // Check local env PAYMASTER_ALLOWED_SELECTORS if present
  const raw = env('PAYMASTER_ALLOWED_SELECTORS');
  if (raw) {
    const configured = new Set(parseSelectors(raw));
    const missing = selectors.filter(({ sel }) => !configured.has(sel));
    if (missing.length) {
      console.log('PAYMASTER_ALLOWED_SELECTORS missing:', missing.map((m) => m.sel).join(', '));
    } else {
      console.log('PAYMASTER_ALLOWED_SELECTORS includes required selectors.');
    }
  } else {
    console.log('PAYMASTER_ALLOWED_SELECTORS not set; local proxy will use defaults (OK).');
  }

  // Verify manifest allowedAddresses includes registry
  const manifestPath = path.join(ROOT, 'config', 'manifest.base.json');
  const manifest = readJson(manifestPath);
  if (manifest && registry) {
    const list = manifest?.baseBuilder?.allowedAddresses || [];
    const has = list.some((v) => normalizeAddr(v) === registry);
    console.log('Manifest allowedAddresses contains registry:', has ? 'YES' : 'NO');
    if (!has) {
      console.log('  Add to config/manifest.base.json > baseBuilder.allowedAddresses:', registry);
    }
  }

  console.log('\nPortal Checklist (copy/paste):');
  console.log('- Contract address:', registry || '<REGISTRY_ADDRESS>');
  console.log('- Chain: Base Sepolia (84532) or Base (8453)');
  console.log('- Allowed function selectors:');
  for (const { sel, sig } of selectors) console.log(`  • ${sel}  (${sig})`);
}

main().catch((err) => { console.error(err); process.exit(1); });

