/**
 * Utility functions for handling accessibility concerns
 */

/**
 * Generates a unique ID for form fields if none is provided
 * @param prefix - Prefix for the generated ID
 * @param existingId - Existing ID if any
 * @returns The existing ID or a generated one
 */
export function ensureFieldId(prefix: string, existingId?: string): string {
  if (existingId) return existingId;
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

interface FieldProps {
  id?: string;
  name?: string;
  placeholder?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  [key: string]: any;
}

/**
 * Ensures a form field has required accessibility attributes
 * @param props - Component props
 * @param fieldType - Type of form field (e.g., 'input', 'select')
 * @returns Props with accessibility attributes added
 */
export function enhanceFieldAccessibility(props: FieldProps, fieldType: string): FieldProps {
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

interface LinkProps {
  title?: string;
  children?: string | React.ReactNode;
  className?: string;
  'aria-label'?: string;
  [key: string]: any;
}

/**
 * Enhances link accessibility by ensuring proper attributes
 * @param props - Link props
 * @returns Props with accessibility attributes added
 */
export function enhanceLinkAccessibility(props: LinkProps): LinkProps {
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

interface ImageProps {
  src?: string;
  alt?: string;
  [key: string]: any;
}

/**
 * Enhances image accessibility by ensuring alt text
 * @param props - Image props
 * @returns Props with accessibility attributes added
 */
export function enhanceImageAccessibility(props: ImageProps): ImageProps {
  const enhanced = { ...props };
  
  // Ensure alt text exists
  if (!enhanced.alt && enhanced.src) {
    const filename = enhanced.src.split('/').pop()?.split('.')[0] || '';
    enhanced.alt = filename.replace(/[_-]/g, ' ');
  }
  
  return enhanced;
}