import {CODE_TYPES, SETTINGS_CATEGORIES} from "../../common-src/Constants";
import {CODE_FILES} from "../../common-src/Constants";

const Mustache = require('mustache');

// Default templates
const DEFAULT_WEB_HEADER = `<style>
  /* Inspired by https://www.swyx.io/css-100-bytes */
  html {
    max-width: 70ch;
    padding: 1.5em 0.2em;
    margin: auto;
    line-height: 1.75;
    font-size: 1em;
    color: #24292f;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  section {
    margin-bottom: 4em;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.25em;
  }

  p, ul, ol {
    margin-top: 0;
    margin-bottom: 0.5em;
  }

  a, a:visited {
    color: #0997cc;
    text-decoration: none;
    font-weight: 500;
  }

  a:hover {
    opacity: 65%;
  }

  img {
    max-width: 100%;
  }

  /* Some css classes */
  .flex {
    display: flex;
  }

  .flex-none {
    flex: none;
  }

  .flex-1 {
    flex: 1;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .px-2 {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }

  .mb-1 {
    margin-bottom: 0.25em;
  }

  .mb-2 {
    margin-bottom: 0.5em;
  }

  .mb-4 {
    margin-bottom: 1em;
  }

  .mt-2 {
    margin-top: 0.5em;
  }

  .mt-4 {
    margin-top: 1em;
  }

  .ml-1 {
    margin-left: 0.25em;
  }

  .mr-4 {
    margin-right: 1em;
  }

  .one-line {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .text-sm {
    font-size: 0.8em;
  }

  .text-lg {
    font-size: 1.25em;
  }

  .img-lg {
    max-width: 7.5em;
    border-radius: 0.8em;
    box-shadow: 0.2em 0.2em 0.2em #DCDCDC;
  }

  .img-md {
    max-width: 3.5em;
    border-radius: 0.2em;
    box-shadow: 0.1em 0.1em 0.1em #DCDCDC;
  }

  .img-sm {
    max-width: 1em;
    border-radius: 0.2em;
  }

  .border-t {
    border-top: 1px solid #DCDCDC;
  }

  .border-b {
    border-bottom: 1px solid #DCDCDC;
  }

  .text-center {
    text-align: center;
  }

  .w-full {
    width: 100%;
  }

  .font-bold {
    font-weight: bold;
  }

  @media only screen and (max-width: 600px) {
    .hide-mobile {
      display: none;
    }
  }

  .icon-arrow-left:before {
    content: "←";
  }

  .icon-arrow-right:before {
    content: "→";
  }
</style>

<!-- Lazy load images -->
<style>
  @keyframes backgroundColorPalette {
    0% {
      background: #DCDCDC;
    }
    25% {
      background: #D3D3D3;
    }
    50% {
      background: #778899;
    }
    75% {
      background: #D3D3D3;
    }
    100% {
      background: #DCDCDC;
    }
  }

  .loader {
    width: 100%;
    height: 20em;
    background-color: #DCDCDC;
    animation-name: backgroundColorPalette;
    animation-duration: 10s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
</style>
<script>
  document.addEventListener('DOMContentLoaded', function () {

    let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          const newImage = document.createElement('img');
          newImage.src = lazyImage.dataset.src;
          newImage.onload = function () {
            lazyImage.classList.remove("loader");
            const wrapper = document.createElement('a');
            wrapper.setAttribute('href', newImage.src);
            wrapper.setAttribute('target', "_blank");
            wrapper.appendChild(newImage.cloneNode(true));
            if (lazyImage.parentElement) {
              lazyImage.parentElement.replaceChild(wrapper, lazyImage);
              lazyImage.remove();
            }
          };
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    const images = document.querySelectorAll('img:not([loading=lazy])');
    for (let i = 0; i < images.length; i++) {
      images[i].dataset.src = images[i].src;
      images[i].classList.add('loader');
      images[i].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP88eNnPQAJQwNqJHSUZQAAAABJRU5ErkJggg==";
      lazyImageObserver.observe(images[i]);
    }

  }, false);
</script>`;

const DEFAULT_WEB_BODY_END = `</body></html>`;

const DEFAULT_WEB_BODY_START = `<body>`;

