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

// Load manifest in production
let manifest = null;

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

  // Base path is the same for both dev and prod
  const base = '/_app/immutable';
  const isEntry = ENTRY_POINTS.includes(name);

  // In development, use predictable paths
  if (isDev) {
    if (type === 'js') {
      return isEntry 
        ? `${base}/entry-${name}.js`
        : `${base}/chunks/${name}.js`;
    } else {
      return `${base}/assets/${finalName}.css`;
    }
  }

  // In production, try to load and use the manifest
  try {
    if (!manifest) {
      manifest = require('../../dist/.vite/manifest.json');
    }

    // Find the correct entry in the manifest
    let manifestKey;
    if (isEntry) {
      // For entry points, look up by source file
      manifestKey = `client-src/Client${name.charAt(0).toUpperCase() + name.slice(1)}App/index.jsx`;
    } else {
      // For chunks, look up by name
      manifestKey = Object.keys(manifest).find(key => {
        const entry = manifest[key];
        return entry.name === name && 
               entry.file && 
               entry.file.includes('chunks') &&
               !entry.isEntry;
      });
    }

    if (manifestKey && manifest[manifestKey]) {
      const entry = manifest[manifestKey];
      if (type === 'css' && entry.css && entry.css.length > 0) {
        return `/${entry.css[0]}`;
      }
      if (entry.file) {
        return `/${entry.file}`;
      }
    }
  } catch (e) {
    console.error('Failed to load or parse manifest:', e);
  }

  // Fallback to predictable paths if manifest lookup fails
  return `${base}/${
    type === 'js' ? (isEntry ? `entry-${name}` : `chunks/${name}`) : 
    `assets/${finalName}`
  }.${type}`;
}

// Export for testing
export const __testing = { getViteAssetPath, manifest };
