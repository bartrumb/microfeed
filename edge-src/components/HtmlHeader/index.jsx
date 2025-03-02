import React from 'react';
import { getViteAssetPath } from '../../common/ViteUtils';

// Use same environment detection as ViteUtils
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.CF_PAGES;

// Critical chunks that should be preloaded
const CRITICAL_CHUNKS = [
  'react-vendor',
  'utils',
  'ui-components'
];

// Known entry points from vite.config.js
const ENTRY_POINTS = ['adminhome',
  'admincustomcode',
  'adminchannel',
  'adminitems',
  'adminsettings'];

export default class HtmlHeader extends React.Component {
  renderPreloadLinks() {
    if (isDev) {
      return null; // Skip preloading in development mode
    }
    return CRITICAL_CHUNKS.map(chunk => (
      <link 
        key={`preload-${chunk}`}
        rel="modulepreload"
        href={getViteAssetPath(chunk, 'js')}
        crossOrigin="anonymous"
      />
    ));
  }

  render() {
    const defaultLang = 'en'; // Default to English
    const {
      title,
      description,
      scripts,
      styles,
      favicon,
      canonicalUrl,
      manifest,
      lang = defaultLang,
    } = this.props;

    return (
      <head>
        <meta charSet="utf-8"/>
        <title>{title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {description && <meta name="description" content={description}/>}
        {scripts && scripts.map((js) => {
          const path = getViteAssetPath(js, 'js');
          return <script key={js} type="module" src={path} crossOrigin="anonymous"/>;
        })}
        {styles && styles.map((css) => {
          const name = css.replace(/^\//, '').replace(/\.css$/, ''); // Clean the CSS filename
          return (
            <link 
              key={css} 
              rel="stylesheet" 
              type="text/css"
              href={getViteAssetPath(name, 'css')}
              crossOrigin="anonymous"
            />
          );
        })}
        {this.renderPreloadLinks()}
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
