/**
 * Leaderboard DOM Module
 * Handles rendering and formatting utilities
 * 
 * Phase 4.1: Performance optimizations
 * - View state caching for DOM references
 * - DocumentFragment batch rendering
 * - Minimized DOM writes per frame
 */

import { createLogger } from '../utils/logger.js';

const log = createLogger('LeaderboardDOM');

// ============================================
// VIEW STATE CACHE
// ============================================
// Cached DOM references to avoid repeated querySelector calls
const viewCache = {
  debugEl: null,
  lastRenderHash: null, // Track last render to skip redundant work
};

/**
 * Abbreviate Ethereum address
 */
export function abbreviateAddress(address) {
  if (typeof address !== "string") return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Get fallback avatar URL
 */
export function fallbackAvatar(address) {
  if (!address) return "";
  return `https://effigy.im/a/${address}.png`;
}

/**
 * Parse date value
 */
export function parseDateValue(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return new Date(value);
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Format relative time
 */
export function formatRelativeTime(value) {
  const date = parseDateValue(value);
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return "";
  }
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

/**
 * Format score with compact notation (54K, 1.5M)
 */
export function formatScore(value, fallback) {
  let numValue = null;
  if (typeof value === "number" && Number.isFinite(value)) {
    numValue = value;
  } else if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      numValue = parsed;
    }
  }
  
  if (numValue === null) {
    if (typeof fallback === "string") return fallback;
    if (typeof value === "string") return value;
    return "0";
  }
  
  if (numValue >= 1000000) {
    const millions = numValue / 1000000;
    return millions % 1 === 0 
      ? `${millions.toFixed(0)}M`
      : `${millions.toFixed(1)}M`;
  } else if (numValue >= 1000) {
    const thousands = numValue / 1000;
    return thousands % 1 === 0
      ? `${thousands.toFixed(0)}K`
      : `${thousands.toFixed(1)}K`;
  } else {
    return numValue.toLocaleString("en-US");
  }
}

/**
 * Format timestamp
 */
