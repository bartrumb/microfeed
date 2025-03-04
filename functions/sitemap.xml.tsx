import { SitemapResponseBuilder } from '../edge-src/common/PageUtils';
import { STATUSES } from "../common-src/Constants";
import type { D1Database } from '@cloudflare/workers-types';
import { FeedContent } from "../common-src/types/FeedContent";

interface Env {
  FEED_DB: D1Database;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  R2_PUBLIC_BUCKET: string;
}

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