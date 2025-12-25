(() => {
  try {
    const env = (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV : {};
    const cfg = (window.BaseManOnchainConfig = window.BaseManOnchainConfig || {});
    const allowDirectPaymaster = String(env.NEXT_PUBLIC_ALLOW_DIRECT_PAYMASTER_URL || '').toLowerCase() === 'true';
    const isCdpRpcUrl = (value) => {
      if (!value || typeof value !== 'string') return false;
      return /^https?:\\/\\/api\\.developer\\.coinbase\\.com\\/rpc\\/v1\\//.test(value.trim());
    };
    const isLocalhost = () => {
      try {
        const host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1' || host === '::1';
      } catch (_) {
        return false;
      }
    };

    // Override registry from NEXT_PUBLIC_REGISTRY_ADDRESS if provided
    if (env.NEXT_PUBLIC_REGISTRY_ADDRESS && env.NEXT_PUBLIC_REGISTRY_ADDRESS !== cfg.registryAddress) {
      cfg.registryAddress = env.NEXT_PUBLIC_REGISTRY_ADDRESS;
    }

    // ChainId override preference:
    // 1) NEXT_PUBLIC_REGISTRY_CHAIN_ID
    // 2) REGISTRY_CHAIN_ID (non-secret, exposed via /api/env.js)
    // 3) REGISTRY_DEFAULT_TARGET ('base' | 'base-sepolia')
    // 4) If registry matches NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS ⇒ 8453
    if (env.NEXT_PUBLIC_REGISTRY_CHAIN_ID) {
      const id = Number(env.NEXT_PUBLIC_REGISTRY_CHAIN_ID);
      if (Number.isFinite(id) && id > 0) cfg.chainId = id;
    } else if (env.REGISTRY_CHAIN_ID) {
      const id = Number(env.REGISTRY_CHAIN_ID);
      if (Number.isFinite(id) && id > 0) cfg.chainId = id;
    } else if (env.REGISTRY_DEFAULT_TARGET) {
      const t = String(env.REGISTRY_DEFAULT_TARGET).toLowerCase();
      if (t === 'base') cfg.chainId = 8453;
      if (t === 'base-sepolia') cfg.chainId = 84532;
    } else if (
      env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS &&
      cfg.registryAddress &&
      env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS.toLowerCase() === cfg.registryAddress.toLowerCase()
    ) {
      cfg.chainId = 8453;
    }

    // Optional Bundler/Paymaster overrides (keep in sync with combined endpoint)
    if (env.NEXT_PUBLIC_BUNDLER_URL) cfg.bundlerUrl = env.NEXT_PUBLIC_BUNDLER_URL;
    if (env.NEXT_PUBLIC_PAYMASTER_URL) cfg.paymasterUrl = env.NEXT_PUBLIC_PAYMASTER_URL;
    // Fallback to combined endpoint if individual ones are missing
    if (env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT) {
      const url = env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT;
      if (!cfg.paymasterUrl) cfg.paymasterUrl = url;
      if (!cfg.bundlerUrl) cfg.bundlerUrl = url;
    }

    // Prefer proxy in non-local environments when a direct CDP RPC URL is provided.
    if (cfg.paymasterUrl && isCdpRpcUrl(cfg.paymasterUrl) && !isLocalhost() && !allowDirectPaymaster) {
      cfg.paymasterUrl = "/api/paymaster-proxy";
    }
  } catch (_) {
    // no-op best effort
  }
})();
