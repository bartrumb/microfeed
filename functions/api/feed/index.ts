import { Context } from '../../../common-src/types/CloudflareTypes';
import { FeedContent } from '../../../common-src/types/FeedContent';

export async function onRequestGet({ env, request }: Context): Promise<Response> {
  const db = env.MICROFEED_DB;
  const content = await db.prepare('SELECT * FROM feed_content').first() as FeedContent;
  
  return new Response(JSON.stringify(content), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
