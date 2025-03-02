import React from 'react';
const isDev = process.env.NODE_ENV === 'development';

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
      return null; // Skip preload in development
    }
    return CRITICAL_CHUNKS.map(chunk => (
      <link 
        key={`preload-${chunk}`}
        rel="modulepreload"
        href={`/assets/client/chunks/${chunk}.js`}
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
          // In development, let Vite handle the paths
          const path = isDev
            ? `/${js}.js`
            : ENTRY_POINTS.includes(js)
              ? `/assets/client/${js}.js`
              : `/assets/client/chunks/${js}.js`;
          return <script key={js} type="module" src={path} crossOrigin="anonymous"/>;
        })}
        {styles && styles.map((css) => {
          // Remove any leading slashes and .css extension
          const name = css.replace(/^\//, '').replace(/\.css$/, '');
          return (
            <link 
              key={css} 
              rel="stylesheet" 
              type="text/css" 
              href={`/assets/${name}.css`}
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
