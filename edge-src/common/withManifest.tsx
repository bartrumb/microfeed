import React from 'react';
import { isDev, isPreviewMode, isCloudflarePages } from './ManifestUtils';
import { manifestData as virtualManifest } from './manifest-virtual';

// Define types for manifest data
export interface ManifestEntry {
  file: string;
}

export interface Manifest {
  [key: string]: ManifestEntry;
}

export interface WithManifestProps {
  manifest?: Manifest;
}

// Critical chunks that must be loaded before rendering
const CRITICAL_CHUNKS: Record<string, string> = {
  'utils': '_app/immutable/chunks/utils.js',
  'react-vendor': '_app/immutable/chunks/react-vendor.js',
  'ui-components': '_app/immutable/chunks/ui-components.js',
  'constants': '_app/immutable/chunks/constants.js',
  'admin-styles': '_app/immutable/assets/admin-styles.css'
};

/**
 * Create a manifest object from critical chunks
 */
function createManifestFromCriticalChunks(): Manifest {
  const manifest: Manifest = {};
  Object.entries(CRITICAL_CHUNKS).forEach(([key, path]) => {
    manifest[key] = { file: path };
  });
  return manifest;
}

/**
 * Higher-order component that handles manifest loading for Edge components
 * @param WrappedComponent - The component to wrap
 * @returns The wrapped component with manifest handling
 */
export function withManifest<P extends WithManifestProps>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithManifestProps>> {
  return class WithManifest extends React.Component<Omit<P, keyof WithManifestProps>> {
    render(): React.ReactNode {
      let manifest: Manifest;

      // Try to get manifest from props first
      manifest = (this.props as P).manifest || {};

      // If no manifest in props and in development/preview, use critical chunks
      if ((isDev || isPreviewMode) && Object.keys(manifest).length === 0) {
        console.log('Using development paths for assets');
        // Create manifest with non-hashed paths for development/preview
        // This ensures consistent asset loading across environments
        manifest = createManifestFromCriticalChunks();
        return <WrappedComponent {...(this.props as P)} manifest={manifest} />;
      }

      // If no manifest in props and in Cloudflare Pages, try virtual module
      if (Object.keys(manifest).length === 0 && isCloudflarePages) {
        manifest = virtualManifest as Manifest;
      }

      // If still no manifest, use critical chunks as fallback
      if (Object.keys(manifest).length === 0) {
        console.warn('No manifest data available, using critical chunks');
        manifest = createManifestFromCriticalChunks();
      }

      // Pass the resolved manifest to the wrapped component
      return <WrappedComponent {...(this.props as P)} manifest={manifest} />;
    }
  };
}

// Define types for route handler context
export interface RouteContext {
  data: Record<string, any>;
  [key: string]: any;
}

/**
 * Higher-order component that handles manifest loading for Edge route handlers
 * @param handler - The route handler function
 * @returns The wrapped handler with manifest loading
 */
export function withRouteManifest(
  handler: (context: RouteContext) => Promise<Response>
): (context: RouteContext) => Promise<Response> {
  return async function(context: RouteContext): Promise<Response> {
    let manifest: Manifest = createManifestFromCriticalChunks();

    // In development or preview mode, use critical chunks manifest
    if (isDev || isPreviewMode) {
      const { data, ...rest } = context;
      return handler({
        ...rest,
        data: {
          ...data,
          manifest
        }
      });
    }
    
    // Try to get manifest from virtual module in Cloudflare Pages
    if (process.env.CF_PAGES) {
      try {
        manifest = virtualManifest as Manifest;
      } catch (e) {
        console.warn('Failed to load virtual manifest:', e);
        // Use critical chunks as fallback
        manifest = createManifestFromCriticalChunks();
      }
    }

    // Add manifest to the data
    const { data, ...rest } = context;
    return handler({
      ...rest,
      data: {
        ...data,
        manifest
      }
    });
  };
}