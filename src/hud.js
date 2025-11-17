
var hud = (function(){

    var on = false;
    var soundBtn = null;
    
    // Initialize sound button with lazy evaluation
    var initSoundButton = function() {
        if (soundBtn) return; // Already initialized
        
        // Ensure tileSize and mapWidth are available
        if (typeof tileSize === 'undefined' || typeof mapWidth === 'undefined') {
            return; // Not ready yet
        }
        
        // Make button larger and more visible
        var soundBtnSize = tileSize * 3; // Make it even larger for visibility
        // Position in top-right corner of map area, with some padding
        // Use mapWidth - padding to ensure it's visible
        var soundBtnX = mapWidth - soundBtnSize - tileSize;
        var soundBtnY = tileSize;
        
        // Quick sound toggle button
        soundBtn = new Button(soundBtnX, soundBtnY, soundBtnSize, soundBtnSize, function() {
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
            var size = soundBtnSize; // Use closure variable
            
            // Use brighter colors for better visibility
            ctx.strokeStyle = isMuted ? "#F44" : "#FFE14F";
            ctx.fillStyle = isMuted ? "#F44" : "#FFE14F";
            ctx.lineWidth = 2;
            
            // Draw speaker cone
            ctx.beginPath();
            ctx.moveTo(x - size * 0.15, y);
            ctx.lineTo(x - size * 0.35, y - size * 0.2);
            ctx.lineTo(x - size * 0.35, y + size * 0.2);
            ctx.closePath();
            ctx.fill();
            
            // Draw sound waves
            if (!isMuted) {
                ctx.beginPath();
                ctx.arc(x + size * 0.1, y, size * 0.15, -0.5, 0.5, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + size * 0.2, y, size * 0.25, -0.7, 0.7, false);
                ctx.stroke();
            } else {
                // Draw mute X
                ctx.strokeStyle = "#F44";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x + size * 0.15, y - size * 0.15);
                ctx.lineTo(x + size * 0.35, y + size * 0.15);
                ctx.moveTo(x + size * 0.35, y - size * 0.15);
                ctx.lineTo(x + size * 0.15, y + size * 0.15);
                ctx.stroke();
            }
        });
        
        // Make button more visible with brighter border
        soundBtn.borderFocusColor = "#FFE14F";
        soundBtn.borderBlurColor = "#FFE14F"; // Make border always visible
        
        // Debug: Log button creation
        console.log('[HUD] Sound button created:', {
            x: soundBtnX,
            y: soundBtnY,
            size: soundBtnSize,
            mapWidth: mapWidth,
            mapHeight: typeof mapHeight !== 'undefined' ? mapHeight : 'undefined'
        });
    };

    return {

        update: function() {
            // Initialize sound button if not already done
            initSoundButton();
            
            var valid = this.isValidState();
            if (valid != on) {
                on = valid;
                if (on) {
                    inGameMenu.onHudEnable();
                    vcr.onHudEnable();
                    if (soundBtn) {
                        soundBtn.enable();
                    }
                }
                else {
                    inGameMenu.onHudDisable();
                    vcr.onHudDisable();
                    if (soundBtn) {
                        soundBtn.disable();
                    }
                }
            }
            if (on && soundBtn && soundBtn.isEnabled) {
                soundBtn.update();
            }
        },
        draw: function(ctx) {
            inGameMenu.draw(ctx);
            vcr.draw(ctx);
            if (on && soundBtn && soundBtn.isEnabled && !inGameMenu.isOpen()) {
                // Draw directly using ctx (same as inGameMenu does)
                // The ctx is already in map coordinate system from renderer
                try {
                    soundBtn.draw(ctx);
                } catch (e) {
                    console.error('[HUD] Error drawing sound button:', e);
                }
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