const DEFAULT_WEB_FEED = `<div class="flex items-center mb-4">
  {{#image}}
  <div class="flex-none mr-4">
    <img src="{{url}}" alt="{{title}}" class="img-lg">
  </div>
  {{/image}}
  <div class="flex-1">
    <h1 class="mb-1">{{title}}</h1>
    <div class="mb-2">{{description}}</div>
    <div class="text-sm">
      {{#author}}By {{author}}{{/author}}
    </div>
  </div>
</div>

<div class="border-t border-b mb-4">
  {{#items}}
  <div class="mb-4 mt-4">
    <div class="flex items-center">
      {{#image}}
      <div class="flex-none mr-4">
        <img src="{{url}}" alt="{{title}}" class="img-md">
      </div>
      {{/image}}
      <div class="flex-1">
        <h2 class="mb-1">
          <a href="{{link}}">{{title}}</a>
        </h2>
        <div class="text-sm">{{pubDate}}</div>
      </div>
    </div>
  </div>
  {{/items}}
</div>

<div class="flex justify-center">
  {{#prevPage}}
  <div class="px-2">
    <a href="{{prevPage}}"><span class="icon-arrow-left"></span> Prev</a>
  </div>
  {{/prevPage}}
  {{#nextPage}}
  <div class="px-2">
    <a href="{{nextPage}}">Next <span class="icon-arrow-right"></span></a>
  </div>
  {{/nextPage}}
</div>`;

const DEFAULT_WEB_ITEM = `<div class="flex items-center mb-4">
  {{#image}}
  <div class="flex-none mr-4">
    <img src="{{url}}" alt="{{title}}" class="img-lg">
  </div>
  {{/image}}
  <div class="flex-1">
    <h1 class="mb-1">{{title}}</h1>
    <div class="mb-2">{{description}}</div>
    <div class="text-sm">
      {{#author}}By {{author}}{{/author}}
    </div>
  </div>
</div>

<div class="border-t border-b mb-4">
  <div class="mb-4 mt-4">
    <div class="flex items-center">
      {{#item.image}}
      <div class="flex-none mr-4">
        <img src="{{url}}" alt="{{title}}" class="img-md">
      </div>
      {{/item.image}}
      <div class="flex-1">
        <h2 class="mb-1">{{item.title}}</h2>
        <div class="text-sm">{{item.pubDate}}</div>
        <div class="mt-2">{{item.description}}</div>
      </div>
    </div>
  </div>
</div>

<div class="flex justify-center">
  <div class="px-2">
    <a href="{{feedLink}}"><span class="icon-arrow-left"></span> Back to Feed</a>
  </div>
</div>`;

