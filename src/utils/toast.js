/**
 * Toast Notification System
 * Lightweight toast notifications for BaseMan mini app
 * 
 * Usage:
 *   import { toast, showToast } from './utils/toast.js';
 *   
 *   toast.success('Score saved!');
 *   toast.error('Connection failed');
 *   toast.info('Syncing...');
 *   toast.warning('Low balance');
 *   
 *   // Or with options:
 *   showToast('Custom message', { type: 'success', duration: 5000 });
 */

import { createLogger } from './logger.js';

const log = createLogger('Toast');

// Toast container element
let toastContainer = null;

// Active toasts tracking
const activeToasts = new Map();
let toastIdCounter = 0;

// Default configuration
const DEFAULT_CONFIG = {
  duration: 3000,        // Auto-dismiss after 3 seconds
  position: 'top',       // 'top' or 'bottom'
  maxToasts: 3,          // Maximum visible toasts
  pauseOnHover: true,    // Pause auto-dismiss on hover
  showProgress: true,    // Show progress bar
};

// Toast type configurations
const TOAST_TYPES = {
  success: {
    icon: '✓',
    className: 'toast-success',
    defaultMessage: 'Success!',
  },
  error: {
    icon: '✕',
    className: 'toast-error',
    defaultMessage: 'Something went wrong',
  },
  warning: {
    icon: '⚠',
    className: 'toast-warning',
    defaultMessage: 'Warning',
  },
  info: {
    icon: 'ℹ',
    className: 'toast-info',
    defaultMessage: 'Info',
  },
  loading: {
    icon: '⟳',
    className: 'toast-loading',
    defaultMessage: 'Loading...',
  },
};

/**
 * Initialize the toast container
 */
function initContainer() {
  if (toastContainer) return toastContainer;

  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  toastContainer.setAttribute('role', 'alert');
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('aria-atomic', 'true');
  
  document.body.appendChild(toastContainer);
  log.debug('Toast container initialized');
  
  return toastContainer;
}

/**
 * Create a toast element
 */
function createToastElement(message, options) {
  const { type, showProgress, duration } = options;
  const typeConfig = TOAST_TYPES[type] || TOAST_TYPES.info;

  const toast = document.createElement('div');
  toast.className = `toast ${typeConfig.className}`;
  toast.setAttribute('role', 'status');

  // Icon
  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.textContent = typeConfig.icon;
  if (type === 'loading') {
    iconSpan.classList.add('toast-icon-spin');
  }

  // Content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'toast-content';

  const messageSpan = document.createElement('span');
  messageSpan.className = 'toast-message';
  messageSpan.textContent = message || typeConfig.defaultMessage;
  contentDiv.appendChild(messageSpan);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.type = 'button';

  // Assemble
  toast.appendChild(iconSpan);
  toast.appendChild(contentDiv);
  toast.appendChild(closeBtn);

  // Progress bar (for non-loading toasts)
  if (showProgress && type !== 'loading' && duration > 0) {
    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress';
    progressBar.style.animationDuration = `${duration}ms`;
    toast.appendChild(progressBar);
  }

  return toast;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Toast options
 * @returns {Object} Toast control object with dismiss() method
 */
export function showToast(message, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const { type = 'info', duration, pauseOnHover, maxToasts } = config;

  // Initialize container if needed
  initContainer();

  // Limit max toasts
  while (activeToasts.size >= maxToasts) {
    const oldestId = activeToasts.keys().next().value;
    dismissToast(oldestId);
  }

  // Create toast
  const toastId = ++toastIdCounter;
  const toastEl = createToastElement(message, { ...config, type });
  
  // Store reference
  const toastData = {
    id: toastId,
    element: toastEl,
    timeoutId: null,
    isPaused: false,
    remainingTime: duration,
    startTime: Date.now(),
  };
  activeToasts.set(toastId, toastData);

  // Close button handler
  const closeBtn = toastEl.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => dismissToast(toastId));

  // Pause on hover
  if (pauseOnHover && duration > 0 && type !== 'loading') {
    toastEl.addEventListener('mouseenter', () => pauseToast(toastId));
    toastEl.addEventListener('mouseleave', () => resumeToast(toastId));
    toastEl.addEventListener('touchstart', () => pauseToast(toastId), { passive: true });
    toastEl.addEventListener('touchend', () => resumeToast(toastId), { passive: true });
  }

  // Add to container with animation
  toastContainer.appendChild(toastEl);
  
  // Trigger enter animation
  requestAnimationFrame(() => {
    toastEl.classList.add('toast-enter');
  });

  // Auto-dismiss (except for loading toasts with duration 0)
  if (duration > 0 && type !== 'loading') {
    toastData.timeoutId = setTimeout(() => dismissToast(toastId), duration);
  }

  log.debug(`Toast shown: ${type} - ${message}`);

  // Return control object
  return {
    id: toastId,
    dismiss: () => dismissToast(toastId),
    update: (newMessage, newOptions) => updateToast(toastId, newMessage, newOptions),
  };
}

