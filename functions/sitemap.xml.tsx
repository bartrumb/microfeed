import { SitemapResponseBuilder } from '../edge-src/common/PageUtils';
import { STATUSES } from "../common-src/Constants";
import { FeedContent } from "../common-src/types/FeedContent";
import type { Env } from '../common-src/types/CloudflareTypes';

interface RequestContext {
  env: Env;
  request: Request;
}

export async function onRequestGet({ env, request }: RequestContext): Promise<Response> {
  const sitemapResponseBuilder = new SitemapResponseBuilder(env, request, {
    queryKwargs: {
      status: STATUSES.PUBLISHED,
    },
  });
  return sitemapResponseBuilder.getResponse({
    getComponent: (_content: FeedContent, jsonData: any) => {
      return jsonData;
    },
  });
}