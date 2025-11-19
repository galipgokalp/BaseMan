
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

    // Initialize sound button
    var initSoundButton = function() {
        if (soundBtn) return;
        
        var soundBtnSize = tileSize * 3;
        var soundBtnX = mapWidth - mapMargin - soundBtnSize - tileSize;
        var soundBtnY = mapHeight - mapMargin - soundBtnSize - tileSize;
        
        soundBtn = new Button(soundBtnX, soundBtnY, soundBtnSize, soundBtnSize, function() {
            var isMuted = window.__basemanGameSoundEffectsEnabled === false;
            if (typeof window.BaseManSettings !== 'undefined' && window.BaseManSettings.setSetting) {
                window.BaseManSettings.setSetting('gameSoundEffects', !isMuted);
                window.BaseManSettings.applySettings();
            } else {
                window.__basemanGameSoundEffectsEnabled = !isMuted;
            }
            soundBtn.setIcon(function(ctx, centerX, centerY, frame) {
                var isMuted = window.__basemanGameSoundEffectsEnabled === false;
                var size = soundBtnSize;
                var iconColor = isMuted ? '#FF0000' : '#00FF00';
                
                // Draw speaker body (rounded rectangle)
                var bodyW = size * 0.4;
                var bodyH = size * 0.5;
                var bodyX = centerX - bodyW * 0.6;
                var bodyY = centerY - bodyH * 0.5;
                var cornerRadius = size * 0.05;
                
                ctx.fillStyle = iconColor;
                ctx.beginPath();
                ctx.moveTo(bodyX + cornerRadius, bodyY);
                ctx.lineTo(bodyX + bodyW - cornerRadius, bodyY);
                ctx.quadraticCurveTo(bodyX + bodyW, bodyY, bodyX + bodyW, bodyY + cornerRadius);
                ctx.lineTo(bodyX + bodyW, bodyY + bodyH - cornerRadius);
                ctx.quadraticCurveTo(bodyX + bodyW, bodyY + bodyH, bodyX + bodyW - cornerRadius, bodyY + bodyH);
                ctx.lineTo(bodyX + cornerRadius, bodyY + bodyH);
                ctx.quadraticCurveTo(bodyX, bodyY + bodyH, bodyX, bodyY + bodyH - cornerRadius);
                ctx.lineTo(bodyX, bodyY + cornerRadius);
                ctx.quadraticCurveTo(bodyX, bodyY, bodyX + cornerRadius, bodyY);
                ctx.closePath();
                ctx.fill();
                
                // Draw speaker cone
                var coneW = size * 0.15;
                var coneH = size * 0.3;
                var coneX = bodyX + bodyW;
                var coneY = centerY - coneH * 0.5;
                
                ctx.fillStyle = iconColor;
                ctx.beginPath();
                ctx.moveTo(coneX, coneY);
                ctx.lineTo(coneX + coneW, centerY - coneH * 0.25);
                ctx.lineTo(coneX + coneW, centerY + coneH * 0.25);
                ctx.lineTo(coneX, coneY + coneH);
                ctx.closePath();
                ctx.fill();
                
                if (isMuted) {
                    // Draw slash line for muted state
                    ctx.strokeStyle = iconColor;
                    ctx.lineWidth = size * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(coneX + coneW + size * 0.1, coneY - size * 0.1);
                    ctx.lineTo(coneX + coneW + size * 0.5, coneY + coneH + size * 0.1);
                    ctx.stroke();
                } else {
                    // Draw sound waves for unmuted state
                    ctx.strokeStyle = iconColor;
                    ctx.lineWidth = size * 0.06;
                    var waveX = coneX + coneW;
                    var waveY = centerY;
                    var waveRadius1 = size * 0.12;
                    var waveRadius2 = size * 0.2;
                    var waveRadius3 = size * 0.28;
                    
                    ctx.beginPath();
                    ctx.arc(waveX, waveY, waveRadius1, -Math.PI * 0.25, Math.PI * 0.25);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(waveX, waveY, waveRadius2, -Math.PI * 0.3, Math.PI * 0.3);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(waveX, waveY, waveRadius3, -Math.PI * 0.35, Math.PI * 0.35);
                    ctx.stroke();
                }
            });
        });
        
        soundBtn.borderBlurColor = "#333";
        soundBtn.borderFocusColor = "#EEE";
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
                    initSoundButton();
                    if (soundBtn) soundBtn.enable();
                }
                else {
                    inGameMenu.onHudDisable();
                    vcr.onHudDisable();
                    if (soundBtn) soundBtn.disable();
                }
            }
            
            if (on && soundBtn) {
                soundBtn.update();
            }
        },
        draw: function(ctx) {
            inGameMenu.draw(ctx);
            vcr.draw(ctx);
            
            if (on && soundBtn) {
                soundBtn.draw(ctx);
            }
            
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
