/**
 * Haptic Feedback Utility for Farcaster Mini Apps
 * Provides vibration feedback for enhanced user experience
 */

// Haptic feedback types supported by Farcaster SDK
export const HapticType = {
  IMPACT_LIGHT: 'impact_light',
  IMPACT_MEDIUM: 'impact_medium', 
  IMPACT_HEAVY: 'impact_heavy',
  NOTIFICATION_SUCCESS: 'notification_success',
  NOTIFICATION_WARNING: 'notification_warning',
  NOTIFICATION_ERROR: 'notification_error',
  SELECTION_CHANGED: 'selection_changed'
};

// Check if running in Farcaster Mini App context
function isFarcasterContext() {
  return typeof window !== 'undefined' && 
         window.farcasterSdk && 
         typeof window.farcasterSdk.hapticFeedback === 'function';
}

// Check if Web Vibration API is available
function hasVibrationAPI() {
  return typeof navigator !== 'undefined' && 
         typeof navigator.vibrate === 'function';
}

/**
 * Trigger haptic feedback
 * @param {string} type - Type of haptic feedback from HapticType
 * @returns {Promise<boolean>} - Whether haptic was triggered
 */
export async function triggerHaptic(type = HapticType.IMPACT_LIGHT) {
  try {
    // Try Farcaster SDK first
    if (isFarcasterContext()) {
      await window.farcasterSdk.hapticFeedback(type);
      console.log(`[Haptics] Farcaster haptic triggered: ${type}`);
      return true;
    }

    // Fallback to Web Vibration API
    if (hasVibrationAPI()) {
      const vibrationPattern = getVibrationPattern(type);
      navigator.vibrate(vibrationPattern);
      console.log(`[Haptics] Web vibration triggered: ${type}`);
      return true;
    }

    console.log('[Haptics] No haptic support available');
    return false;
  } catch (error) {
    console.warn('[Haptics] Error triggering haptic:', error);
    return false;
  }
}

/**
 * Get vibration pattern for Web Vibration API based on haptic type
 * @param {string} type - Haptic type
 * @returns {number|number[]} - Vibration pattern in milliseconds
 */
function getVibrationPattern(type) {
  switch (type) {
    case HapticType.IMPACT_LIGHT:
      return 10;
    case HapticType.IMPACT_MEDIUM:
      return 25;
    case HapticType.IMPACT_HEAVY:
      return 50;
    case HapticType.NOTIFICATION_SUCCESS:
      return [10, 50, 10]; // Two quick pulses
    case HapticType.NOTIFICATION_WARNING:
      return [30, 50, 30]; // Two medium pulses
    case HapticType.NOTIFICATION_ERROR:
      return [50, 100, 50, 100, 50]; // Three strong pulses
    case HapticType.SELECTION_CHANGED:
      return 5;
    default:
      return 10;
  }
}

// Convenience methods for common haptic patterns
export const haptics = {
  /**
   * Light tap feedback - for button presses
   */
  tap: () => triggerHaptic(HapticType.IMPACT_LIGHT),
  
  /**
   * Medium impact - for important actions
   */
  impact: () => triggerHaptic(HapticType.IMPACT_MEDIUM),
  
  /**
   * Heavy impact - for significant events
   */
  heavyImpact: () => triggerHaptic(HapticType.IMPACT_HEAVY),
  
  /**
   * Success feedback - for completed actions
   */
  success: () => triggerHaptic(HapticType.NOTIFICATION_SUCCESS),
  
  /**
   * Warning feedback - for caution states
   */
  warning: () => triggerHaptic(HapticType.NOTIFICATION_WARNING),
  
  /**
   * Error feedback - for failed actions
   */
  error: () => triggerHaptic(HapticType.NOTIFICATION_ERROR),
  
  /**
   * Selection change - for menu/option changes
   */
  selection: () => triggerHaptic(HapticType.SELECTION_CHANGED),
  
  /**
   * Game-specific: Pac-Man eats dot
   */
  eatDot: () => triggerHaptic(HapticType.IMPACT_LIGHT),
  
  /**
   * Game-specific: Pac-Man eats power pellet
   */
  eatPowerPellet: () => triggerHaptic(HapticType.IMPACT_MEDIUM),
  
  /**
   * Game-specific: Pac-Man eats ghost
   */
  eatGhost: () => triggerHaptic(HapticType.IMPACT_HEAVY),
  
  /**
   * Game-specific: Pac-Man dies
   */
  death: () => triggerHaptic(HapticType.NOTIFICATION_ERROR),
  
  /**
   * Game-specific: Level complete
   */
  levelComplete: () => triggerHaptic(HapticType.NOTIFICATION_SUCCESS),
  
  /**
   * Game-specific: Game over
   */
  gameOver: () => triggerHaptic(HapticType.NOTIFICATION_WARNING),
  
  /**
   * Score submission started
   */
  scoreSubmitStart: () => triggerHaptic(HapticType.IMPACT_LIGHT),
  
  /**
   * Score submission success
   */
  scoreSubmitSuccess: () => triggerHaptic(HapticType.NOTIFICATION_SUCCESS),
  
  /**
   * Score submission error
   */
  scoreSubmitError: () => triggerHaptic(HapticType.NOTIFICATION_ERROR)
};

// Export default for convenience
export default haptics;

