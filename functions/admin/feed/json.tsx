import { FeedContent } from "../../../common-src/types/FeedContent";

interface RequestContext {
  data: {
    feedContent: FeedContent;
  };
}

export async function onRequestGet({ data }: RequestContext): Promise<Response> {
  const { feedContent } = data;
  return new Response(JSON.stringify(feedContent), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}