const DEFAULT_RSS_STYLESHEET = `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <link rel="stylesheet" href="/themes/rss_stylesheet.xsl"/>
      </head>
      <body>
        <div class="container">
          <div class="podcast-header">
            <div class="podcast-header-image-title">
              <div>
                <xsl:if test="/rss/channel/image">
                  <div class="podcast-image">
                    <a>
                      <xsl:attribute name="href">
                        <xsl:value-of select="/rss/channel/image/link"/>
                      </xsl:attribute>
                      <img>
                        <xsl:attribute name="src">
                          <xsl:value-of select="/rss/channel/image/url"/>
                        </xsl:attribute>
                        <xsl:attribute name="title">
                          <xsl:value-of select="/rss/channel/image/title"/>
                        </xsl:attribute>
                      </img>
                    </a>
                  </div>
                </xsl:if>
              </div>
              <div>
                <h1><xsl:value-of select="/rss/channel/title"/></h1>
                <xsl:if test="/rss/channel/itunes:author">
                  <p>By <span class="podcast-author"><xsl:value-of select="/rss/channel/itunes:author"/></span></p>
                </xsl:if>
              </div>
            </div>
            <div class="podcast-description">
              <xsl:value-of select="/rss/channel/description" disable-output-escaping="yes"/>
            </div>
          </div>
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h2>
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h2>
              <div class="episode-time">
                <xsl:value-of select="pubDate"/>
              </div>
              <xsl:if test="description">
                <div>
                  <xsl:value-of select="description" disable-output-escaping="yes"/>
                </div>
              </xsl:if>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

export default class Theme {
  constructor(jsonData, settings=null, themeName = null) {
    this.jsonData = jsonData;
    this.settings = settings;

    this.theme = 'custom';
    if (!themeName) {
      // Select current theme
      if (settings && settings[SETTINGS_CATEGORIES.CUSTOM_CODE] &&
        settings[SETTINGS_CATEGORIES.CUSTOM_CODE].currentTheme &&
        settings[SETTINGS_CATEGORIES.CUSTOM_CODE].themes[settings[SETTINGS_CATEGORIES.CUSTOM_CODE].currentTheme]) {
        this.theme = settings[SETTINGS_CATEGORIES.CUSTOM_CODE].currentTheme;
      }
    } else {
      this.theme = themeName;
    }
    this.themeBundle = (this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE] &&
      this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE].themes) ?
      this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE].themes[this.theme] : null;
  }

  name() {
    return this.theme;
  }

  getWebHeader() {
    const tmpl = this.getWebHeaderTmpl();
    const html = Mustache.render(tmpl, {...this.jsonData,});
    return {html};
  }

  getWebHeaderTmpl() {
    let tmpl;
    if (this.theme === CODE_TYPES.SHARED) {
      tmpl = (this.settings && this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE] && this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE][CODE_FILES.WEB_HEADER]) ?
        this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE][CODE_FILES.WEB_HEADER] : '';
    } else {
      tmpl = this.themeBundle ? this.themeBundle[CODE_FILES.WEB_HEADER] : DEFAULT_WEB_HEADER;
    }
    return tmpl;
  }

  getWebBodyEnd() {
    const tmpl = this.getWebBodyEndTmpl();
    const html = Mustache.render(tmpl, {...this.jsonData,});
    return {html};
  }

  getWebBodyEndTmpl() {
    let tmpl = null;
    if (this.theme === CODE_TYPES.SHARED) {
      tmpl = (this.settings && this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE] && this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE][CODE_FILES.WEB_BODY_END]) ?
        this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE][CODE_FILES.WEB_BODY_END] : '';
    } else {
      tmpl = this.themeBundle ? this.themeBundle[CODE_FILES.WEB_BODY_END] : DEFAULT_WEB_BODY_END;
    }
    return tmpl;
  }

  getWebBodyStart() {
    const tmpl = this.getWebBodyStartTmpl();
    const html = Mustache.render(tmpl, {...this.jsonData,});
    return {html};
  }

  getWebBodyStartTmpl() {
    let tmpl;
    if (this.theme === CODE_TYPES.SHARED) {
      tmpl = (this.settings && this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE] && this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE][CODE_FILES.WEB_BODY_START]) ?
        this.settings[SETTINGS_CATEGORIES.CUSTOM_CODE][CODE_FILES.WEB_BODY_START] : '';
    } else {
      tmpl = this.themeBundle ? this.themeBundle[CODE_FILES.WEB_BODY_START] : DEFAULT_WEB_BODY_START;
    }
    return tmpl;
  }

  getRssStylesheetTmpl() {
    return this.themeBundle ? this.themeBundle[CODE_FILES.RSS_STYLESHEET] : DEFAULT_RSS_STYLESHEET;
  }

  getRssStylesheet() {
    const tmpl = this.getRssStylesheetTmpl();
    const stylesheet = Mustache.render(tmpl, {});
    return {
      stylesheet,
    };
  }

  getWebFeed() {
    const tmpl = this.getWebFeedTmpl();
    const html = Mustache.render(tmpl, {
      ...this.jsonData,
    });
    return {
      html,
    };
  }

  getWebFeedTmpl() {
    return this.themeBundle ? this.themeBundle[CODE_FILES.WEB_FEED] : DEFAULT_WEB_FEED;
  }

  getWebItem(item) {
    const tmpl = this.getWebItemTmpl();
    const html = Mustache.render(tmpl, {
      ...this.jsonData,

      // TODO: Remove "item". We don't need this "item" field any more. Use "items.0" instead.
      item,
    });
    return {
      html,
    };
  }

  getWebItemTmpl() {
    return this.themeBundle ? this.themeBundle[CODE_FILES.WEB_ITEM] : DEFAULT_WEB_ITEM;
  }
}
