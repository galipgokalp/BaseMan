/**
 * Leaderboard DOM Module
 * Handles rendering and formatting utilities
 */

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
  if (entry?.profile?.avatarUrl || entry?.player) {
    const img = document.createElement("img");
    img.src = entry?.profile?.avatarUrl || fallbackAvatar(entry.player);
    img.alt =
      entry?.profile?.username
        ? `@${entry.profile.username}`
        : entry?.profile?.displayName || abbreviateAddress(entry.player);
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
  const displayName = entry?.profile?.displayName || entry?.profile?.username || abbreviateAddress(entry.player);
  name.textContent = displayName || "Unknown";
  identityText.appendChild(name);
  
  // Platform logo
  const platform = entry?.profile?.platform;
  console.log('[leaderboard-dom] Entry platform for', entry?.profile?.username || entry?.player, ':', platform);
  if (platform === 'farcaster' || platform === 'base-app') {
    const platformLogo = document.createElement("span");
    platformLogo.className = `leaderboard-platform-logo leaderboard-platform-logo-${platform}`;
    platformLogo.setAttribute("title", platform === 'farcaster' ? 'Farcaster' : 'Base App');
    platformLogo.setAttribute("aria-label", platform === 'farcaster' ? 'Farcaster' : 'Base App');
    identityText.appendChild(platformLogo);
  } else if (entry?.profile) {
    console.warn('[leaderboard-dom] Profile exists but platform is missing:', {
      username: entry.profile.username,
      displayName: entry.profile.displayName,
      platform: entry.profile.platform,
      provider: entry.profile.provider
    });
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
 */
export function showDebugInfo(panel, debugInfo) {
  let debugEl = panel.querySelector('[data-debug-info]');
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
    debugInfo.profileDetails.forEach(detail => {
      const hasProfile = detail.hasProfile ? '✅' : '❌';
      const user = detail.username ? `@${detail.username}` : detail.address;
      info.push(`  ${hasProfile} ${user.substring(0, 20)}${detail.fid ? ` (FID: ${detail.fid})` : ''}`);
    });
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
 */
export function hideDebugInfo(panel) {
  const debugEl = panel.querySelector('[data-debug-info]');
  if (debugEl) {
    debugEl.style.display = 'none';
  }
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
 */
export function renderRows(items, { topListEl, restListEl, scrollWrapper, statusEl, limit, isMyEntry }) {
  if (topListEl) {
    topListEl.innerHTML = "";
  }
  if (restListEl) {
    restListEl.innerHTML = "";
  }
  if (scrollWrapper) {
    scrollWrapper.hidden = true;
  }
  if (!items.length) {
    if (statusEl) statusEl.textContent = "No scores yet.";
    return null;
  }

  const effectiveItems = items.slice(0, limit);
  const topItems = effectiveItems.slice(0, 10);
  const restItems = effectiveItems.slice(10);

  if (topListEl) {
    const fragmentTop = document.createDocumentFragment();
    topItems.forEach((entry, index) => {
      const isMe = isMyEntry ? isMyEntry(entry) : false;
      fragmentTop.appendChild(createListItem(entry, index + 1, isMe));
    });
    topListEl.appendChild(fragmentTop);
  }

  if (restItems.length && restListEl && scrollWrapper) {
    const fragmentRest = document.createDocumentFragment();
    restItems.forEach((entry, index) => {
      const fallbackRank = 10 + index + 1;
      const isMe = isMyEntry ? isMyEntry(entry) : false;
      fragmentRest.appendChild(createListItem(entry, fallbackRank, isMe));
    });
    restListEl.appendChild(fragmentRest);
    scrollWrapper.hidden = false;
  }

  return {
    total: items.length,
    pinned: topItems.length,
    scrollable: restItems.length
  };
}

/**
 * Render error state
 */
export function renderError(message, { topListEl, restListEl, scrollWrapper, statusEl }) {
  if (statusEl) statusEl.textContent = "";
  if (topListEl) {
    topListEl.innerHTML = "";
  }
  if (restListEl) {
    restListEl.innerHTML = "";
  }
  if (scrollWrapper) {
    scrollWrapper.hidden = true;
  }
}

