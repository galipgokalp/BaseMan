function postAppLog(event, meta) {
  try {
    fetch('/api/app-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, meta })
    }).catch(() => {});
  } catch (_) {}
}

export function scheduleStateHookPatching({ state, debug, log, submitScore, handleRunStart }) {
  function patchStateHooks(attempt = 0) {
    debug(`patchStateHooks: Attempt ${attempt + 1}`);
    postAppLog('patchStateHooks:attempt', { attempt: attempt + 1 });

    const ensureRunStart = () => {
      if (state.runStartedAt === null) {
        handleRunStart();
      }
    };

    const patchInit = (target, flagKey, hook, label, isAsync = false) => {
      if (!target) {
        const errorMsg = `${label}: State not available yet (target is ${typeof target})`;
        debug(errorMsg);
        log.warn(errorMsg);
        log.warn('Available window states:', {
          overState: typeof window.overState,
          finishState: typeof window.finishState,
          newGameState: typeof window.newGameState,
          readyState: typeof window.readyState
        });
        postAppLog('patchStateHooks:state:missing', {
          label,
          targetType: typeof target,
          availableStates: { overState: !!window.overState, finishState: !!window.finishState }
        });
        return false;
      }
      if (!target.init) {
        const errorMsg = `${label}: init method not available (target type: ${typeof target})`;
        debug(errorMsg);
        log.warn(errorMsg);
        postAppLog('patchStateHooks:state:no-init', { label, targetType: typeof target });
        return false;
      }
      if (target[flagKey]) {
        debug(`${label}: Already patched`);
        return true;
      }
      if (!hook || typeof hook !== 'function') {
        const errorMsg = `${label}: Hook function is not available (hook type: ${typeof hook})`;
        debug(errorMsg);
        log.error(errorMsg);
        postAppLog('patchStateHooks:state:no-hook', { label, hookType: typeof hook });
        return false;
      }

      const original = target.init.bind(target);
      target.init = function patchedInit(...args) {
        debug(`${label}: init called (patched)`);
        log.debug(`${label}: init called (patched)`);
        postAppLog('state:init:called', { label, timestamp: new Date().toISOString() });

        if (isAsync) {
          debug(`${label}: Starting async hook BEFORE original init...`);
          log.debug(`${label}: Starting async hook (submitScore)...`);
          postAppLog('state:init:hook:start', {
            label,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
          });

          (async () => {
            try {
              debug(`${label}: Executing async hook (awaiting)...`);
              log.debug(`${label}: Executing async hook (awaiting)...`);
              const hookResult = await hook?.apply(this, args);
              debug(`${label}: async hook completed successfully, result:`, hookResult);
              log.debug(`${label}: async hook completed successfully`);
              postAppLog('state:init:hook:success', {
                label,
                timestamp: new Date().toISOString(),
                result: hookResult ? 'success' : 'no-result'
              });
            } catch (error) {
              const errorMsg = error?.message || String(error);
              const errorStack = error?.stack || new Error().stack;
              debug(`${label} async hook ERROR: ${errorMsg}`);
              log.error(`${label} async hook ERROR:`, error);
              log.error(`${label} async hook ERROR stack:`, errorStack);
              postAppLog('state:init:hook:error', {
                label,
                error: errorMsg,
                stack: errorStack,
                timestamp: new Date().toISOString(),
                errorName: error?.name || 'Error',
                errorCode: error?.code || null
              });
              if ((label.includes('overState') || label.includes('finishState')) &&
                  !errorMsg.includes('reject') &&
                  !errorMsg.includes('denied') &&
                  !errorMsg.includes('User rejected')) {
                try {
                  setTimeout(() => {
                    log.error(`Score submission failed: ${errorMsg}`);
                  }, 100);
                } catch (_) {}
              }
            }
          })();
        } else {
          try {
            debug(`${label}: Executing hook BEFORE original init...`);
            log.debug(`${label}: Executing hook...`);
            const hookResult = hook?.apply(this, args);
            debug(`${label}: hook executed successfully, result:`, hookResult);
            log.debug(`${label}: hook executed successfully`);
            postAppLog('state:init:hook:success', { label, timestamp: new Date().toISOString() });
          } catch (error) {
            const errorMsg = error?.message || String(error);
            debug(`${label} hook error: ${errorMsg}`);
            log.error(`${label} hook error:`, error);
            postAppLog('state:init:hook:error', {
              label,
              error: errorMsg,
              stack: error?.stack,
              timestamp: new Date().toISOString()
            });
          }
        }

        debug(`${label}: Executing original init...`);
        try {
          const originalResult = original(...args);
          debug(`${label}: original init executed, result:`, originalResult);
          return originalResult;
        } catch (originalError) {
          debug(`${label}: original init error: ${originalError?.message || originalError}`);
          log.error(`${label}: original init error:`, originalError);
          throw originalError;
        }
      };
      target[flagKey] = true;
      debug(`${label} patched successfully`);
      postAppLog('patchStateHooks:state:patched', { label });
      return true;
    };

    const stateCheck = {
      newGameState: !!window.newGameState,
      readyState: !!window.readyState,
      readyNewState: !!window.readyNewState,
      readyRestartState: !!window.readyRestartState,
      overState: !!window.overState,
      finishState: !!window.finishState
    };

    debug('patchStateHooks: State availability check:', stateCheck);
    log.debug(' patchStateHooks: State availability:', stateCheck);

    if (!stateCheck.overState || !stateCheck.finishState) {
      const missing = Object.entries(stateCheck).filter(([_, available]) => !available).map(([name]) => name);
      debug(`patchStateHooks: CRITICAL - Missing states: ${missing.join(', ')}`);
      log.warn(`patchStateHooks: CRITICAL - Missing states: ${missing.join(', ')}`);
      log.warn("window keys containing 'state':", Object.keys(window).filter((k) => k.toLowerCase().includes('state')));
      postAppLog('patchStateHooks:critical-missing-states', {
        attempt: attempt + 1,
        missing,
        available: stateCheck,
        windowKeys: Object.keys(window).filter((k) => k.toLowerCase().includes('state'))
      });
    }

    const results = {
      newGameState: patchInit(window.newGameState, '_patchedForOnchainNewGame', handleRunStart, 'newGameState.init', false),
      readyState: patchInit(window.readyState, '_patchedForOnchainReady', ensureRunStart, 'readyState.init', false),
      readyNewState: patchInit(window.readyNewState, '_patchedForOnchainReadyNew', ensureRunStart, 'readyNewState.init', false),
      readyRestartState: patchInit(window.readyRestartState, '_patchedForOnchainReadyRestart', ensureRunStart, 'readyRestartState.init', false),
      overState: patchInit(window.overState, '_patchedForOnchainOver', submitScore, 'overState.init', true),
      finishState: patchInit(window.finishState, '_patchedForOnchainFinish', submitScore, 'finishState.init', true)
    };

    const patchedStates = Object.entries(results).filter(([_, patched]) => patched).map(([name]) => name);
    const failedStates = Object.entries(results).filter(([_, patched]) => !patched).map(([name]) => name);
    const allPatched = Object.values(results).every((result) => result === true);

    debug(`patchStateHooks: Results - Patched: [${patchedStates.join(', ')}], Failed: [${failedStates.join(', ')}]`);
    log.debug(`patchStateHooks: Patched states: [${patchedStates.join(', ')}], Failed: [${failedStates.join(', ')}]`);

    if (allPatched) {
      debug('patchStateHooks: All states patched successfully (including overState and finishState for score submission)');
      log.debug('patchStateHooks: ✅ All states patched successfully - score submission hooks active');
      postAppLog('patchStateHooks:success', { attempt: attempt + 1, patchedStates });
    } else if (attempt < 20) {
      const missing = Object.entries(results).filter(([_, patched]) => !patched).map(([name]) => name);
      debug(`patchStateHooks: Some states not patched yet: ${missing.join(', ')}`);
      postAppLog('patchStateHooks:partial', { attempt: attempt + 1, missing });
      setTimeout(() => patchStateHooks(attempt + 1), 500);
    } else {
      const missing = Object.entries(results).filter(([_, patched]) => !patched).map(([name]) => name);
      debug('patchStateHooks: Max attempts reached, some states may not be patched');
      log.warn(' patchStateHooks: Max attempts reached. Missing states:', missing);
      postAppLog('patchStateHooks:max-attempts', { missing });
    }
  }

  function schedule() {
    patchStateHooks();
    setTimeout(() => patchStateHooks(), 100);
    setTimeout(() => patchStateHooks(), 500);
    setTimeout(() => patchStateHooks(), 1000);
    setTimeout(() => patchStateHooks(), 2000);
    setTimeout(() => patchStateHooks(), 3000);
  }

  if (document.readyState === 'complete') {
    schedule();
  } else if (document.readyState === 'interactive') {
    schedule();
    window.addEventListener(
      'load',
      () => {
        setTimeout(() => patchStateHooks(), 500);
        setTimeout(() => patchStateHooks(), 1000);
        setTimeout(() => patchStateHooks(), 2000);
      },
      { once: true }
    );
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      schedule();
    }, { once: true });

    window.addEventListener(
      'load',
      () => {
        debug('Window load event fired - scheduling patchStateHooks');
        postAppLog('window:load', { timestamp: new Date().toISOString() });
        setTimeout(() => patchStateHooks(), 100);
        setTimeout(() => patchStateHooks(), 500);
        setTimeout(() => patchStateHooks(), 1000);
        setTimeout(() => patchStateHooks(), 2000);
        setTimeout(() => patchStateHooks(), 3000);
      },
      { once: true }
    );
  }
}
