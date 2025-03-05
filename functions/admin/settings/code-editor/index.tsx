import { Context } from "../../../../common-src/types/CloudflareTypes";
import Theme from "../../../../edge-src/models/Theme";
import FeedDb from "../../../../edge-src/models/FeedDb";

interface ThemeTemplate {
  themeName: string;
  webHeader: string;
  webBodyStart: string;
  webBodyEnd: string;
  webFeed: string;
  webItem: string;
  rssStylesheet: string;
}

export async function onRequestGet({ request, env, data }: Context): Promise<Response> {
  const feed = new FeedDb(env);
  const content = await feed.getContent();
  const theme = new Theme(content, content.settings);

  // Get custom code settings
  const customCode = content.settings.customCode || {};
  const themeTemplate: ThemeTemplate = {
    themeName: customCode.themeName || 'Default Theme',
    webHeader: customCode.webHeader || '',
    webBodyStart: customCode.webBodyStart || '',
    webBodyEnd: customCode.webBodyEnd || '',
    webFeed: customCode.webFeed || '',
    webItem: customCode.webItem || '',
    rssStylesheet: customCode.rssStylesheet || ''
  };

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Code Editor - ${themeTemplate.themeName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>${theme.generateCss()}</style>
      </head>
      <body>
        <div class="container">
          <h1>Code Editor</h1>
          <div id="editor-app"></div>
        </div>
        <script>
          window.THEME_TEMPLATE = ${JSON.stringify(themeTemplate)};
        </script>
      </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
