
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
        // Position in top-right corner of the screen
        // Context is already translated by (mapMargin+mapPad, mapMargin+mapPad)
        // To position at screen top-right, we need to account for this translation
        // screenWidth = mapWidth + 2*mapMargin
        // In map coordinates (after translate): x = screenWidth - soundBtnSize - mapMargin - mapPad
        // Simplified: x = mapWidth + mapMargin - soundBtnSize - mapPad
        var mapMargin = 4 * tileSize; // 32px
        var mapPad = tileSize / 8; // 1px
        var offsetLeft = tileSize * 1.5; // Move left by 12px
        var offsetDown = tileSize * 1.5; // Move down by 12px
        var soundBtnX = mapWidth + mapMargin - soundBtnSize - mapPad - offsetLeft; // Screen right edge in map coords, moved left
        var soundBtnY = -mapMargin - mapPad + offsetDown; // Screen top edge in map coords (negative because translate), moved down
        
        // Quick sound toggle button - controls both intro music and sound effects
        soundBtn = new Button(soundBtnX, soundBtnY, soundBtnSize, soundBtnSize, function() {
            logHUD('Sound button clicked');
            
            // Get current states from settings
            var currentSoundEffects = true;
            var currentIntroMusic = true;
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.getSetting) {
                currentSoundEffects = window.BaseManSettings.getSetting('gameSoundEffects', true);
                currentIntroMusic = window.BaseManSettings.getSetting('introMusic', true);
            } else {
                if (typeof window.__basemanGameSoundEffectsEnabled !== 'undefined') {
                    currentSoundEffects = window.__basemanGameSoundEffectsEnabled !== false;
                }
                if (typeof window.__basemanIntroMusicEnabled !== 'undefined') {
                    currentIntroMusic = window.__basemanIntroMusicEnabled !== false;
                }
            }
            
            // Toggle both settings to the same state (if either is on, turn both off; if both are off, turn both on)
            var newState = !(currentSoundEffects || currentIntroMusic);
            logHUD('Toggling all sounds:', {
                from: {soundEffects: currentSoundEffects, introMusic: currentIntroMusic},
                to: newState
            });
            
            // Update both settings
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.setSetting) {
                window.BaseManSettings.setSetting('gameSoundEffects', newState);
                window.BaseManSettings.setSetting('introMusic', newState);
                window.BaseManSettings.applySettings();
                logHUD('All sound settings updated via BaseManSettings');
            } else {
                window.__basemanGameSoundEffectsEnabled = newState;
                window.__basemanIntroMusicEnabled = newState;
                logHUD('All sound settings updated via global variables');
            }
            
            // Force re-wrap audio tracks to apply change immediately
            if (typeof window.BaseManSettings !== 'undefined' && typeof window.BaseManSettings.wrapAudioTracks === 'function') {
                window.BaseManSettings.wrapAudioTracks();
                logHUD('Audio tracks re-wrapped');
            }
        });
        
        // Draw simple speaker icon: green when sound on, red when muted
        soundBtn.setIcon(function(ctx, x, y, frame) {
            // x, y are the center coordinates from Button.draw()
            // Get muted state
            var isMuted = false;
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.getSetting) {
                var soundEffects = window.BaseManSettings.getSetting('gameSoundEffects', true);
                var introMusic = window.BaseManSettings.getSetting('introMusic', true);
                isMuted = !(soundEffects || introMusic);
            } else {
                var soundEffects = (typeof window.__basemanGameSoundEffectsEnabled !== 'undefined')
                    ? window.__basemanGameSoundEffectsEnabled !== false : true;
                var introMusic = (typeof window.__basemanIntroMusicEnabled !== 'undefined')
                    ? window.__basemanIntroMusicEnabled !== false : true;
                isMuted = !(soundEffects || introMusic);
            }

            var size = soundBtnSize;
            var centerX = x; // x is already the center
            var centerY = y; // y is already the center
            
            ctx.save();
            
            // Color: green when sound on, red when muted
            var color = isMuted ? "#FF4444" : "#4CAF50";
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            if (!isMuted) {
                // Sound ON - Draw speaker icon (green)
                // Speaker body (rectangle)
                var speakerW = size * 0.35;
                var speakerH = size * 0.5;
                var speakerX = centerX - size * 0.3;
                var speakerY = centerY - speakerH / 2;
                
                ctx.fillRect(speakerX, speakerY, speakerW, speakerH);
                
                // Speaker cone (triangle pointing right)
                ctx.beginPath();
                ctx.moveTo(speakerX + speakerW, speakerY);
                ctx.lineTo(speakerX + speakerW + size * 0.12, centerY);
                ctx.lineTo(speakerX + speakerW, speakerY + speakerH);
                ctx.closePath();
                ctx.fill();
                
                // Sound waves (3 curved arcs)
                var waveStartX = speakerX + speakerW + size * 0.15;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                
                // Small wave
                ctx.beginPath();
                ctx.arc(waveStartX, centerY, size * 0.08, -0.5, 0.5, false);
                ctx.stroke();
                
                // Medium wave
                ctx.beginPath();
                ctx.arc(waveStartX, centerY, size * 0.13, -0.7, 0.7, false);
                ctx.stroke();
                
                // Large wave
                ctx.beginPath();
                ctx.arc(waveStartX, centerY, size * 0.18, -0.9, 0.9, false);
                ctx.stroke();
            } else {
                // Sound OFF - Draw speaker with slash (red)
                // Speaker body (rectangle)
                var speakerW = size * 0.35;
                var speakerH = size * 0.5;
                var speakerX = centerX - size * 0.3;
                var speakerY = centerY - speakerH / 2;
                
                ctx.fillRect(speakerX, speakerY, speakerW, speakerH);
                
                // Speaker cone (triangle pointing right)
                ctx.beginPath();
                ctx.moveTo(speakerX + speakerW, speakerY);
                ctx.lineTo(speakerX + speakerW + size * 0.12, centerY);
                ctx.lineTo(speakerX + speakerW, speakerY + speakerH);
                ctx.closePath();
                ctx.fill();
                
                // Diagonal slash (mute indicator)
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                var lineStartX = speakerX + speakerW + size * 0.1;
                var lineEndX = centerX + size * 0.22;
                var lineOffset = size * 0.2;
                
                ctx.beginPath();
                ctx.moveTo(lineStartX, centerY - lineOffset);
                ctx.lineTo(lineEndX, centerY + lineOffset);
                ctx.stroke();
            }
            
            ctx.restore();
        });
        
        // Make button more visible
        soundBtn.borderBlurColor = "#FFFFFF"; // White border for visibility
        soundBtn.borderFocusColor = "#FFFF00"; // Yellow when focused
        
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
