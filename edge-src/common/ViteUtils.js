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

  // Convert name to build format
  const buildName = name.toLowerCase()
    .replace('client', 'index');

  // Add _css suffix for CSS files
  const finalName = type === 'css' ? 
    `${buildName}_css` : buildName;

  // In development, use predictable paths
  if (isDev) {
    if (type === 'js') {
      // Handle JS chunks and entry points
      const isEntry = ENTRY_POINTS.includes(name);
      return isEntry ? `/${name}.${type}` : `/assets/chunks/${name}.${type}`;
    } else {
      // Handle CSS files
      return `/${finalName}.${type}`;
    }
  }

  // In production, use Cloudflare Pages structure
  const base = '/_app/immutable';
  const isEntry = ENTRY_POINTS.includes(name);
  
  let path;
  if (type === 'js') {
    path = isEntry ? `entries/${name}` : `chunks/${name}`;
  } else {
    path = `assets/${finalName}`;
  }
  return `${base}/${path}.${type}`;
}

// Export for testing
export const __testing = { getViteAssetPath };
