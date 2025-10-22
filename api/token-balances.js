import { ethers } from "ethers";
import { z } from "zod";
import { getCdpClient, assertNetwork } from "./_lib/cdp.js";

const QuerySchema = z.object({
  address: z
    .string()
    .trim()
    .refine((value) => ethers.isAddress(value), {
      message: "address must be a valid EVM address"
    })
    .transform((value) => ethers.getAddress(value)),
  network: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toLowerCase() : value)),
  pageSize: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined)),
  pageToken: z.string().optional(),
});

function serializeBalances(response) {
  return {
    balances: response.balances.map((entry) => ({
      token: {
        network: entry.token.network,
        contractAddress: entry.token.contractAddress,
        symbol: entry.token.symbol,
        name: entry.token.name
      },
      amount: {
        amount: entry.amount.amount.toString(),
        decimals: entry.amount.decimals
      }
    })),
    nextPageToken: response.nextPageToken ?? null
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten()
    });
  }

  try {
    const { address, network, pageSize, pageToken } = parsed.data;
    const networkId = assertNetwork(network);
    const client = getCdpClient();

    const result = await client.evm.listTokenBalances({
      address,
      network: networkId,
      pageSize: pageSize && Number.isFinite(pageSize) ? pageSize : undefined,
      pageToken: pageToken || undefined
    });

    return res.status(200).json({
      address,
      network: networkId,
      ...serializeBalances(result)
    });
  } catch (error) {
    console.error("[token-balances] error", error);
    return res.status(500).json({
      error: "Failed to fetch balances",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
