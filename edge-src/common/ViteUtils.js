// During development, assets are served directly by Vite
// In production, we need to use the manifest to get the correct hashed filenames

// Detect development environment using Miniflare
const isDev = typeof globalThis !== 'undefined' && globalThis.MINIFLARE !== undefined;

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

  // In development, use predictable paths
  if (isDev) {
    return `/assets/${name}.${type}`;
  }

  // In production, use the actual hashed filenames from the build output
  const path = `/assets/${name}-[hash].${type}`;

  console.log('Asset path:', {
    name,
    type,
    path,
    isDev,
    timestamp: new Date().toISOString()
  });
  return path;
}
