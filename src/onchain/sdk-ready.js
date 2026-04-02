function dispatchSdkReady(detail, debug) {
  try {
    window.__basemanSDKReadyFired = true;
    window.dispatchEvent(new CustomEvent('baseman-sdk-ready', { detail }));
  } catch (eventError) {
    debug(`Failed to dispatch sdk-ready event: ${eventError?.message || eventError}`);
  }
}

export async function runSdkReadyLifecycle({ sdk, debug, log }) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
      let isReady = false;
      if (typeof sdk.isInMiniApp === 'function') {
        try {
          isReady = await sdk.isInMiniApp(1000);
        } catch (error) {
          debug(`isInMiniApp check failed: ${error?.message || error}`);
          isReady = false;
        }
      } else {
        isReady =
          (typeof window !== 'undefined' && window !== window.parent) ||
          (typeof window.ReactNativeWebView !== 'undefined');
      }

      if (!isReady) {
        try {
          const ua = navigator.userAgent || '';
          const isMobileWebView =
            ua.includes('Farcaster') ||
            ua.includes('Warpcast') ||
            ua.includes('BaseApp') ||
            typeof window.ReactNativeWebView !== 'undefined';
          if (isMobileWebView) isReady = true;
        } catch (_) {}
      }

      if (isReady) {
        try {
          await sdk.actions.ready({ disableNativeGestures: true });
          debug('sdk.actions.ready() called successfully');
          dispatchSdkReady({ sdk }, debug);
        } catch (readyError) {
          const errorMsg = readyError?.message || String(readyError);
          const isNonCriticalError =
            errorMsg.includes('Request failed') ||
            errorMsg.includes('result') ||
            errorMsg.includes('undefined') ||
            readyError?.name === 'RequestFailedError' ||
            readyError?.name === 'TypeError' ||
            readyError?.status === 400;

          if (isNonCriticalError) {
            debug(`SDK ready error (non-critical): ${errorMsg}`);
            log.warn(`SDK ready error: ${errorMsg}`, readyError);
          } else {
            debug(`Error calling sdk.actions.ready: ${errorMsg}`);
            log.error(`SDK ready unexpected error: ${errorMsg}`, readyError);
          }

          dispatchSdkReady({ sdk, error: errorMsg }, debug);
        }
      } else {
        debug('Warning: SDK detected but not in mini app context');
        dispatchSdkReady({ sdk: null }, debug);
      }
    } else {
      debug('Warning: sdk.actions.ready is not available');
      dispatchSdkReady({ sdk: null }, debug);
    }
  } catch (error) {
    debug(`Error in SDK initialization: ${error?.message || error}`);
    dispatchSdkReady({ sdk: null, error: error?.message }, debug);

    if (!(sdk && sdk.actions && typeof sdk.actions.ready === 'function')) {
      setTimeout(() => {
        dispatchSdkReady({ sdk: null }, debug);
      }, 300);
    }
  }
}

export function scheduleBackgroundMiniAppWallet({ sdk, state, ensureWallet, safeProviderRequest, debug }) {
  (async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (sdk?.wallet && typeof sdk.wallet.getEthereumProvider === 'function' && !state.contract) {
        let provider;
        try {
          provider = await sdk.wallet.getEthereumProvider();
        } catch (providerError) {
          const errorMsg = providerError?.message || String(providerError);
          const isRequestError =
            errorMsg.includes('Request failed') ||
            providerError?.name === 'RequestFailedError' ||
            providerError?.status === 400;

          if (isRequestError) {
            debug(`Background wallet: SDK getEthereumProvider request failed (non-critical): ${errorMsg}`);
            return;
          }
          throw providerError;
        }

        if (provider) {
          const accounts = await safeProviderRequest(provider, { method: 'eth_accounts' }, []);
          if (Array.isArray(accounts) && accounts.length > 0) {
            debug('Background wallet: accounts already available, connecting without request');
            await ensureWallet(false);
          } else {
            debug('Background wallet: no accounts yet, will connect on first on-chain action');
          }
        }
      }
    } catch (error) {
      debug(`Background wallet preparation: ${error?.message || error}`);
    }
  })();
}
