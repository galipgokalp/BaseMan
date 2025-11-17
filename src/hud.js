
var hud = (function(){

    var on = false;
    var soundBtnSize = tileSize * 1.5;
    var soundBtnX = mapWidth - soundBtnSize - tileSize;
    var soundBtnY = tileSize * 0.5;
    
    // Quick sound toggle button
    var soundBtn = new Button(soundBtnX, soundBtnY, soundBtnSize, soundBtnSize, function() {
        var currentState = window.__basemanGameSoundEffectsEnabled !== false;
        var newState = !currentState;
        if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.setSetting) {
            window.BaseManSettings.setSetting('gameSoundEffects', newState);
            window.BaseManSettings.applySettings();
        } else {
            window.__basemanGameSoundEffectsEnabled = newState;
        }
    });
    
    // Draw sound icon (speaker with sound waves or muted)
    soundBtn.setIcon(function(ctx, x, y, frame) {
        var isMuted = window.__basemanGameSoundEffectsEnabled === false;
        ctx.strokeStyle = isMuted ? "#888" : "#FFF";
        ctx.fillStyle = isMuted ? "#888" : "#FFF";
        ctx.lineWidth = 2;
        
        // Draw speaker cone
        ctx.beginPath();
        ctx.moveTo(x - soundBtnSize * 0.15, y);
        ctx.lineTo(x - soundBtnSize * 0.35, y - soundBtnSize * 0.2);
        ctx.lineTo(x - soundBtnSize * 0.35, y + soundBtnSize * 0.2);
        ctx.closePath();
        ctx.fill();
        
        // Draw sound waves
        if (!isMuted) {
            ctx.beginPath();
            ctx.arc(x + soundBtnSize * 0.1, y, soundBtnSize * 0.15, -0.5, 0.5, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + soundBtnSize * 0.2, y, soundBtnSize * 0.25, -0.7, 0.7, false);
            ctx.stroke();
        } else {
            // Draw mute X
            ctx.strokeStyle = "#F44";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + soundBtnSize * 0.15, y - soundBtnSize * 0.15);
            ctx.lineTo(x + soundBtnSize * 0.35, y + soundBtnSize * 0.15);
            ctx.moveTo(x + soundBtnSize * 0.35, y - soundBtnSize * 0.15);
            ctx.lineTo(x + soundBtnSize * 0.15, y + soundBtnSize * 0.15);
            ctx.stroke();
        }
    });

    return {

        update: function() {
            var valid = this.isValidState();
            if (valid != on) {
                on = valid;
                if (on) {
                    inGameMenu.onHudEnable();
                    vcr.onHudEnable();
                    soundBtn.enable();
                }
                else {
                    inGameMenu.onHudDisable();
                    vcr.onHudDisable();
                    soundBtn.disable();
                }
            }
            if (on && soundBtn.isEnabled) {
                soundBtn.update();
            }
        },
        draw: function(ctx) {
            inGameMenu.draw(ctx);
            vcr.draw(ctx);
            if (on && soundBtn.isEnabled && !inGameMenu.isOpen()) {
                soundBtn.draw(ctx);
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
