/**
 * Settings Panel
 * Displays app settings and preferences
 */

import { createElement } from './utils/panel-base.js';

const PANEL_ID = 'baseman-settings-panel';

// Use helpers from panel-base
const el = createElement;

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
          <div class="settings-section">
            <h3 class="settings-section-title">Debug Logs</h3>
            <div class="settings-row">
              <span>View recent logs</span>
              <button type="button" class="settings-button" data-debug-logs-view>View Logs</button>
            </div>
            <div class="settings-row">
              <span>Clear logs</span>
              <button type="button" class="settings-button" data-debug-logs-clear>Clear</button>
            </div>
            <div class="settings-row">
              <span>Export logs</span>
              <button type="button" class="settings-button" data-debug-logs-export>Export</button>
            </div>
            <div class="settings-debug-logs-container" data-debug-logs-container style="display: none;">
              <div class="settings-debug-logs-header">
                <span>Recent Logs</span>
                <div class="settings-debug-logs-header-actions">
                  <button type="button" class="settings-debug-logs-copy" data-debug-logs-copy title="Copy all logs to clipboard">📋 Copy</button>
                  <button type="button" class="settings-debug-logs-close" data-debug-logs-close>×</button>
                </div>
              </div>
              <div class="settings-debug-logs-filters" data-debug-logs-filters style="padding: 8px; border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1)); display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="settings-debug-logs-filter" data-debug-logs-filter="all" style="padding: 4px 8px; border: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-bg-secondary, rgba(255,255,255,0.05)); color: var(--color-text, #fff); border-radius: 4px; cursor: pointer; font-size: 0.75rem;">All</button>
                <button type="button" class="settings-debug-logs-filter" data-debug-logs-filter="error" style="padding: 4px 8px; border: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-bg-secondary, rgba(255,255,255,0.05)); color: #fca5a5; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Errors</button>
                <button type="button" class="settings-debug-logs-filter" data-debug-logs-filter="warn" style="padding: 4px 8px; border: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-bg-secondary, rgba(255,255,255,0.05)); color: #fbbf24; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Warnings</button>
                <button type="button" class="settings-debug-logs-filter" data-debug-logs-filter="info" style="padding: 4px 8px; border: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-bg-secondary, rgba(255,255,255,0.05)); color: var(--color-text, #fff); border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Info</button>
              </div>
              <div class="settings-debug-logs-content" data-debug-logs-content>
                <div class="settings-debug-logs-empty">No logs available</div>
              </div>
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

    // Wrap coffeeBreakMusic (intro music) - always re-wrap to ensure latest settings
    if (window.audio.coffeeBreakMusic) {
      // Store original functions if not already stored
      if (!window.audio.coffeeBreakMusic._originalPlay) {
        window.audio.coffeeBreakMusic._originalPlay = window.audio.coffeeBreakMusic.play;
      }
      if (!window.audio.coffeeBreakMusic._originalStartLoop) {
        window.audio.coffeeBreakMusic._originalStartLoop = window.audio.coffeeBreakMusic.startLoop;
      }
      
      const originalPlay = window.audio.coffeeBreakMusic._originalPlay;
      const originalStartLoop = window.audio.coffeeBreakMusic._originalStartLoop;
      
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
      if (window.audio[trackName]) {
        // Always re-wrap to ensure we use the latest getSetting function
        // Store original functions if not already stored
        if (!window.audio[trackName]._originalPlay) {
          window.audio[trackName]._originalPlay = window.audio[trackName].play;
        }
        if (!window.audio[trackName]._originalStartLoop) {
          window.audio[trackName]._originalStartLoop = window.audio[trackName].startLoop;
        }
        
        const originalPlay = window.audio[trackName]._originalPlay;
        const originalStartLoop = window.audio[trackName]._originalStartLoop;
        
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

    // Debug Logs buttons
    const debugLogsViewBtn = panel.querySelector('[data-debug-logs-view]');
    if (debugLogsViewBtn && !wiredElements.has(debugLogsViewBtn)) {
      wiredElements.add(debugLogsViewBtn);
      const handleViewLogs = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showDebugLogs(panel);
      };
      debugLogsViewBtn.addEventListener('click', handleViewLogs, { passive: false });
      debugLogsViewBtn.addEventListener('touchend', handleViewLogs, { passive: false });
    }

    const debugLogsClearBtn = panel.querySelector('[data-debug-logs-clear]');
    if (debugLogsClearBtn && !wiredElements.has(debugLogsClearBtn)) {
      wiredElements.add(debugLogsClearBtn);
      const handleClearLogs = (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearDebugLogs(panel);
      };
      debugLogsClearBtn.addEventListener('click', handleClearLogs, { passive: false });
      debugLogsClearBtn.addEventListener('touchend', handleClearLogs, { passive: false });
    }

    const debugLogsExportBtn = panel.querySelector('[data-debug-logs-export]');
    if (debugLogsExportBtn && !wiredElements.has(debugLogsExportBtn)) {
      wiredElements.add(debugLogsExportBtn);
      const handleExportLogs = (e) => {
        e.preventDefault();
        e.stopPropagation();
        exportDebugLogs();
      };
      debugLogsExportBtn.addEventListener('click', handleExportLogs, { passive: false });
      debugLogsExportBtn.addEventListener('touchend', handleExportLogs, { passive: false });
    }

    const debugLogsCopyBtn = panel.querySelector('[data-debug-logs-copy]');
    if (debugLogsCopyBtn && !wiredElements.has(debugLogsCopyBtn)) {
      wiredElements.add(debugLogsCopyBtn);
      const handleCopyLogs = (e) => {
        e.preventDefault();
        e.stopPropagation();
        copyAllLogs(panel);
      };
      debugLogsCopyBtn.addEventListener('click', handleCopyLogs, { passive: false });
      debugLogsCopyBtn.addEventListener('touchend', handleCopyLogs, { passive: false });
    }

    const debugLogsCloseBtn = panel.querySelector('[data-debug-logs-close]');
    if (debugLogsCloseBtn && !wiredElements.has(debugLogsCloseBtn)) {
      wiredElements.add(debugLogsCloseBtn);
      const handleCloseLogs = (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideDebugLogs(panel);
      };
      debugLogsCloseBtn.addEventListener('click', handleCloseLogs, { passive: false });
      debugLogsCloseBtn.addEventListener('touchend', handleCloseLogs, { passive: false });
    }

    // Debug Logs Filter buttons
    const filterButtons = panel.querySelectorAll('[data-debug-logs-filter]');
    filterButtons.forEach(btn => {
      if (!wiredElements.has(btn)) {
        wiredElements.add(btn);
        const handleFilterClick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const filter = btn.dataset.debugLogsFilter || 'all';
          currentLogFilter = filter;
          localStorage.setItem('debugLogsFilter', filter);
          
          // Update active state
          filterButtons.forEach(b => {
            const isActive = b.dataset.debugLogsFilter === filter;
            if (isActive) {
              b.style.background = 'var(--color-primary, rgba(59, 130, 246, 0.3))';
              b.style.borderColor = 'var(--color-primary, rgba(59, 130, 246, 0.5))';
            } else {
              b.style.background = 'var(--color-bg-secondary, rgba(255,255,255,0.05))';
              b.style.borderColor = 'var(--color-border, rgba(255,255,255,0.1))';
            }
          });
          
          // Reload logs with new filter
          const contentEl = panel.querySelector('[data-debug-logs-content]');
          if (contentEl && allLogsCache.length > 0) {
            renderDebugLogs(contentEl, allLogsCache, filter);
          } else {
            loadDebugLogs(contentEl, filter);
          }
        };
        btn.addEventListener('click', handleFilterClick, { passive: false });
        btn.addEventListener('touchend', handleFilterClick, { passive: false });
      }
    });
    
    // Set initial active filter button
    filterButtons.forEach(btn => {
      const filter = btn.dataset.debugLogsFilter || 'all';
      const isActive = filter === currentLogFilter;
      if (isActive) {
        btn.style.background = 'var(--color-primary, rgba(59, 130, 246, 0.3))';
        btn.style.borderColor = 'var(--color-primary, rgba(59, 130, 246, 0.5))';
      }
    });
}

