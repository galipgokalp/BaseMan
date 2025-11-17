
var hud = (function(){

    var on = false;
    var soundBtn = null;
    
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
    
    // Initialize sound button with lazy evaluation
    var initSoundButton = function() {
        if (soundBtn) {
            return; // Already initialized - no need to log every frame
        }
        
        // Ensure tileSize and mapWidth are available
        if (typeof tileSize === 'undefined' || typeof mapWidth === 'undefined') {
            logHUD('[HUD] initSoundButton: Not ready yet', {
                tileSize: typeof tileSize !== 'undefined' ? tileSize : 'undefined',
                mapWidth: typeof mapWidth !== 'undefined' ? mapWidth : 'undefined'
            });
            return; // Not ready yet
        }
        
        logHUD('[HUD] initSoundButton: Starting initialization', {
            tileSize: tileSize,
            mapWidth: mapWidth
        });
        
        // Make button smaller and position in top-right corner
        var soundBtnSize = tileSize * 3; // 24px - smaller to not interfere with game
        // Position in top-right corner, as close to edge as possible
        // Button coordinates are in map coordinate system (after translate in renderer)
        // mapWidth = 226, so position at the very right edge
        var soundBtnX = mapWidth - soundBtnSize; // No margin - absolute right edge
        var soundBtnY = 0; // No margin - absolute top edge
        
        // Quick sound toggle button
        soundBtn = new Button(soundBtnX, soundBtnY, soundBtnSize, soundBtnSize, function() {
            logHUD('Sound button clicked');
            // Get current state from settings
            var currentState = true;
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.getSetting) {
                currentState = window.BaseManSettings.getSetting('gameSoundEffects', true);
            } else if (typeof window.__basemanGameSoundEffectsEnabled !== 'undefined') {
                currentState = window.__basemanGameSoundEffectsEnabled !== false;
            }
            var newState = !currentState;
            logHUD('Toggling sound:', {from: currentState, to: newState});
            
            // Update setting
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.setSetting) {
                window.BaseManSettings.setSetting('gameSoundEffects', newState);
                window.BaseManSettings.applySettings();
                logHUD('Sound setting updated via BaseManSettings');
            } else {
                window.__basemanGameSoundEffectsEnabled = newState;
                logHUD('Sound setting updated via global variable');
            }
            
            // Force re-wrap audio tracks to apply change immediately
            if (typeof window.BaseManSettings !== 'undefined' && typeof window.BaseManSettings.wrapAudioTracks === 'function') {
                window.BaseManSettings.wrapAudioTracks();
                logHUD('Audio tracks re-wrapped');
            }
        });
        
        // Draw sound icon (speaker with sound waves or muted)
        soundBtn.setIcon(function(ctx, x, y, frame) {
            // Get muted state from settings
            var isMuted = false;
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.getSetting) {
                isMuted = !window.BaseManSettings.getSetting('gameSoundEffects', true);
            } else if (typeof window.__basemanGameSoundEffectsEnabled !== 'undefined') {
                isMuted = window.__basemanGameSoundEffectsEnabled === false;
            }
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
        
        // Make button more visible with brighter border and background
        soundBtn.borderFocusColor = "#FFE14F";
        soundBtn.borderBlurColor = "#FFE14F"; // Make border always visible
        
        // Override button draw to make it more visible
        var originalDraw = soundBtn.draw;
        soundBtn.draw = function(ctx) {
            // Draw a very visible background
            ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
            ctx.fillRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            // Draw bright border
            ctx.strokeStyle = "#FFE14F";
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            // Call original draw
            originalDraw.call(this, ctx);
        };
        
        // Debug: Log button creation
        logHUD('[HUD] Sound button created:', {
            x: soundBtnX,
            y: soundBtnY,
            size: soundBtnSize,
            mapWidth: mapWidth,
            mapHeight: typeof mapHeight !== 'undefined' ? mapHeight : 'undefined'
        });
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
            
            // Initialize sound button if not already done
            initSoundButton();
            
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
                    soundBtn: !!soundBtn,
                    tileSize: typeof tileSize !== 'undefined' ? tileSize : 'undefined',
                    mapWidth: typeof mapWidth !== 'undefined' ? mapWidth : 'undefined',
                    stateExists: typeof state !== 'undefined',
                    playStateExists: typeof playState !== 'undefined',
                    newGameStateExists: typeof newGameState !== 'undefined'
                });
            }
            
            if (valid != on) {
                on = valid;
                logHUD('[HUD] State changed:', {on: on, valid: valid, soundBtn: !!soundBtn});
                if (on) {
                    inGameMenu.onHudEnable();
                    vcr.onHudEnable();
                    if (soundBtn) {
                        soundBtn.enable();
                        logHUD('[HUD] Sound button enabled');
                    } else {
                        logHUD('[HUD] Sound button is null when trying to enable');
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
            
            // Debug: Log draw conditions
            if (typeof window.__hudDebugCount === 'undefined') {
                window.__hudDebugCount = 0;
            }
            window.__hudDebugCount++;
            if (window.__hudDebugCount % 60 === 0) { // Log every 60 frames (1 second at 60fps)
                logHUD('[HUD] Draw check:', {
                    on: on,
                    soundBtn: !!soundBtn,
                    isEnabled: soundBtn ? soundBtn.isEnabled : false,
                    menuOpen: inGameMenu.isOpen(),
                    shouldDraw: on && soundBtn && soundBtn.isEnabled && !inGameMenu.isOpen(),
                    buttonPos: soundBtn ? {x: soundBtn.x, y: soundBtn.y, w: soundBtn.w, h: soundBtn.h} : null
                });
            }
            
            // Draw sound button when HUD is active, even if menu is open (but draw it behind menu)
            // Menu will overlay it, but button should still be visible when menu is closed
            if (on && soundBtn && soundBtn.isEnabled) {
                // Draw directly using ctx (same as inGameMenu does)
                // The ctx is already in map coordinate system from renderer
                try {
                    soundBtn.draw(ctx);
                } catch (e) {
                    logHUD('Error drawing sound button: ' + (e.message || String(e)));
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
