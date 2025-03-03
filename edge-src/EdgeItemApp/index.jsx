import React from 'react';
import HtmlHeader from "../components/HtmlHeader";
import {htmlMetaDescription} from "../../common-src/StringUtils";

// Use same environment detection as ViteUtils
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.CF_PAGES;

export default class EdgeItemApp extends React.Component {
  render() {
    const {item, theme, jsonData, canonicalUrl} = this.props;
    const {html} = theme.getWebItem(item);
    return (
      <html lang={jsonData.language || 'en'}>
      <HtmlHeader
        title={item.title}
        description={htmlMetaDescription(item.content_text, false)}
        scripts={isDev ? [] : []}
        styles={[]}
        canonicalUrl={canonicalUrl}
        favicon={{
          // 'apple-touch-icon': '/assets/apple-touch-icon.png',
          // '32x32': '/assets/favicon-32x32.png',
          // '16x16': '/assets/favicon-16x16.png',
          // 'manifest': '/assets/site.webmanifest',
          // 'mask-icon': {
          //   'href': '/assets/safari-pinned-tab.svg',
          //   'color': '#b82f00',
          // },
          // 'msapplication-TileColor': '#da532c',
          // 'theme-color': '#ffffff',
        }}
      />
      <body>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </body>
      </html>
    );
  }
}
