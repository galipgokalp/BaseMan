export default async function handler(req, res) {
  // Public environment variables that are safe to expose
  const keys = [
    'REGISTRY_DEFAULT_TARGET',
    'REGISTRY_CHAIN_ID',
    'BASE_SEPOLIA_REGISTRY_CHAIN_ID',
    'NEXT_PUBLIC_REGISTRY_ADDRESS',
    'NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS',
    'NEXT_PUBLIC_REGISTRY_CHAIN_ID',
    'NEXT_PUBLIC_REGISTRY_EIP712_VERSION',
    'REGISTRY_EIP712_VERSION',
    'PAYMASTER_ENFORCE_ALLOWLIST',
    'PAYMASTER_ALLOWED_TARGETS',
    'PAYMASTER_ALLOWED_SELECTORS',
    'NEXT_PUBLIC_BUNDLER_URL',
    'NEXT_PUBLIC_PAYMASTER_URL'
  ];

  const data = {};
  for (const k of keys) {
    data[k] = process.env[k] || null;
  }

  // Add computed/normalized values for easier client-side checking
  const normalized = {
    registryAddress: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
                     process.env.BASE_MAINNET_REGISTRY_ADDRESS ||
                     process.env.NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS || null,
    chainId: process.env.NEXT_PUBLIC_REGISTRY_CHAIN_ID ||
             process.env.REGISTRY_CHAIN_ID || null,
    eip712Version: process.env.NEXT_PUBLIC_REGISTRY_EIP712_VERSION ||
                   process.env.REGISTRY_EIP712_VERSION || null,
    defaultTarget: process.env.REGISTRY_DEFAULT_TARGET || null
  };

  res.status(200).json({
    env: data,
    normalized,
    timestamp: new Date().toISOString()
  });
}

