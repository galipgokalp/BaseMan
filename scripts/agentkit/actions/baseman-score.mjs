import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, "..", "..", "..", ".env.agentkit")
});

const DEFAULT_CHAIN = normalizeChain(process.env.BASEMAN_AGENT_DEFAULT_CHAIN || "base-sepolia");

const CHAIN_CONFIG = {
  base: {
    registryEnv: [
      "BASEMAN_AGENT_BASE_REGISTRY_ADDRESS",
      "BASEMAN_AGENT_REGISTRY_ADDRESS",
      "NEXT_PUBLIC_REGISTRY_ADDRESS"
    ],
    rpcEnv: ["BASEMAN_AGENT_BASE_RPC_URL", "BASEMAN_AGENT_RPC_URL", "RPC_URL"],
    headersEnv: ["BASEMAN_AGENT_BASE_RPC_HEADERS", "BASEMAN_AGENT_RPC_HEADERS"]
  },
  "base-sepolia": {
    registryEnv: [
      "BASEMAN_AGENT_BASE_SEPOLIA_REGISTRY_ADDRESS",
      "BASEMAN_AGENT_REGISTRY_ADDRESS",
      "NEXT_PUBLIC_REGISTRY_ADDRESS"
    ],
    rpcEnv: ["BASEMAN_AGENT_BASE_SEPOLIA_RPC_URL", "BASEMAN_AGENT_RPC_URL", "RPC_URL"],
    headersEnv: ["BASEMAN_AGENT_BASE_SEPOLIA_RPC_HEADERS", "BASEMAN_AGENT_RPC_HEADERS"]
  },
  appchain: {
    registryEnv: ["BASEMAN_AGENT_APPCHAIN_REGISTRY_ADDRESS"],
    rpcEnv: ["BASEMAN_AGENT_APPCHAIN_RPC_URL"],
    headersEnv: ["BASEMAN_AGENT_APPCHAIN_RPC_HEADERS"]
  }
};

const CHAIN_ALIASES = {
  base: "base",
  "base-mainnet": "base",
  "base-sepolia": "base-sepolia",
  basesepolia: "base-sepolia",
  "base-testnet": "base-sepolia",
  appchain: "appchain"
};

function normalizeChain(value) {
  return (value || "").toString().trim().toLowerCase().replace(/_/g, "-");
}

function readFirstEnv(keys = []) {
  for (const key of keys) {
    if (key && process.env[key]) {
      return process.env[key];
    }
  }
  return null;
}

function resolveChainConfig(target) {
  const normalized = normalizeChain(target || DEFAULT_CHAIN);
  const chainKey = CHAIN_ALIASES[normalized] || normalized;
  const envKeys = CHAIN_CONFIG[chainKey];
  if (!envKeys) {
    throw new Error(`Desteklenmeyen zincir: ${target || normalized}`);
  }

  const registryAddress = readFirstEnv(envKeys.registryEnv);
  if (!registryAddress) {
    throw new Error(
      `Registry adresi bulunamadı. Lütfen ${envKeys.registryEnv.join(
        " / "
      )} değişkenlerinden birini ayarlayın.`
    );
  }

  const rpcUrl = readFirstEnv(envKeys.rpcEnv);
  if (!rpcUrl) {
    throw new Error(
      `RPC URL'i bulunamadı. Lütfen ${envKeys.rpcEnv.join(" / ")} değişkenlerinden birini ayarlayın.`
    );
  }

  const headersRaw = readFirstEnv(envKeys.headersEnv || []);
  let rpcHeaders;
  if (headersRaw) {
    try {
      rpcHeaders = JSON.parse(headersRaw);
    } catch (error) {
      console.warn("[agentkit] RPC headers parse error", error);
    }
  }

  return { chainKey, registryAddress, rpcUrl, rpcHeaders };
}

const REGISTRY_ABI = [
  "function getScore(address player) view returns (tuple(uint256 highScore,uint256 lastUpdatedAt))",
  "function submitScore(address player,uint256 score,uint256 deadline,bytes signature)"
];

export const verifyScoreAction = {
  id: "baseman.verifyScore",
  description:
    "BaseManRegistry kontratındaki oyuncu skorunu okuyarak verilen skor iddiasının doğruluğunu kontrol eder.",
  examples: [
    {
      input: {
        player: "0x1234...",
        claimedScore: 15000
      },
      output: {
        success: true,
        onChainHighScore: "15500",
        matches: false
      }
    }
  ],
  handler: async (ctx) => {
    const player = ctx.params?.player;
    const claimedScore = ctx.params?.claimedScore;
    const chainParam = ctx.params?.chain;

    if (!player || !ethers.isAddress(player)) {
      throw new Error("Geçerli bir oyuncu adresi (player) sağlanmalı.");
    }

    if (claimedScore === undefined || Number(claimedScore) < 0) {
      throw new Error("claimedScore parametresi pozitif bir sayı olmalı.");
    }

    const { chainKey, registryAddress, rpcUrl, rpcHeaders } = resolveChainConfig(chainParam);

    const connection = rpcHeaders ? { url: rpcUrl, headers: rpcHeaders } : rpcUrl;
    const provider = new ethers.JsonRpcProvider(connection);
    const contract = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);
    const scoreTuple = await contract.getScore(player);
    const tupleHighScore = scoreTuple.highScore ?? scoreTuple[0];
    const highScore = tupleHighScore ? tupleHighScore.toString() : "0";

    const matches = highScore === String(claimedScore);
    return {
      success: true,
      onChainHighScore: highScore,
      matches,
      chain: chainKey
    };
  }
};
