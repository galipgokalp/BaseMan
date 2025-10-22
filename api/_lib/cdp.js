import { CdpClient } from "@coinbase/cdp-sdk";

let cachedClient;

export function getCdpClient() {
  if (cachedClient) return cachedClient;

  const apiKeyName = process.env.CDP_API_KEY_ID;
  const privateKey = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyName || !privateKey) {
    throw new Error(
      "[CDP] Missing CDP_API_KEY_ID or CDP_API_KEY_SECRET environment variables. Generate a Secret API key in the CDP dashboard and set both values."
    );
  }

  cachedClient = new CdpClient({
    apiKeyName,
    privateKey
  });

  return cachedClient;
}

export function getDefaultNetwork() {
  return process.env.CDP_DEFAULT_NETWORK || "base-sepolia";
}

export function assertNetwork(network) {
  const value = (network || getDefaultNetwork()).toLowerCase();
  if (value !== "base" && value !== "base-sepolia") {
    throw new Error(`[CDP] Unsupported network "${network}". Use "base" or "base-sepolia".`);
  }
  return value;
}
