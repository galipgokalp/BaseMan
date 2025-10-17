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
        showFailure("Farcaster Mini App SDK yüklenemedi.");
      } else if (!ethers) {
        showFailure("ethers.js kütüphanesi yüklenemedi.");
      } else {
        showFailure("On-chain yapılandırması bulunamadı.");
      }
      return;
    }

    setTimeout(tryInitialize, POLL_DELAY_MS);
  }

  function initialize(sdk, ethers, config) {
    window.sdk = sdk;
    window.BaseManModuleLoaded = true;
    debug("SDK ve ethers bulundu, on-chain entegrasyon başlatılıyor.");

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
      submitting: false
    };

    sdk.actions.ready();
    debug("sdk.actions.ready() çağrıldı");

    async function ensureWallet() {
      if (state.contract) return state;

      try {
        await sdk.actions.signIn();
        debug("sdk.actions.signIn() tamamlandı");
      } catch (error) {
        debug(`signIn hatası: ${error?.message || error}`);
      }

      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        throw new Error("Ethereum sağlayıcısı alınamadı.");
      }
      debug("sdk.wallet.getEthereumProvider() döndü");
      await ensureChain(provider, config.chainId);

      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      state.signer = signer;
      state.address = ethers.getAddress(address);
      state.contract = new ethers.Contract(config.registryAddress, CONTRACT_ABI, signer);
      state.provider = provider;
      debug(`Cüzdan hazır: ${state.address}`);

      return state;
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
        throw new Error("chainId boş olamaz");
      } catch (error) {
        throw new Error(`Geçersiz chainId: ${chainId} (${error?.message || error})`);
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
          debug(`wallet_addEthereumChain ile ${chainId} eklendi`);
        } else {
          debug(`wallet_switchEthereumChain hatası: ${error?.message || error}`);
        }
      }
    }

    async function requestScoreSignature(score, durationMs) {
      let playerAddress = state.address;
      try {
        playerAddress = ethers.getAddress(playerAddress);
      } catch (error) {
        debug(`score-sign adres normalize edilemedi: ${error?.message || error}`);
        throw new Error("Geçersiz cüzdan adresi");
      }

      debug(
        `score-sign isteği hazırlanıyor: skor=${score.toString()} duration=${durationMs}ms`
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
        const message = payload?.error || "Skor imzası alınamadı";
        debug(`score-sign başarısız: ${message}`);
        throw new Error(message);
      }
      debug(`score-sign başarılı: ${score} (süre ${durationMs}ms)`);
      return payload;
    }

    async function submitScoreWithPaymaster(callData) {
      if (!config.paymasterUrl) {
        return null;
      }
      if (!state.provider || typeof state.provider.request !== "function") {
        debug("paymaster isteği için provider bulunamadı.");
        return null;
      }

      const hexChainId = (() => {
        try {
          return ethers.toBeHex(config.chainId);
        } catch (error) {
          debug(`chainId hex dönüştürme hatası: ${error?.message || error}`);
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
            url: config.paymasterUrl,
            optional: false
          }
        }
      };

      try {
        debug("wallet_sendCalls (paymaster) isteği gönderiliyor.");
        const result = await state.provider.request({
          method: "wallet_sendCalls",
          params: [payload]
        });

        if (result && typeof result === "object") {
          if (result.id) {
            debug(`wallet_sendCalls isteği gönderildi. id=${result.id}`);
          } else {
            debug(`wallet_sendCalls yanıtı: ${JSON.stringify(result)}`);
          }
        } else {
          debug("wallet_sendCalls yanıtı beklenenden farklı.");
        }

        return result;
      } catch (error) {
        const message = error?.message || error;
        debug(`wallet_sendCalls başarısız: ${message}`);
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
          throw new Error("Cüzdan bağlantısı gerekli");
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
              debug(`Paymaster destekli gönderim başlatıldı (id: ${identifier}).`);
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
                        `wallet_getCallsStatus yanıtı: ${
                          status ? JSON.stringify(status) : "boş yanıt"
                        }`
                      );
                    })
                    .catch((statusError) => {
                      debug(
                        `wallet_getCallsStatus hatası: ${
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
          debug("Paymaster gönderimi tamamlanamadı, standart işlem gönderiliyor.");
        }

        const tx = await state.contract.submitScore(
          state.address,
          scoreValue,
          deadlineValue,
          signature
        );

        debug(`submitScore tx: ${tx.hash}`);
      } catch (error) {
        debug(`submitScore hatası: ${error?.message || error}`);
      } finally {
        state.submitting = false;
        state.runStartedAt = null;
      }
    }

    function handleRunStart() {
      state.runStartedAt = performance.now();
      debug("Oyun başlangıcı yakalandı");
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
            debug(`${label} hook hatası: ${error?.message || error}`);
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
      log: debug
    };
  }

  function createDebugOverlay() {
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
