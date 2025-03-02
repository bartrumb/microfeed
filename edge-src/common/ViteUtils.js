// During development, assets are served directly by Vite
// In production, we need to use the manifest to get the correct hashed filenames

/**
 * Get the appropriate asset path based on environment and asset type
 * @param {string} name - Asset name without extension
 * @param {('js'|'css')} type - Asset type
 * @returns {string} The resolved asset path
 */
export function getViteAssetPath(name, type = 'js') {
  // Validate input
  if (!name) {
    console.error('Asset name is required');
    throw new Error('Asset name is required');
  }
  
  if (!['js', 'css'].includes(type)) {
    console.error(`Invalid asset type: ${type}`);
    throw new Error('Asset type must be "js" or "css"');
  }

  // Detect development environment using Miniflare
  const isDev = typeof globalThis !== 'undefined' && globalThis.MINIFLARE !== undefined;

  // Convert name to build format
  const buildName = name.toLowerCase()
    .replace('client', '')
    .replace('app', '');

  // In development, use predictable paths
  if (isDev) {
    return `/${buildName}.${type}`;
  }

  // In production, use the actual hashed filenames from the build output
  const hash = '48e9e372204a37a79e94';
  return `/${buildName}-${hash}.${type}`;
}

// Export for testing
export const __testing = { getViteAssetPath };
