import { Env } from "../../../../common-src/types/CloudflareTypes";
import { ChannelData } from "../../../../common-src/types/FeedContent";
import { FeedCrudManager } from "../../../../edge-src/models/FeedCrudManager";

interface ApiResponse {
  error?: string;
}

export const onRequestPut: PagesFunction<Env> = async ({ params, request, data }) => {
  const channelId = (params as Record<string, string>).channelId;

  let response: ApiResponse = {};
  let status = 200;

  if (channelId !== 'primary') {
    status = 400;
    response = { error: 'Invalid channel id' };
  } else {
    try {
      const channelJson = await request.json() as Partial<ChannelData>;
      const feedCrud = data.feedCrud as FeedCrudManager;
      
      await feedCrud.upsertChannel(channelJson);
    } catch (error) {
      status = 500;
      response = { 
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  }

  return new Response(JSON.stringify(response), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    status,
  });
};