import React from 'react';
import { isDev, getAssetPath } from '../../common/ManifestUtils';

// Critical chunks that should be preloaded
const CRITICAL_CHUNKS = [
  'react-vendor',
  'utils',
  'ui-components',
  'constants'
];

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
    const manifestData = manifest || {};

    // Generate script paths for entry points
    const scriptPaths = scripts.map(name => 
      getAssetPath(manifestData, name, 'js', true)
    ).filter(Boolean);

    // Generate critical chunk paths - these are NOT entry points
    const criticalPaths = CRITICAL_CHUNKS.map(name => 
      getAssetPath(manifestData, name, 'js', false)
    ).filter(Boolean);

    // Get additional chunks from manifest dependencies
    const dependencyPaths = Object.values(manifestData)
      .filter(entry => 
        entry.file && 
        entry.file.includes('chunks/') && 
        !criticalPaths.includes('/' + entry.file) &&
        !entry.isEntry
      )
      .map(entry => entry.file);

    // Generate style paths
    const stylePaths = styles.map(name => 
      getAssetPath(manifest, name, 'css', false)
    ).filter(Boolean);

    // Get admin styles path if needed
    const adminStylesPath = getAssetPath(manifest, 'admin-styles', 'css', false);

    return (
      <head>
        <meta charSet="utf-8"/>
        <title>{title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {description && <meta name="description" content={description}/>}

        {/* Inject manifest data for client-side use */}
        {!isDev && (
          <script dangerouslySetInnerHTML={{
            __html: `window.__MANIFEST__ = ${JSON.stringify(manifestData)};`
          }} />
        )}

        {/* Load critical chunks first */}
        {criticalPaths.map(path => (
          <script key={path} type="module" src={path} crossOrigin="anonymous" />
        ))}

        {/* Then load entry points */}
        {scriptPaths.map(path => (
          <script key={path} type="module" src={path} crossOrigin="anonymous"/>
        ))}

        {/* Load styles */}
        {stylePaths.map(path => (
          <link
            key={path} 
            rel="stylesheet" 
            type="text/css"
            href={path}
            crossOrigin="anonymous"
          />
        ))}

        {/* Load additional chunks */}
        {dependencyPaths.map(path => (
          <script key={path} type="module" src={`/${path}`} crossOrigin="anonymous" />
        ))}

        {/* Admin styles */}
        {adminStylesPath && (
          <link
            key="admin-styles"
            rel="stylesheet"
            type="text/css"
            href={adminStylesPath}
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
