import fs from 'fs';
import path from 'path';

export interface ManifestEntry {
  file: string;
  src: string;
  isEntry?: boolean;
  css?: string[];
  assets?: string[];
}

export interface Manifest {
  [key: string]: ManifestEntry;
}

/**
 * Load the manifest file for route handlers
 * @param {string} dirname - The __dirname of the calling file
 * @returns {Object|null} The manifest data or null if not found
 */
export function loadRouteManifest(dirname: string): Manifest | null {
  let manifest: Manifest | null = null;
  try {
    // Walk up the directory tree to find the dist folder
    let currentDir: string = dirname;
    let distDir: string | null = null;
    
    while (currentDir !== path.parse(currentDir).root) {
      const potentialDist = path.join(currentDir, 'dist');
      if (fs.existsSync(potentialDist)) {
        distDir = potentialDist;
        break;
      }
      currentDir = path.dirname(currentDir);
    }

    if (distDir) {
      const manifestPath = path.join(distDir, '.vite/manifest.json');
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      }
    }
  } catch (e) {
    console.warn('Could not load manifest:', e);
  }

  return manifest;
}