import ReactDOMServer from "react-dom/server";
import type { D1Database } from '@cloudflare/workers-types';
import Theme from "../models/Theme";
import FeedDb, { getFetchItemsParams, QueryOptions } from "../models/FeedDb";
import { CODE_TYPES } from "../../common-src/constants";
import { ADMIN_URLS, escapeHtml, urlJoinWithRelative } from "../../common-src/StringUtils";
import { OnboardingChecker } from "../../common-src/OnboardingUtils";
import { FeedContent, SettingsData, SETTINGS_CATEGORY } from "../../common-src/types/FeedContent";
import { Env } from "../../common-src/types/CloudflareTypes";

import { getViteAssetPath } from "./ViteUtils";

interface ChannelData {
  id: string;
  status: number;
  is_primary: boolean;
  image: string;
  link: string;
  language: string;
  categories: string[];
  'itunes:explicit': boolean;
  'itunes:type': string;
  'itunes:complete': boolean;
  'itunes:block': boolean;
  copyright: string;
}

interface ResponseBuilderProps {
  buildXmlFunc?: (data: any) => string;
  checkIsAllowed?: boolean;
  isValid?: (data: any) => boolean;
  getComponent?: (content: FeedContent, jsonData: any, theme: Theme) => React.ReactElement;
}

interface FetchItemsObject {
  queryKwargs?: Record<string, any>;
  limit?: number;
}

type Settings = SettingsData;

interface ThemeCode {
  html: string;
}

interface ElementHandler {
  tagName: string;
  append: (content: string, options: { html: boolean }) => void;
  prepend: (content: string, options: { html: boolean }) => void;
}

export function renderReactToHtml(
  Component: React.ReactElement
): string {
  return ReactDOMServer.renderToString(
    Component
  );
}

class ResponseBuilder {
  protected feed: FeedDb;
  protected request: Request;
  protected fetchItemsObj: FetchItemsObject;
  protected env: Env;
  protected content!: FeedContent;
  protected settings!: Settings;
  protected jsonData!: any;

  constructor(
    env: Env,
    request: Request,
    fetchItemsObj: FetchItemsObject | null = null
  ) {
    this.feed = new FeedDb(env, request);
    this.request = request;
    this.fetchItemsObj = fetchItemsObj || {};
    this.env = env;
  }

  protected async fetchFeed(): Promise<void> {
    const options: QueryOptions = {};
    this.content = await this.feed.getContent(options);
    this.settings = this.content.settings || {};
    const queryKwargs = this.fetchItemsObj.queryKwargs || {};
    const forOneItem = !!queryKwargs.id;
    this.jsonData = await this.feed.getPublicJsonData(this.settings, forOneItem);
  }

  protected _verifyPasscode(): boolean {
    // TODO: check passcord in query string / cookie
    return true;
  }

  async getResponse(props: ResponseBuilderProps): Promise<Response> {
    await this.fetchFeed();
    if (this.settings.access) {
      const {currentPolicy} = this.settings.access;
      switch (currentPolicy) {
        case 'passcode':
          if (!this._verifyPasscode()) {
            // TODO: redirect to a page (401) to type in passcode
          }
          break;
        case 'offline':
          return ResponseBuilder.Response404();
        default:
          break;
      }
    }

    const onboardingChecker = new OnboardingChecker(this.env);
    const onboardingResult = await onboardingChecker.checkAll();
    if (!onboardingResult.requiredOk) {
      const urlObj = new URL(this.request.url);
      return Response.redirect(ADMIN_URLS.home(urlObj.origin), 302);
    }

    return this._getResponse(props);
  }

  static Response404(text = 'Not Found'): Response {
    return new Response(text, {
      status: 404,
      statusText: text,
    });
  }

  static notEnabledResponse(subscribeMethods: Settings['subscribeMethods'], type: string): Response | null {
    let notFoundRes = null;
    if (subscribeMethods && subscribeMethods.methods && subscribeMethods.methods.length > 0) {
      subscribeMethods.methods.forEach((method) => {
        if (method.type === type && !method.editable && !method.enabled) {
          notFoundRes = ResponseBuilder.Response404();
        }
      });
    }
    return notFoundRes;
  }

  protected get _contentType(): string {
    return 'text/html; charset=utf-8';
  }

  protected get _fetchItems(): Record<string, any> {
    return getFetchItemsParams(this.request);
  }

  protected _getResponse(props?: ResponseBuilderProps): Response {
    return new Response('ok', {
      headers: {
        'content-type': this._contentType,
      },
    });
  }
}

export class RssResponseBuilder extends ResponseBuilder {
  protected get _contentType(): string {
    return 'application/xml';
  }

  protected _getResponse(props: ResponseBuilderProps): Response {
    const res = super._getResponse(props);
    const {subscribeMethods} = this.settings;
    let notFoundRes = ResponseBuilder.notEnabledResponse(subscribeMethods, 'rss');
    if (notFoundRes) {
      return notFoundRes;
    }
    const rssRes = props.buildXmlFunc ? props.buildXmlFunc(this.jsonData) : null;
    if (!rssRes) {
      return ResponseBuilder.Response404();
    }
    return new Response(rssRes, res);
  }
}