/**
 * Dismiss a toast
 */
function dismissToast(toastId) {
  const toastData = activeToasts.get(toastId);
  if (!toastData) return;

  const { element, timeoutId } = toastData;

  // Clear timeout
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Exit animation
  element.classList.remove('toast-enter');
  element.classList.add('toast-exit');

  // Remove after animation
  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    activeToasts.delete(toastId);
  }, 300); // Match CSS animation duration
}

/**
 * Pause toast auto-dismiss
 */
function pauseToast(toastId) {
  const toastData = activeToasts.get(toastId);
  if (!toastData || toastData.isPaused) return;

  toastData.isPaused = true;
  toastData.remainingTime -= Date.now() - toastData.startTime;

  if (toastData.timeoutId) {
    clearTimeout(toastData.timeoutId);
    toastData.timeoutId = null;
  }

  // Pause progress bar animation
  const progressBar = toastData.element.querySelector('.toast-progress');
  if (progressBar) {
    progressBar.style.animationPlayState = 'paused';
  }
}

/**
 * Resume toast auto-dismiss
 */
function resumeToast(toastId) {
  const toastData = activeToasts.get(toastId);
  if (!toastData || !toastData.isPaused) return;

  toastData.isPaused = false;
  toastData.startTime = Date.now();

  if (toastData.remainingTime > 0) {
    toastData.timeoutId = setTimeout(() => dismissToast(toastId), toastData.remainingTime);
  }

  // Resume progress bar animation
  const progressBar = toastData.element.querySelector('.toast-progress');
  if (progressBar) {
    progressBar.style.animationPlayState = 'running';
  }
}

/**
 * Update an existing toast
 */
function updateToast(toastId, newMessage, newOptions = {}) {
  const toastData = activeToasts.get(toastId);
  if (!toastData) return;

  const { element } = toastData;

  // Update message
  if (newMessage) {
    const messageEl = element.querySelector('.toast-message');
    if (messageEl) {
      messageEl.textContent = newMessage;
    }
  }

  // Update type/class
  if (newOptions.type) {
    const typeConfig = TOAST_TYPES[newOptions.type];
    if (typeConfig) {
      // Remove old type classes
      Object.values(TOAST_TYPES).forEach(t => {
        element.classList.remove(t.className);
      });
      element.classList.add(typeConfig.className);

      // Update icon
      const iconEl = element.querySelector('.toast-icon');
      if (iconEl) {
        iconEl.textContent = typeConfig.icon;
        iconEl.classList.toggle('toast-icon-spin', newOptions.type === 'loading');
      }
    }
  }

  // Set auto-dismiss if specified
  if (newOptions.duration && newOptions.duration > 0) {
    if (toastData.timeoutId) {
      clearTimeout(toastData.timeoutId);
    }
    toastData.remainingTime = newOptions.duration;
    toastData.startTime = Date.now();
    toastData.timeoutId = setTimeout(() => dismissToast(toastId), newOptions.duration);
  }
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  activeToasts.forEach((_, toastId) => {
    dismissToast(toastId);
  });
}

/**
 * Convenience methods for different toast types
 */
export const toast = {
  success: (message, options = {}) => showToast(message, { ...options, type: 'success' }),
  error: (message, options = {}) => showToast(message, { ...options, type: 'error' }),
  warning: (message, options = {}) => showToast(message, { ...options, type: 'warning' }),
  info: (message, options = {}) => showToast(message, { ...options, type: 'info' }),
  loading: (message, options = {}) => showToast(message, { ...options, type: 'loading', duration: 0 }),
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
};

// Make toast available globally for easy access
if (typeof window !== 'undefined') {
  window.toast = toast;
  window.showToast = showToast;
}

export default toast;


