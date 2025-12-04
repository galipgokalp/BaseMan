/**
 * Leaderboard Search Module
 * Handles search modal functionality, live search, and platform detection
 */

import { abbreviateAddress, fallbackAvatar, formatScore } from './dom.js';

// Platform detection helpers
export function isIOS() {
  return typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;
}

export function isAndroid() {
  return typeof navigator !== "undefined" &&
    /Android/.test(navigator.userAgent);
}

// Debounce helper
function debounce(fn, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Search state
let searchModal = null;
let searchInput = null;
let searchResults = null;
let searchClose = null;
let searchClear = null;
let searchSpinner = null;
let searchBackdrop = null;
let searchAbortController = null;
let searchDebounced = null;
let viewportHandler = null;
let bodyScrollLocked = false;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';
let searchInputWired = false; // Flag to prevent duplicate event listener registrations

/**
 * Ensure search DOM elements are ready
 */
function ensureSearchDOM() {
  if (searchModal && searchInput) return true;
  
  searchModal = document.querySelector('[data-search-modal]');
  searchInput = document.querySelector('[data-search-input]');
  searchResults = document.querySelector('[data-search-results]');
  searchClose = document.querySelector('[data-search-close]');
  searchClear = document.querySelector('[data-search-clear]');
  searchBackdrop = document.querySelector('[data-search-backdrop]');
  
  const loadingEl = document.querySelector('[data-search-loading]');
  if (loadingEl) {
    searchSpinner = loadingEl.querySelector('.leaderboard-search-loading-spinner') || null;
    loadingEl.hidden = true;
    loadingEl.style.display = 'none';
  }
  
  if (!searchModal || !searchInput) {
    console.warn('[leaderboard-search] Search modal DOM not found');
    return false;
  }
  
  // Configure input attributes for mobile
  searchInput.setAttribute('autocapitalize', 'off');
  searchInput.setAttribute('autocomplete', 'off');
  searchInput.setAttribute('autocorrect', 'off');
  searchInput.setAttribute('spellcheck', 'false');
  searchInput.setAttribute('inputmode', 'search');
  searchInput.setAttribute('enterkeyhint', 'search');
  searchInput.style.fontSize = '16px';
  
  return true;
}

/**
 * Lock body scroll
 */
function lockBodyScroll() {
  if (bodyScrollLocked) return;
  if (document.body) {
    originalBodyOverflow = document.body.style.overflow || '';
    originalBodyPaddingRight = document.body.style.paddingRight || '';
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    bodyScrollLocked = true;
  }
}

/**
 * Unlock body scroll
 */
function unlockBodyScroll() {
  if (!bodyScrollLocked) return;
  if (document.body) {
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
    bodyScrollLocked = false;
  }
}

/**
 * Attach visual viewport shim for keyboard detection
 */
function attachViewportShim() {
  if (!window.visualViewport || viewportHandler) return;
  
  const modalContent = searchModal?.querySelector('.leaderboard-search-modal-content');
  if (!modalContent) return;
  
  viewportHandler = () => {
    if (!modalContent) return;
    const vh = window.visualViewport.height;
    const windowHeight = window.innerHeight;
    const needsLift = vh < windowHeight * 0.8;
    modalContent.style.top = needsLift ? '6%' : '12%';
  };
  
  window.visualViewport.addEventListener('resize', viewportHandler);
  window.visualViewport.addEventListener('scroll', viewportHandler);
}

/**
 * Detach visual viewport shim
 */
function detachViewportShim() {
  if (!window.visualViewport || !viewportHandler) return;
  
  window.visualViewport.removeEventListener('resize', viewportHandler);
  window.visualViewport.removeEventListener('scroll', viewportHandler);
  viewportHandler = null;
  
  const modalContent = searchModal?.querySelector('.leaderboard-search-modal-content');
  if (modalContent) {
    modalContent.style.top = '';
  }
}

/**
 * Render search results
 * Uses safe DOM APIs instead of innerHTML
 */
function renderResults(filtered, { topListEl, restListEl, onItemClick }) {
  if (!searchResults) return;
  
  if (filtered.length === 0) {
    searchResults.textContent = ''; // Clear safely
    const noResults = document.createElement('div');
    noResults.className = 'leaderboard-search-no-results';
    noResults.textContent = 'No users found';
    searchResults.appendChild(noResults);
    return;
  }
  
  const fragment = document.createDocumentFragment();
  const resultsList = document.createElement('ol');
  resultsList.className = 'leaderboard-search-list';
  
  filtered.forEach((entry) => {
    const listItem = document.createElement('li');
    listItem.className = 'leaderboard-search-result-item';
    listItem.setAttribute('data-address', entry?.player || '');
    
    // Left: avatar + username/address + platform
    const leftEl = document.createElement('div');
    leftEl.className = 'leaderboard-search-result-left';
    
    // Avatar
    const avatar = document.createElement(entry?.profile?.profileUrl ? 'a' : 'div');
    avatar.className = 'leaderboard-search-result-avatar';
    if (entry?.profile?.profileUrl) {
      avatar.href = entry.profile.profileUrl;
      avatar.target = '_blank';
      avatar.rel = 'noopener noreferrer';
    }
    if (entry?.profile?.avatarUrl || entry?.player) {
      const img = document.createElement('img');
      img.src = entry?.profile?.avatarUrl || fallbackAvatar(entry.player);
      img.alt = entry?.profile?.username
        ? `@${entry.profile.username}`
        : entry?.profile?.displayName || abbreviateAddress(entry.player);
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = function() {
        this.style.display = 'none';
        avatar.textContent = '👾';
      };
      avatar.appendChild(img);
    } else {
      avatar.textContent = '👾';
    }
    
    // Name container
    const nameContainer = document.createElement('div');
    nameContainer.className = 'leaderboard-search-result-name-container';
    
    // Name
    const nameEl = document.createElement('div');
    nameEl.className = 'leaderboard-search-result-name';
    const name = entry?.profile?.username || entry?.profile?.displayName || abbreviateAddress(entry?.player || '');
    nameEl.textContent = name || 'Unknown';
    
    // Platform logo
    const platform = entry?.profile?.platform;
    if (platform === 'farcaster' || platform === 'base-app') {
      const platformLogo = document.createElement('span');
      platformLogo.className = `leaderboard-platform-logo leaderboard-platform-logo-${platform}`;
      platformLogo.setAttribute('title', platform === 'farcaster' ? 'Farcaster' : 'Base App');
      platformLogo.setAttribute('aria-label', platform === 'farcaster' ? 'Farcaster' : 'Base App');
      nameContainer.appendChild(nameEl);
      nameContainer.appendChild(platformLogo);
    } else {
      nameContainer.appendChild(nameEl);
    }
    
    leftEl.appendChild(avatar);
    leftEl.appendChild(nameContainer);
    
    // Right: score
    const rightEl = document.createElement('div');
    rightEl.className = 'leaderboard-search-result-right';
    const score = entry?.totalScore ?? entry?.highScore ?? 0;
    rightEl.textContent = formatScore(score, entry?.highScore);
    
    listItem.appendChild(leftEl);
    listItem.appendChild(rightEl);
    
    // Click handler
    if (onItemClick) {
      listItem.addEventListener('click', () => {
        onItemClick(entry);
      }, { passive: true });
    }
    
    resultsList.appendChild(listItem);
  });
  
  fragment.appendChild(resultsList);
  searchResults.textContent = ''; // Clear safely
  searchResults.appendChild(fragment);
}

/**
 * Perform live search
 * Uses safe DOM APIs instead of innerHTML
 */
function performLiveSearch(query, allEntries, { topListEl, restListEl, onItemClick }) {
  if (!searchResults) return;
  
  // Cancel previous search
  if (searchAbortController) {
    searchAbortController.abort();
  }
  searchAbortController = new AbortController();
  
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    searchResults.textContent = ''; // Clear safely
    return;
  }
  
  const signal = searchAbortController.signal;
  
  requestAnimationFrame(() => {
    if (signal.aborted) return;
    
    if (!allEntries || !Array.isArray(allEntries) || allEntries.length === 0) {
      if (signal.aborted) return;
      searchResults.textContent = ''; // Clear safely
      const noEntries = document.createElement('div');
      noEntries.className = 'leaderboard-search-no-results';
      noEntries.textContent = 'No entries available';
      searchResults.appendChild(noEntries);
      return;
    }
    
    const searchTerm = trimmedQuery.toLowerCase();
    const filtered = allEntries.filter(entry => {
      if (signal.aborted) return false;
      const username = entry?.profile?.username?.toLowerCase() || '';
      const displayName = entry?.profile?.displayName?.toLowerCase() || '';
      const address = entry?.player?.toLowerCase() || '';
      const abbreviatedAddress = abbreviateAddress(entry?.player || '').toLowerCase();
      
      return username.includes(searchTerm) || 
             displayName.includes(searchTerm) || 
             address.includes(searchTerm) ||
             abbreviatedAddress.includes(searchTerm);
    });
    
    if (signal.aborted) return;
    
    renderResults(filtered, { topListEl, restListEl, onItemClick });
  });
}

