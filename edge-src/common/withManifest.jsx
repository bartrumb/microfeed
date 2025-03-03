import React from 'react';
import { isDev, isPreviewMode } from './ManifestUtils';
import { manifestData as virtualManifest } from './manifest-virtual';

/**
 * Higher-order component that handles manifest loading for Edge components
 * @param {React.ComponentType} WrappedComponent - The component to wrap
 * @returns {React.ComponentType} The wrapped component with manifest handling
 */
export function withManifest(WrappedComponent) {
  return class WithManifest extends React.Component {
    render() {
      // In development or preview mode, we want to use non-hashed paths
      if (isDev || isPreviewMode) {
        return <WrappedComponent {...this.props} manifest={{}} />;
      }

      // Try to get manifest from props first
      let manifest = this.props.manifest;

      // If no manifest in props, try virtual module in Cloudflare Pages
      if (!manifest && process.env.CF_PAGES) {
        manifest = virtualManifest;
      }

      // If still no manifest, use empty object but log warning
      if (!manifest) {
        console.warn('No manifest data available');
        manifest = {
          // Add critical fallback entries
          '_app/immutable/chunks/utils.js': 'utils.js',
          '_app/immutable/chunks/react-vendor.js': 'react-vendor.js',
          '_app/immutable/chunks/ui-components.js': 'ui-components.js',
          '_app/immutable/chunks/constants.js': 'constants.js',
          '_app/immutable/assets/admin-styles.css': 'admin-styles.css'
        };
      }

      // In production, pass the manifest through
      return <WrappedComponent {...this.props} manifest={manifest} />;
    }
  };
}

/**
 * Higher-order component that handles manifest loading for Edge route handlers
 * @param {Function} handler - The route handler function
 * @returns {Function} The wrapped handler with manifest loading
 */
export function withRouteManifest(handler) {
  return async function(context) {
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