import { onFetchFeedJsonRequestGet } from "../../edge-src/EdgeCommonRequests";
import type { Env } from '../../common-src/types/CloudflareTypes';

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