import { Env } from '../../../../common-src/types/CloudflareTypes';
import { ChannelData } from '../../../../common-src/types/FeedContent';
import { FeedCrudManager } from '../../../../edge-src/models/FeedCrudManager';

interface RequestParams {
  params: {
    channelId: string;
  };
  request: Request;
  data: {
    feedCrud: FeedCrudManager;
  };
}

interface ApiResponse {
  error?: string;
}

export async function onRequestPut({ params, request, data }: RequestParams): Promise<Response> {
  const { channelId } = params;

  let response: ApiResponse = {};
  let status = 200;

  if (channelId !== 'primary') {
    status = 400;
    response = { error: 'Invalid channel id' };
  } else {
    const channelJson = await request.json() as Partial<ChannelData>;
    const { feedCrud } = data;
    await feedCrud.upsertChannel(channelJson);
  }

  return new Response(JSON.stringify(response), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    status,
  });
}