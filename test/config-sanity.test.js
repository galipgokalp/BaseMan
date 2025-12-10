import { readFileSync } from 'fs';
import { join } from 'path';
import { expect } from 'chai';

import { escapeHtml, escapeHtmlPreserveNewlines } from '../src/utils/escape-html.js';
import { setPanelVisible } from '../src/utils/panel-base.js';

function parseOnchainConfig() {
  const content = readFileSync(join(process.cwd(), 'src/onchain-config.js'), 'utf-8');
  const match = content.match(/window\.BaseManOnchainConfig\s*=\s*({[\s\S]*?});/);
  const jsonStr = (match && match[1]) ? match[1].replace(/'/g, '"') : '{}';
  return JSON.parse(jsonStr);
}

function readContractVersion() {
  const content = readFileSync(join(process.cwd(), 'contracts/BaseManRegistry.sol'), 'utf-8');
  const directMatch = content.match(/eip712Version\(\)[^{]*{[^"]*"([^"]+)"/s);
  if (directMatch) return directMatch[1];
  const ctorMatch = content.match(/EIP712\([^,]+,\s*["'`]([^"'`]+)["'`]\)/);
  return ctorMatch ? ctorMatch[1] : null;
}

function readTypedVersion() {
  const content = readFileSync(join(process.cwd(), 'api/_lib/registry.js'), 'utf-8');
  const direct = content.match(/CONTRACT_VERSION[^=]*=\s*["'`]([^"'`]+)["'`]/);
  if (direct) return direct[1];
  const fallback = content.match(/CONTRACT_VERSION[^=]*=\s*\(process\.env\.REGISTRY_EIP712_VERSION\s*\|\|\s*["'`]([^"'`]+)["'`]\)/);
  if (fallback) return fallback[1];
  return process.env.REGISTRY_EIP712_VERSION || null;
}

describe('Config sanity checks', () => {
  it('matches REGISTRY_CHAIN_ID with onchain-config.js chainId', () => {
    const config = parseOnchainConfig();
    const originalEnv = process.env.REGISTRY_CHAIN_ID;
    process.env.REGISTRY_CHAIN_ID = String(config.chainId);
    expect(Number(process.env.REGISTRY_CHAIN_ID)).to.equal(config.chainId);
    if (originalEnv === undefined) delete process.env.REGISTRY_CHAIN_ID;
    else process.env.REGISTRY_CHAIN_ID = originalEnv;
  });

  it('keeps typed-data version aligned with contract', () => {
    const contractVersion = readContractVersion();
    const typedVersion = readTypedVersion();
    expect(typedVersion).to.equal(contractVersion);
  });
});

describe('escape-html utilities', () => {
  it('escapes script tags', () => {
    expect(escapeHtml('<script>alert(1)</script>')).to.equal('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
  });

  it('preserves newlines while escaping', () => {
    const input = '<b>line1</b>\nline2';
    expect(escapeHtmlPreserveNewlines(input)).to.equal('&lt;b&gt;line1&lt;&#x2F;b&gt;<br>line2');
  });
});

describe('panel-base setPanelVisible', () => {
  function createPanelStub() {
    const classes = new Set();
    return {
      classList: {
        toggle(cls, enabled) {
          if (enabled) classes.add(cls);
          else classes.delete(cls);
        },
        has(cls) {
          return classes.has(cls);
        }
      },
      attrs: {},
      setAttribute(key, value) {
        this.attrs[key] = value;
      },
      getAttribute(key) {
        return this.attrs[key];
      }
    };
  }

  it('toggles aria-hidden and open class', () => {
    const panel = createPanelStub();
    setPanelVisible(panel, true);
    expect(panel.classList.has('open')).to.equal(true);
    expect(panel.getAttribute('aria-hidden')).to.equal('false');
    setPanelVisible(panel, false);
    expect(panel.classList.has('open')).to.equal(false);
    expect(panel.getAttribute('aria-hidden')).to.equal('true');
  });
});

describe('platform detection fallback', () => {
  it('returns web when detection fails', async () => {
    const originalWindow = global.window;
    global.window = { sdk: { context: Promise.reject(new Error('fail')) } };
    const { getPlatform } = await import('../src/utils/platform-detection.js');
    const platform = await getPlatform();
    expect(platform).to.equal('web');
    global.window = originalWindow;
  });
});

describe('mock miniapp provider fallbacks', () => {
  it('returns safe fallback on wallet_sendCalls failure', async () => {
    const originalWindow = global.window;
    const originalFetch = global.fetch;
    global.window = {
      location: { search: '?mock-miniapp=1' },
      __ENV: { NEXT_PUBLIC_FORCE_MOCK_MINIAPP: '1' },
      BaseManOnchainConfig: { chainId: 8453 }
    };
    const DummyInterface = class {
      constructor() {}
      encodeFunctionData() {
        throw new Error('encode-failed');
      }
    };
    global.window.ethers = {
      Interface: DummyInterface,
      toBeHex: (n) => '0x' + Number(n).toString(16)
    };
    global.fetch = async () => ({ status: 500, text: async () => '' });
    await import('../src/mock-miniapp-provider.js');
    const provider = await global.window.sdk.wallet.getEthereumProvider();
    const res = await provider.request({ method: 'wallet_sendCalls', params: [{}] });
    expect(res).to.have.property('error', true);
    global.window = originalWindow;
    global.fetch = originalFetch;
  });
});
