import { CdpClient } from "@coinbase/cdp-sdk";
import { getEnv } from "./env.js";

let cachedClient;

export function getCdpClient() {
  if (cachedClient) return cachedClient;

  const env = getEnv();
  const { apiKeyId, apiKeySecret } = env.cdp;

  cachedClient = new CdpClient({
    apiKeyName: apiKeyId,
    privateKey: apiKeySecret
  });

  return cachedClient;
}

export function getDefaultNetwork() {
  const env = getEnv();
  return env.cdp.defaultNetwork;
}

export function assertNetwork(network) {
  const value = (network || getDefaultNetwork()).toLowerCase();
  if (value !== "base" && value !== "base-sepolia") {
    throw new Error(`[CDP] Unsupported network "${network}". Use "base" or "base-sepolia".`);
  }
  return value;
}
