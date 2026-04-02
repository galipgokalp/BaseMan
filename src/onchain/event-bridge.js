export function createEventBridge({ state, debug }) {
  function emitToastEvent(eventType, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(`baseman:${eventType}`, { detail }));
      debug(`Toast event emitted: baseman:${eventType}`);
    } catch (error) {
      debug(`Toast event emit error: ${error?.message || error}`);
    }
  }

  function emitWalletStatus(ready, error) {
    state.walletReady = !!ready;
    state.walletError = ready ? null : error ? String(error) : null;

    if (ready && state.address) {
      emitToastEvent('wallet:connected', { address: state.address });
    } else if (error) {
      emitToastEvent('wallet:error', { message: String(error) });
    }

    try {
      window.dispatchEvent(
        new CustomEvent('baseman-wallet-status', {
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

  return { emitToastEvent, emitWalletStatus };
}
