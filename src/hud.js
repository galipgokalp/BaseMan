
var hud = (function(){

    var on = false;

    // Import logger (use dynamic import to avoid circular dependencies)
    var log = null;
    try {
        // Try to get logger from window if available
        if (typeof window !== 'undefined' && window.BaseManLogger) {
            log = window.BaseManLogger.createLogger('HUD');
        } else {
            // Fallback: create a simple logger
            log = {
                debug: function(msg, data) {
                    if (data) {
                        console.log('[HUD] ' + msg, data);
                    } else {
                        console.log('[HUD] ' + msg);
                    }
                }
            };
        }
    } catch (e) {
        // Ultimate fallback
        log = {
            debug: function(msg, data) {
                if (data) {
                    console.log('[HUD] ' + msg, data);
                } else {
                    console.log('[HUD] ' + msg);
                }
            }
        };
    }

    // Helper function to log to logger
    var logHUD = function(message, data) {
        // Remove duplicate [HUD] prefix if present
        var cleanMessage = message.startsWith('[HUD] ') ? message.substring(6) : message;
        log.debug(cleanMessage, data);
    };

    return {

        update: function() {
            var valid = this.isValidState();
            
            // Only log when state actually changes (not on every update)
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
