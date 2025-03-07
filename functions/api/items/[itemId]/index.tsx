import { getIdFromSlug } from "../../../../common-src/StringUtils";
import { ITEM_STATUSES_STRINGS_DICT, STATUSES } from "../../../../common-src/Constants";
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

interface ItemResponse extends Partial<Item> {
  _microfeed?: {
    status: ValidStatusString;
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
  let oldItem: ItemResponse = {};
  
  if (res.status === 200) {
    const feed = await res.json() as FeedContent;
    if (feed.items && feed.items.length > 0) {
      oldItem = feed.items[0];
    }
  } else {
    return res;
  }

  const itemJson = await request.json() as ItemResponse;
  const newItemJson: Partial<Item> = {
    ...oldItem,
    ...itemJson,
  };

  if (!itemJson.pubDateMs) {
    newItemJson.pubDateMs = itemJson.pub_date ?
      new Date(itemJson.pub_date).getTime() : Date.now();
  }

  // Determine the status with proper type checking
  let status = STATUSES.PUBLISHED;
  if (itemJson.status && isValidStatusString(itemJson.status)) {
    status = ITEM_STATUSES_STRINGS_DICT[itemJson.status];
  } else if (oldItem._microfeed?.status && isValidStatusString(oldItem._microfeed.status)) {
    status = ITEM_STATUSES_STRINGS_DICT[oldItem._microfeed.status];
  }

  const { feedCrud } = data;
  await feedCrud.updateItem(itemUniqId, {
    ...newItemJson,
    status,
    updated_at: new Date().toISOString()
  });

  return new Response(JSON.stringify({}), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}