/**
 * Wire live search
 */
function wireLiveSearch(getAllEntries, { topListEl, restListEl, onItemClick, onClose }) {
  if (!searchInput || searchInputWired) return; // Guard: do nothing if already wired
  
  searchInputWired = true;
  
  searchDebounced = debounce((query) => {
    const allEntries = typeof getAllEntries === 'function' ? getAllEntries() : getAllEntries;
    performLiveSearch(query, allEntries, { topListEl, restListEl, onItemClick });
  }, 120);
  
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    
    if (searchClear) {
      searchClear.hidden = !value || value.trim() === '';
    }
    
    searchDebounced(value);
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  });
}

/**
 * Open search modal
 */
export function openSearchModal(getAllEntries, { topListEl, restListEl, onItemClick, onClose }) {
  const allEntries = typeof getAllEntries === 'function' ? getAllEntries() : getAllEntries;
  if (!ensureSearchDOM()) return;
  
  lockBodyScroll();
  
  searchInput.value = '';
  if (searchClear) {
    searchClear.hidden = true;
  }
  
  if (searchResults) {
    searchResults.textContent = ''; // Clear safely
  }
  
  const loadingEl = document.querySelector('[data-search-loading]');
  if (loadingEl) {
    loadingEl.hidden = true;
    loadingEl.style.display = 'none';
  }
  
  searchModal.removeAttribute('hidden');
  
  searchInput.removeAttribute('readonly');
  searchInput.removeAttribute('disabled');
  searchInput.setAttribute('tabindex', '0');
  
  // Platform-specific focus tricks
  if (isAndroid()) {
    try {
      searchInput.click();
    } catch (e) {}
  }
  
  if (isIOS()) {
    try {
      const ev = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
      searchInput.dispatchEvent(ev);
    } catch (e) {}
  }
  
  searchInput.focus({ preventScroll: true });
  try {
    const end = searchInput.value.length;
    searchInput.setSelectionRange(end, end);
  } catch (e) {}
  
  requestAnimationFrame(() => {
    searchModal.classList.add('modal-open');
    
    requestAnimationFrame(() => {
      if (document.activeElement !== searchInput) {
        if (isAndroid()) {
          try {
            searchInput.click();
          } catch (e) {}
        }
        if (isIOS()) {
          try {
            const ev = new PointerEvent('pointerdown', { bubbles: true });
            searchInput.dispatchEvent(ev);
          } catch (e) {}
        }
        searchInput.focus({ preventScroll: true });
      }
    });
    
    attachViewportShim();
  });
  
  wireLiveSearch(getAllEntries, { topListEl, restListEl, onItemClick, onClose });
  renderResults([], { topListEl, restListEl, onItemClick });
}

