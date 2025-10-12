import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk@0.4.5";
import { ethers } from "https://esm.sh/ethers@6.13.0";
import { onchainConfig } from "./onchain-config.js";

function createDebugOverlay() {
  const container = document.createElement("div");
  container.id = "baseman-debug";
  container.style.position = "fixed";
  container.style.left = "8px";
  container.style.right = "8px";
  container.style.bottom = "8px";
  container.style.maxHeight = "45vh";
  container.style.overflowY = "auto";
  container.style.background = "rgba(0, 0, 0, 0.75)";
  container.style.color = "#0f0";
  container.style.font = "12px monospace";
  container.style.padding = "6px";
  container.style.zIndex = "9999";
  container.style.pointerEvents = "none";
  container.style.whiteSpace = "pre-wrap";
  container.style.display = "none";

  const buffer = [];
  const flush = () => {
    if (container.parentElement || !document.body) return;
    document.body.appendChild(container);
    if (buffer.length) {
      container.textContent = buffer.join("\n") + "\n";
      container.style.display = "block";
      buffer.length = 0;
    }
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    flush();
  } else {
    document.addEventListener("DOMContentLoaded", flush, { once: true });
  }

  return (message) => {
    const entry = `[${new Date().toISOString().split("T")[1].split(".")[0]}] ${message}`;
    if (container.parentElement && document.body) {
      container.style.display = "block";
      container.textContent += entry + "\n";
    } else {
      buffer.push(entry);
      flush();
    }
  };
}

const debug = createDebugOverlay();
debug("onchain-client module loaded");

window.addEventListener("error", (event) => {
  debug(`Error: ${(event && event.message) || event}`);
});

window.addEventListener("unhandledrejection", (event) => {
  debug(`Unhandled rejection: ${event.reason}`);
});

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
debug("sdk.actions.ready() called");

async function ensureWallet() {
  if (state.contract) return state;

  try {
    await sdk.actions.signIn();
    debug("sdk.actions.signIn() resolved");
  } catch (error) {
    debug(`signIn error: ${error?.message || error}`);
  }

  const provider = await sdk.wallet.getEthereumProvider();
  debug("Received provider from sdk.wallet.getEthereumProvider()");
  await ensureChain(provider, onchainConfig.chainId);

  const browserProvider = new ethers.BrowserProvider(provider);
  const signer = await browserProvider.getSigner();
  const address = await signer.getAddress();

  state.signer = signer;
  state.address = ethers.getAddress(address);
  state.contract = new ethers.Contract(onchainConfig.registryAddress, CONTRACT_ABI, signer);
  debug(`Wallet ready: ${state.address}`);

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
      debug(`Added chain ${chainId} via wallet_addEthereumChain`);
    } else {
      debug(`wallet_switchEthereumChain failed: ${error?.message || error}`);
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
    debug(`score-sign failed: ${message}`);
    throw new Error(message);
  }
  debug(`score-sign success for ${score} (duration ${durationMs}ms)`);
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

    debug(`submitScore tx sent: ${tx.hash}`);
  } catch (error) {
    debug(`submitScore error: ${error?.message || error}`);
  } finally {
    state.submitting = false;
    state.runStartedAt = null;
  }
}

function handleRunStart() {
  state.runStartedAt = performance.now();
  debug("Run started");
}

function patchStateHooks() {
  if (window.newGameState?.init && !window.newGameState._patchedForOnchain) {
    const original = window.newGameState.init.bind(window.newGameState);
    window.newGameState.init = function patchedInit(...args) {
      handleRunStart();
      return original(...args);
    };
    window.newGameState._patchedForOnchain = true;
    debug("Patched newGameState.init");
  }

  if (window.overState?.init && !window.overState._patchedForOnchain) {
    const original = window.overState.init.bind(window.overState);
    window.overState.init = function patchedGameOver(...args) {
      submitScore();
      return original(...args);
    };
    window.overState._patchedForOnchain = true;
    debug("Patched overState.init");
  }
}

patchStateHooks();

window.BaseManOnchain = {
  ensureWallet,
  submitScore,
  handleRunStart
};
