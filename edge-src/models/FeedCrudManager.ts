import { Env } from '../../common-src/types/CloudflareTypes';
import { FeedContent, Item, ChannelData } from '../../common-src/types/FeedContent';
import FeedDb from './FeedDb';

interface FeedCrudManagerOptions {
  env: Env;
  request?: Request;
}

export class FeedCrudManager {
  private feedDb: FeedDb;
  private feedContent: FeedContent;
  private env: Env;
  private request?: Request;

  constructor(options: FeedCrudManagerOptions) {
    this.env = options.env;
    this.request = options.request;
    this.feedDb = new FeedDb(this.env);
    this.feedContent = {
      channel: {
        id: '',
        title: '',
        status: 1,
        is_primary: 1,
        image: '',
        link: '',
        language: 'en',
        categories: [],
        "itunes:explicit": false,
        "itunes:type": 'episodic',
        "itunes:complete": false,
        "itunes:block": false,
        copyright: ''
      },
      items: [],
      settings: {}
    };
  }

  async init(): Promise<void> {
    this.feedContent = await this.feedDb.getContent();
  }

  getFeedContent(): FeedContent {
    return this.feedContent;
  }

  async getItem(itemId: string): Promise<Item | undefined> {
    return this.feedContent.items?.find(item => item.id === itemId);
  }

  async createItem(item: Partial<Item>): Promise<string> {
    const newItem: Item = {
      id: crypto.randomUUID(),
      status: 1,
      title: item.title || '',
      content: item.content,
      description: item.description,
      link: item.link,
      author: item.author,
      categories: item.categories,
      mediaFile: item.mediaFile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!this.feedContent.items) {
      this.feedContent.items = [];
    }
    this.feedContent.items.push(newItem);
    await this.feedDb.updateContent(this.feedContent);
    return newItem.id;
  }

  async updateItem(itemId: string, updates: Partial<Item>): Promise<void> {
    if (!this.feedContent.items) return;

    const itemIndex = this.feedContent.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    this.feedContent.items[itemIndex] = {
      ...this.feedContent.items[itemIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.feedDb.updateContent(this.feedContent);
  }

  async deleteItem(itemId: string): Promise<void> {
    if (!this.feedContent.items) return;

    this.feedContent.items = this.feedContent.items.filter(item => item.id !== itemId);
    await this.feedDb.updateContent(this.feedContent);
  }

  async getItemBySlug(slug: string): Promise<Item | undefined> {
    return this.feedContent.items?.find(item => item.name === slug);
  }

  async setItemAsPublished(itemId: string): Promise<void> {
    await this.updateItem(itemId, {
      status: 1,
      pub_date: new Date().toISOString(),
      pubDateMs: Date.now()
    });
  }

  async setItemAsUnpublished(itemId: string): Promise<void> {
    await this.updateItem(itemId, {
      status: 0,
      pub_date: undefined,
      pubDateMs: undefined
    });
  }

  async setItemAsUnlisted(itemId: string): Promise<void> {
    await this.updateItem(itemId, {
      status: 2
    });
  }

  async setItemAsDraft(itemId: string): Promise<void> {
    if (!this.feedContent.items) {
      this.feedContent.items = [];
    }

    const existingItemIndex = this.feedContent.items.findIndex(item => item.id === itemId);
    const draftItem: Item = {
      id: itemId,
      status: 0,
      title: '',
      content: '',
      description: '',
      link: '',
      author: '',
      categories: [],
      updated_at: new Date().toISOString()
    };

    if (existingItemIndex !== -1) {
      // Update existing item
      this.feedContent.items[existingItemIndex] = {
        ...this.feedContent.items[existingItemIndex],
        ...draftItem
      };
    } else {
      // Add new draft item
      draftItem.created_at = new Date().toISOString();
      this.feedContent.items.push(draftItem);
    }

    await this.feedDb.updateContent(this.feedContent);
  }

  async upsertChannel(channel: Partial<ChannelData>): Promise<string> {
    this.feedContent.channel = {
      ...this.feedContent.channel,
      ...channel
    };
    await this.feedDb.updateContent(this.feedContent);
    return this.feedContent.channel.id;
  }
}

export function getFetchItemsParams(request: Request): { status?: number; limit?: number; cursor?: string } {
  const url = new URL(request.url);
  return {
    status: url.searchParams.get('status') ? parseInt(url.searchParams.get('status')!) : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    cursor: url.searchParams.get('cursor') || undefined
  };
}
