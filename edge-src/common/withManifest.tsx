import React from 'react';
import { isDev, isPreviewMode } from './ManifestUtils';
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
      // In development or preview mode, we want to use non-hashed paths
      if (isDev || isPreviewMode) {
        return <WrappedComponent {...(this.props as P)} manifest={{}} />;
      }

      // Try to get manifest from props first
      let manifest = (this.props as P).manifest;

      // If no manifest in props, try virtual module in Cloudflare Pages
      if (!manifest && process.env.CF_PAGES) {
        manifest = virtualManifest;
      }

      // If still no manifest, use empty object but log warning
      if (!manifest) {
        console.warn('No manifest data available');
        manifest = {
          // Add critical fallback entries with proper file structure
          'utils': { file: '_app/immutable/chunks/utils.js' },
          'react-vendor': { file: '_app/immutable/chunks/react-vendor.js' },
          'ui-components': { file: '_app/immutable/chunks/ui-components.js' },
          'constants': { file: '_app/immutable/chunks/constants.js' },
          'admin-styles': { file: '_app/immutable/assets/admin-styles.css' }
        };
        console.log('Using fallback manifest:', manifest);
      }

      // In production, pass the manifest through
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
    // Pass through in development or preview mode
    if (isDev || isPreviewMode) {
      // In preview mode, add an empty manifest to prevent the HTML generator
      // from trying to use hashed paths which don't exist
      if (isPreviewMode) {
        const { data, ...rest } = context;
        return handler({
          ...rest,
          data: {
            ...data,
            manifest: {}
          }
        });
      }
      return handler(context);
    }
    
    // Get manifest data
    let manifest = {};
    
    // Try to get manifest from virtual module in Cloudflare Pages
    if (process.env.CF_PAGES) {
      try {
        manifest = virtualManifest;
      } catch (e) {
        console.warn('Failed to load virtual manifest:', e);
      }
    }

    // In production, add manifest to the data
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