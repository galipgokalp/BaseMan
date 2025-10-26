#!/usr/bin/env node
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5173;

app.use(express.json({ limit: '1mb' }));

async function loadHandler(modulePath) {
  const mod = await import(modulePath);
  const handler = mod.default || mod.handler || mod;
  if (typeof handler !== 'function') {
    throw new Error(`Handler not found for ${modulePath}`);
  }
  return handler;
}

function wrap(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      // Fallback for handlers that may throw
      console.error('[api] error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', details: String(err?.message || err) });
      }
    }
  };
}

// API routes (Vercel/Next-style handlers)
const apiMap = [
  ['/api/env.js', path.join(ROOT, 'api', 'env.js')],
  ['/api/score-sign', path.join(ROOT, 'api', 'score-sign.js')],
  ['/api/quest-sign', path.join(ROOT, 'api', 'quest-sign.js')],
  ['/api/paymaster-proxy', path.join(ROOT, 'api', 'paymaster-proxy.js')],
  ['/api/leaderboard', path.join(ROOT, 'api', 'leaderboard.js')],
  ['/api/address-history', path.join(ROOT, 'api', 'address-history.js')],
  ['/api/token-balances', path.join(ROOT, 'api', 'token-balances.js')],
  ['/api/miniapp-webhook', path.join(ROOT, 'api', 'miniapp-webhook.js')],
  ['/api/webhook', path.join(ROOT, 'api', 'webhook.js')],
];

await Promise.all(
  apiMap.map(async ([route, mod]) => {
    const handler = await loadHandler(path.resolve(mod));
    app.all(route, wrap(handler));
  })
);

// Runtime public env injection for browser (NEXT_PUBLIC_* only)
app.get('/__env.js', (req, res) => {
  const entries = Object.entries(process.env || {}).filter(([k]) => k.startsWith('NEXT_PUBLIC_'));
  const obj = Object.fromEntries(entries);
  res.type('application/javascript').send(`window.__ENV = ${JSON.stringify(obj)};`);
});

// Static files (serve repo root) — allow dotfiles for .well-known
app.use(express.static(ROOT, { dotfiles: 'allow' }));

app.listen(PORT, () => {
  console.log(`[dev] Server running at http://127.0.0.1:${PORT}`);
});