export class JsonResponseBuilder extends ResponseBuilder {
  protected get _contentType(): string {
    return 'application/json;charset=UTF-8';
  }

  protected _getResponse(props: ResponseBuilderProps): Response {
    const res = super._getResponse(props);

    if (props) {
      if (props.checkIsAllowed) {
        const {subscribeMethods} = this.settings;
        let notFoundRes = ResponseBuilder.notEnabledResponse(subscribeMethods, 'json');
        if (notFoundRes) {
          return notFoundRes;
        }
      }
      if (props.isValid) {
        if (!props.isValid(this.jsonData)) {
          return ResponseBuilder.Response404();
        }
      }
    }
    const newResponse = new Response(JSON.stringify(this.jsonData), res);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  }
}

export class SitemapResponseBuilder extends ResponseBuilder {
  protected get _contentType(): string {
    return 'text/xml';
  }

  protected _getResponse(props: ResponseBuilderProps): Response {
    const res = super._getResponse(props);
    let xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">';
    xml += `<url><loc>${this.jsonData.home_page_url}</loc><image:image><image:loc>${this.jsonData.icon}</image:loc></image:image></url>`;
    this.jsonData.items.map((item: any) => {
      xml += `<url><loc>${item._microfeed.web_url}</loc><lastmod>${item.date_published}</lastmod>`;
      if (item.attachments) {
        item.attachments.forEach((attachment: any) => {
          if (attachment.mime_type.startsWith('image/')) {
            xml += `<image:image><image:loc>${attachment.url}</image:loc></image:image>`;
          } else if (attachment.mime_type.startsWith('video/')) {
            xml += `<video:video><video:title>${escapeHtml(item.title)}</video:title><video:publication_date>${item.date_published}</video:publication_date><video:content_loc>${attachment.url}</video:content_loc></video:video>`;
          }
        });
      }
      xml += `</url>`;
    });
    xml += '</urlset>';
    return new Response(xml, res);
  }

  protected get _fetchItems(): Record<string, any> {
    return getFetchItemsParams(this.request);
  }
}

class CodeInjector {
  private settings: Settings;
  private theme: Theme;
  private sharedTheme: Theme;
  private appName?: string;

  constructor(settings: Settings, theme: Theme, sharedTheme: Theme, appName?: string) {
    this.settings = settings;
    this.theme = theme;
    this.sharedTheme = sharedTheme;
    this.appName = appName;
  }

  element(element: ElementHandler): void {
    if (!this.settings) {
      return;
    }

    if (element.tagName === 'head') {
      // Add Vite client script in development
      if (this.appName) {
        element.append(`<script type="module" src="${getViteAssetPath(this.appName, 'js')}" defer></script>`, {html: true});
        element.append(`<link rel="stylesheet" href="${getViteAssetPath(this.appName, 'css')}">`, {html: true});
      }

      // Add favicon
      if (this.settings.webGlobalSettings) {
        const {favicon, publicBucketUrl} = this.settings.webGlobalSettings;
        if (favicon && favicon.url) {
          const faviconUrl = urlJoinWithRelative(publicBucketUrl || '', favicon.url);
          element.append(`<link rel="icon" type="${favicon.contentType}" href="${faviconUrl}">`, {html: true});
        }
      }

      // Add custom header code
      element.append(this.sharedTheme.getWebHeader().html || '', {html: true});
      const {html} = this.theme.getWebHeader();
      element.append(html, {html: true});
    } else if (element.tagName === 'body') {
      element.prepend(this.theme.getWebBodyStart().html, {html: true});
      element.prepend(this.sharedTheme.getWebBodyStart().html || '', {html: true});

      element.append(this.sharedTheme.getWebBodyEnd().html || '', {html: true});
      const {html} = this.theme.getWebBodyEnd();
      element.append(html, {html: true});
    }
  }
}

export class WebResponseBuilder extends ResponseBuilder {
  protected get _contentType(): string {
    return 'text/html; charset=utf-8';
  }

  protected _getResponse(props: ResponseBuilderProps): Response {
    const res = super._getResponse(props);
    const theme = new Theme(this.jsonData, this.settings);
    const sharedTheme = new Theme(this.jsonData, this.settings, SETTINGS_CATEGORY.CUSTOM_CODE);
    const component = props.getComponent ? props.getComponent(this.content, this.jsonData, theme) : null;
    if (!component) {
      return ResponseBuilder.Response404();
    }
    const fromReact = `<!DOCTYPE html>${renderReactToHtml(component)}`;
    const newRes = new Response(fromReact, res);

    // Extract app name from component for asset loading if available
    const appName = typeof component.type === 'function' ? component.type.name : undefined;

    return new (globalThis as any).HTMLRewriter()
      .on('head', new CodeInjector(this.settings || {}, theme, sharedTheme, appName))
      .on('body', new CodeInjector(this.settings, theme, sharedTheme, appName))
      .transform(newRes);
  }
}