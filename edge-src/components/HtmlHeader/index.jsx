import React from 'react';
import { getViteAssetPath } from '../../common/ViteUtils';

export default class HtmlHeader extends React.Component {
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
        {/* Add lang attribute to parent HTML element */}
        <script dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = '${lang}';`
        }} />
        
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8"/>
        <title>{title}</title>
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {description && <meta name="description" content={description}/>}
        {scripts && scripts.map((js) => (
          <script key={js} type="module" src={getViteAssetPath(js, 'js')} defer/>
        ))}
        {styles && styles.map((css) => (
          <link 
            key={css} 
            rel="stylesheet" 
            type="text/css" 
            href={getViteAssetPath(css, 'css')}
            // Add cache control headers
            crossOrigin="anonymous"
          />
        ))}
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
        
        {/* Add security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff"/>
        
        {/* Add CSS compatibility styles */}
        <style>
          {`:root { text-size-adjust: 100%; -webkit-text-size-adjust: 100%; } * { -webkit-user-select: none; user-select: none; }`}
        </style>
      </head>
    );
  }
}
