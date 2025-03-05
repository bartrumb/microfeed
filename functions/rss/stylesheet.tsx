import FeedDb from "../../edge-src/models/FeedDb";
import Theme from "../../edge-src/models/Theme";
import { Context } from "../../common-src/types/CloudflareTypes";

export async function onRequestGet({ request, env }: Context): Promise<Response> {
  const feed = new FeedDb(env);
  const content = await feed.getContent();
  const theme = new Theme(content, content.settings);

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          ${theme.generateCss()}
        </style>
      </head>
      <body>
        <div class="container">
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p><xsl:value-of select="/rss/channel/description"/></p>
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h2><xsl:value-of select="title"/></h2>
              <p><xsl:value-of select="description"/></p>
              <xsl:if test="enclosure">
                <div class="media">
                  <audio controls="controls">
                    <source src="{enclosure/@url}" type="{enclosure/@type}"/>
                  </audio>
                </div>
              </xsl:if>
              <p class="meta">
                <xsl:if test="pubDate">
                  Published: <xsl:value-of select="pubDate"/>
                </xsl:if>
                <xsl:if test="author">
                  by <xsl:value-of select="author"/>
                </xsl:if>
              </p>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`,
    {
      headers: {
        "Content-Type": "text/xml",
      },
    }
  );
}
