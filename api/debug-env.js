export default async function handler(req, res) {
  const keys = [
    'REGISTRY_DEFAULT_TARGET','REGISTRY_CHAIN_ID','BASE_SEPOLIA_REGISTRY_CHAIN_ID',
    'NEXT_PUBLIC_REGISTRY_ADDRESS','NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS',
    'PAYMASTER_ENFORCE_ALLOWLIST','PAYMASTER_ALLOWED_TARGETS','PAYMASTER_ALLOWED_SELECTORS'
  ];
  const data = {};
  for (const k of keys) data[k] = process.env[k] || null;
  res.status(200).json({ env: data });
}