/**
 * Close search modal
 */
export function closeSearchModal(onRestore) {
  if (!searchModal) return;
  
  if (searchAbortController) {
    searchAbortController.abort();
    searchAbortController = null;
  }
  
  detachViewportShim();
  unlockBodyScroll();
  
  searchModal.classList.remove('modal-open');
  
  if (searchInput) {
    searchInput.value = '';
    searchInput.blur();
  }
  
  if (searchResults) {
    searchResults.textContent = ''; // Clear safely
  }
  
  const loadingEl = document.querySelector('[data-search-loading]');
  if (loadingEl) {
    loadingEl.hidden = true;
    loadingEl.style.display = 'none';
  }
  
  if (searchClear) {
    searchClear.hidden = true;
  }
  
  setTimeout(() => {
    searchModal.setAttribute('hidden', '');
    if (onRestore) {
      onRestore();
    }
  }, 300);
}

/**
 * Initialize search module and wire event listeners
 */
export function initSearch(panel, getAllEntries, { topListEl, restListEl, onItemClick, onClose }) {
  // Wire search button
  const searchBtn = panel.querySelector('[data-search-btn]');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSearchModal(getAllEntries, { topListEl, restListEl, onItemClick, onClose });
    });
    searchBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSearchModal(getAllEntries, { topListEl, restListEl, onItemClick, onClose });
    }, { passive: false });
  }
  
  // Wire close button
  if (ensureSearchDOM() && searchClose) {
    searchClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSearchModal(onClose);
    });
    searchClose.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSearchModal(onClose);
    }, { passive: false });
  }
  
  // Wire clear button
  if (searchClear) {
    searchClear.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        searchClear.hidden = true;
        if (searchDebounced) {
          searchDebounced('');
        }
      }
    });
  }
  
  // Wire backdrop click
  if (searchBackdrop) {
    searchBackdrop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSearchModal(onClose);
    });
  }
  
  // Wire modal background click
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        closeSearchModal(onClose);
      }
    });
  }
  
  // Wire live search
  if (ensureSearchDOM()) {
    wireLiveSearch(getAllEntries, { topListEl, restListEl, onItemClick, onClose });
  }
  
  // Global Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal && !searchModal.hasAttribute('hidden')) {
      closeSearchModal(onClose);
    }
  });
}

