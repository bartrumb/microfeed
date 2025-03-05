import { Context } from "../../common-src/types/CloudflareTypes";
import FeedPublicRssBuilder from "../../edge-src/models/FeedPublicRssBuilder";
import FeedDb from "../../edge-src/models/FeedDb";

export async function onRequestGet({ request, env }: Context): Promise<Response> {
  const feed = new FeedDb(env);
  const content = await feed.getContent({
    status: 1 // Only published items
  });

  const baseUrl = new URL(request.url).origin;
  const rssBuilder = new FeedPublicRssBuilder(content, baseUrl);
  const rssContent = rssBuilder.build();

  return new Response(rssContent, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=300", // 5 minutes cache
    },
  });
}