// During development, assets are served directly by Vite
// In production, we need to use the manifest to get the correct hashed filenames

// Known entry points from vite.config.js
const ENTRY_POINTS = [
  'adminhome',
  'admincustomcode',
  'adminchannel',
  'adminitems',
  'adminsettings'
];

// More reliable environment detection for Cloudflare Workers
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  // Additional check for Cloudflare Pages preview environment
  !process.env.CF_PAGES;

// Base path for assets
const BASE_PATH = '/_app/immutable';

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

  // Clean up the name
  const cleanName = name.toLowerCase().replace('client', 'index');

  // Determine if this is an entry point
  const isEntry = ENTRY_POINTS.includes(name);

  // Build the path based on the type and whether it's an entry point
  let path;
  if (type === 'js') {
    path = isEntry 
      ? `${BASE_PATH}/entry-${cleanName}.js`
      : `${BASE_PATH}/chunks/${cleanName}.js`;
  } else {
    // CSS files
    path = `${BASE_PATH}/assets/${cleanName}.css`;
  }

  // Don't add hash placeholder - we'll use the actual filenames from the build
  if (false) {
    path = path.replace(/\.(js|css)$/, '.[hash].$1');
  }

  return path;
}

// Export for testing
export const __testing = { getViteAssetPath };
