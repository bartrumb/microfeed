import { getIdFromSlug } from "../../../../common-src/StringUtils";
import { ITEM_STATUSES_STRINGS_DICT, STATUSES } from "../../../../common-src/constants";
import { onFetchItemRequestGet } from "../../../../edge-src/EdgeCommonRequests";
import { Env } from "../../../../common-src/types/CloudflareTypes";
import { FeedContent, Item } from "../../../../common-src/types/FeedContent";
import { FeedCrudManager } from "../../../../edge-src/models/FeedCrudManager";

type ValidStatusString = keyof typeof ITEM_STATUSES_STRINGS_DICT;

interface RequestParams {
  params: {
    itemId: string;
  };
  env: Env;
  request: Request;
  data: {
    feedCrud: FeedCrudManager;
  };
}

// Define a separate interface for the incoming JSON structure
interface ItemRequestBody {
  status?: ValidStatusString;
  _microfeed?: {
    status: ValidStatusString;
  };
  title?: string;
  name?: string;
  pub_date?: string;
  pubDateMs?: number;
  created_at?: string;
  updated_at?: string;
  content?: string;
  description?: string;
  link?: string;
  author?: string;
  categories?: string[];
  enclosure?: {
    url: string;
    type: string;
    length?: number;
  };
}

function isValidStatusString(status: string): status is ValidStatusString {
  return status in ITEM_STATUSES_STRINGS_DICT;
}

export async function onRequestGet({ params, env, request }: RequestParams): Promise<Response> {
  if (!params.itemId) {
    return new Response(JSON.stringify({ error: 'Item ID is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    });
  }

  return await onFetchItemRequestGet(
    { params, env, request },
    false,
    [STATUSES.PUBLISHED, STATUSES.UNLISTED, STATUSES.UNPUBLISHED]
  );
}

export async function onRequestDelete({ params, data }: RequestParams): Promise<Response> {
  const { itemId } = params;
  if (!itemId) {
    return new Response(JSON.stringify({ error: 'Item ID is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    });
  }

  const itemUniqId = getIdFromSlug(itemId);
  if (!itemUniqId) {
    return new Response(JSON.stringify({ error: 'Invalid item ID format' }), {
      status: 400,
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    });
  }

  const { feedCrud } = data;
  await feedCrud.updateItem(itemUniqId, {
    status: STATUSES.DELETED,
    updated_at: new Date().toISOString()
  });

  return new Response(JSON.stringify({}), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}

export async function onRequestPut({ params, request, data, env }: RequestParams): Promise<Response> {
  const { itemId } = params;
  if (!itemId) {
    return new Response(JSON.stringify({ error: 'Item ID is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    });
  }

  const itemUniqId = getIdFromSlug(itemId);
  if (!itemUniqId) {
    return new Response(JSON.stringify({ error: 'Invalid item ID format' }), {
      status: 400,
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    });
  }

  const res = await onRequestGet({ params, request, env, data });
  let oldItem: Partial<Item> = {};
  
  if (res.status === 200) {
    const feed = await res.json() as FeedContent;
    if (feed.items && feed.items.length > 0) {
      oldItem = feed.items[0];
    }
  } else {
    return res;
  }

  const itemJson = await request.json() as ItemRequestBody;
  
  // Create a new object without the status field from itemJson
  const { status: _, _microfeed, ...restItemJson } = itemJson;
  
  const newItemJson: Partial<Item> = {
    ...oldItem,
    ...restItemJson,
  };

  // Handle publication date
  const now = new Date();
  if (!itemJson.pubDateMs) {
    const pubDate = itemJson.pub_date ? new Date(itemJson.pub_date) : now;
    newItemJson.pubDateMs = pubDate.getTime();
    newItemJson.pub_date = pubDate.toISOString();
  }

  // Determine the status with proper type checking
  let status: number = STATUSES.PUBLISHED;
  if (itemJson.status && isValidStatusString(itemJson.status)) {
    status = ITEM_STATUSES_STRINGS_DICT[itemJson.status];
  } else if (itemJson._microfeed?.status && isValidStatusString(itemJson._microfeed.status)) {
    status = ITEM_STATUSES_STRINGS_DICT[itemJson._microfeed.status];
  }

  const { feedCrud } = data;
  await feedCrud.updateItem(itemUniqId, {
    ...newItemJson,
    status,
    updated_at: now.toISOString()
  });

  return new Response(JSON.stringify({}), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}