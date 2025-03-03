/**
 * Core utility functions with proper TypeScript types and exports
 */
import { default as slugifyLib } from 'slugify';
import { htmlToText } from 'html-to-text';

// Re-export with explicit names to prevent minification issues
export const slugify = slugifyLib;
export const convertHtmlToText = htmlToText;

// Add the 'c' export that's needed by ui-components
// This should be properly typed and documented
export const c = (): Record<string, unknown> => ({});

// Re-export other utilities with explicit names
export * from './BrowserUtils';
export * from './ClientUrlUtils';
export * from './ToastUtils';
export * from '@common/StringUtils';
export * from '@common/TimeUtils';

// Export a default for compatibility
const utils = {
  slugify,
  convertHtmlToText,
  c
};

export default utils;