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
                  <span class="settings-toggle-label">Dark</span>
                  <span class="settings-toggle-label">Light</span>
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
                <option value="normal" selected>Normal</option>
                <option value="hard">Hard</option>
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
            <h3 class="settings-section-title">Network</h3>
            <div class="settings-row">
              <span>Current Network</span>
              <span data-network>-</span>
            </div>
            <div class="settings-row">
              <span>Chain ID</span>
              <span data-chain-id>-</span>
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
      const difficulty = getSetting('difficulty', 'normal');
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

      // Get network info
      const onchain = window.BaseManOnchain;
      if (onchain) {
        const chainId = onchain.getChainId && onchain.getChainId();
        const networkEl = panel.querySelector('[data-network]');
        const chainIdEl = panel.querySelector('[data-chain-id]');
        
        if (chainId) {
          const networkLabel = Number(chainId) === 8453 ? 'Base' : 
                               (Number(chainId) === 84532 ? 'Base Sepolia' : `Chain ${chainId}`);
          if (networkEl) networkEl.textContent = networkLabel;
          if (chainIdEl) chainIdEl.textContent = String(chainId);
        } else {
          if (networkEl) networkEl.textContent = '-';
          if (chainIdEl) chainIdEl.textContent = '-';
        }
      } else {
        const networkEl = panel.querySelector('[data-network]');
        const chainIdEl = panel.querySelector('[data-chain-id]');
        if (networkEl) networkEl.textContent = 'Not connected';
        if (chainIdEl) chainIdEl.textContent = '-';
      }
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
    if (typeof window.audio !== 'undefined' && window.audio) {
      if (!soundEnabled && window.audio.silence) {
        window.audio.silence();
      }
    }

    // Apply difficulty
    const difficulty = getSetting('difficulty', 'normal');
    window.__basemanDifficulty = difficulty;

    // Apply profile button visibility
    const showProfile = getSetting('showProfile', true);
    ensureProfileButton(showProfile);
  }

  function ensureProfileButton(show) {
    let profileBtn = document.getElementById('baseman-profile-btn');
    if (!profileBtn && show) {
      // Create profile button if it doesn't exist and should be shown
      profileBtn = document.createElement('button');
      profileBtn.id = 'baseman-profile-btn';
      profileBtn.className = 'profile-btn';
      profileBtn.type = 'button';
      profileBtn.textContent = 'Profile';
      profileBtn.setAttribute('aria-label', 'Open profile panel');
      profileBtn.addEventListener('click', () => {
        if (typeof window.ProfilePanel !== 'undefined' && typeof window.ProfilePanel.show === 'function') {
          window.ProfilePanel.show();
        }
      });
      document.body.appendChild(profileBtn);
    }
    if (profileBtn) {
      profileBtn.style.display = show ? '' : 'none';
    }
  }

  function wire(panel) {
    const closeBtn = panel.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        setVisible(false);
      });
    }

    // Close on overlay click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        setVisible(false);
      }
    });

    // Theme toggle
    const themeToggle = panel.querySelector('[data-setting="theme"]');
    if (themeToggle) {
      const currentTheme = getSetting('theme', 'dark');
      themeToggle.checked = currentTheme === 'light';
      themeToggle.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? 'light' : 'dark';
        setSetting('theme', newTheme);
        applySettings();
      });
    }

    // Sound toggle
    const soundToggle = panel.querySelector('[data-setting="sound"]');
    if (soundToggle) {
      const soundEnabled = getSetting('sound', true);
      soundToggle.checked = soundEnabled;
      soundToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        setSetting('sound', enabled);
        applySettings();
      });
    }

    // Difficulty select
    const difficultySelect = panel.querySelector('[data-setting="difficulty"]');
    if (difficultySelect) {
      const difficulty = getSetting('difficulty', 'normal');
      difficultySelect.value = difficulty;
      difficultySelect.addEventListener('change', (e) => {
        const newDifficulty = e.target.value;
        setSetting('difficulty', newDifficulty);
        applySettings();
      });
    }

    // Profile button toggle
    const profileToggle = panel.querySelector('[data-setting="showProfile"]');
    if (profileToggle) {
      const showProfile = getSetting('showProfile', true);
      profileToggle.checked = showProfile;
      profileToggle.addEventListener('change', (e) => {
        const show = e.target.checked;
        setSetting('showProfile', show);
        applySettings();
      });
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

