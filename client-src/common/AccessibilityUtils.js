/**
 * Utility functions for handling accessibility concerns
 */

/**
 * Generates a unique ID for form fields if none is provided
 * @param {string} prefix - Prefix for the generated ID
 * @param {string} [existingId] - Existing ID if any
 * @returns {string} The existing ID or a generated one
 */
export function ensureFieldId(prefix, existingId) {
  if (existingId) return existingId;
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Ensures a form field has required accessibility attributes
 * @param {Object} props - Component props
 * @param {string} fieldType - Type of form field (e.g., 'input', 'select')
 * @returns {Object} Props with accessibility attributes added
 */
export function enhanceFieldAccessibility(props, fieldType) {
  const enhanced = { ...props };
  
  // Ensure ID exists
  enhanced.id = ensureFieldId(fieldType, props.id);
  
  // Ensure name attribute exists
  if (!enhanced.name) {
    enhanced.name = enhanced.id;
  }
  
  // Add aria-label if no label is provided
  if (!enhanced['aria-label'] && !enhanced['aria-labelledby'] && enhanced.placeholder) {
    enhanced['aria-label'] = enhanced.placeholder;
  }
  
  return enhanced;
}

/**
 * Enhances link accessibility by ensuring proper attributes
 * @param {Object} props - Link props
 * @returns {Object} Props with accessibility attributes added
 */
export function enhanceLinkAccessibility(props) {
  const enhanced = { ...props };
  
  // Add title if not present
  if (!enhanced.title && typeof enhanced.children === 'string') {
    enhanced.title = enhanced.children;
  }
  
  // Add aria-label for icon-only links
  if (!enhanced['aria-label'] && !enhanced.title && enhanced.className?.includes('icon')) {
    enhanced['aria-label'] = 'Link with icon';
  }
  
  return enhanced;
}

/**
 * Enhances image accessibility by ensuring alt text
 * @param {Object} props - Image props
 * @returns {Object} Props with accessibility attributes added
 */
export function enhanceImageAccessibility(props) {
  const enhanced = { ...props };
  
  // Ensure alt text exists
  if (!enhanced.alt && enhanced.src) {
    const filename = enhanced.src.split('/').pop().split('.')[0];
    enhanced.alt = filename.replace(/[_-]/g, ' ');
  }
  
  return enhanced;
}