import { getIdFromSlug } from "../../../../common-src/StringUtils";
import { ITEM_STATUSES_STRINGS_DICT, STATUSES } from "../../../../common-src/Constants";
import { onFetchItemRequestGet } from "../../../../edge-src/EdgeCommonRequests";
import { Env } from "../../../../common-src/types/CloudflareTypes";
import { FeedCrudManager } from "../../../../edge-src/models/FeedCrudManager";
import { Item } from "../../../../common-src/types/FeedContent";

interface ApiResponse {
  items?: Item[];
  error?: string;
}

interface ItemParams {
  itemId: string;
}

// Extend Item but override status to be more specific
type ItemRequestBody = Omit<Partial<Item>, 'status'> & {
  status?: number;
  date_published?: string;
  date_published_ms?: number;
  _microfeed?: {
    status: keyof typeof ITEM_STATUSES_STRINGS_DICT;
  };
};

// Type guard for params
function isItemParams(params: unknown): params is ItemParams {
  return typeof params === 'object' && 
         params !== null && 
         'itemId' in params && 
         typeof (params as ItemParams).itemId === 'string';
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return await onFetchItemRequestGet(
    context as any, // EdgeCommonRequests expects a different context structure
    false,
    [STATUSES.PUBLISHED, STATUSES.UNLISTED, STATUSES.UNPUBLISHED]
  );
};

export const onRequestDelete: PagesFunction<Env> = async ({ params, data }) => {
  try {
    if (!isItemParams(params)) {
      throw new Error('Invalid or missing item ID');
    }

    const itemUniqId = getIdFromSlug(params.itemId);
    if (!itemUniqId) {
      throw new Error('Invalid item ID format');
    }

    const feedCrud = data.feedCrud as FeedCrudManager;
    await feedCrud.updateItem(itemUniqId, {
      status: STATUSES.DELETED,
      updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({}), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }
    );
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ params, request, data, env }) => {
  try {
    if (!isItemParams(params)) {
      throw new Error('Invalid or missing item ID');
    }

    const itemUniqId = getIdFromSlug(params.itemId);
    if (!itemUniqId) {
      throw new Error('Invalid item ID format');
    }

    // Get existing item
    const res = await onRequestGet({ params, request, env } as any);
    let oldItem: ItemRequestBody = {};
    
    if (res.status === 200) {
      const feed = (await res.json()) as ApiResponse;
      if (feed.items && feed.items.length > 0) {
        oldItem = feed.items[0];
      }
    } else {
      return res;
    }

    // Parse and validate request body
    const itemJson = await request.json() as ItemRequestBody;
    const newItemJson: ItemRequestBody = {
      ...oldItem,
      ...itemJson,
    };

    // Handle date published
    if (!itemJson.date_published_ms) {
      newItemJson.date_published_ms = itemJson.date_published
        ? new Date(itemJson.date_published).getTime()
        : new Date().getTime();
    }

    // Handle status
    let status = STATUSES.PUBLISHED; // Default status
    if (typeof itemJson.status === 'number') {
      status = itemJson.status;
    } else if (oldItem._microfeed?.status && ITEM_STATUSES_STRINGS_DICT[oldItem._microfeed.status]) {
      status = ITEM_STATUSES_STRINGS_DICT[oldItem._microfeed.status];
    }

    // Update item
    const feedCrud = data.feedCrud as FeedCrudManager;
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
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }
    );
  }
};