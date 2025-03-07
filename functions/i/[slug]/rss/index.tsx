import { RssResponseBuilder } from "../../../../edge-src/common/PageUtils";
import FeedPublicRssBuilder from "../../../../edge-src/models/FeedPublicRssBuilder";
import { getIdFromSlug } from "../../../../common-src/StringUtils";
import { STATUSES } from "../../../../common-src/Constants";
import { Env } from "../../../../common-src/types/CloudflareTypes";
import { FeedContent } from "../../../../common-src/types/FeedContent";

interface SlugParams {
  slug: string;
}

// Type guard for params
function isSlugParams(params: unknown): params is SlugParams {
  return typeof params === 'object' && 
         params !== null && 
         'slug' in params && 
         typeof (params as SlugParams).slug === 'string';
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    if (!isSlugParams(params)) {
      return RssResponseBuilder.Response404('Invalid slug parameter');
    }

    const itemId = getIdFromSlug(params.slug);
    if (!itemId) {
      return RssResponseBuilder.Response404('Invalid slug format');
    }

    const rssResponseBuilder = new RssResponseBuilder(env, request, {
      queryKwargs: {
        id: itemId,
        'status__in': [STATUSES.PUBLISHED, STATUSES.UNLISTED],
      },
      limit: 1,
    });

    return await rssResponseBuilder.getResponse({
      buildXmlFunc: (feedContent: FeedContent): string => {
        const item = feedContent.items && feedContent.items.length > 0 ? feedContent.items[0] : null;
        if (!item) {
          // Return an empty RSS feed instead of null
          return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feedContent.channel.title}</title>
    <description>No items found</description>
  </channel>
</rss>`;
        }

        // Create a single-item feed content
        const singleItemFeed: FeedContent = {
          channel: feedContent.channel,
          items: [item],
          settings: feedContent.settings
        };

        const urlObj = new URL(request.url);
        const builder = new FeedPublicRssBuilder(singleItemFeed, urlObj.origin);
        return builder.build();
      },
      isValid: (feedContent: FeedContent) => {
        return !!(feedContent.items && feedContent.items.length > 0);
      }
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml;charset=UTF-8',
        },
      }
    );
  }
};