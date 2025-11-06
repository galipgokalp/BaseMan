/**
 * Settings Panel
 * Displays app settings and preferences
 */

(function() {
  'use strict';

  const PANEL_ID = 'baseman-settings-panel';

  function $(sel) { return document.querySelector(sel); }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function ensurePanel() {
    if (!document.body) {
      console.warn('[settings-panel] document.body not ready');
      return null;
    }

    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = el('section', 'settings-panel');
      panel.id = PANEL_ID;
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <header class="settings-header">
          <h2 class="settings-title">Settings</h2>
          <button type="button" class="settings-close" data-close>×</button>
        </header>
        <div class="settings-body">
          <div class="settings-section">
            <h3 class="settings-section-title">Preferences</h3>
            <div class="settings-row settings-toggle-row">
              <span>Theme</span>
              <label class="settings-toggle">
                <input type="checkbox" data-setting="theme" />
                <span class="settings-toggle-slider">
                  <span class="settings-toggle-icon">🌙</span>
                  <span class="settings-toggle-icon">☀️</span>
                </span>
              </label>
            </div>
            <div class="settings-row settings-toggle-row">
              <span>Intro Music</span>
              <label class="settings-toggle">
                <input type="checkbox" data-setting="introMusic" checked />
                <span class="settings-toggle-slider">
                  <span class="settings-toggle-label">Off</span>
                  <span class="settings-toggle-label">On</span>
                </span>
              </label>
            </div>
            <div class="settings-row settings-toggle-row">
              <span>Game Sound Effects</span>
              <label class="settings-toggle">
                <input type="checkbox" data-setting="gameSoundEffects" checked />
                <span class="settings-toggle-slider">
                  <span class="settings-toggle-label">Off</span>
                  <span class="settings-toggle-label">On</span>
                </span>
              </label>
            </div>
            <div class="settings-row settings-select-row">
              <span>Game Difficulty</span>
              <select class="settings-select" data-setting="difficulty">
                <option value="easy">Easy</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            <div class="settings-row settings-toggle-row">
              <span>Show Profile Button</span>
              <label class="settings-toggle">
                <input type="checkbox" data-setting="showProfile" checked />
                <span class="settings-toggle-slider">
                  <span class="settings-toggle-label">Hide</span>
                  <span class="settings-toggle-label">Show</span>
                </span>
              </label>
            </div>
          </div>
          <div class="settings-section">
            <h3 class="settings-section-title">App Settings</h3>
            <div class="settings-row">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <div class="settings-row">
              <span>Environment</span>
              <span data-environment>-</span>
            </div>
          </div>
          <div class="settings-section">
            <h3 class="settings-section-title">About</h3>
            <div class="settings-row">
              <span>Mini App</span>
              <span>BaseMan</span>
            </div>
            <div class="settings-row">
              <span>Platform</span>
              <span>Farcaster / Base App</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(panel);
    }
    return panel;
  }

  let isOpen = false;

  function setVisible(visible) {
    const panel = ensurePanel();
    if (!panel) return;

    isOpen = !!visible;
    // Show panel immediately (synchronous)
    panel.classList.toggle('open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      // Load settings immediately (synchronous)
      loadSettings();
      // Re-wire event listeners when panel opens (for mobile compatibility)
      requestAnimationFrame(() => {
        wire(panel);
      });
      // Refresh in background (non-blocking)
      requestAnimationFrame(() => {
        refresh();
      });
    }
  }

  function loadSettings() {
    const panel = ensurePanel();
    if (!panel) return;

    // Load theme
    const themeToggle = panel.querySelector('[data-setting="theme"]');
    if (themeToggle) {
      const theme = getSetting('theme', 'dark');
      themeToggle.checked = theme === 'light';
    }

    // Load intro music setting
    const introMusicToggle = panel.querySelector('[data-setting="introMusic"]');
    if (introMusicToggle) {
      const introMusicEnabled = getSetting('introMusic', true);
      introMusicToggle.checked = introMusicEnabled;
    }
    
    // Load game sound effects setting
    const gameSoundEffectsToggle = panel.querySelector('[data-setting="gameSoundEffects"]');
    if (gameSoundEffectsToggle) {
      const gameSoundEffectsEnabled = getSetting('gameSoundEffects', true);
      gameSoundEffectsToggle.checked = gameSoundEffectsEnabled;
    }

    // Load difficulty
    const difficultySelect = panel.querySelector('[data-setting="difficulty"]');
    if (difficultySelect) {
      const difficulty = getSetting('difficulty', 'easy');
      difficultySelect.value = difficulty;
    }

    // Load profile button visibility
    const profileToggle = panel.querySelector('[data-setting="showProfile"]');
    if (profileToggle) {
      const showProfile = getSetting('showProfile', true);
      profileToggle.checked = showProfile;
    }
  }

  function refresh() {
    const panel = ensurePanel();
    if (!panel) return;

    try {
      // Get environment
      const env = window.__ENV || {};
      const envEl = panel.querySelector('[data-environment]');
      if (envEl) {
        const isProd = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('base-man');
        envEl.textContent = isProd ? 'Production' : 'Development';
      }

      // Network section removed
    } catch (error) {
      console.error('[settings-panel] refresh error', error);
    }
  }

  // Settings storage
  function getSetting(key, defaultValue) {
    try {
      const stored = localStorage.getItem(`baseman_${key}`);
      if (stored !== null) {
        if (stored === 'true') return true;
        if (stored === 'false') return false;
        return stored;
      }
    } catch (e) {}
    return defaultValue;
  }

  function setSetting(key, value) {
    try {
      localStorage.setItem(`baseman_${key}`, String(value));
    } catch (e) {
      console.warn('[settings-panel] Failed to save setting:', key, e);
    }
  }

  // Wrap audio track functions to respect settings
  function wrapAudioTracks() {
    if (typeof window.audio === 'undefined' || !window.audio) {
      return;
    }

    // Wrap coffeeBreakMusic (intro music)
    if (window.audio.coffeeBreakMusic && !window.audio.coffeeBreakMusic._wrapped) {
      const originalPlay = window.audio.coffeeBreakMusic.play;
      const originalStartLoop = window.audio.coffeeBreakMusic.startLoop;
      
      window.audio.coffeeBreakMusic.play = function(noResetTime) {
        const introMusicEnabled = getSetting('introMusic', true);
        if (introMusicEnabled) {
          return originalPlay.call(this, noResetTime);
        }
        // Don't play if disabled
        return;
      };
      
      window.audio.coffeeBreakMusic.startLoop = function(noResetTime) {
        const introMusicEnabled = getSetting('introMusic', true);
        if (introMusicEnabled) {
          return originalStartLoop.call(this, noResetTime);
        }
        // Don't start loop if disabled
        return;
      };
      
      window.audio.coffeeBreakMusic._wrapped = true;
    }

    // Wrap game sound effects (all other sounds)
    const gameSoundTracks = [
      'credit', 'startMusic', 'die', 'ghostReturnToHome', 
      'eatingGhost', 'ghostTurnToBlue', 'eatingFruit',
      'ghostSpurtMove1', 'ghostSpurtMove2', 'ghostSpurtMove3', 'ghostSpurtMove4',
      'ghostNormalMove', 'extend', 'eating'
    ];
    
    gameSoundTracks.forEach(function(trackName) {
      if (window.audio[trackName] && !window.audio[trackName]._wrapped) {
        const originalPlay = window.audio[trackName].play;
        const originalStartLoop = window.audio[trackName].startLoop;
        
        window.audio[trackName].play = function(noResetTime) {
          const gameSoundEffectsEnabled = getSetting('gameSoundEffects', true);
          if (gameSoundEffectsEnabled) {
            return originalPlay.call(this, noResetTime);
          }
          // Don't play if disabled
          return;
        };
        
        window.audio[trackName].startLoop = function(noResetTime) {
          const gameSoundEffectsEnabled = getSetting('gameSoundEffects', true);
          if (gameSoundEffectsEnabled) {
            return originalStartLoop.call(this, noResetTime);
          }
          // Don't start loop if disabled
          return;
        };
        
        window.audio[trackName]._wrapped = true;
      }
    });
  }

  function applySettings() {
    // Apply theme
    const theme = getSetting('theme', 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme === 'dark');

    // Apply intro music setting (coffeeBreakMusic)
    const introMusicEnabled = getSetting('introMusic', true);
    window.__basemanIntroMusicEnabled = introMusicEnabled;
    
    // Apply game sound effects setting (all other sounds including startMusic)
    const gameSoundEffectsEnabled = getSetting('gameSoundEffects', true);
    window.__basemanGameSoundEffectsEnabled = gameSoundEffectsEnabled;
    
    // Wrap audio tracks to respect settings (only once)
    wrapAudioTracks();
    
    if (typeof window.audio !== 'undefined' && window.audio) {
      try {
        // Control intro music (coffeeBreakMusic - plays on mini app entry)
        if (window.audio.coffeeBreakMusic && window.audio.coffeeBreakMusic.audio) {
          if (introMusicEnabled) {
            window.audio.coffeeBreakMusic.audio.volume = 1;
          } else {
            window.audio.coffeeBreakMusic.audio.volume = 0;
            // Stop the music if it's playing
            if (window.audio.coffeeBreakMusic.stopLoop) {
              window.audio.coffeeBreakMusic.stopLoop();
            }
          }
        }
        
        // Control game sound effects (all other sounds including startMusic)
        const gameSoundTracks = [
          'credit', 'startMusic', 'die', 'ghostReturnToHome', 
          'eatingGhost', 'ghostTurnToBlue', 'eatingFruit',
          'ghostSpurtMove1', 'ghostSpurtMove2', 'ghostSpurtMove3', 'ghostSpurtMove4',
          'ghostNormalMove', 'extend', 'eating'
        ];
        
        gameSoundTracks.forEach(function(trackName) {
          if (window.audio[trackName] && window.audio[trackName].audio) {
            if (gameSoundEffectsEnabled) {
              // Restore original volumes
              if (trackName === 'ghostTurnToBlue' || trackName === 'eating') {
                window.audio[trackName].audio.volume = 0.5;
              } else {
                window.audio[trackName].audio.volume = 1;
              }
            } else {
              // Mute game sound effects
              window.audio[trackName].audio.volume = 0;
              // Stop any looping sounds
              if (window.audio[trackName].stopLoop) {
                window.audio[trackName].stopLoop();
              }
            }
          }
        });
      } catch (e) {
        console.warn('[settings-panel] Failed to apply audio settings:', e);
      }
    }

    // Apply difficulty
    const difficulty = getSetting('difficulty', 'easy');
    window.__basemanDifficulty = difficulty;
    window.gameDifficulty = difficulty;
    
    // Apply difficulty to game speed
    // Difficulty affects game update rate: Easy (100%), Hard (110%), Extreme (120%)
    const applyDifficulty = () => {
      if (typeof window.executive !== 'undefined' && window.executive && typeof window.executive.setUpdatesPerSecond === 'function') {
        try {
          if (difficulty === 'easy') {
            // Easy: 100% speed (normal)
            window.executive.setUpdatesPerSecond(60); // 60 * 1.0
          } else if (difficulty === 'hard') {
            // Hard: 110% speed (faster)
            window.executive.setUpdatesPerSecond(66); // 60 * 1.1
          } else if (difficulty === 'extreme') {
            // Extreme: 120% speed (fastest)
            window.executive.setUpdatesPerSecond(72); // 60 * 1.2
          }
          console.log('[settings-panel] Difficulty applied:', difficulty);
        } catch (err) {
          console.warn('[settings-panel] Failed to apply difficulty:', err);
        }
      } else {
        // Executive not ready yet, retry after a short delay
        setTimeout(applyDifficulty, 100);
      }
    };
    applyDifficulty();

    // Apply profile button visibility setting
    const showProfile = getSetting('showProfile', true);
    ensureProfileButton(showProfile);
  }

  function ensureProfileButton(show) {
    // Profile button is now in bottom nav, but we keep this function for compatibility
    // If a top-right profile button exists, show/hide it based on setting
    let profileBtn = document.getElementById('baseman-profile-btn');
    if (profileBtn) {
      profileBtn.style.display = show ? 'inline-flex' : 'none';
    }
    // Note: Bottom nav profile button is always visible and controlled by bottom-nav.js
    // This setting only affects any legacy top-right profile button if it exists
  }

  // Track if elements are already wired to prevent duplicate listeners
  const wiredElements = new WeakSet();

  function wire(panel) {
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn && !wiredElements.has(closeBtn)) {
      wiredElements.add(closeBtn);
      const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        // Also update bottom nav state
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      };
      closeBtn.addEventListener('click', handleClose, { passive: false });
      // Touch event for mobile
      closeBtn.addEventListener('touchend', handleClose, { passive: false });
    }

    // Close on overlay click
    if (!wiredElements.has(panel)) {
      wiredElements.add(panel);
      panel.addEventListener('click', (e) => {
        if (e.target === panel) {
          setVisible(false);
        }
      }, { passive: true });
    }

    // Theme toggle - use both click and change for mobile compatibility
    const themeToggle = panel.querySelector('[data-setting="theme"]');
    if (themeToggle && !wiredElements.has(themeToggle)) {
      wiredElements.add(themeToggle);
      const currentTheme = getSetting('theme', 'dark');
      themeToggle.checked = currentTheme === 'light';
      
      const handleThemeChange = (e) => {
        // Don't prevent default for change event - let native checkbox work
        if (e.type === 'change') {
          e.stopPropagation();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        // Get the actual input element (in case event is from label)
        const input = e.target.type === 'checkbox' ? e.target : themeToggle;
        const newTheme = input.checked ? 'light' : 'dark';
        setSetting('theme', newTheme);
        applySettings();
      };
      
      // Change event (primary) - fires when checkbox state changes
      themeToggle.addEventListener('change', handleThemeChange, { passive: true });
      // Click event for immediate feedback
      themeToggle.addEventListener('click', handleThemeChange, { passive: false, capture: true });
      // Touch events for mobile
      themeToggle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
      themeToggle.addEventListener('touchend', handleThemeChange, { passive: false, capture: true });
      
      // Also listen on the label wrapper for better mobile compatibility
      const themeLabel = themeToggle.closest('.settings-toggle');
      if (themeLabel && !wiredElements.has(themeLabel)) {
        wiredElements.add(themeLabel);
        const handleLabelClick = (e) => {
          // Only handle if click is on label itself, not on input
          if (e.target === themeLabel || e.target.closest('.settings-toggle-slider')) {
            e.preventDefault();
            e.stopPropagation();
            themeToggle.checked = !themeToggle.checked;
            // Trigger change event manually
            themeToggle.dispatchEvent(new Event('change', { bubbles: true }));
            const newTheme = themeToggle.checked ? 'light' : 'dark';
            setSetting('theme', newTheme);
            applySettings();
          }
        };
        themeLabel.addEventListener('click', handleLabelClick, { passive: false, capture: true });
        themeLabel.addEventListener('touchend', handleLabelClick, { passive: false, capture: true });
      }
    }

    // Intro Music toggle
    const introMusicToggle = panel.querySelector('[data-setting="introMusic"]');
    if (introMusicToggle && !wiredElements.has(introMusicToggle)) {
      wiredElements.add(introMusicToggle);
      const introMusicEnabled = getSetting('introMusic', true);
      introMusicToggle.checked = introMusicEnabled;
      
      const handleIntroMusicChange = (e) => {
        if (e.type === 'change') {
          e.stopPropagation();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        const input = e.target.type === 'checkbox' ? e.target : introMusicToggle;
        const enabled = input.checked;
        setSetting('introMusic', enabled);
        applySettings();
      };
      
      introMusicToggle.addEventListener('change', handleIntroMusicChange, { passive: true });
      introMusicToggle.addEventListener('click', handleIntroMusicChange, { passive: false, capture: true });
      introMusicToggle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
      introMusicToggle.addEventListener('touchend', handleIntroMusicChange, { passive: false, capture: true });
      
      const introMusicLabel = introMusicToggle.closest('.settings-toggle');
      if (introMusicLabel && !wiredElements.has(introMusicLabel)) {
        wiredElements.add(introMusicLabel);
        const handleLabelClick = (e) => {
          if (e.target === introMusicLabel || e.target.closest('.settings-toggle-slider')) {
            e.preventDefault();
            e.stopPropagation();
            introMusicToggle.checked = !introMusicToggle.checked;
            introMusicToggle.dispatchEvent(new Event('change', { bubbles: true }));
            const enabled = introMusicToggle.checked;
            setSetting('introMusic', enabled);
            applySettings();
          }
        };
        introMusicLabel.addEventListener('click', handleLabelClick, { passive: false, capture: true });
        introMusicLabel.addEventListener('touchend', handleLabelClick, { passive: false, capture: true });
      }
    }

    // Game Sound Effects toggle
    const gameSoundEffectsToggle = panel.querySelector('[data-setting="gameSoundEffects"]');
    if (gameSoundEffectsToggle && !wiredElements.has(gameSoundEffectsToggle)) {
      wiredElements.add(gameSoundEffectsToggle);
      const gameSoundEffectsEnabled = getSetting('gameSoundEffects', true);
      gameSoundEffectsToggle.checked = gameSoundEffectsEnabled;
      
      const handleGameSoundEffectsChange = (e) => {
        if (e.type === 'change') {
          e.stopPropagation();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        const input = e.target.type === 'checkbox' ? e.target : gameSoundEffectsToggle;
        const enabled = input.checked;
        setSetting('gameSoundEffects', enabled);
        applySettings();
      };
      
      gameSoundEffectsToggle.addEventListener('change', handleGameSoundEffectsChange, { passive: true });
      gameSoundEffectsToggle.addEventListener('click', handleGameSoundEffectsChange, { passive: false, capture: true });
      gameSoundEffectsToggle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
      gameSoundEffectsToggle.addEventListener('touchend', handleGameSoundEffectsChange, { passive: false, capture: true });
      
      const gameSoundEffectsLabel = gameSoundEffectsToggle.closest('.settings-toggle');
      if (gameSoundEffectsLabel && !wiredElements.has(gameSoundEffectsLabel)) {
        wiredElements.add(gameSoundEffectsLabel);
        const handleLabelClick = (e) => {
          if (e.target === gameSoundEffectsLabel || e.target.closest('.settings-toggle-slider')) {
            e.preventDefault();
            e.stopPropagation();
            gameSoundEffectsToggle.checked = !gameSoundEffectsToggle.checked;
            gameSoundEffectsToggle.dispatchEvent(new Event('change', { bubbles: true }));
            const enabled = gameSoundEffectsToggle.checked;
            setSetting('gameSoundEffects', enabled);
            applySettings();
          }
        };
        gameSoundEffectsLabel.addEventListener('click', handleLabelClick, { passive: false, capture: true });
        gameSoundEffectsLabel.addEventListener('touchend', handleLabelClick, { passive: false, capture: true });
      }
    }

    // Difficulty select - use both change and input for mobile compatibility
    const difficultySelect = panel.querySelector('[data-setting="difficulty"]');
    if (difficultySelect && !wiredElements.has(difficultySelect)) {
      wiredElements.add(difficultySelect);
      const difficulty = getSetting('difficulty', 'easy');
      difficultySelect.value = difficulty;
      
      const handleDifficultyChange = (e) => {
        // Never prevent default for select - let it work naturally
        e.stopPropagation();
        const newDifficulty = e.target.value || difficultySelect.value;
        if (newDifficulty) {
          setSetting('difficulty', newDifficulty);
          applySettings();
        }
      };
      
      // Change event (primary) - fires when selection is made
      difficultySelect.addEventListener('change', handleDifficultyChange, { passive: true });
      
      // Input event for better mobile compatibility
      difficultySelect.addEventListener('input', handleDifficultyChange, { passive: true });
      
      // Click event to ensure select opens on mobile - don't prevent default
      difficultySelect.addEventListener('click', (e) => {
        e.stopPropagation();
        // Don't prevent default - let native select open
        // Just ensure it's focused
        if (e.target.tagName === 'SELECT') {
          e.target.focus();
        }
      }, { passive: true });
      
      // Touch events for mobile - don't prevent default to allow native select to open
      difficultySelect.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        // Allow native select to open - don't prevent default
      }, { passive: true });
      
      difficultySelect.addEventListener('touchend', (e) => {
        e.stopPropagation();
        // Don't prevent default - let native select open
        // Check for value change after a delay
        const currentValue = difficultySelect.value;
        setTimeout(() => {
          const newValue = difficultySelect.value;
          if (newValue && newValue !== currentValue) {
            setSetting('difficulty', newValue);
            applySettings();
          }
        }, 300);
      }, { passive: true });
      
      // Also listen for focus to ensure it works
      difficultySelect.addEventListener('focus', () => {
        // Ensure select is ready
        difficultySelect.style.pointerEvents = 'auto';
        difficultySelect.style.touchAction = 'manipulation';
      });
    }

    // Profile button toggle - use both click and change for mobile compatibility
    const profileToggle = panel.querySelector('[data-setting="showProfile"]');
    if (profileToggle && !wiredElements.has(profileToggle)) {
      wiredElements.add(profileToggle);
      const showProfile = getSetting('showProfile', true);
      profileToggle.checked = showProfile;
      
      const handleProfileChange = (e) => {
        // Don't prevent default for change event - let native checkbox work
        if (e.type === 'change') {
          e.stopPropagation();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        // Get the actual input element (in case event is from label)
        const input = e.target.type === 'checkbox' ? e.target : profileToggle;
        const show = input.checked;
        setSetting('showProfile', show);
        applySettings();
      };
      
      // Change event (primary) - fires when checkbox state changes
      profileToggle.addEventListener('change', handleProfileChange, { passive: true });
      // Click event for immediate feedback
      profileToggle.addEventListener('click', handleProfileChange, { passive: false, capture: true });
      // Touch events for mobile
      profileToggle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
      profileToggle.addEventListener('touchend', handleProfileChange, { passive: false, capture: true });
      
      // Also listen on the label wrapper for better mobile compatibility
      const profileLabel = profileToggle.closest('.settings-toggle');
      if (profileLabel && !wiredElements.has(profileLabel)) {
        wiredElements.add(profileLabel);
        const handleLabelClick = (e) => {
          // Only handle if click is on label itself, not on input
          if (e.target === profileLabel || e.target.closest('.settings-toggle-slider')) {
            e.preventDefault();
            e.stopPropagation();
            profileToggle.checked = !profileToggle.checked;
            // Trigger change event manually
            profileToggle.dispatchEvent(new Event('change', { bubbles: true }));
            const show = profileToggle.checked;
            setSetting('showProfile', show);
            applySettings();
          }
        };
        profileLabel.addEventListener('click', handleLabelClick, { passive: false, capture: true });
        profileLabel.addEventListener('touchend', handleLabelClick, { passive: false, capture: true });
      }
    }
  }

  function init() {
    try {
      const panel = ensurePanel();
      if (!panel) {
        setTimeout(() => {
          const retry = ensurePanel();
          if (retry) wire(retry);
        }, 100);
        return;
      }
      wire(panel);
    } catch (error) {
      console.error('[settings-panel] init error', error);
    }
  }

  // Public API
  window.SettingsPanel = {
    show: () => setVisible(true),
    hide: () => setVisible(false),
    toggle: () => setVisible(!isOpen),
    refresh: () => refresh(),
    isOpen: () => isOpen
  };

  // Wait for DOM and SDK ready
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (window.__basemanSDKReadyFired) {
          setTimeout(init, 100);
        } else {
          window.addEventListener('baseman-sdk-ready', () => {
            setTimeout(init, 100);
          }, { once: true });
          setTimeout(init, 1000);
        }
      }, { once: true });
    } else {
      if (window.__basemanSDKReadyFired) {
        setTimeout(init, 100);
      } else {
        window.addEventListener('baseman-sdk-ready', () => {
          setTimeout(init, 100);
        }, { once: true });
        setTimeout(init, 1000);
      }
    }
  }

  // Apply settings on load
  if (typeof window !== 'undefined') {
    function doApplySettings() {
      // Wait for audio to be ready, then wrap and apply settings
      function tryApply() {
        if (typeof window.audio !== 'undefined' && window.audio) {
          wrapAudioTracks();
          applySettings();
        } else {
          // Retry after a short delay if audio is not ready yet
          setTimeout(tryApply, 100);
        }
      }
      tryApply();
      // Also apply profile button visibility after a delay to ensure profile-panel.js has run
      setTimeout(() => {
        const showProfile = getSetting('showProfile', true);
        ensureProfileButton(showProfile);
      }, 500);
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(doApplySettings, 100);
      });
    } else {
      setTimeout(doApplySettings, 100);
    }
  }

  initWhenReady();
})();

