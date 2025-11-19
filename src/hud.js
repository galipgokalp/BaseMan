
var hud = (function(){

    var on = false;

    // Helper function to log to both console and ConsoleLogger
    // ConsoleLogger automatically captures console.log, so we just use console.log
    // But we format it clearly with [HUD] prefix so it's easy to find
    var logHUD = function(message, data) {
        // Remove duplicate [HUD] prefix if present
        var cleanMessage = message.startsWith('[HUD] ') ? message.substring(6) : message;
        if (data) {
            console.log('[HUD] ' + cleanMessage, data);
        } else {
            console.log('[HUD] ' + cleanMessage);
        }
    };

    return {

        update: function() {
            // Log that update is being called (first few times to verify it's working)
            if (typeof window.__hudUpdateCount === 'undefined') {
                window.__hudUpdateCount = 0;
                logHUD('HUD.update() called for the first time');
            }
            window.__hudUpdateCount++;
            if (window.__hudUpdateCount <= 5) {
                logHUD('HUD.update() called', {count: window.__hudUpdateCount});
            }
            
            var valid = this.isValidState();
            
            // Debug: Log state check periodically
            if (typeof window.__hudUpdateCount === 'undefined') {
                window.__hudUpdateCount = 0;
            }
            window.__hudUpdateCount++;
            if (window.__hudUpdateCount % 180 === 0) { // Log every 3 seconds at 60fps
                // Try to identify current state
                var stateName = 'unknown';
                if (typeof state !== 'undefined' && state) {
                    if (state === playState) stateName = 'playState';
                    else if (state === newGameState) stateName = 'newGameState';
                    else if (state === readyNewState) stateName = 'readyNewState';
                    else if (state === readyRestartState) stateName = 'readyRestartState';
                    else if (state === finishState) stateName = 'finishState';
                    else if (state === deadState) stateName = 'deadState';
                    else if (state === overState) stateName = 'overState';
                    else if (state === homeState) stateName = 'homeState';
                    else if (state === readyState) stateName = 'readyState';
                    else stateName = 'other';
                }
                logHUD('Update check:', {
                    valid: valid,
                    on: on,
                    currentState: stateName,
                    tileSize: typeof tileSize !== 'undefined' ? tileSize : 'undefined',
                    mapWidth: typeof mapWidth !== 'undefined' ? mapWidth : 'undefined',
                    stateExists: typeof state !== 'undefined',
                    playStateExists: typeof playState !== 'undefined',
                    newGameStateExists: typeof newGameState !== 'undefined'
                });
            }
            
            if (valid != on) {
                on = valid;
                logHUD('[HUD] State changed:', {on: on, valid: valid});
                if (on) {
                    inGameMenu.onHudEnable();
                    vcr.onHudEnable();
                }
                else {
                    inGameMenu.onHudDisable();
                    vcr.onHudDisable();
                }
            }
        },
        draw: function(ctx) {
            inGameMenu.draw(ctx);
            vcr.draw(ctx);
            
            // Debug: Log draw conditions
            if (typeof window.__hudDebugCount === 'undefined') {
                window.__hudDebugCount = 0;
            }
            window.__hudDebugCount++;
            if (window.__hudDebugCount % 60 === 0) { // Log every 60 frames (1 second at 60fps)
                logHUD('[HUD] Draw check:', {
                    on: on,
                    menuOpen: inGameMenu.isOpen()
                });
            }
        },
        isValidState: function() {
            return (
                state == playState ||
                state == newGameState ||
                state == readyNewState ||
                state == readyRestartState ||
                state == finishState ||
                state == deadState ||
                state == overState);
        },
    };

})();
