/**
 * Skeleton Loader Utilities
 * Generates skeleton loading placeholders for BaseMan panels
 * 
 * Usage:
 *   import { renderLeaderboardSkeleton, renderProfileSkeleton } from './utils/skeleton-loader.js';
 *   
 *   const skeleton = renderLeaderboardSkeleton(10);
 *   container.innerHTML = skeleton;
 *   
 *   // Or use global:
 *   window.SkeletonLoader.leaderboard(10);
 */

/**
 * Generate skeleton HTML for leaderboard items
 * @param {number} count - Number of skeleton items to render
 * @returns {string} HTML string
 */
export function renderLeaderboardSkeleton(count = 10) {
  const items = Array.from({ length: count }, (_unused, _i) => `
    <div class="leaderboard-skeleton-item" aria-hidden="true">
      <div class="skeleton skeleton-rank"></div>
      <div class="skeleton skeleton-avatar"></div>
      <div class="skeleton skeleton-name"></div>
      <div class="skeleton-score">
        <div class="skeleton skeleton-score-value"></div>
        <div class="skeleton skeleton-score-label"></div>
      </div>
    </div>
  `).join('');

  return `<div class="leaderboard-skeleton" role="progressbar" aria-label="Loading leaderboard...">${items}</div>`;
}

/**
 * Generate skeleton HTML for profile panel
 * @returns {string} HTML string
 */
export function renderProfileSkeleton() {
  return `
    <div class="profile-skeleton" role="progressbar" aria-label="Loading profile...">
      <div class="profile-skeleton-header">
        <div class="skeleton skeleton-profile-avatar"></div>
        <div class="skeleton-profile-info">
          <div class="skeleton skeleton-profile-name"></div>
          <div class="skeleton skeleton-profile-address"></div>
        </div>
      </div>
      
      <div class="profile-skeleton-section">
        <div class="skeleton skeleton-section-title"></div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-value"></div>
        </div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-value"></div>
        </div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-value"></div>
        </div>
      </div>
      
      <div class="profile-skeleton-section">
        <div class="skeleton skeleton-section-title"></div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-value"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate skeleton HTML for wallet panel
 * @returns {string} HTML string
 */
export function renderWalletSkeleton() {
  return `
    <div class="wallet-skeleton" role="progressbar" aria-label="Loading wallet...">
      <div class="skeleton skeleton-balance"></div>
      <div class="skeleton skeleton-network"></div>
      <div class="skeleton skeleton-button"></div>
    </div>
  `;
}

/**
 * Generate skeleton HTML for search results
 * @param {number} count - Number of skeleton items to render
 * @returns {string} HTML string
 */
export function renderSearchSkeleton(count = 5) {
  const items = Array.from({ length: count }, () => `
    <div class="search-skeleton-item" aria-hidden="true">
      <div class="skeleton skeleton-search-avatar"></div>
      <div class="skeleton skeleton-search-name"></div>
      <div class="skeleton skeleton-search-score"></div>
    </div>
  `).join('');

  return `<div class="search-skeleton" role="progressbar" aria-label="Loading results...">${items}</div>`;
}

/**
 * Show skeleton in a container
 * @param {HTMLElement} container - Container element
 * @param {string} type - Type of skeleton ('leaderboard', 'profile', 'wallet', 'search')
 * @param {number} count - Number of items (for list types)
 */
export function showSkeleton(container, type = 'leaderboard', count = 10) {
  if (!container) return;
  
  let html = '';
  switch (type) {
    case 'leaderboard':
      html = renderLeaderboardSkeleton(count);
      break;
    case 'profile':
      html = renderProfileSkeleton();
      break;
    case 'wallet':
      html = renderWalletSkeleton();
      break;
    case 'search':
      html = renderSearchSkeleton(count);
      break;
    default:
      html = renderLeaderboardSkeleton(count);
  }
  
  container.innerHTML = html;
}

/**
 * Hide skeleton and clear container
 * @param {HTMLElement} container - Container element
 */
export function hideSkeleton(container) {
  if (!container) return;
  
  const skeleton = container.querySelector('.leaderboard-skeleton, .profile-skeleton, .wallet-skeleton, .search-skeleton');
  if (skeleton) {
    skeleton.remove();
  }
}

// Export for global access
const SkeletonLoader = {
  leaderboard: renderLeaderboardSkeleton,
  profile: renderProfileSkeleton,
  wallet: renderWalletSkeleton,
  search: renderSearchSkeleton,
  show: showSkeleton,
  hide: hideSkeleton
};

// Make available globally
if (typeof window !== 'undefined') {
  window.SkeletonLoader = SkeletonLoader;
}

export default SkeletonLoader;

