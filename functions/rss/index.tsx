import { RssResponseBuilder } from "../../edge-src/common/PageUtils";
import FeedPublicRssBuilder from "../../edge-src/models/FeedPublicRssBuilder";
import { STATUSES } from "../../common-src/Constants";
import type { D1Database } from '@cloudflare/workers-types';
import { FeedContent } from "../../common-src/types/FeedContent";

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

export async function onRequestGet({ request, env }: RequestContext): Promise<Response> {
  const rssResponseBuilder = new RssResponseBuilder(env, request, {
    queryKwargs: {
      status: STATUSES.PUBLISHED,
    },
  });
  return await rssResponseBuilder.getResponse({
    buildXmlFunc: (jsonData: FeedContent): string => {
      const urlObj = new URL(request.url);
      const builder = new FeedPublicRssBuilder(jsonData, urlObj.origin);
      return builder.getRssData();
    }
  });
}

export function onRequestHead(): Response {
  return new Response('ok');
}