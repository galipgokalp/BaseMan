export function ensureOnchainPlaceholder() {
  if (typeof window === 'undefined') return;

  window.BaseManOnchain = {
    ensureWallet: async function() {
      throw new Error("Onchain client not initialized yet. Please wait for SDK to load.");
    },
    setNetwork: async function() {
      throw new Error("Onchain client not initialized yet. Please wait for SDK to load.");
    },
    submitScore: async function() {
      throw new Error("Onchain client not initialized yet. Please wait for SDK to load.");
    },
    completeQuest: async function() {
      throw new Error("Onchain client not initialized yet. Please wait for SDK to load.");
    },
    handleRunStart: function() {},
    getCurrentChainId: function() {
      return null;
    },
    log: function() {},
    isWalletReady: function() {
      return false;
    },
    getWalletError: function() {
      return null;
    },
    getWalletAddress: function() {
      return null;
    }
  };
}

export function bindPublicOnchainApi(api, state, debug) {
  if (typeof window === 'undefined') return;

  const target = window.BaseManOnchain || {};
  target.ensureWallet = api.ensureWallet;
  target.setNetwork = api.setNetwork;
  target.submitScore = api.submitScore;
  target.completeQuest = api.completeQuest;
  target.handleRunStart = api.handleRunStart;
  target.getCurrentChainId = api.getCurrentChainId;
  target.log = debug;
  target.isWalletReady = () => state.walletReady;
  target.getWalletError = () => state.walletError;
  target.getWalletAddress = () => state.address;
  window.BaseManOnchain = target;
}
