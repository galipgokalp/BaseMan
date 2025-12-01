
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
