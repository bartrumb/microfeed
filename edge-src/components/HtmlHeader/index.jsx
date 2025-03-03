import React from 'react';
import { isDev, getManifestPath } from '../common/ManifestUtils';

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
      manifest,
      lang = 'en',
    } = this.props;

    // In production, use the actual filenames from the build
    const scriptPaths = scripts.map(name => {
      if (isDev) {
        return `/_app/immutable/entry-${name}.js`;
      }
      const filePath = getManifestPath(manifest, name, 'js');
      return filePath ? `/${filePath}` : `/_app/immutable/entry-${name}.js`;
    });

    const criticalPaths = CRITICAL_CHUNKS.map(name => {
      if (isDev) {
        return `/_app/immutable/chunks/${name}.js`;
      }
      const filePath = getManifestPath(manifest, name, 'js');
      return filePath ? `/${filePath}` : `/_app/immutable/chunks/${name}.js`;
    });

    const stylePaths = styles.map(name => {
      if (isDev) {
        return `/_app/immutable/assets/${name}.css`;
      }
      const filePath = getManifestPath(manifest, name, 'css');
      return filePath ? `/${filePath}` : `/_app/immutable/assets/${name}.css`;
    });

    return (
      <head>
        <meta charSet="utf-8"/>
        <title>{title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {description && <meta name="description" content={description}/>}
        
        {/* Load critical chunks first */}
        {criticalPaths.map(path => (
          <script key={path} type="module" src={path} crossOrigin="anonymous"/>
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

        {/* Preload critical chunks */}
        {criticalPaths.map(path => (
          <link 
            key={`preload-${path}`}
            rel="modulepreload"
            href={path}
            crossOrigin="anonymous"
          />
        ))}

        {/* Admin styles */}
        <link
          key="admin-styles"
          rel="stylesheet"
          type="text/css"
          href={isDev ? '/_app/immutable/assets/admin-styles.css' : `/${getManifestPath(manifest, 'admin-styles', 'css') || 'admin-styles.css'}`}
          crossOrigin="anonymous"
        />

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
