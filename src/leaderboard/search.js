/**
 * Leaderboard Search Module
 * Handles search modal functionality, live search, and platform detection
 * 
 * Phase 4.1: Performance optimizations
 * - Query caching to skip redundant searches
 * - Result caching to skip redundant renders
 * - Optimized filtering with for-loops
 */

import { createLogger } from '../utils/logger.js';
import { abbreviateAddress, fallbackAvatar, formatScore } from './dom.js';

const log = createLogger('Search');

/**
 * Resolve display name for search results
 * Priority: profile.displayName > profile.username > abbreviated address
 */
function resolveSearchDisplayName(entry) {
  const profile = entry && entry.profile ? entry.profile : {};

  if (profile.displayName && typeof profile.displayName === "string") {
    return profile.displayName;
  }

  if (profile.username && typeof profile.username === "string") {
    return profile.username.startsWith("@")
      ? profile.username
      : `@${profile.username}`;
  }

  if (entry && typeof entry.player === "string" && entry.player.length > 0) {
    const addr = entry.player;
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  return "";
}

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

// Phase 4.1: Query and result caching
let lastNormalizedQuery = ''; // Track last search query to skip redundant work
let lastResultCount = -1; // Track last result count for comparison
let lastResultHash = ''; // Simple hash of results to detect changes

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
    log.warnOnce('no-search-dom', 'Search modal DOM not found');
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
 * Compute simple hash for result comparison
 */
function computeResultHash(filtered) {
  if (!filtered || filtered.length === 0) return 'empty';
  // Use first few addresses as hash (good enough for detecting changes)
  let hash = filtered.length.toString();
  const maxCheck = Math.min(filtered.length, 10);
  for (let i = 0; i < maxCheck; i++) {
    hash += '|' + (filtered[i]?.player || '');
  }
  return hash;
}

/**
 * Render search results
 * Uses safe DOM APIs instead of innerHTML
 * 
 * Phase 4.1: Skip redundant renders when results unchanged
 */
function renderResults(filtered, { topListEl, restListEl, onItemClick }) {
  if (!searchResults) return;
  
  // Compute hash to detect if results changed
  const resultHash = computeResultHash(filtered);
  
  // Skip render if results unchanged
  if (resultHash === lastResultHash && lastResultCount === filtered.length) {
    log.debug('renderResults: skipping (results unchanged)');
    return;
  }
  
  // Update cache
  lastResultHash = resultHash;
  lastResultCount = filtered.length;
  
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
  
  // Phase 4.1: Use for-loop instead of forEach for better performance
  for (let i = 0, len = filtered.length; i < len; i++) {
    const entry = filtered[i];
    const listItem = document.createElement('li');
    listItem.className = 'leaderboard-search-result-item';
    listItem.setAttribute('data-address', entry?.player || '');
    
    // Left: avatar + username/address + platform
    const leftEl = document.createElement('div');
    leftEl.className = 'leaderboard-search-result-left';
    
    // Avatar
    const hasProfileUrl = entry?.profile?.profileUrl;
    const avatar = document.createElement(hasProfileUrl ? 'a' : 'div');
    avatar.className = 'leaderboard-search-result-avatar';
    if (hasProfileUrl) {
      avatar.href = entry.profile.profileUrl;
      avatar.target = '_blank';
      avatar.rel = 'noopener noreferrer';
    }
    
    // Use entry.profile.avatarUrl if present, otherwise show emoji/default avatar
    if (entry?.profile?.avatarUrl) {
      const img = document.createElement('img');
      img.src = entry.profile.avatarUrl;
      img.alt = resolveSearchDisplayName(entry) || 'avatar';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = function() {
        this.style.display = 'none';
        avatar.textContent = '👾';
      };
      avatar.appendChild(img);
    } else if (entry?.player) {
      // Fallback only if profile avatar is missing but we have address
      const img = document.createElement('img');
      img.src = fallbackAvatar(entry.player);
      img.alt = resolveSearchDisplayName(entry) || 'avatar';
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
    nameEl.textContent = resolveSearchDisplayName(entry);
    
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
  }
  
  fragment.appendChild(resultsList);
  searchResults.textContent = ''; // Clear safely
  searchResults.appendChild(fragment);
}

/**
 * Perform live search
 * Uses safe DOM APIs instead of innerHTML
 * 
 * Phase 4.1: Query caching to skip redundant searches
 */
function performLiveSearch(query, allEntries, { topListEl, restListEl, onItemClick }) {
  if (!searchResults) return;
  
  // Cancel previous search
  if (searchAbortController) {
    searchAbortController.abort();
  }
  searchAbortController = new AbortController();
  
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  
  // Handle empty query
  if (!trimmedQuery) {
    // Reset cache state
    lastNormalizedQuery = '';
    lastResultHash = '';
    lastResultCount = -1;
    searchResults.textContent = ''; // Clear safely
    return;
  }
  
  // Phase 4.1: Skip if query unchanged (after normalization)
  if (normalizedQuery === lastNormalizedQuery) {
    log.debug('performLiveSearch: skipping (query unchanged)');
    return;
  }
  
  lastNormalizedQuery = normalizedQuery;
  
  const signal = searchAbortController.signal;
  
  requestAnimationFrame(() => {
    if (signal.aborted) return;
    
    if (!allEntries || !Array.isArray(allEntries) || allEntries.length === 0) {
      if (signal.aborted) return;
      // Reset result cache
      lastResultHash = 'no-entries';
      lastResultCount = 0;
      searchResults.textContent = ''; // Clear safely
      const noEntries = document.createElement('div');
      noEntries.className = 'leaderboard-search-no-results';
      noEntries.textContent = 'No entries available';
      searchResults.appendChild(noEntries);
      return;
    }
    
    // Phase 4.1: Use for-loop for filtering (better performance)
    const searchTerm = normalizedQuery;
    const filtered = [];
    
    for (let i = 0, len = allEntries.length; i < len; i++) {
      if (signal.aborted) break;
      
      const entry = allEntries[i];
      const username = entry?.profile?.username?.toLowerCase() || '';
      const displayName = entry?.profile?.displayName?.toLowerCase() || '';
      const address = entry?.player?.toLowerCase() || '';
      
      // Check matches (most likely to least likely order for short-circuit)
      if (username.includes(searchTerm) || 
          displayName.includes(searchTerm) || 
          address.includes(searchTerm)) {
        filtered.push(entry);
      } else {
        // Only compute abbreviated address if other checks failed
        const abbreviatedAddress = abbreviateAddress(entry?.player || '').toLowerCase();
        if (abbreviatedAddress.includes(searchTerm)) {
          filtered.push(entry);
        }
      }
    }
    
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
  
  // Phase 4.1: Increased debounce to 150ms for better mobile performance
  searchDebounced = debounce((query) => {
    const allEntries = typeof getAllEntries === 'function' ? getAllEntries() : getAllEntries;
    performLiveSearch(query, allEntries, { topListEl, restListEl, onItemClick });
  }, 150);
  
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
 * Phase 4.1: Reset cache state on open for fresh search
 */
export function openSearchModal(getAllEntries, { topListEl, restListEl, onItemClick, onClose }) {
  const allEntries = typeof getAllEntries === 'function' ? getAllEntries() : getAllEntries;
  if (!ensureSearchDOM()) return;
  
  // Phase 4.1: Reset query and result cache on open
  lastNormalizedQuery = '';
  lastResultHash = '';
  lastResultCount = -1;
  
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
 * Phase 4.1: Reset query cache on close
 */
export function closeSearchModal(onRestore) {
  if (!searchModal) return;
  
  if (searchAbortController) {
    searchAbortController.abort();
    searchAbortController = null;
  }
  
  // Phase 4.1: Reset query and result cache
  lastNormalizedQuery = '';
  lastResultHash = '';
  lastResultCount = -1;
  
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
