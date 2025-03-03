// Environment detection for Cloudflare Pages
export const isDev = typeof window !== 'undefined' && 
  window.location.hostname === 'localhost' &&
  !process.env.REBUILD_WITH_MANIFEST;  // Allow using production paths in rebuild


// Special flag for preview deployments with disabled hashing
export const isPreviewMode = typeof process !== 'undefined' && 
  (
    process.env.VITE_DISABLE_HASH === 'true' ||
    (process.env.CF_PAGES && process.env.CF_PAGES_BRANCH !== 'main') ||
    process.env.PREVIEW === 'true'
  ) || (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('preview')
  );

// Detect Cloudflare Pages environment
export const isCloudflarePages = typeof process !== 'undefined' && 
  process.env.CF_PAGES === 'true' || (
    typeof window !== 'undefined' && window.location.hostname.endsWith('.pages.dev')
  );

const BASE_PATH = '/_app/immutable';

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

  // In preview mode with disabled hashing, use development paths
  if (isPreviewMode) {
    return getDevPath(name, type, isEntry);
  }

  // Direct lookup first - this handles our fallback manifest format
  if (manifest[name] && manifest[name].file) {
    return manifest[name].file;
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

  // For chunks, looking for a pattern like chunks/name-hash.js
  const namePattern = name.toLowerCase(); // Case-insensitive match
  const pattern = type === 'js' ?
    new RegExp(`chunks/${namePattern}-[^.]+\\.js$`, 'i') : 
    new RegExp(`assets/${name}-[^.]+\\.css$`);

  const manifestKey = Object.keys(manifest).find(key => {
    const entry = manifest[key];
    return entry.file && pattern.test(entry.file);
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
  if (type === 'js') {
    return isEntry 
      ? `${BASE_PATH}/entry-${name}.js`
      : `${BASE_PATH}/chunks/${name}.js`;
  }
  // CSS files are always in assets directory
  return `${BASE_PATH}/assets/${name === 'admin-styles' ? name : 'index'}.css`;
}

// Critical chunks that should only be loaded as chunks, not as entries
const CRITICAL_CHUNKS = ['react-vendor', 'utils', 'ui-components', 'constants', 'withManifest'];

/**
 * Get the asset path based on environment
 * @param {Object} manifest - The manifest data
 * @param {string} name - The name of the file
 * @param {string} type - The type of file (js or css)
 * @param {boolean} isEntry - Whether this is an entry point
 * @returns {string} The resolved path
 */
export function getAssetPath(manifest, name, type = 'js', isEntry = true) {
  // In preview mode or development, use non-hashed paths
  if (isPreviewMode) {
    // Special handling for critical chunks - never load them as entry points in preview mode
    if (CRITICAL_CHUNKS.includes(name) && isEntry) {
      console.log(`Preventing entry-point loading for ${name} in preview mode`);
      return getDevPath(name, type, false); // Force loading as chunk
    }
    return getDevPath(name, type, isEntry);
  }

  // Normal development mode
  if (isDev) {
    return getDevPath(name, type, isEntry);
  }

  // Try to get manifest from window if available
  const clientManifest = typeof window !== 'undefined' ? window.__MANIFEST__ : null;
  let manifestData = manifest || clientManifest || {};

  // In Cloudflare Pages production, try to load manifest from virtual module
  if (typeof process !== 'undefined' && process.env.CF_PAGES && !Object.keys(manifestData).length) {
    try {
      const { manifestData: virtualManifest } = require('./manifest-virtual');
      manifestData = virtualManifest;
    } catch (e) {
      console.warn('Failed to load virtual manifest:', e);
    }
  }

  const manifestPath = getManifestPath(manifestData, name, type, isEntry);
  if (!manifestPath) {
    console.warn(`Could not find ${name} in manifest for ${type}, using fallback path`);
    return getDevPath(name, type, isEntry);
  }

  return `/${manifestPath}`;
}