export function formatTimestamp(value) {
  if (!value && value !== 0) return "";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

/**
 * Create a leaderboard list item
 * @param {Object} entry - Leaderboard entry
 * @param {number} fallbackRank - Fallback rank if entry.rank is not available
 * @param {boolean} isMe - Whether this entry belongs to the current user
 */
export function createListItem(entry, fallbackRank, isMe = false) {
  const li = document.createElement("li");
  li.className = "leaderboard-item";
  
  // Store address for easier querying
  if (entry?.player) {
    li.dataset.address = entry.player.toLowerCase();
  }
  
  // Mark user's own row
  if (isMe) {
    li.classList.add("leaderboard-item-me");
    li.dataset.myRankItem = "true";
  }

  // Rank
  const rank = document.createElement("span");
  rank.className = "leaderboard-rank";
  const rankValue =
    typeof entry.rank === "number" && Number.isFinite(entry.rank) ? entry.rank : fallbackRank;
  rank.textContent = `${rankValue}`;
  li.append(rank);

  // Avatar
  const avatar = document.createElement(entry?.profile?.profileUrl ? "a" : "div");
  avatar.className = "leaderboard-avatar";
  if (entry?.profile?.profileUrl) {
    avatar.href = entry.profile.profileUrl;
    avatar.target = "_blank";
    avatar.rel = "noopener noreferrer";
  }
  
  // Priority: entry.profile.avatarUrl > fallback
  if (entry?.profile?.avatarUrl) {
    const img = document.createElement("img");
    img.src = entry.profile.avatarUrl;
    img.alt = entry?.profile?.displayName || entry?.profile?.username || "avatar";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.onerror = function() {
      this.style.display = 'none';
      avatar.textContent = "👾";
    };
    avatar.appendChild(img);
  } else if (entry?.player) {
    // Fallback only if profile avatar is missing but we have address
    const img = document.createElement("img");
    img.src = fallbackAvatar(entry.player);
    img.alt = entry?.profile?.displayName || entry?.profile?.username || "avatar";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.onerror = function() {
      this.style.display = 'none';
      avatar.textContent = "👾";
    };
    avatar.appendChild(img);
  } else {
    avatar.textContent = "👾";
  }
  li.append(avatar);

  // Username Container
  const identityRoot = document.createElement(entry?.profile?.profileUrl ? "a" : "div");
  identityRoot.className = "leaderboard-identity";
  if (entry?.profile?.profileUrl) {
    identityRoot.href = entry.profile.profileUrl;
    identityRoot.target = "_blank";
    identityRoot.rel = "noopener noreferrer";
  }

  const identityText = document.createElement("div");
  identityText.className = "leaderboard-text";
  const name = document.createElement("span");
  name.className = "leaderboard-name";
  
  // Priority: displayName > username > abbreviated address
  const profile = entry.profile || {};
  const label =
    profile.displayName ||
    (profile.username ? `@${profile.username}` : null) ||
    abbreviateAddress(entry.player);
  name.textContent = label;
  
  identityText.appendChild(name);
  
  // Platform logo
  const platform = entry?.profile?.platform;
  if (platform === 'farcaster' || platform === 'base-app') {
    const platformLogo = document.createElement("span");
    platformLogo.className = `leaderboard-platform-logo leaderboard-platform-logo-${platform}`;
    platformLogo.setAttribute("title", platform === 'farcaster' ? 'Farcaster' : 'Base App');
    platformLogo.setAttribute("aria-label", platform === 'farcaster' ? 'Farcaster' : 'Base App');
    identityText.appendChild(platformLogo);
  }
  
  identityRoot.appendChild(identityText);
  li.append(identityRoot);

  // Total Score
  const scoreWrap = document.createElement("div");
  scoreWrap.className = "leaderboard-score";
  const scoreValue = document.createElement("span");
  scoreValue.className = "leaderboard-score-value";
  scoreValue.textContent = formatScore(entry.totalScore, entry.highScore);
  scoreWrap.appendChild(scoreValue);
  li.append(scoreWrap);

  return li;
}

/**
 * Show debug info
 * Phase 4.1: Cache debug element reference
 */
export function showDebugInfo(panel, debugInfo) {
  // Use cached reference if available and still in DOM
  let debugEl = viewCache.debugEl;
  if (!debugEl || !debugEl.parentElement) {
    debugEl = panel.querySelector('[data-debug-info]');
  }
  
  if (!debugEl) {
    debugEl = document.createElement('div');
    debugEl.setAttribute('data-debug-info', '');
    debugEl.style.cssText = `
      margin-top: 16px;
      padding: 12px;
      background: rgba(0,0,0,0.1);
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      max-height: 200px;
      overflow-y: auto;
      color: #666;
      border: 1px solid rgba(0,0,0,0.1);
    `;
    panel.appendChild(debugEl);
  }
  
  // Cache the reference
  viewCache.debugEl = debugEl;
  
  // Build info array
  const info = [];
  info.push(`🔍 DEBUG MODE`);
  if (debugInfo.headerReceived !== undefined) {
    info.push(`Header: ${debugInfo.headerReceived ? '✅ Received' : '❌ Not received'}`);
  }
  if (debugInfo.mappingCount !== undefined) {
    info.push(`Mappings: ${debugInfo.mappingCount}`);
  }
  if (debugInfo.addressesRequested !== undefined) {
    info.push(`Addresses: ${debugInfo.addressesRequested}`);
  }
  if (debugInfo.profilesFound !== undefined) {
    info.push(`Profiles: ${debugInfo.profilesFound}`);
  }
  if (debugInfo.profileDetails) {
    info.push('');
    info.push('Profile Details:');
    const details = debugInfo.profileDetails;
    for (let i = 0, len = details.length; i < len; i++) {
      const detail = details[i];
      const hasProfile = detail.hasProfile ? '✅' : '❌';
      const user = detail.username ? `@${detail.username}` : detail.address;
      info.push(`  ${hasProfile} ${user.substring(0, 20)}${detail.fid ? ` (FID: ${detail.fid})` : ''}`);
    }
  }
  if (debugInfo.error) {
    info.push('');
    info.push(`❌ Error: ${debugInfo.error}`);
  }
  
  debugEl.textContent = info.join('\n');
  debugEl.style.display = 'block';
}

/**
 * Hide debug info
 * Phase 4.1: Use cached reference
 */
export function hideDebugInfo(panel) {
  // Use cached reference if available
  let debugEl = viewCache.debugEl;
  if (!debugEl || !debugEl.parentElement) {
    debugEl = panel.querySelector('[data-debug-info]');
    if (debugEl) viewCache.debugEl = debugEl;
  }
  if (debugEl) {
    debugEl.style.display = 'none';
  }
}

/**
 * Reset render cache
 * Call this when you need to force a fresh render on next call
 */
export function resetRenderCache() {
  viewCache.lastRenderHash = null;
}

/**
 * Compute a simple hash for render comparison
 * Used to skip redundant DOM work when data hasn't changed
 */
function computeRenderHash(items, limit) {
  if (!items || items.length === 0) return 'empty';
  const effectiveItems = items.slice(0, limit);
  // Create a lightweight hash from player addresses and scores
  let hash = effectiveItems.length.toString();
  for (let i = 0, len = effectiveItems.length; i < len; i++) {
    const entry = effectiveItems[i];
    hash += '|' + (entry?.player || '') + ':' + (entry?.totalScore || entry?.highScore || 0);
  }
  return hash;
}

/**
 * Render leaderboard rows
 * @param {Array} items - Leaderboard entries
 * @param {Object} options - Rendering options
 * @param {HTMLElement} options.topListEl - Top list element
 * @param {HTMLElement} options.restListEl - Rest list element
 * @param {HTMLElement} options.scrollWrapper - Scroll wrapper element
 * @param {HTMLElement} options.statusEl - Status element
 * @param {number} options.limit - Limit of items to render
 * @param {Function} options.isMyEntry - Function to check if entry belongs to current user
 * @param {boolean} options.forceRender - Force re-render even if data unchanged
 * 
 * Phase 4.1 optimizations:
 * - Skip render if data hash unchanged (avoids redundant DOM work)
 * - Use DocumentFragment for batch DOM insertion
 * - Use simple for-loop instead of forEach in hot path
 */
export function renderRows(items, { topListEl, restListEl, scrollWrapper, statusEl, limit, isMyEntry, forceRender = false }) {
  // Debug: Log render attempt
  log.debug('renderRows called:', {
    itemsCount: items?.length || 0,
    hasTopListEl: !!topListEl,
    hasRestListEl: !!restListEl,
    hasScrollWrapper: !!scrollWrapper,
    hasStatusEl: !!statusEl,
    limit
  });
  
  // Compute hash to detect if data actually changed
  const renderHash = computeRenderHash(items, limit);
  
  // Skip redundant render if data unchanged (unless forced)
  if (!forceRender && viewCache.lastRenderHash === renderHash) {
    log.debug('renderRows: skipping redundant render (data unchanged)');
    return null;
  }
  
  // Update hash before rendering
  viewCache.lastRenderHash = renderHash;

  // Clear containers
  if (topListEl) {
    topListEl.textContent = ""; // Clear safely
  } else {
    log.warn('renderRows: topListEl not found!');
  }
  if (restListEl) {
    restListEl.textContent = ""; // Clear safely
  } else {
    log.warn('renderRows: restListEl not found!');
  }
  if (scrollWrapper) {
    scrollWrapper.hidden = true;
  } else {
    log.warn('renderRows: scrollWrapper not found!');
  }
  
  if (!items || items.length === 0) {
    log.debug('renderRows: items is empty, showing "No scores yet."');
    if (statusEl) statusEl.textContent = "No scores yet.";
    return null;
  }

  const effectiveItems = items.slice(0, limit);
  const topCount = Math.min(10, effectiveItems.length);
  
  log.debug('renderRows: rendering', {
    effectiveItemsCount: effectiveItems.length,
    topCount,
    restCount: effectiveItems.length - topCount
  });
  
  // Build top items using DocumentFragment
  if (topListEl && topCount > 0) {
    const fragmentTop = document.createDocumentFragment();
    // Use simple for-loop for better performance in hot path
    for (let i = 0; i < topCount; i++) {
      const entry = effectiveItems[i];
      if (!entry) {
        log.warn(`renderRows: entry at index ${i} is null/undefined`);
        continue;
      }
      try {
        const isMe = isMyEntry ? isMyEntry(entry) : false;
        const listItem = createListItem(entry, i + 1, isMe);
        fragmentTop.appendChild(listItem);
      } catch (error) {
        log.error(`renderRows: failed to create list item for entry at index ${i}:`, error);
      }
    }
    if (fragmentTop.childNodes.length > 0) {
      topListEl.appendChild(fragmentTop);
      log.debug(`renderRows: appended ${fragmentTop.childNodes.length} top items`);
    } else {
      log.warn('renderRows: no top items were created');
    }
  } else if (topCount > 0 && !topListEl) {
    log.error('renderRows: topCount > 0 but topListEl is missing!');
  }

  // Build rest items using DocumentFragment
  const restCount = effectiveItems.length - topCount;
  if (restCount > 0 && restListEl && scrollWrapper) {
    const fragmentRest = document.createDocumentFragment();
    for (let i = 0; i < restCount; i++) {
      const entry = effectiveItems[topCount + i];
      if (!entry) {
        log.warn(`renderRows: entry at index ${topCount + i} is null/undefined`);
        continue;
      }
      try {
        const fallbackRank = topCount + i + 1;
        const isMe = isMyEntry ? isMyEntry(entry) : false;
        const listItem = createListItem(entry, fallbackRank, isMe);
        fragmentRest.appendChild(listItem);
      } catch (error) {
        log.error(`renderRows: failed to create list item for entry at index ${topCount + i}:`, error);
      }
    }
    if (fragmentRest.childNodes.length > 0) {
      restListEl.appendChild(fragmentRest);
      scrollWrapper.hidden = false;
      log.debug(`renderRows: appended ${fragmentRest.childNodes.length} rest items`);
    } else {
      log.warn('renderRows: no rest items were created');
    }
  } else if (restCount > 0 && (!restListEl || !scrollWrapper)) {
    log.error('renderRows: restCount > 0 but restListEl or scrollWrapper is missing!', {
      hasRestListEl: !!restListEl,
      hasScrollWrapper: !!scrollWrapper
    });
  }
  
  if (topCount === 0 && restCount === 0 && effectiveItems.length > 0) {
    log.warn('renderRows: effectiveItems.length > 0 but topCount and restCount are both 0!', {
      effectiveItemsLength: effectiveItems.length,
      limit
    });
  }

  return {
    total: items.length,
    pinned: topCount,
    scrollable: restCount
  };
}

/**
 * Render error state
 * Uses safe DOM APIs instead of innerHTML
 */
export function renderError(message, { topListEl, restListEl, scrollWrapper, statusEl, onRetry = null }) {
  if (statusEl) statusEl.textContent = "";
  if (topListEl) {
    topListEl.textContent = ""; // Clear safely
  }
  if (restListEl) {
    restListEl.textContent = ""; // Clear safely
  }
  
  // Phase 6: Show error message with retry button
  const errorDiv = document.createElement('div');
  errorDiv.className = 'leaderboard-error-state';
  errorDiv.style.cssText = 'padding: 40px 20px; text-align: center; color: #fff;';
  
  const errorMsg = document.createElement('p');
  errorMsg.textContent = message || "Couldn't load the leaderboard right now.";
  errorMsg.style.cssText = 'margin: 0 0 16px 0; font-size: 16px; opacity: 0.9;';
  errorDiv.appendChild(errorMsg);
  
  if (onRetry && typeof onRetry === 'function') {
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.className = 'leaderboard-retry-btn';
    retryBtn.style.cssText = 'padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
    retryBtn.addEventListener('click', () => {
      retryBtn.disabled = true;
      retryBtn.textContent = 'Retrying...';
      onRetry();
    });
    errorDiv.appendChild(retryBtn);
  }
  
  if (topListEl) {
    topListEl.appendChild(errorDiv);
  } else if (restListEl) {
    restListEl.appendChild(errorDiv);
  }
  
  if (scrollWrapper) {
    scrollWrapper.hidden = false; // Show wrapper so error is visible
  }
}

/**
 * Render empty state (no scores yet)
 * Phase 6: Empty state handling
 */
export function renderEmpty({ topListEl, restListEl, scrollWrapper, statusEl }) {
  if (statusEl) statusEl.textContent = "";
  if (topListEl) {
    topListEl.textContent = ""; // Clear safely
  }
  if (restListEl) {
    restListEl.textContent = ""; // Clear safely
  }
  
  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'leaderboard-empty-state';
  emptyDiv.style.cssText = 'padding: 40px 20px; text-align: center; color: #fff; opacity: 0.8;';
  
  const emptyMsg = document.createElement('p');
  emptyMsg.textContent = "No scores yet. Be the first to play and get on the board!";
  emptyMsg.style.cssText = 'margin: 0; font-size: 16px;';
  emptyDiv.appendChild(emptyMsg);
  
  if (topListEl) {
    topListEl.appendChild(emptyDiv);
  } else if (restListEl) {
    restListEl.appendChild(emptyDiv);
  }
  
  if (scrollWrapper) {
    scrollWrapper.hidden = false; // Show wrapper so empty state is visible
  }
}

/**
 * Render loading state
 * Phase 6: Loading state handling
 */
export function renderLoading({ topListEl, restListEl, scrollWrapper, statusEl }) {
  if (statusEl) {
    // Don't show loading message - keep status element empty
    statusEl.textContent = "";
  }
  
  // Optionally show skeleton rows or keep old data visible
  // For now, we'll just show the status message
  if (scrollWrapper) {
    scrollWrapper.hidden = false;
  }
}
