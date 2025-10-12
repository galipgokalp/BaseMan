import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk@0.4.5";
import { ethers } from "https://esm.sh/ethers@6.13.0";
import { onchainConfig } from "./onchain-config.js";

const CONTRACT_ABI = [
  "function submitScore(address player,uint256 score,uint256 deadline,bytes signature)",
  "function completeQuest(address player,uint256 questId,uint256 deadline,bytes signature)",
  "function getScore(address player) view returns (tuple(uint256 highScore,uint256 lastUpdatedAt))"
];

const CHAIN_METADATA = {
  8453: {
    chainName: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  },
  84532: {
    chainName: "Base Sepolia",
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
  }
};

const state = {
  signer: null,
  address: null,
  contract: null,
  runStartedAt: null,
  submitting: false
};

sdk.actions.ready();

async function ensureWallet() {
  if (state.contract) return state;

  try {
    await sdk.actions.signIn();
  } catch (error) {
    console.warn("[BaseMan] signIn skipped or failed:", error);
  }

  const provider = await sdk.wallet.getEthereumProvider();
  await ensureChain(provider, onchainConfig.chainId);

  const browserProvider = new ethers.BrowserProvider(provider);
  const signer = await browserProvider.getSigner();
  const address = await signer.getAddress();

  state.signer = signer;
  state.address = ethers.getAddress(address);
  state.contract = new ethers.Contract(onchainConfig.registryAddress, CONTRACT_ABI, signer);

  return state;
}

async function ensureChain(provider, chainId) {
  const hexChainId = ethers.hexlify(chainId);
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }]
    });
  } catch (error) {
    if (error?.code === 4902) {
      const metadata = CHAIN_METADATA[chainId] || {
        chainName: `Chain ${chainId}`,
        rpcUrls: [],
        blockExplorerUrls: [],
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
      };
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            ...metadata
          }
        ]
      });
    } else {
      console.warn("[BaseMan] wallet_switchEthereumChain failed", error);
    }
  }
}

async function requestScoreSignature(score, durationMs) {
  const response = await fetch(onchainConfig.scoreEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerAddress: state.address,
      score: score.toString(),
      durationMs,
      level: window.level ?? 1
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error || "Failed to obtain score signature";
    throw new Error(message);
  }
  return payload;
}

async function submitScore() {
  if (state.submitting) return;
  if (typeof window.getScore !== "function") return;

  const score = BigInt(window.getScore());
  if (score <= 0n) return;

  const durationMs =
    state.runStartedAt !== null ? Math.max(0, Math.floor(performance.now() - state.runStartedAt)) : 0;

  try {
    state.submitting = true;

    await ensureWallet();
    if (!state.address) {
      throw new Error("Wallet connection required");
    }

    const { signature, deadline, score: signedScore } = await requestScoreSignature(
      score,
      durationMs
    );

    const scoreValue = signedScore ? BigInt(signedScore) : score;
    const deadlineValue = BigInt(deadline);

    const tx = await state.contract.submitScore(
      state.address,
      scoreValue,
      deadlineValue,
      signature
    );

    console.log("[BaseMan] Submitted score tx:", tx.hash);
  } catch (error) {
    console.error("[BaseMan] submitScore failed:", error);
  } finally {
    state.submitting = false;
    state.runStartedAt = null;
  }
}

function handleRunStart() {
  state.runStartedAt = performance.now();
}

function patchStateHooks() {
  if (window.newGameState?.init && !window.newGameState._patchedForOnchain) {
    const original = window.newGameState.init.bind(window.newGameState);
    window.newGameState.init = function patchedInit(...args) {
      handleRunStart();
      return original(...args);
    };
    window.newGameState._patchedForOnchain = true;
  }

  if (window.overState?.init && !window.overState._patchedForOnchain) {
    const original = window.overState.init.bind(window.overState);
    window.overState.init = function patchedGameOver(...args) {
      submitScore();
      return original(...args);
    };
    window.overState._patchedForOnchain = true;
  }
}

patchStateHooks();

window.BaseManOnchain = {
  ensureWallet,
  submitScore,
  handleRunStart
};
