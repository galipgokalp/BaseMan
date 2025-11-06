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
              <span>Sound Effects</span>
              <label class="settings-toggle">
                <input type="checkbox" data-setting="sound" checked />
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

    // Load sound
    const soundToggle = panel.querySelector('[data-setting="sound"]');
    if (soundToggle) {
      const soundEnabled = getSetting('sound', true);
      soundToggle.checked = soundEnabled;
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

  function applySettings() {
    // Apply theme
    const theme = getSetting('theme', 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme === 'dark');

    // Apply sound
    const soundEnabled = getSetting('sound', true);
    window.__basemanSoundEnabled = soundEnabled;
    
    if (typeof window.audio !== 'undefined' && window.audio) {
      if (!soundEnabled) {
        // Mute all sounds
        if (window.audio.silence) {
          window.audio.silence();
        }
        // Also set volume to 0 for all audio tracks
        try {
          for (var key in window.audio) {
            if (window.audio[key] && typeof window.audio[key] === 'object') {
              // Check if it's an audioTrack object with audio property
              if (window.audio[key].audio && window.audio[key].audio instanceof Audio) {
                window.audio[key].audio.volume = 0;
              }
            }
          }
        } catch (e) {
          console.warn('[settings-panel] Failed to mute audio:', e);
        }
      } else {
        // Unmute all sounds - restore volumes
        try {
          // Restore original volumes
          if (window.audio.credit && window.audio.credit.audio) window.audio.credit.audio.volume = 1;
          if (window.audio.coffeeBreakMusic && window.audio.coffeeBreakMusic.audio) window.audio.coffeeBreakMusic.audio.volume = 1;
          if (window.audio.die && window.audio.die.audio) window.audio.die.audio.volume = 1;
          if (window.audio.ghostReturnToHome && window.audio.ghostReturnToHome.audio) window.audio.ghostReturnToHome.audio.volume = 1;
          if (window.audio.eatingGhost && window.audio.eatingGhost.audio) window.audio.eatingGhost.audio.volume = 1;
          if (window.audio.ghostTurnToBlue && window.audio.ghostTurnToBlue.audio) window.audio.ghostTurnToBlue.audio.volume = 0.5;
          if (window.audio.eatingFruit && window.audio.eatingFruit.audio) window.audio.eatingFruit.audio.volume = 1;
          if (window.audio.ghostSpurtMove1 && window.audio.ghostSpurtMove1.audio) window.audio.ghostSpurtMove1.audio.volume = 1;
          if (window.audio.ghostSpurtMove2 && window.audio.ghostSpurtMove2.audio) window.audio.ghostSpurtMove2.audio.volume = 1;
          if (window.audio.ghostSpurtMove3 && window.audio.ghostSpurtMove3.audio) window.audio.ghostSpurtMove3.audio.volume = 1;
          if (window.audio.ghostSpurtMove4 && window.audio.ghostSpurtMove4.audio) window.audio.ghostSpurtMove4.audio.volume = 1;
          if (window.audio.ghostNormalMove && window.audio.ghostNormalMove.audio) window.audio.ghostNormalMove.audio.volume = 1;
          if (window.audio.extend && window.audio.extend.audio) window.audio.extend.audio.volume = 1;
          if (window.audio.eating && window.audio.eating.audio) window.audio.eating.audio.volume = 0.5;
          if (window.audio.startMusic && window.audio.startMusic.audio) window.audio.startMusic.audio.volume = 1;
        } catch (e) {
          console.warn('[settings-panel] Failed to unmute audio:', e);
        }
      }
    }

    // Apply difficulty
    const difficulty = getSetting('difficulty', 'easy');
    window.__basemanDifficulty = difficulty;
    window.gameDifficulty = difficulty;
    
    // Apply difficulty to game speed
    // Difficulty affects game update rate: Easy (100%), Hard (110%), Extreme (120%)
    if (typeof window.executive !== 'undefined' && window.executive && typeof window.executive.setUpdatesPerSecond === 'function') {
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
    }

    // Profile button removed - now controlled by bottom nav only
    // Always ensure profile button is hidden
    ensureProfileButton(false);
  }

  function ensureProfileButton(show) {
    // Profile button removed - now controlled by bottom nav only
    // Hide any existing profile button
    let profileBtn = document.getElementById('baseman-profile-btn');
    if (profileBtn) {
      profileBtn.style.display = 'none';
      // Remove from DOM if exists
      try {
        profileBtn.remove();
      } catch (e) {}
    }
  }

  function wire(panel) {
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        // Also update bottom nav state
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      });
      // Touch event for mobile
      closeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible(false);
        if (window.BottomNav) {
          window.BottomNav.setActive(null);
        }
      }, { passive: false });
    }

    // Close on overlay click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        setVisible(false);
      }
    });

    // Theme toggle - use both click and change for mobile compatibility
    const themeToggle = panel.querySelector('[data-setting="theme"]');
    if (themeToggle) {
      const currentTheme = getSetting('theme', 'dark');
      themeToggle.checked = currentTheme === 'light';
      const handleThemeChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newTheme = e.target.checked ? 'light' : 'dark';
        setSetting('theme', newTheme);
        applySettings();
      };
      themeToggle.addEventListener('change', handleThemeChange, { passive: false });
      themeToggle.addEventListener('click', handleThemeChange, { passive: false });
      themeToggle.addEventListener('touchend', handleThemeChange, { passive: false });
    }

    // Sound toggle - use both click and change for mobile compatibility
    const soundToggle = panel.querySelector('[data-setting="sound"]');
    if (soundToggle) {
      const soundEnabled = getSetting('sound', true);
      soundToggle.checked = soundEnabled;
      const handleSoundChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const enabled = e.target.checked;
        setSetting('sound', enabled);
        applySettings();
      };
      soundToggle.addEventListener('change', handleSoundChange, { passive: false });
      soundToggle.addEventListener('click', handleSoundChange, { passive: false });
      soundToggle.addEventListener('touchend', handleSoundChange, { passive: false });
    }

    // Difficulty select - use both change and input for mobile compatibility
    const difficultySelect = panel.querySelector('[data-setting="difficulty"]');
    if (difficultySelect) {
      const difficulty = getSetting('difficulty', 'easy');
      difficultySelect.value = difficulty;
      const handleDifficultyChange = (e) => {
        const newDifficulty = e.target.value;
        setSetting('difficulty', newDifficulty);
        applySettings();
      };
      // Add multiple event listeners for better mobile compatibility
      difficultySelect.addEventListener('change', handleDifficultyChange, { passive: true });
      difficultySelect.addEventListener('input', handleDifficultyChange, { passive: true });
      difficultySelect.addEventListener('click', (e) => {
        // Ensure select is focused/opened on mobile
        if (e.target.tagName === 'SELECT') {
          e.target.focus();
        }
      }, { passive: true });
      // Touch events for mobile
      difficultySelect.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDifficultyChange(e);
      }, { passive: false });
    }

    // Profile button toggle - use both click and change for mobile compatibility
    const profileToggle = panel.querySelector('[data-setting="showProfile"]');
    if (profileToggle) {
      const showProfile = getSetting('showProfile', true);
      profileToggle.checked = showProfile;
      const handleProfileChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const show = e.target.checked;
        setSetting('showProfile', show);
        applySettings();
      };
      profileToggle.addEventListener('change', handleProfileChange, { passive: false });
      profileToggle.addEventListener('click', handleProfileChange, { passive: false });
      profileToggle.addEventListener('touchend', handleProfileChange, { passive: false });
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
      applySettings();
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

