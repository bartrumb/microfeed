import React from "react";
import EdgeItemApp from "../../../edge-src/EdgeItemApp";
import { WebResponseBuilder } from '../../../edge-src/common/PageUtils';
import { PUBLIC_URLS, getIdFromSlug } from "../../../common-src/StringUtils";
import { STATUSES } from "../../../common-src/Constants";
import { Env } from "../../../common-src/types/CloudflareTypes";
import { FeedContent } from "../../../common-src/types/FeedContent";
import Theme from "../../../edge-src/models/Theme";

interface SlugParams {
  slug: string;
}

interface JsonData {
  items?: Array<{
    title: string;
    content_text: string;
  }>;
  language?: string;
}

// Type guard for params
function isSlugParams(params: unknown): params is SlugParams {
  return typeof params === 'object' && 
         params !== null && 
         'slug' in params && 
         typeof (params as SlugParams).slug === 'string';
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env, request }) => {
  try {
    if (!isSlugParams(params)) {
      return WebResponseBuilder.Response404('Invalid slug parameter');
    }

    const itemId = getIdFromSlug(params.slug);
    if (!itemId) {
      return WebResponseBuilder.Response404('Invalid slug format');
    }

    const webResponseBuilder = new WebResponseBuilder(env, request, {
      queryKwargs: {
        id: itemId,
        'status__in': [STATUSES.PUBLISHED, STATUSES.UNLISTED],
      },
      limit: 1,
    });

    return webResponseBuilder.getResponse({
      getComponent: (content: FeedContent, jsonData: JsonData, theme: Theme) => {
        const item = jsonData.items && jsonData.items.length > 0 ? jsonData.items[0] : null;
        if (!item) {
          // Instead of returning null, return an error component
          return (
            <div>
              <h1>Item Not Found</h1>
              <p>The requested item could not be found.</p>
            </div>
          );
        }

        const urlObject = new URL(request.url);
        const canonicalUrl = PUBLIC_URLS.webItem(itemId, item.title, urlObject.origin);

        return (
          <EdgeItemApp
            item={item}
            theme={theme}
            jsonData={jsonData}
            canonicalUrl={canonicalUrl}
          />
        );
      },
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(
      'Internal Server Error',
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
      }
    );
  }
};