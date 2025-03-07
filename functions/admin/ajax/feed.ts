import { Context, Env } from "../../../common-src/types/CloudflareTypes";
import { FeedContent } from "../../../common-src/types/FeedContent";
import FeedDb from "../../../edge-src/models/FeedDb";

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const updatedFeed: FeedContent = await request.json();
  const feed = new FeedDb(env, request);
  await feed.putContent(updatedFeed);

  return new Response(JSON.stringify({}), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}