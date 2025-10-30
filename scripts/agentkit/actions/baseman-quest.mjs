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
  // Read-only ABI is sufficient for verification action
  "function isQuestCompleted(address player,uint256 questId) view returns (bool)"
];

export const verifyQuestAction = {
  id: "baseman.verifyQuest",
  description:
    "BaseManRegistry kontratında belirtilen görevin oyuncu tarafından tamamlanıp tamamlanmadığını kontrol eder.",
  examples: [
    {
      input: {
        player: "0x1234...",
        questId: 1
      },
      output: {
        success: true,
        completed: false
      }
    }
  ],
  handler: async (ctx) => {
    const player = ctx.params?.player;
    const questId = ctx.params?.questId;
    const chainParam = ctx.params?.chain;

    if (!player || !ethers.isAddress(player)) {
      throw new Error("Geçerli bir oyuncu adresi (player) sağlanmalı.");
    }

    if (questId === undefined || Number(questId) < 0) {
      throw new Error("questId parametresi sıfır veya pozitif bir sayı olmalı.");
    }

    const { chainKey, registryAddress, rpcUrl, rpcHeaders } = resolveChainConfig(chainParam);

    const connection = rpcHeaders ? { url: rpcUrl, headers: rpcHeaders } : rpcUrl;
    const provider = new ethers.JsonRpcProvider(connection);
    const contract = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);
    const completed = await contract.isQuestCompleted(player, questId);

    return {
      success: true,
      completed,
      chain: chainKey
    };
  }
};
