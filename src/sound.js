/* Sound handlers added by Dr James Freeman who was sad such a great reverse was a silent movie  */

var audio = new preloadAudio();
// Make audio globally accessible
if (typeof window !== 'undefined') {
  window.audio = audio;
}

var soundLog = (function() {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.BaseManCreateLogger === 'function') {
        return window.BaseManCreateLogger('UiSound');
      }
      if (window.BaseManLogger && typeof window.BaseManLogger.createLogger === 'function') {
        return window.BaseManLogger.createLogger('UiSound');
      }
    }
  } catch (_) {}
  return { warn: function() {} };
})();

function audioTrack(url, volume) {
    var audio = new Audio(url);
    if (volume) audio.volume = volume;
    audio.load();
    var looping = false;
    this.play = function(noResetTime) {
        playSound(noResetTime);
    };
    this.startLoop = function(noResetTime) {
        if (looping) return;
        audio.addEventListener('ended', audioLoop);
        audioLoop(noResetTime);
        looping = true;
    };
    this.stopLoop = function(noResetTime) {
        try{ audio.removeEventListener('ended', audioLoop) } catch (e) {}
        audio.pause();
        if (!noResetTime) audio.currentTime = 0;
        looping = false;
    };
    this.isPlaying = function() {
        return !audio.paused;
    };
    this.isPaused = function() {
        return audio.paused;
    }; 
    this.stop = this.stopLoop;

    function audioLoop(noResetTime) {
        playSound(noResetTime);
    }
    function playSound(noResetTime) {
        // for really rapid sound repeat set noResetTime
        if(!audio.paused) {
            audio.pause();
            if (!noResetTime ) audio.currentTime = 0;
        }
        try{
            var playPromise = audio.play();
            if(playPromise) {
                playPromise.then(function(){}).catch(function(err){
                    // Log audio play errors (non-critical)
                    try { soundLog.warn('Audio play failed:', err); } catch (_) {}
                });
            }
        } 
        catch(err) {
            // Log audio play errors (non-critical)
            try { soundLog.warn('Audio play error:', err); } catch (_) {}
        }
    }
}


function preloadAudio() {

    this.credit            = new audioTrack('sounds/credit.mp3');
    this.coffeeBreakMusic  = new audioTrack('sounds/coffee-break-music.mp3');
    this.die               = new audioTrack('sounds/miss.mp3');
    this.ghostReturnToHome = new audioTrack('sounds/ghost-return-to-home.mp3');
    this.eatingGhost       = new audioTrack('sounds/eating-ghost.mp3');
    this.ghostTurnToBlue   = new audioTrack('sounds/ghost-turn-to-blue.mp3', 0.5);
    this.eatingFruit       = new audioTrack('sounds/eating-fruit.mp3');
    this.ghostSpurtMove1   = new audioTrack('sounds/ghost-spurt-move-1.mp3');
    this.ghostSpurtMove2   = new audioTrack('sounds/ghost-spurt-move-2.mp3');
    this.ghostSpurtMove3   = new audioTrack('sounds/ghost-spurt-move-3.mp3');
    this.ghostSpurtMove4   = new audioTrack('sounds/ghost-spurt-move-4.mp3');
    this.ghostNormalMove   = new audioTrack('sounds/ghost-normal-move.mp3');
    this.extend            = new audioTrack('sounds/extend.mp3');
    this.eating            = new audioTrack('sounds/eating.mp3', 0.5);
    this.startMusic        = new audioTrack('sounds/start-music.mp3');

    this.ghostReset = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            if (s.match(/^ghost/)) this[s].stopLoop(noResetTime);
        }
    };

    this.silence = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            this[s].stopLoop(noResetTime);
        }
    }
}