function showDebugLogs(panel) {
    const container = panel.querySelector('[data-debug-logs-container]');
    const content = panel.querySelector('[data-debug-logs-content]');
    if (!container || !content) return;

    container.style.display = 'block';
    
    // Load logs with current filter
    loadDebugLogs(content, currentLogFilter);
}

function hideDebugLogs(panel) {
    const container = panel.querySelector('[data-debug-logs-container]');
    if (!container) return;
    container.style.display = 'none';
}

// Store current filter and all logs
let currentLogFilter = localStorage.getItem('debugLogsFilter') || 'all';
let allLogsCache = [];

async function loadDebugLogs(contentEl, filter = null) {
    if (!contentEl) return;
    
    // Use provided filter or saved filter
    const activeFilter = filter !== null ? filter : currentLogFilter;

    // Show loading state
    contentEl.innerHTML = '<div class="settings-debug-logs-empty">Loading logs...</div>';

    // PRIORITY 1: Try to get logs from ConsoleLogger API (client-side buffer - most reliable)
    // This is more reliable than server-side logs because it's in-memory on the client
    try {
      if (window.ConsoleLogger && typeof window.ConsoleLogger.getLogs === 'function') {
        const logs = window.ConsoleLogger.getLogs();
        if (logs && logs.length > 0) {
          console.log('[settings-panel] Loaded logs from ConsoleLogger (client-side):', logs.length);
          // Format logs to match expected structure
          const formattedLogs = logs.map(log => ({
            ts: log.timestamp || new Date().toISOString(),
            event: log.type || 'log',
            message: log.message || '',
            meta: {
              args: log.args || [],
              stack: log.stack || null,
              filename: log.filename || null,
              lineno: log.lineno || null
            }
          }));
          allLogsCache = formattedLogs; // Cache all logs
          renderDebugLogs(contentEl, formattedLogs, activeFilter);
          return;
        }
      }
    } catch (error) {
      console.warn('[settings-panel] Failed to load logs from ConsoleLogger:', error);
    }

    // PRIORITY 2: Try to get logs from API endpoint (server-side logs)
    // This might be empty if server restarted (Vercel cold start)
    try {
      const response = await fetch('/api/app-log?limit=500');
      if (response.ok) {
        const data = await response.json();
        const logs = data.logs || [];
        if (logs && logs.length > 0) {
          console.log('[settings-panel] Loaded logs from API (server-side):', logs.length);
          allLogsCache = logs; // Cache all logs
          renderDebugLogs(contentEl, logs, activeFilter);
          return;
        } else {
          console.log('[settings-panel] API returned empty logs (server may have restarted)');
        }
      } else {
        console.warn('[settings-panel] API endpoint returned error:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('[settings-panel] Failed to load logs from API:', error);
    }

    // No logs available
    contentEl.innerHTML = '<div class="settings-debug-logs-empty">No logs available. Open the leaderboard or play a game to generate logs. Logs are stored in your browser\'s memory and reset on page refresh.</div>';
}

function renderDebugLogs(contentEl, logs, filter = 'all') {
    if (!contentEl) return;

    if (!logs || logs.length === 0) {
      contentEl.innerHTML = '<div class="settings-debug-logs-empty">No logs available</div>';
      return;
    }

    // Sort logs by timestamp (newest first)
    const sortedLogs = logs.slice().sort((a, b) => {
      const tsA = new Date(a.ts || a.timestamp || 0).getTime();
      const tsB = new Date(b.ts || b.timestamp || 0).getTime();
      return tsB - tsA;
    });

    // Apply filter
    let filteredLogs = sortedLogs;
    if (filter === 'error') {
      filteredLogs = sortedLogs.filter(log => {
        const event = (log.event || log.type || '').toLowerCase();
        const message = (log.message || '').toLowerCase();
        return event.includes('error') || 
               message.includes('error') ||
               message.includes('failed') ||
               message.includes('exception') ||
               message.includes('err:');
      });
    } else if (filter === 'warn') {
      filteredLogs = sortedLogs.filter(log => {
        const event = (log.event || log.type || '').toLowerCase();
        const message = (log.message || '').toLowerCase();
        return event.includes('warn') || 
               message.includes('warning') ||
               message.includes('warn:');
      });
    } else if (filter === 'info') {
      filteredLogs = sortedLogs.filter(log => {
        const event = (log.event || log.type || '').toLowerCase();
        const message = (log.message || '').toLowerCase();
        return !event.includes('error') && 
               !event.includes('warn') &&
               !message.includes('error') &&
               !message.includes('warning') &&
               !message.includes('failed');
      });
    }
    // filter === 'all' shows all logs

    if (filteredLogs.length === 0) {
      contentEl.innerHTML = `<div class="settings-debug-logs-empty">No ${filter === 'all' ? '' : filter + ' '}logs available. Try playing a game and check again.</div>`;
      return;
    }

    // Limit to last 200 logs for performance (increased from 50)
    const displayLogs = filteredLogs.slice(0, 200);
    
    let html = displayLogs.map(log => {
      const ts = log.ts || log.timestamp || '';
      const event = log.event || log.type || 'unknown';
      const message = log.message || '';
      const meta = log.meta || {};
      const timeStr = ts ? new Date(ts).toLocaleTimeString() : '';
      
      let logClass = 'settings-debug-log';
      if (event.includes('error') || message.includes('ERROR') || message.toLowerCase().includes('error')) {
        logClass += ' settings-debug-log-error';
      } else if (event.includes('warn') || message.includes('WARNING') || message.toLowerCase().includes('warning')) {
        logClass += ' settings-debug-log-warn';
      } else if (event.includes('success') || message.includes('successfully') || message.toLowerCase().includes('success')) {
        logClass += ' settings-debug-log-success';
      } else if (event.includes('submitScore') || message.includes('submitScore')) {
        logClass += ' settings-debug-log-success'; // Highlight score submission logs
      } else if (event.includes('patchStateHooks') || message.includes('patchStateHooks')) {
        logClass += ' settings-debug-log-warn'; // Highlight patch hooks logs
      }

      // Truncate very long messages
      const displayMessage = message.length > 500 ? message.substring(0, 500) + '...' : message;

      return `
        <div class="${logClass}">
          <div class="settings-debug-log-time">${timeStr}</div>
          <div class="settings-debug-log-event">${escapeHtml(event)}</div>
          <div class="settings-debug-log-message">${escapeHtml(displayMessage)}</div>
          ${Object.keys(meta).length > 0 ? `<div class="settings-debug-log-meta">${escapeHtml(JSON.stringify(meta, null, 2))}</div>` : ''}
        </div>
      `;
    }).join('');
    
    if (filteredLogs.length > 200) {
      html += `<div class="settings-debug-logs-empty" style="padding: var(--spacing-sm); text-align: center; color: var(--color-text-muted); font-size: 0.5rem;">Showing last 200 of ${filteredLogs.length} ${filter === 'all' ? '' : filter + ' '}logs</div>`;
    } else if (filteredLogs.length > 0) {
      html += `<div class="settings-debug-logs-empty" style="padding: var(--spacing-sm); text-align: center; color: var(--color-text-muted); font-size: 0.5rem;">Showing ${filteredLogs.length} ${filter === 'all' ? '' : filter + ' '}log${filteredLogs.length > 1 ? 's' : ''}</div>`;
    }

    contentEl.innerHTML = html;
    
    // Scroll to top
    contentEl.scrollTop = 0;
}

function clearDebugLogs(panel) {
    if (!confirm('Are you sure you want to clear all logs?')) {
      return;
    }

    try {
      // Clear ConsoleLogger logs
      if (window.ConsoleLogger && typeof window.ConsoleLogger.clear === 'function') {
        window.ConsoleLogger.clear();
      }
    } catch (error) {
      console.warn('[settings-panel] Failed to clear ConsoleLogger logs:', error);
    }

    // Clear displayed logs
    const content = panel.querySelector('[data-debug-logs-content]');
    if (content) {
      content.innerHTML = '<div class="settings-debug-logs-empty">Logs cleared</div>';
    }

    // Hide logs container
    hideDebugLogs(panel);
}

async function copyAllLogs(panel) {
    const copyBtn = panel.querySelector('[data-debug-logs-copy]');
    const originalText = copyBtn ? copyBtn.textContent : '📋 Copy';
    
    // Show loading feedback
    if (copyBtn) {
      copyBtn.textContent = '⏳ Copying...';
      copyBtn.disabled = true;
    }
    
    try {
      // Try to get logs from API endpoint first
      let logs = [];
      try {
        const response = await fetch('/api/app-log');
        if (response.ok) {
          const data = await response.json();
          logs = data.logs || [];
          console.log('[settings-panel] Fetched logs from API:', logs.length);
        } else {
          console.warn('[settings-panel] API endpoint returned error:', response.status, response.statusText);
        }
      } catch (apiError) {
        console.warn('[settings-panel] Failed to fetch logs from API:', apiError);
      }

      // Fallback: Try to get logs from ConsoleLogger API
      if (logs.length === 0) {
        try {
          if (window.ConsoleLogger && typeof window.ConsoleLogger.getLogs === 'function') {
            const consoleLogs = window.ConsoleLogger.getLogs();
            logs = consoleLogs.map(log => ({
              ts: log.timestamp,
              event: log.type,
              message: log.message,
              meta: log.meta || {}
            }));
            console.log('[settings-panel] Fetched logs from ConsoleLogger:', logs.length);
          }
        } catch (loggerError) {
          console.warn('[settings-panel] Failed to get logs from ConsoleLogger:', loggerError);
        }
      }

      // Final fallback: Try to get logs from currently displayed content
      if (logs.length === 0) {
        const contentEl = panel.querySelector('[data-debug-logs-content]');
        if (contentEl) {
          const logElements = contentEl.querySelectorAll('.settings-debug-log');
          if (logElements.length > 0) {
            // Extract text from displayed logs
            const logTexts = Array.from(logElements).map(el => {
              const time = el.querySelector('.settings-debug-log-time')?.textContent || '';
              const event = el.querySelector('.settings-debug-log-event')?.textContent || '';
              const message = el.querySelector('.settings-debug-log-message')?.textContent || '';
              const meta = el.querySelector('.settings-debug-log-meta')?.textContent || '';
              return `[${time}] ${event}: ${message}${meta ? '\n' + meta : ''}`;
            });
            const textToCopy = logTexts.join('\n\n---\n\n');
            
            if (textToCopy && textToCopy.trim().length > 0) {
              console.log('[settings-panel] Copying logs from displayed content:', logTexts.length, 'logs');
              await copyToClipboard(textToCopy);
              showCopyFeedback(copyBtn, '✓ Copied!', true);
              return;
            }
          }
        }
        
        // No logs found anywhere
        console.warn('[settings-panel] No logs available to copy');
        if (copyBtn) {
          copyBtn.disabled = false;
        }
        showCopyFeedback(copyBtn, '✗ No logs', false);
        alert('No logs available to copy. Please play a game first and then try again.');
        return;
      }

      // Sort logs by timestamp (newest first)
      const sortedLogs = logs.slice().sort((a, b) => {
        const tsA = new Date(a.ts || a.timestamp || 0).getTime();
        const tsB = new Date(b.ts || b.timestamp || 0).getTime();
        return tsB - tsA;
      });

      // Format logs as readable text
      const formattedLogs = sortedLogs.map(log => {
        const ts = log.ts || log.timestamp || '';
        const event = log.event || log.type || 'unknown';
        const message = log.message || '';
        const meta = log.meta || {};
        const timeStr = ts ? new Date(ts).toLocaleString() : 'No timestamp';
        
        let logText = `[${timeStr}] ${event}`;
        if (message) {
          logText += `\n  Message: ${message}`;
        }
        if (Object.keys(meta).length > 0) {
          logText += `\n  Meta: ${JSON.stringify(meta, null, 2).split('\n').join('\n  ')}`;
        }
        return logText;
      });

      const textToCopy = formattedLogs.join('\n\n---\n\n');
      
      if (!textToCopy || textToCopy.trim().length === 0) {
        throw new Error('No log content to copy');
      }
      
      console.log('[settings-panel] Copying', sortedLogs.length, 'formatted logs to clipboard');
      await copyToClipboard(textToCopy);
      showCopyFeedback(copyBtn, '✓ Copied!', true);
    } catch (error) {
      console.error('[settings-panel] Failed to copy logs:', error);
      const errorMessage = error?.message || String(error);
      showCopyFeedback(copyBtn, '✗ Failed', false);
      
      // More helpful error message
      let userMessage = 'Failed to copy logs to clipboard.';
      if (errorMessage.includes('clipboard')) {
        userMessage += '\n\nYour browser may not support clipboard access, or you may need to grant permission.';
      } else if (errorMessage.includes('manual')) {
        userMessage = errorMessage;
      }
      
      alert(userMessage);
    } finally {
      // Re-enable button
      if (copyBtn) {
        copyBtn.disabled = false;
      }
    }
}

async function copyToClipboard(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text to copy');
    }

    // Try modern Clipboard API first (with permission check per MDN best practices)
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        // Check clipboard permission if available (MDN recommended approach)
        let hasPermission = true;
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' });
            hasPermission = permissionStatus.state === 'granted' || permissionStatus.state === 'prompt';
            // If permission is denied, skip Clipboard API and use fallback directly
            if (permissionStatus.state === 'denied') {
              // Silently fall through to fallback method
            }
          } catch (permError) {
            // Permission API not supported or failed, try Clipboard API anyway
            hasPermission = true;
          }
        }
        
        if (hasPermission) {
          await navigator.clipboard.writeText(text);
          console.log('[settings-panel] Text copied to clipboard using Clipboard API');
          return;
        }
        // Permission denied, fall through to fallback method silently
      } catch (clipboardError) {
        // Only log warning for non-permission errors (network, security, etc.)
        // Permission denied errors are handled silently above
        const isPermissionError = clipboardError.name === 'NotAllowedError' || 
                                   clipboardError.message?.includes('permission') ||
                                   clipboardError.message?.includes('denied');
        if (!isPermissionError) {
          console.warn('[settings-panel] Clipboard API failed, trying fallback:', clipboardError);
        }
        // Fall through to fallback method
      }
    }

    // Fallback method for older browsers or when Clipboard API fails
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      textarea.setAttribute('readonly', '');
      textarea.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(textarea);
      
      // For mobile devices, use setSelectionRange
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, 999999);
      } else {
        textarea.select();
        textarea.setSelectionRange(0, 999999); // For mobile devices
      }
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (!successful) {
        throw new Error('execCommand copy failed');
      }
      
      console.log('[settings-panel] Text copied to clipboard using fallback method');
    } catch (fallbackError) {
      console.error('[settings-panel] Fallback copy method also failed:', fallbackError);
      // Last resort: Show the text in an alert or prompt so user can manually copy
      throw new Error('Failed to copy to clipboard. Please copy manually from the logs view.');
    }
}

function showCopyFeedback(button, text, success) {
    if (!button) return;
    const originalText = button.textContent;
    button.textContent = text;
    button.style.color = success ? '#4caf50' : '#f44336';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.color = '';
    }, 2000);
}

function exportDebugLogs() {
    try {
      // Try to export from ConsoleLogger API
      if (window.ConsoleLogger && typeof window.ConsoleLogger.export === 'function') {
        window.ConsoleLogger.export();
        return;
      }
    } catch (error) {
      console.warn('[settings-panel] Failed to export logs from ConsoleLogger:', error);
    }

    // Fallback: Fetch from API and export
    fetch('/api/app-log')
      .then(response => response.json())
      .then(data => {
        const logs = data.logs || [];
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `baseman-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('[settings-panel] Failed to export logs:', error);
        alert('Failed to export logs. Please try again.');
      });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    isOpen: () => isOpen,
    getSetting: getSetting,
    setSetting: setSetting,
    applySettings: applySettings,
    wrapAudioTracks: wrapAudioTracks
};

// Alias for compatibility with in-game menu
window.BaseManSettings = window.SettingsPanel;

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

