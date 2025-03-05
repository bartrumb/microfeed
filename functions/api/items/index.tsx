import { Context } from '../../../common-src/types/CloudflareTypes';
import { FeedContent, Item, SETTINGS_CATEGORY } from '../../../common-src/types/FeedContent';
import { ITEM_STATUSES, ITEM_STATUSES_STRINGS_DICT } from '../../../common-src/types/CloudflareTypes';

interface ItemRequest {
  status: string;
  title: string;
  content?: string;
  description?: string;
  link?: string;
  author?: string;
  categories?: string[];
  mediaFile?: {
    url?: string;
    category?: string;
    contentType?: string;
    durationSecond?: number;
    size?: number;
  };
}

export async function onRequestPost({ request, data }: Context): Promise<Response> {
  const itemJson = await request.json() as ItemRequest;
  const feedContent = data.feedContent as FeedContent;

  // Convert status string to number
  const statusNumber = ITEM_STATUSES_STRINGS_DICT[itemJson.status] || ITEM_STATUSES.published;

  // Create new item
  const newItem: Item = {
    id: crypto.randomUUID(),
    status: statusNumber,
    title: itemJson.title,
    content: itemJson.content,
    description: itemJson.description,
    link: itemJson.link,
    author: itemJson.author,
    categories: itemJson.categories,
    mediaFile: itemJson.mediaFile ? {
      url: itemJson.mediaFile.url || '',
      category: parseInt(itemJson.mediaFile.category || '0'),
      contentType: itemJson.mediaFile.contentType,
      durationSecond: itemJson.mediaFile.durationSecond,
      size: itemJson.mediaFile.size
    } : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Add item to feed content
  if (!feedContent.items) {
    feedContent.items = [];
  }
  feedContent.items.push(newItem);

  return new Response(JSON.stringify(newItem), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
