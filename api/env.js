export default async function handler(req, res) {
  try {
    const env = process.env || {};
    // Public runtime env: allow NEXT_PUBLIC_* and a curated set of non‑secret keys used for chain selection
    const SAFE_KEYS = new Set([
      'REGISTRY_CHAIN_ID',
      'REGISTRY_EIP712_VERSION',
      'REGISTRY_DEFAULT_TARGET',
      'BASE_SEPOLIA_REGISTRY_ADDRESS',
      'NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS'
    ]);
    const obj = {};
    for (const [k, v] of Object.entries(env)) {
      if (k.startsWith('NEXT_PUBLIC_') || SAFE_KEYS.has(k)) {
        // Normalize and trim to avoid stray newlines/spaces from dashboard pastes
        let val = v;
        if (typeof val === 'string') {
          try { val = val.trim(); } catch (_) {}
        }
        obj[k] = val;
      }
    }
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send(`window.__ENV = ${JSON.stringify(obj)};`);
  } catch (err) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send('window.__ENV = {};');
  }
}
