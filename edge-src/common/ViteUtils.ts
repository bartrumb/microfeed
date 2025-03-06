// During development, assets are served directly by Vite
// In production, we need to use the manifest to get the correct hashed filenames

import { Manifest, ManifestEntry } from './RouteUtils';

// Known entry points from vite.config.js
const ENTRY_POINTS = [
  'adminhome',
  'admincustomcode',
  'adminchannel',
  'adminitems',
  'adminsettings',
  'withManifest'
] as const;

type EntryPoint = typeof ENTRY_POINTS[number];
type AssetType = 'js' | 'css';

// Match the same environment detection logic from ManifestUtils.js for consistency
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.REBUILD_WITH_MANIFEST && // Allow using production paths in rebuild
  !process.env.PREVIEW &&
  !process.env.CF_PAGES;

// Base path for assets
const BASE_PATH = '/_app/immutable';

// Load manifest data
let manifestData: Manifest | null = null;
try {
  manifestData = require('../../dist/.vite/manifest.json');
} catch (e) {
  console.warn('Could not load manifest data:', e);
}

/**
 * Get the appropriate asset path based on environment and asset type
 * @param {string} name - Asset name without extension
 * @param {('js'|'css')} type - Asset type
 * @returns {string} The resolved asset path
 */
export function getViteAssetPath(name: string, type: AssetType = 'js'): string {
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
  let cleanName = name.toLowerCase().replace('client', 'index');
  
  // Special case for withManifest component
  if (cleanName === 'withmanifest') {
    return type === 'js' ? `${BASE_PATH}/chunks/withManifest.js` : `${BASE_PATH}/assets/index.css`;
  }

  // Determine if this is an entry point
  const isEntry = ENTRY_POINTS.includes(cleanName as EntryPoint);

  // In development, use non-hashed paths
  if (isDev) {
    if (type === 'js') {
      return isEntry 
        ? `${BASE_PATH}/entry-${cleanName}.js`
        : `${BASE_PATH}/chunks/${cleanName}.js`;
    }
    return `${BASE_PATH}/assets/${cleanName}.css`;
  }

  // In production, try to find the file in the manifest
  if (manifestData) {
    // For JS files
    if (type === 'js') {
      const entryKey = isEntry ? `entry-${cleanName}` : cleanName;
      const manifestKey = Object.keys(manifestData).find(key => 
        key.includes(entryKey) && key.endsWith('.js')
      );
      if (manifestKey) {
        return `/${manifestData[manifestKey].file}`;
      }
    }
    
    // For CSS files
    if (type === 'css') {
      const manifestKey = Object.keys(manifestData).find(key => 
        key.includes(cleanName) && key.endsWith('.css')
      );
      if (manifestKey) {
        return `/${manifestData[manifestKey].file}`;
      }
    }
  }

  // Fallback to non-hashed paths
  console.warn(`Could not find ${name} in manifest, using fallback path`);
  if (type === 'js') {
    return isEntry 
      ? `${BASE_PATH}/entry-${cleanName}.js`
      : `${BASE_PATH}/chunks/${cleanName}.js`;
  }
  return `${BASE_PATH}/assets/${cleanName}.css`;
}

// Export for testing
export const __testing = { getViteAssetPath };
