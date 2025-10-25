(function () {
  const MAX_ATTEMPTS = 300;
  const POLL_DELAY_MS = 200;
  let attempts = 0;

  const debug = createDebugOverlay();
  console.log("[BaseMan] onchain-client bootstrap");

  function showFailure(message) {
    debug(`HATA: ${message}`);
    if (typeof window.__showModuleFailure === "function") {
      window.__showModuleFailure(message);
    } else {
      console.error("[BaseMan] " + message);
    }
  }

  function resolveSdk() {
    const candidates = [
      () => window.sdk,
      () => window.fc && window.fc.miniapp,
      () => window.farcaster && window.farcaster.miniapp,
      () => window.MiniAppSDK,
      () => window.FarcasterMiniAppSDK,
      () => window.MiniApp && window.MiniApp.sdk,
      () => window.miniapp && (window.miniapp.default || window.miniapp.sdk || window.miniapp),
      () =>
        (window.globalThis &&
          window.globalThis.MiniAppSDK &&
          window.globalThis.MiniAppSDK.default) ||
        null,
      () =>
        (window.globalThis &&
          window.globalThis.miniapp &&
          (window.globalThis.miniapp.default || window.globalThis.miniapp.sdk)) ||
        null
    ];
    for (const getter of candidates) {
      try {
        const value = getter();
        if (value) return value;
      } catch (error) {
        debug(`SDK candidate error: ${error?.message || error}`);
      }
    }
    return null;
  }

  function resolveEthers() {
    return window.ethers || window.Ethers || window.ethersjs || null;
  }

  function tryInitialize() {
    const sdk = resolveSdk();
    const ethers = resolveEthers();
    const onchainConfig = window.BaseManOnchainConfig;

    if (sdk && ethers && onchainConfig) {
      initialize(sdk, ethers, onchainConfig);
      return;
    }

    attempts += 1;
    if (attempts % 10 === 0) {
      const hints = Object.keys(window)
        .filter((key) => key.toLowerCase().includes("mini"))
        .slice(0, 10)
        .join(", ");
      debug("SDK/Ethers bekleniyor... deneme #" + attempts + (hints ? " | mini keys: " + hints : ""));
    }

    if (attempts >= MAX_ATTEMPTS) {
      if (!sdk) {
        showFailure("Farcaster Mini App SDK not found.");
      } else if (!ethers) {
        showFailure("ethers.js library not loaded.");
      } else {
        showFailure("On-chain configuration not found.");
      }
      return;
    }

    setTimeout(tryInitialize, POLL_DELAY_MS);
  }

  function initialize(sdk, ethers, config) {
    window.sdk = sdk;
    window.BaseManModuleLoaded = true;
    debug("SDK and ethers found, initializing on-chain integration.");

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
      provider: null,
      runStartedAt: null,
      submitting: false,
      walletReady: false,
      walletError: null
    };

    function emitWalletStatus(ready, error) {
      state.walletReady = !!ready;
      state.walletError = ready ? null : error ? String(error) : null;
      try {
        window.dispatchEvent(
          new CustomEvent("baseman-wallet-status", {
            detail: {
              ready: state.walletReady,
              error: state.walletError,
              address: state.walletReady ? state.address : null
            }
          })
        );
      } catch (eventError) {
        debug(`wallet-status event error: ${eventError?.message || eventError}`);
      }
    }

    sdk.actions.ready();
    debug("sdk.actions.ready() called");

    async function ensureWallet() {
      if (state.contract) {
        return state;
      }

      try {
        await sdk.actions.signIn({
          acceptAuthAddress: true
        });
        debug("sdk.actions.signIn() completed");
      } catch (error) {
        debug(`signIn error: ${error?.message || error}`);
      }

      try {
        const provider = await sdk.wallet.getEthereumProvider();
        if (!provider) {
          throw new Error("Ethereum provider not available.");
        }
        debug("sdk.wallet.getEthereumProvider() returned");
        await ensureChain(provider, config.chainId);

        const browserProvider = new ethers.BrowserProvider(provider);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        state.signer = signer;
        state.address = ethers.getAddress(address);
        state.contract = new ethers.Contract(config.registryAddress, CONTRACT_ABI, signer);
        state.provider = provider;
        debug(`Wallet ready: ${state.address}`);

        emitWalletStatus(true, null);
        return state;
      } catch (error) {
        state.signer = null;
        state.address = null;
        state.contract = null;
        state.provider = null;
        const message = error?.message || error || "Wallet initialization failed";
        emitWalletStatus(false, message);
        throw error instanceof Error ? error : new Error(String(error));
      }
    }

    function toHexChainId(chainId) {
      try {
        if (typeof chainId === "bigint") {
          return ethers.toBeHex(chainId);
        }
        if (typeof chainId === "number") {
          return ethers.toBeHex(chainId);
        }
        if (typeof chainId === "string" && chainId.startsWith("0x")) {
          return ethers.toBeHex(chainId);
        }
        if (typeof chainId === "string" && chainId.trim() !== "") {
          return ethers.toBeHex(BigInt(chainId));
        }
        throw new Error("chainId cannot be empty");
      } catch (error) {
        throw new Error(`Invalid chainId: ${chainId} (${error?.message || error})`);
      }
    }

    async function ensureChain(provider, chainId) {
      const hexChainId = toHexChainId(chainId);
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
          debug(`wallet_addEthereumChain added ${chainId}`);
        } else {
          debug(`wallet_switchEthereumChain error: ${error?.message || error}`);
        }
      }
    }

    async function requestScoreSignature(score, durationMs) {
      let playerAddress = state.address;
      try {
        playerAddress = ethers.getAddress(playerAddress);
      } catch (error) {
        debug(`score-sign address normalization failed: ${error?.message || error}`);
        throw new Error("Invalid wallet address");
      }

      debug(
        `Preparing score-sign request: score=${score.toString()} duration=${durationMs}ms`
      );

      const response = await fetch(config.scoreEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress,
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
      debug(`score-sign succeeded: ${score} (duration ${durationMs}ms)`);
      return payload;
    }

    function resolveCapabilityUrl(url) {
      if (!url || typeof url !== "string") {
        return null;
      }
      try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }
        return new URL(url, window.location.origin).toString();
      } catch (error) {
        debug(`paymaster URL could not be resolved: ${error?.message || error}`);
        return null;
      }
    }

    async function submitScoreWithPaymaster(callData) {
      if (!config.paymasterUrl) {
        return null;
      }
      if (!state.provider || typeof state.provider.request !== "function") {
        debug("No provider available for paymaster request.");
        return null;
      }

      const capabilityUrl = resolveCapabilityUrl(config.paymasterUrl);
      if (!capabilityUrl) {
        debug("Paymaster capability URL could not be resolved.");
        return null;
      }

      const hexChainId = (() => {
        try {
          return ethers.toBeHex(config.chainId);
        } catch (error) {
          debug(`chainId hex conversion error: ${error?.message || error}`);
          return null;
        }
      })();
      if (!hexChainId) return null;

      const payload = {
        version: "1.0.0",
        from: state.address,
        chainId: hexChainId,
        atomicRequired: true,
        calls: [
          {
            to: config.registryAddress,
            data: callData,
            value: "0x0"
          }
        ],
        capabilities: {
          paymasterService: {
            url: capabilityUrl,
            optional: false
          }
        }
      };

      try {
        debug("Sending wallet_sendCalls (paymaster) request.");
        const result = await state.provider.request({
          method: "wallet_sendCalls",
          params: [payload]
        });

        if (result && typeof result === "object") {
          if (result.id) {
            debug(`wallet_sendCalls request sent. id=${result.id}`);
          } else {
            debug(`wallet_sendCalls response: ${JSON.stringify(result)}`);
          }
        } else {
          debug("wallet_sendCalls response unexpected.");
        }

        return result;
      } catch (error) {
        const message = error?.message || error;
        debug(`wallet_sendCalls failed: ${message}`);
        return null;
      }
    }

    async function submitScore() {
      if (state.submitting) return;
      if (typeof window.getScore !== "function") return;

      const score = BigInt(window.getScore());
      if (score <= 0n) return;

      const durationMs =
        state.runStartedAt !== null
          ? Math.max(0, Math.floor(performance.now() - state.runStartedAt))
          : 0;

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

        let paymasterHandled = false;
        const contractInterface = state.contract && state.contract.interface;
        if (contractInterface && typeof contractInterface.encodeFunctionData === "function") {
          const callData = contractInterface.encodeFunctionData("submitScore", [
            state.address,
            scoreValue,
            deadlineValue,
            signature
          ]);
          const paymasterResult = await submitScoreWithPaymaster(callData);
          if (paymasterResult) {
            let identifier = null;
            if (typeof paymasterResult === "string") {
              identifier = paymasterResult;
            } else if (typeof paymasterResult === "object") {
              if (typeof paymasterResult.id === "string") {
                identifier = paymasterResult.id;
              } else if (typeof paymasterResult.hash === "string") {
                identifier = paymasterResult.hash;
              }
            }

            if (identifier) {
              paymasterHandled = true;
              debug(`Paymaster-backed submission started (id: ${identifier}).`);
              if (
                typeof paymasterResult === "object" &&
                typeof paymasterResult.id === "string"
              ) {
                setTimeout(() => {
                  if (!state.provider || typeof state.provider.request !== "function") return;
                  state.provider
                    .request({
                      method: "wallet_getCallsStatus",
                      params: [paymasterResult.id]
                    })
                    .then((status) => {
                      debug(
                        `wallet_getCallsStatus response: ${
                          status ? JSON.stringify(status) : "empty response"
                        }`
                      );
                    })
                    .catch((statusError) => {
                      debug(
                        `wallet_getCallsStatus error: ${
                          statusError?.message || statusError
                        }`
                      );
                    });
                }, 3000);
              }
            }
          }
        }

        if (paymasterHandled) {
          return;
        } else if (config.paymasterUrl) {
          debug("Paymaster submission not completed, sending standard transaction.");
        }

        const tx = await state.contract.submitScore(
          state.address,
          scoreValue,
          deadlineValue,
          signature
        );

        debug(`submitScore tx: ${tx.hash}`);
      } catch (error) {
        debug(`submitScore error: ${error?.message || error}`);
      } finally {
        state.submitting = false;
        state.runStartedAt = null;
      }
    }

    function handleRunStart() {
      state.runStartedAt = performance.now();
      debug("Game start detected");
    }

    function patchStateHooks(attempt = 0) {
      const ensureRunStart = () => {
        if (state.runStartedAt === null) {
          handleRunStart();
        }
      };

      const patchInit = (target, flagKey, hook, label) => {
        if (!target?.init || target[flagKey]) {
          return;
        }
        const original = target.init.bind(target);
        target.init = function patchedInit(...args) {
          try {
            hook?.apply(this, args);
          } catch (error) {
            debug(`${label} hook error: ${error?.message || error}`);
          }
          return original(...args);
        };
        target[flagKey] = true;
        debug(`${label} patch'lendi`);
      };

      patchInit(window.newGameState, "_patchedForOnchain", handleRunStart, "newGameState.init");
      patchInit(window.readyState, "_patchedForOnchainReady", ensureRunStart, "readyState.init");
      patchInit(
        window.readyNewState,
        "_patchedForOnchainReadyNew",
        ensureRunStart,
        "readyNewState.init"
      );
      patchInit(
        window.readyRestartState,
        "_patchedForOnchainReadyRestart",
        ensureRunStart,
        "readyRestartState.init"
      );
      patchInit(window.overState, "_patchedForOnchain", submitScore, "overState.init");

      const shouldRetry =
        !window.newGameState ||
        !window.newGameState._patchedForOnchain ||
        !window.overState ||
        !window.overState._patchedForOnchain ||
        !window.readyState ||
        !window.readyState._patchedForOnchainReady ||
        !window.readyNewState ||
        !window.readyNewState._patchedForOnchainReadyNew ||
        !window.readyRestartState ||
        !window.readyRestartState._patchedForOnchainReadyRestart;

      if (shouldRetry && attempt < 10) {
        setTimeout(() => patchStateHooks(attempt + 1), 250);
      }
    }

    patchStateHooks();

    window.BaseManOnchain = {
      ensureWallet,
      submitScore,
      handleRunStart,
      log: debug,
      isWalletReady: () => state.walletReady,
      getWalletError: () => state.walletError
    };

    ensureWallet().catch((error) => {
      debug(`Automatic wallet preparation failed: ${error?.message || error}`);
    });
  }

  function createDebugOverlay() {
    // Disabled by default. Enable only if NEXT_PUBLIC_DEBUG_OVERLAY=1 or ?debug present.
    try {
      const enabledByEnv =
        (window.__ENV && String(window.__ENV.NEXT_PUBLIC_DEBUG_OVERLAY) === '1') ||
        new URLSearchParams(window.location.search).has('debug');
      if (!enabledByEnv) {
        return function () {};
      }
    } catch (_) {
      // no-op
      return function () {};
    }
    const containerId = "baseman-debug";
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = containerId;
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

  tryInitialize();
})();
