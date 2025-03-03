import fs from 'fs';
import path from 'path';

// Use same environment detection as ViteUtils
export const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.CF_PAGES;

let manifestCache = null;

/**
 * Load the Vite manifest file
 * @param {string} relativePath - Path to the manifest relative to the calling file
 * @returns {Object|null} The manifest data or null if not found
 */
export function loadManifest(relativePath = '../../dist/.vite/manifest.json') {
  if (isDev) {
    return null;
  }

  if (manifestCache) {
    return manifestCache;
  }

  try {
    const manifestPath = path.resolve(__dirname, relativePath);
    if (fs.existsSync(manifestPath)) {
      manifestCache = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      return manifestCache;
    }
  } catch (e) {
    console.warn('Could not load manifest:', e);
  }

  return null;
}

/**
 * Get the file path from the manifest
 * @param {Object} manifest - The manifest data
 * @param {string} name - The name of the file
 * @param {string} type - The type of file (js or css)
 * @returns {string|null} The file path or null if not found
 */
export function getManifestPath(manifest, name, type = 'js') {
  if (!manifest) {
    return null;
  }

  const pattern = type === 'js' ? 
    new RegExp(`entry-${name}-[^.]+\\.js$`) :
    new RegExp(`${name}-[^.]+\\.css$`);

  const manifestKey = Object.keys(manifest).find(key => pattern.test(key));
  return manifestKey ? manifest[manifestKey].file : null;
}