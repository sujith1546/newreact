/**
 * Native Haptic Feedback Engine
 * Lightweight, safe vibration pattern triggers for mobile web interactions.
 */

export const haptic = {
  // Light tap for bottom nav tab switches and icon clicks
  light: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) {}
    }
  },

  // Medium feedback for drawer toggles, modals, and dropdowns
  medium: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(22); } catch (e) {}
    }
  },

  // Heavy feedback for key settings toggles or dev mode actions
  heavy: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch (e) {}
    }
  },

  // Multi-step pulse cadence for successful copy / contact form send
  success: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([10, 30, 15]); } catch (e) {}
    }
  },

  // Double pulse for warning or cancel actions
  warning: () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([20, 40, 20]); } catch (e) {}
    }
  }
};

export default haptic;
