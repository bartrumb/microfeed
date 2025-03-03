/**
 * Core utility functions with proper TypeScript types and exports
 */
import slugify from 'slugify';
import { htmlToText } from 'html-to-text';

// Export slugify directly to maintain function reference
export { slugify };
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