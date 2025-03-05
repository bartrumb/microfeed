import type { Manifest, ManifestEntry } from './ManifestUtils';

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
  // Note: Using require for compatibility with Vite's virtual modules
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  manifestData = require('../../dist/.vite/manifest.json');
} catch (e) {
  console.warn('Could not load manifest data:', e);
}

/**
 * Validates that a string is a valid entry point
 * @param name - The name to check
 * @returns True if the name is a valid entry point
 */
function isValidEntryPoint(name: string): name is EntryPoint {
  return ENTRY_POINTS.includes(name as EntryPoint);
}

/**
 * Get the appropriate asset path based on environment and asset type
 * @param name - Asset name without extension
 * @param type - Asset type (js or css)
 * @returns The resolved asset path
 * @throws Error if name is missing or type is invalid
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
  const isEntry = isValidEntryPoint(name);

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