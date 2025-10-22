const root = document.getElementById("bridge-root");
const statusEl = document.getElementById("bridge-status");
const loadButton = document.getElementById("bridge-load-button");

if (!root || !statusEl || !loadButton) {
  // eslint-disable-next-line no-console
  console.warn("[BaseMan Bridge] Gerekli DOM elemanları bulunamadı.");
}

const defaultConfig = {
  base: {
    name: "Base Sepolia",
    chainId: Number(document.body?.dataset.baseChainId || 84532),
    rpcUrl: "https://sepolia.base.org",
    registryAddress: null
  },
  appchain: {
    name: "BaseMan Appchain",
    chainId: Number(document.body?.dataset.appchainChainId || 0),
    rpcUrl: null,
    registryAddress: null
  },
  autoLoad: false
};

function mergeConfig(defaults, overrides) {
  return {
    base: { ...defaults.base, ...(overrides?.base || {}) },
    appchain: { ...defaults.appchain, ...(overrides?.appchain || {}) },
    autoLoad: Boolean(
      overrides?.autoLoad ?? window.BASEMAN_ENABLE_ONCHAINKIT ?? defaults.autoLoad
    )
  };
}

const config = mergeConfig(defaultConfig, window.BASEMAN_BRIDGE_CONFIG);

function updateStatus(status, message) {
  if (!statusEl) return;
  statusEl.dataset.status = status;
  statusEl.textContent = message;
}

function populateConfigDetails() {
  const baseChainEl = document.getElementById("bridge-base-chain-id");
  const baseRpcEl = document.getElementById("bridge-base-rpc");
  const baseRegistryEl = document.getElementById("bridge-base-registry");
  const appChainEl = document.getElementById("bridge-appchain-chain-id");
  const appRpcEl = document.getElementById("bridge-appchain-rpc");
  const appRegistryEl = document.getElementById("bridge-appchain-registry");
  const jsonEl = document.getElementById("bridge-config-json");

  if (baseChainEl) baseChainEl.textContent = String(config.base.chainId);
  if (baseRpcEl) baseRpcEl.textContent = config.base.rpcUrl || "Tanımsız";
  if (baseRegistryEl) baseRegistryEl.textContent = config.base.registryAddress || "Beklemede";

  if (appChainEl) appChainEl.textContent = String(config.appchain.chainId);
  if (appRpcEl) appRpcEl.textContent = config.appchain.rpcUrl || "Beklemede";
  if (appRegistryEl) appRegistryEl.textContent = config.appchain.registryAddress || "Beklemede";

  if (jsonEl) {
    const printable = {
      base: {
        chainId: config.base.chainId,
        rpcUrl: config.base.rpcUrl,
        registryAddress: config.base.registryAddress
      },
      appchain: {
        chainId: config.appchain.chainId,
        rpcUrl: config.appchain.rpcUrl,
        registryAddress: config.appchain.registryAddress
      }
    };
    jsonEl.textContent = JSON.stringify(printable, null, 2);
  }
}

async function loadOnchainKitBridge() {
  if (!root) return;

  updateStatus("loading", "OnchainKit köprü modülünü yüklüyoruz...");
  try {
    const [bridgeModule] = await Promise.all([
      import("https://esm.sh/@coinbase/onchainkit@0.38.7/bridge?bundle")
    ]);

    if (!bridgeModule || Object.keys(bridgeModule).length === 0) {
      throw new Error("Bridge modülü beklenen exportları sağlamadı.");
    }

    updateStatus(
      "ready",
      "OnchainKit modülü yüklendi. React entegrasyonu bir sonraki sprintte tamamlanacak."
    );

    window.BaseManBridgeModule = bridgeModule;
  } catch (error) {
    updateStatus(
      "error",
      `OnchainKit bileşeni yüklenemedi: ${error?.message || "Bilinmeyen hata"}`
    );
    // eslint-disable-next-line no-console
    console.error("[BaseMan Bridge] yükleme hatası:", error);
  }
}

populateConfigDetails();

if (loadButton) {
  loadButton.addEventListener("click", () => {
    loadOnchainKitBridge();
  });
}

window.BaseManBridge = {
  config,
  load: loadOnchainKitBridge,
  setConfig(overrides) {
    const merged = mergeConfig(config, overrides);
    Object.assign(config.base, merged.base);
    Object.assign(config.appchain, merged.appchain);
    config.autoLoad = merged.autoLoad;
    populateConfigDetails();
    updateStatus("idle", "Konfigürasyon güncellendi. Köprüyü yeniden yükleyebilirsiniz.");
  }
};

if (config.autoLoad) {
  loadOnchainKitBridge();
} else {
  updateStatus(
    "idle",
    "Köprü bileşeni hazır değil. Modülü test etmek için \"OnchainKit Bileşenini Yüklemeyi Dene\" butonunu kullanın."
  );
}
