import { onFetchItemRequestGet } from "../../../../edge-src/EdgeCommonRequests";
import { Env } from "../../../../common-src/types/CloudflareTypes";

export const onRequestGet: PagesFunction<Env> = async ({ params, env, request }) => {
  try {
    return await onFetchItemRequestGet({ params, env, request }, true);
  } catch (error) {
    console.error('Error handling GET request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      }
    );
  }
};

export const onRequestHead: PagesFunction<Env> = () => {
  return new Response('ok', {
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  });
};