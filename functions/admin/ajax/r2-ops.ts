import { Context, R2RequestParams } from "../../../common-src/types/CloudflareTypes";
import { onGetR2PresignedUrlRequestPost } from "../../../edge-src/EdgeCommonRequests";

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const inputParams = await request.json();
  const jsonData = await onGetR2PresignedUrlRequestPost({ inputParams, env } as R2RequestParams);
  
  return new Response(JSON.stringify(jsonData), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}