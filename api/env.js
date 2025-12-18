import { getEnv } from './_lib/env.js';

/**
 * Client-side Environment Variables API Endpoint
 * 
 * Exposes safe environment variables to the browser via window.__ENV
 * Only exposes NEXT_PUBLIC_* and curated non-secret keys for chain selection
 */
export default async function handler(req, res) {
  try {
    const env = getEnv();
    const processEnv = process.env || {};
    
    // Public runtime env: allow NEXT_PUBLIC_* and a curated set of non‑secret keys used for chain selection
    const SAFE_KEYS = new Set([
      'REGISTRY_CHAIN_ID',
      'REGISTRY_EIP712_VERSION',
      'REGISTRY_DEFAULT_TARGET',
      'BASE_SEPOLIA_REGISTRY_ADDRESS',
      'NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS'
    ]);
    
    const obj = {};
    
    // Add all NEXT_PUBLIC_* variables
    for (const [k, v] of Object.entries(processEnv)) {
      if (k.startsWith('NEXT_PUBLIC_')) {
        // Normalize and trim to avoid stray newlines/spaces from dashboard pastes
        let val = v;
        if (typeof val === 'string') {
          try { val = val.trim(); } catch {
            // Ignore trim errors
          }
        }
        obj[k] = val;
      }
    }
    
    // Add safe keys from validated env config
    if (env.registry.chainId) obj.REGISTRY_CHAIN_ID = env.registry.chainId;
    if (env.registry.eip712Version) obj.REGISTRY_EIP712_VERSION = env.registry.eip712Version;
    if (env.registry.defaultTarget) obj.REGISTRY_DEFAULT_TARGET = env.registry.defaultTarget;
    if (env.registry.baseSepoliaAddress) obj.BASE_SEPOLIA_REGISTRY_ADDRESS = env.registry.baseSepoliaAddress;
    if (env.registry.baseMainnetAddress) obj.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS = env.registry.baseMainnetAddress;
    
    // Also check process.env for any safe keys that might not be in validated config
    for (const key of SAFE_KEYS) {
      if (!obj[key] && processEnv[key]) {
        let val = processEnv[key];
        if (typeof val === 'string') {
          try { val = val.trim(); } catch {}
        }
        obj[key] = val;
      }
    }
    
    // Provide a public alias for EIP-712 version if only server var is set
    if (!obj.NEXT_PUBLIC_REGISTRY_EIP712_VERSION && obj.REGISTRY_EIP712_VERSION) {
      obj.NEXT_PUBLIC_REGISTRY_EIP712_VERSION = String(obj.REGISTRY_EIP712_VERSION).trim();
    }
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send(`window.__ENV = ${JSON.stringify(obj)};`);
  } catch (error) {
    // On validation error, still try to serve basic env (for graceful degradation)
    try {
      const processEnv = process.env || {};
      const obj = {};
      for (const [k, v] of Object.entries(processEnv)) {
        if (k.startsWith('NEXT_PUBLIC_')) {
          let val = v;
          if (typeof val === 'string') {
            try { val = val.trim(); } catch {}
          }
          obj[k] = val;
        }
      }
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.status(200).send(`window.__ENV = ${JSON.stringify(obj)};`);
    } catch {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.status(200).send('window.__ENV = {};');
    }
  }
}
