(() => {
  function isEnabled() {
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.has('mock-miniapp')) return true;
      const env = (window.__ENV && String(window.__ENV.NEXT_PUBLIC_FORCE_MOCK_MINIAPP || ''));
      return env === '1' || env.toLowerCase() === 'true';
    } catch (_) {
      return false;
    }
  }

  if (!isEnabled()) return;

  const log = (() => {
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.BaseManCreateLogger === 'function') {
          return window.BaseManCreateLogger('UtilMockMiniappProvider');
        }
        if (window.BaseManLogger && typeof window.BaseManLogger.createLogger === 'function') {
          return window.BaseManLogger.createLogger('UtilMockMiniappProvider');
        }
      }
    } catch (_) {}
    return { debug: () => {}, error: () => {}, warn: () => {} };
  })();

  const MOCK_ADDRESS = '0x8132C74c2774935e4CCa5c9B709E381c143b98f7';
  const ENTRY_POINT = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';

  function debug(msg) {
    try {
      log.debug(msg);
    } catch (_) {}
    try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'mock-miniapp', meta: { msg: String(msg) } }) }).catch(()=>{});} catch(_) {}
  }

  function hexChainId() {
    try {
      const id = Number(window?.BaseManOnchainConfig?.chainId || 84532);
      return window.ethers ? window.ethers.toBeHex(id) : '0x' + id.toString(16);
    } catch (_) { return '0x14a34'; }
  }

  function makeProvider() {
    let currentChain = (() => { try { return Number(window?.BaseManOnchainConfig?.chainId || 84532); } catch (_) { return 84532; } })();
    const prov = {
      async request({ method, params }) {
        const p = params || [];
        switch (method) {
          case 'eth_requestAccounts':
          case 'eth_accounts':
            return [MOCK_ADDRESS];
          case 'eth_chainId':
            return (window.ethers ? window.ethers.toBeHex(currentChain) : '0x' + currentChain.toString(16));
          case 'wallet_switchEthereumChain': {
            try {
              const hex = String(p?.[0]?.chainId || '0x0');
              currentChain = Number(BigInt(hex));
            } catch (_) {}
            return null;
          }
          case 'wallet_addEthereumChain':
            return null;
          case 'wallet_getCapabilities': {
            try {
              const caip = `eip155:${currentChain}`;
              return {
                paymasterService: { supported: true },
                capabilities: { paymasterService: { supported: true }, 'org.cdp.paymaster': { supported: true } },
                chains: { [caip]: { paymasterService: { supported: true } } }
              };
            } catch (err) {
              log.error('mock-provider-failed', { method: 'wallet_getCapabilities', reason: err?.message || err });
              return { error: true };
            }
          }
          case 'wallet_sendCalls': {
            try {
              const payload = p?.[0] || {};
              const call = (payload.calls && payload.calls[0]) || {};
              const to = call.to;
              const data = call.data || '0x';
              const ethers = window.ethers;
              const iface = new ethers.Interface(['function execute(address target,uint256 value,bytes data)']);
              const callData = iface.encodeFunctionData('execute', [to, 0, data]);
              const chx = (ethers && typeof ethers.toBeHex === 'function') ? ethers.toBeHex(currentChain) : ('0x' + currentChain.toString(16));
              const pmPayload = {
                jsonrpc: '2.0', id: 1, method: 'pm_getPaymasterStubData',
                params: [
                  {
                    sender: MOCK_ADDRESS,
                    nonce: '0x0', initCode: '0x', callData,
                    callGasLimit: '0x0', verificationGasLimit: '0x0', preVerificationGas: '0x0',
                    maxFeePerGas: '0x0', maxPriorityFeePerGas: '0x0', paymasterAndData: '0x', signature: '0x'
                  },
                  ENTRY_POINT,
                  chx,
                  {}
                ]
              };
              const r = await fetch('/api/paymaster-proxy?auth=basic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pmPayload) });
              const t = await r.text();
              try { fetch('/api/app-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'wallet_sendCalls:mock', meta: { status: r.status } }) }).catch(()=>{});} catch(_) {}
              if (r.status !== 200) throw new Error(`proxy status ${r.status}: ${t.slice(0,160)}`);
              // Return a mock id to simulate async flow
              return { id: `mock-${Date.now()}` };
            } catch (e) {
              log.error('mock-provider-failed', { method: 'wallet_sendCalls', reason: e?.message || e });
              return { error: true };
            }
          }
          case 'wallet_getCallsStatus':
            return { status: 'pending' };
          default:
            log.error('mock-provider-failed', { method: String(method || 'unknown'), reason: 'unsupported-method' });
            return { error: true };
        }
      }
    };
    return prov;
  }

  const sdk = {
    actions: {
      ready() { debug('actions.ready()'); },
      async signIn() { debug('actions.signIn()'); return { ok: true, address: MOCK_ADDRESS }; }
    },
    wallet: {
      async getEthereumProvider() { return makeProvider(); }
    },
    quickAuth: {
      async getToken() { return 'mock.quickauth.token'; },
      async token() { return 'mock.quickauth.token'; }
    }
  };

  // Expose under multiple discoverable keys
  window.miniapp = window.miniapp || {};
  try { window.miniapp.sdk = sdk; } catch (_) {}
  try { window.MiniApp = { sdk }; } catch (_) {}
  try { window.sdk = sdk; } catch (_) {}
  debug('Mock Mini App SDK injected');
})();
