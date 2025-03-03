// Environment detection for Cloudflare Pages
export const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' &&
  !process.env.PREVIEW &&
  !process.env.CF_PAGES;

/**
 * Get the file path from the manifest
 * @param {Object} manifest - The manifest data
 * @param {string} name - The name of the file
 * @param {string} type - The type of file (js or css)
 * @param {boolean} isEntry - Whether this is an entry point
 * @returns {string|null} The file path or null if not found
 */
export function getManifestPath(manifest, name, type = 'js', isEntry = true) {
  if (!manifest) {
    return null;
  }

  // For entry points, look for entry-name pattern
  if (isEntry) {
    const pattern = type === 'js' ? 
      new RegExp(`entry-${name}-[^.]+\\.js$`) :
      new RegExp(`${name}-[^.]+\\.css$`);

    const manifestKey = Object.keys(manifest).find(key => {
      const entry = manifest[key];
      return pattern.test(entry.file);
    });

    return manifestKey ? manifest[manifestKey].file : null;
  }

  // For chunks, look for chunks/name pattern
  const pattern = type === 'js' ? 
    new RegExp(`chunks/${name}-[^.]+\\.js$`) :
    new RegExp(`assets/${name}-[^.]+\\.css$`);

  const manifestKey = Object.keys(manifest).find(key => {
    const entry = manifest[key];
    return pattern.test(entry.file);
  });

  return manifestKey ? manifest[manifestKey].file : null;
}

/**
 * Get the development path for an asset
 * @param {string} name - The name of the file
 * @param {string} type - The type of file (js or css)
 * @param {boolean} isEntry - Whether this is an entry point
 * @returns {string} The development path
 */
export function getDevPath(name, type = 'js', isEntry = true) {
  const BASE_PATH = '/_app/immutable';
  
  if (type === 'js') {
    return isEntry 
      ? `${BASE_PATH}/entry-${name}.js`
      : `${BASE_PATH}/chunks/${name}.js`;
  }
  return `${BASE_PATH}/assets/${name}.css`;
}

/**
 * Get the asset path based on environment
 * @param {Object} manifest - The manifest data
 * @param {string} name - The name of the file
 * @param {string} type - The type of file (js or css)
 * @param {boolean} isEntry - Whether this is an entry point
 * @returns {string} The resolved path
 */
export function getAssetPath(manifest, name, type = 'js', isEntry = true) {
  if (isDev) {
    return getDevPath(name, type, isEntry);
  }

  // Try to get manifest from window if available
  const clientManifest = typeof window !== 'undefined' ? window.__MANIFEST__ : null;
  let manifestData = manifest || clientManifest || {};


// In Cloudflare Pages, try to load manifest from virtual module
  if (process.env.CF_PAGES && !Object.keys(manifestData).length) {
    try {
      const { manifestData: virtualManifest } = require('./manifest-virtual');
      manifestData = virtualManifest;
    } catch (e) {
      console.warn('Failed to load virtual manifest:', e);
    }
  }

  const manifestPath = getManifestPath(manifestData, name, type, isEntry);
  if (!manifestPath) {
    console.warn(`Could not find ${name} in manifest, using fallback path`);
    return getDevPath(name, type, isEntry);
  }

  return `/${manifestPath}`;
}