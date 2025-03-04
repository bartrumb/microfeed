import { onFetchFeedJsonRequestGet } from "../../edge-src/EdgeCommonRequests";
import type { D1Database } from '@cloudflare/workers-types';

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
  return await onFetchFeedJsonRequestGet({ env, request }, true);
}

export function onRequestHead(): Response {
  return new Response('ok');
}