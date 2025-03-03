import React from 'react';
import { isDev, getAssetPath, getDevPath } from '../../common/ManifestUtils';

// Critical chunks that should be preloaded
const CRITICAL_CHUNKS = {
  'react-vendor': '_app/immutable/chunks/react-vendor.js',
  'utils': '_app/immutable/chunks/utils.js',
  'ui-components': '_app/immutable/chunks/ui-components.js',
  'constants': '_app/immutable/chunks/Constants.js',
  'withManifest': '_app/immutable/chunks/withManifest.js',
  'admin-styles': '_app/immutable/assets/admin-styles.css'
};

export default class HtmlHeader extends React.Component {
  render() {
    const {
      title,
      description,
      scripts,
      styles,
      favicon,
      canonicalUrl,
      manifest = {},
      lang = 'en',
    } = this.props;

    
    // Get manifest data
    const manifestData = typeof manifest === 'object' && manifest !== null ? manifest : {};

    // Make sure we only include scripts that aren't critical chunks
    // This prevents duplicate loading of the same JS file
    const filteredScripts = scripts.map(name => `_app/immutable/entry-${name}.js`);

    // Generate script paths for entry points
    const scriptPaths = filteredScripts.map(name => 
      getAssetPath(manifestData, name, 'js', true)
    ).filter(Boolean);

    // Generate critical chunk paths (they should ONLY be loaded as chunks, not as entries)
    const criticalPaths = Object.values(CRITICAL_CHUNKS);

    // Generate style paths
    const stylePaths = styles.map(name => 
      getAssetPath(manifest, name, 'css', false)
    ).filter(Boolean);

    // Get admin styles path if needed
    const adminStylesPath = CRITICAL_CHUNKS['admin-styles'];

    return (
      <head>
        <meta charSet="utf-8"/>
        <title>{title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {description && <meta name="description" content={description}/>}

        {/* Inject manifest data for client-side use */}
        <script dangerouslySetInnerHTML={{
          __html: `window.__MANIFEST__ = ${JSON.stringify(manifestData)};`
        }} />

        {/* 
          Only load critical chunks - don't try to load them as entry points
          The entry point versions don't exist in the build output
          They exist only as chunks
        */}
        {criticalPaths.map(path => (
          <script key={path} type="module" src={`/${path}`} crossOrigin="anonymous" />
        ))}

        {/* Then load entry points */}
        {scriptPaths.map(path => (
          <script key={path} type="module" src={path} crossOrigin="anonymous"/>
        ))}

        {stylePaths.map(path => (
          <link
            key={path} 
            rel="stylesheet" 
            type="text/css"
            href={path}
            crossOrigin="anonymous"
          />
        ))}

        {/* Admin styles */}
        {adminStylesPath && (
          <link
            key="admin-styles"
            rel="stylesheet"
            type="text/css"
            href={`/${adminStylesPath}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Favicon */}
        {favicon && favicon['apple-touch-icon'] && <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={favicon['apple-touch-icon']}
        />}
        {favicon && favicon['32x32'] && <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={favicon['32x32']}
        />}
        {favicon && favicon['16x16'] && <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={favicon['16x16']}
        />}
        {favicon && favicon['manifest'] && <link
          rel="manifest"
          href={favicon['manifest']}
        />}
        {favicon && favicon['theme-color'] && <meta
          name="theme-color"
          content={favicon['theme-color']}
        />}
        {favicon && favicon['msapplication-TileColor'] && <meta
          name="msapplication-TileColor"
          content={favicon['msapplication-TileColor']}
        />}
        {favicon && favicon['mask-icon'] && favicon['mask-icon'].href && favicon['mask-icon'].color && <link
          rel="mask-icon"
          href={favicon['mask-icon'].href}
          color={favicon['mask-icon'].color}
        />}
      </head>
    );
  }
}
