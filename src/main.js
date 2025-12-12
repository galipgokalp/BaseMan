//////////////////////////////////////////////////////////////////////////////////////
// Entry Point
// Performance optimization: Parallel initialization where possible

window.addEventListener("load", function() {
    // Performance monitoring - mark initialization start
    if (typeof performance !== 'undefined' && performance.mark) {
        try {
            performance.mark('game-init-start');
        } catch (e) {}
    }
    
    // Start parallel initialization immediately
    // These can run in parallel as they don't depend on each other
    loadHighScores(); // Fast: localStorage read
    initRenderer(); // Fast: canvas setup
    
    // Use requestIdleCallback for non-critical initialization if available
    // Otherwise use setTimeout to defer heavy operations
    const deferHeavyWork = window.requestIdleCallback || function(cb) { setTimeout(cb, 1); };
    
    // Defer heavy atlas creation to avoid blocking initial render
    deferHeavyWork(function() {
        atlas.create();
    });
    
    // These can run immediately
    initSwipe();
    
    // State switching - can run in parallel with atlas creation
    var anchor = window.location.hash.substring(1);
	if (anchor == "learn") {
		switchState(learnState);
	}
	else if (anchor == "cheat_pac" || anchor == "cheat_mspac") {
		gameMode = (anchor == "cheat_pac") ? GAME_PACMAN : GAME_MSPACMAN;
		practiceMode = true;
        switchState(newGameState);
		for (var i=0; i<4; i++) {
			ghosts[i].isDrawTarget = true;
			ghosts[i].isDrawPath = true;
		}
	}
	else {
		switchState(homeState);
	}
    
    // Executive init can run immediately
    executive.init();
    
    // Measure initialization time
    if (typeof performance !== 'undefined' && performance.mark) {
        try {
            performance.mark('game-init-complete');
            if (performance.measure) {
                performance.measure('game-init-time', 'game-init-start', 'game-init-complete');
            }
        } catch (e) {}
    }
});
