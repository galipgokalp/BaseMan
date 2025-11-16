import { ethers } from "ethers";

/**
 * Debug Config Endpoint
 *
 * Bu endpoint, production environment'taki konfigürasyonu gösterir.
 * Kullanıcılar https://base-man.vercel.app/api/debug-config adresine gidip
 * environment'ın doğru konfigüre edilip edilmediğini kontrol edebilirler.
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get signer address from private key (don't expose the key itself!)
  let signerAddress = "NOT_SET";
  const pk = process.env.SCORE_SIGNER_PRIVATE_KEY || process.env.BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY;
  if (pk) {
    try {
      const wallet = new ethers.Wallet(pk);
      signerAddress = wallet.address;
    } catch (error) {
      signerAddress = `ERROR: ${error.message}`;
    }
  }

  // Get registry contract info
  const registryAddress = process.env.BASE_MAINNET_REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  const rpcUrl = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";

  let authorizerAddress = "UNKNOWN";
  let contractPaused = "UNKNOWN";
  let contractVersion = "UNKNOWN";

  if (registryAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const abi = [
        "function authorizer() view returns (address)",
        "function paused() view returns (bool)",
        "function eip712Version() view returns (string)"
      ];
      const contract = new ethers.Contract(registryAddress, abi, provider);

      authorizerAddress = await contract.authorizer();
      contractPaused = await contract.paused();
      contractVersion = await contract.eip712Version();
    } catch (error) {
      authorizerAddress = `ERROR: ${error.message}`;
    }
  }

  // Build response
  const config = {
    timestamp: new Date().toISOString(),
    environment: {
      REGISTRY_DEFAULT_TARGET: process.env.REGISTRY_DEFAULT_TARGET || "NOT_SET",
      BASE_MAINNET_REGISTRY_ADDRESS: registryAddress || "NOT_SET",
      REGISTRY_EIP712_VERSION: process.env.REGISTRY_EIP712_VERSION || "NOT_SET",
      NEXT_PUBLIC_REGISTRY_EIP712_VERSION: process.env.NEXT_PUBLIC_REGISTRY_EIP712_VERSION || "NOT_SET"
    },
    backend: {
      signerAddress: signerAddress,
      scoreEndpoint: "/api/score-sign",
      questEndpoint: "/api/quest-sign"
    },
    contract: {
      address: registryAddress || "NOT_SET",
      authorizer: authorizerAddress,
      paused: contractPaused,
      eip712Version: contractVersion,
      chainId: 8453,
      chainName: "Base Mainnet",
      explorer: `https://basescan.org/address/${registryAddress}`
    },
    validation: {
      signerMatchesAuthorizer: signerAddress === authorizerAddress,
      versionMatch: process.env.REGISTRY_EIP712_VERSION === contractVersion,
      contractActive: contractPaused === false
    },
    status: "OK"
  };

  // Check for critical issues
  const issues = [];
  if (signerAddress === "NOT_SET") {
    issues.push("SCORE_SIGNER_PRIVATE_KEY not configured");
  }
  if (registryAddress === "NOT_SET") {
    issues.push("BASE_MAINNET_REGISTRY_ADDRESS not configured");
  }
  if (signerAddress !== authorizerAddress && authorizerAddress !== "UNKNOWN") {
    issues.push(`Signer (${signerAddress}) does not match contract authorizer (${authorizerAddress})`);
  }
  if (contractPaused === true) {
    issues.push("Contract is PAUSED - score submissions will fail");
  }
  if (process.env.REGISTRY_EIP712_VERSION !== contractVersion && contractVersion !== "UNKNOWN") {
    issues.push(`EIP-712 version mismatch (env: ${process.env.REGISTRY_EIP712_VERSION}, contract: ${contractVersion})`);
  }

  if (issues.length > 0) {
    config.status = "ERROR";
    config.issues = issues;
  }

  return res.status(200).json(config);
}
