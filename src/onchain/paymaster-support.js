export function resolveCapabilityUrl(url, debug) {
  if (!url || typeof url !== 'string') return null;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return new URL(url, window.location.origin).toString();
  } catch (error) {
    debug(`paymaster URL could not be resolved: ${error?.message || error}`);
    return null;
  }
}

export async function discoverPaymasterUrl({ provider, config, state, debug }) {
  try {
    if (config.paymasterUrl && String(config.paymasterUrl).trim().length > 0) {
      debug('paymasterUrl preset; skipping capability discovery');
      return null;
    }
    if (!provider || typeof provider.request !== 'function') return null;

    let caps = null;
    try {
      caps = await provider.request({ method: 'wallet_getCapabilities' });
    } catch (_) {}
    if (!caps) {
      try {
        const addr = state.address || null;
        if (addr) {
          caps = await provider.request({ method: 'wallet_getCapabilities', params: [addr] });
        }
      } catch (_) {}
    }

    const candidates = [
      'paymasterService',
      'org.cdp.paymaster',
      'capabilities.paymasterService',
      'capabilities.org.cdp.paymaster'
    ];

    function pickUrl(obj) {
      if (!obj || typeof obj !== 'object') return null;
      if (typeof obj.url === 'string' && obj.url.length) return obj.url;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object' && typeof val.url === 'string') return val.url;
      }
      return null;
    }

    let url = null;
    if (caps && typeof caps === 'object') {
      for (const path of candidates) {
        try {
          const parts = path.split('.');
          let cur = caps;
          for (const p of parts) cur = cur?.[p];
          const maybe = pickUrl(cur);
          if (maybe) {
            url = maybe;
            break;
          }
        } catch (_) {}
      }
    }

    if (url) {
      config.paymasterUrl = url;
      debug(`Discovered paymaster capability url: ${url}`);
      return url;
    }
    return null;
  } catch (error) {
    debug(`discoverPaymasterUrl error: ${error?.message || error}`);
    return null;
  }
}

export async function getCapabilities(provider, address, debug) {
  if (!provider || typeof provider.request !== 'function') {
    debug('getCapabilities: Provider not available');
    return null;
  }

  let caps = null;
  try {
    caps = await provider.request({ method: 'wallet_getCapabilities' });
  } catch (_) {}
  if (caps && typeof caps === 'object') {
    debug(`getCapabilities: Retrieved capabilities (without address): ${Object.keys(caps).join(', ')}`);
    return caps;
  }

  if (!caps && address && typeof address === 'string' && address.startsWith('0x')) {
    try {
      caps = await provider.request({ method: 'wallet_getCapabilities', params: [address] });
    } catch (_) {}
    if (caps && typeof caps === 'object') {
      debug(`getCapabilities: Retrieved capabilities (with address): ${Object.keys(caps).join(', ')}`);
      return caps;
    }
  }

  return caps || null;
}

export function isPaymasterSupported(caps, chainId, { ethers, debug }) {
  try {
    if (!caps || typeof caps !== 'object') {
      debug('isPaymasterSupported: No capabilities provided');
      return false;
    }

    const hex = (() => {
      try {
        return ethers.toBeHex(chainId);
      } catch (_) {
        return null;
      }
    })();
    const caip = `eip155:${chainId}`;
    const chainIdStr = String(chainId);

    const byFlat =
      caps?.paymasterService?.supported === true ||
      caps?.org?.cdp?.paymaster?.supported === true;
    const byCaps =
      caps?.capabilities?.paymasterService?.supported === true ||
      caps?.capabilities?.['org.cdp.paymaster']?.supported === true;
    const byChainId =
      caps?.[chainIdStr]?.paymasterService?.supported === true ||
      (hex && caps?.[hex]?.paymasterService?.supported === true) ||
      caps?.[caip]?.paymasterService?.supported === true;
    const byChains =
      caps?.chains?.[caip]?.paymasterService?.supported === true ||
      caps?.chains?.[chainIdStr]?.paymasterService?.supported === true ||
      (hex && caps?.chains?.[hex]?.paymasterService?.supported === true);

    const supported = byFlat || byCaps || byChainId || byChains;
    debug(`isPaymasterSupported: chainId=${chainId}, supported=${supported}`);
    return supported;
  } catch (error) {
    debug(`isPaymasterSupported: Error checking capabilities: ${error?.message || error}`);
    return false;
  }
}
