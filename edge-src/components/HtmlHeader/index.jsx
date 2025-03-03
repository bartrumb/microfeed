import React from 'react';
import { isDev, getAssetPath, getDevPath } from '../../common/ManifestUtils';

// Critical chunks that should be preloaded
const CRITICAL_CHUNKS = {
  'react-vendor': '_app/immutable/chunks/react-vendor.js',
  'utils': '_app/immutable/chunks/utils.js',
  'ui-components': '_app/immutable/chunks/ui-components.js',
  'constants': '_app/immutable/chunks/constants.js',
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

    // Filter out critical chunks from scripts to prevent duplicate loading
    const filteredScripts = scripts.filter(name => !Object.keys(CRITICAL_CHUNKS).includes(name));

    // Generate script paths for entry points
    const scriptPaths = filteredScripts.map(name => 
      getAssetPath(manifestData, name, 'js', true)
    ).filter(Boolean);

    // Get critical chunk paths (they should ONLY be loaded as chunks, not as entries)
    const criticalPaths = Object.values(CRITICAL_CHUNKS);

    // Generate style paths
    const stylePaths = styles.map(name => 
      getAssetPath(manifest, name, 'css', false)
    ).filter(Boolean);

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

        {/* Load critical chunks first */}
        {criticalPaths.map(path => {
          if (path.endsWith('.css')) {
            return (
              <link
                key={path}
                rel="stylesheet"
                type="text/css"
                href={`/${path}`}
                crossOrigin="anonymous"
              />
            );
          }
          return (
            <script
              key={path}
              type="module"
              src={`/${path}`}
              crossOrigin="anonymous"
            />
          );
        })}

        {/* Then load entry points */}
        {scriptPaths.map(path => (
          <script
            key={path}
            type="module"
            src={path}
            crossOrigin="anonymous"
          />
        ))}

        {/* Load additional styles */}
        {stylePaths.map(path => (
          <link
            key={path}
            rel="stylesheet"
            type="text/css"
            href={path}
            crossOrigin="anonymous"
          />
        ))}

        {/* Favicon */}
        {favicon && favicon['apple-touch-icon'] && (
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={favicon['apple-touch-icon']}
          />
        )}
        {favicon && favicon['32x32'] && (
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={favicon['32x32']}
          />
        )}
        {favicon && favicon['16x16'] && (
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={favicon['16x16']}
          />
        )}
        {favicon && favicon['manifest'] && (
          <link
            rel="manifest"
            href={favicon['manifest']}
          />
        )}
        {favicon && favicon['theme-color'] && (
          <meta
            name="theme-color"
            content={favicon['theme-color']}
          />
        )}
        {favicon && favicon['msapplication-TileColor'] && (
          <meta
            name="msapplication-TileColor"
            content={favicon['msapplication-TileColor']}
          />
        )}
        {favicon && favicon['mask-icon'] && favicon['mask-icon'].href && favicon['mask-icon'].color && (
          <link
            rel="mask-icon"
            href={favicon['mask-icon'].href}
            color={favicon['mask-icon'].color}
          />
        )}
      </head>
    );
  }
}
