(() => {
  try {
    const env = (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV : {};
    const cfg = (window.BaseManOnchainConfig = window.BaseManOnchainConfig || {});

    // Override registry from NEXT_PUBLIC_REGISTRY_ADDRESS if provided
    if (env.NEXT_PUBLIC_REGISTRY_ADDRESS && env.NEXT_PUBLIC_REGISTRY_ADDRESS !== cfg.registryAddress) {
      cfg.registryAddress = env.NEXT_PUBLIC_REGISTRY_ADDRESS;
    }

    // ChainId override preference:
    // 1) NEXT_PUBLIC_REGISTRY_CHAIN_ID
    // 2) If registry matches NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS ⇒ 8453
    if (env.NEXT_PUBLIC_REGISTRY_CHAIN_ID) {
      const id = Number(env.NEXT_PUBLIC_REGISTRY_CHAIN_ID);
      if (Number.isFinite(id) && id > 0) cfg.chainId = id;
    } else if (
      env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS &&
      cfg.registryAddress &&
      env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS.toLowerCase() === cfg.registryAddress.toLowerCase()
    ) {
      cfg.chainId = 8453;
    }

    // Optional Bundler/Paymaster overrides
    if (env.NEXT_PUBLIC_BUNDLER_URL) cfg.bundlerUrl = env.NEXT_PUBLIC_BUNDLER_URL;
    if (env.NEXT_PUBLIC_PAYMASTER_URL) cfg.paymasterUrl = env.NEXT_PUBLIC_PAYMASTER_URL;
  } catch (_) {
    // no-op best effort
  }
})();

