// Development version of utils.js with all required exports
import * as originalUtils from './utils';

// Re-export all original exports
export * from './utils';

// Add missing exports that cause runtime errors
export const c = () => ({});

// Export a default for axios compatibility
export default {
  ...originalUtils,
  c: () => ({})
};

// Log when this module is used
console.warn('Using development utils module with patched exports');