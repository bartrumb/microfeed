import { Env } from '../../common-src/types/CloudflareTypes';
import { FeedContent, Item, ChannelData, SettingsData } from '../../common-src/types/FeedContent';

interface QueryOptions {
  status?: number;
  limit?: number;
  cursor?: string;
  sortOrder?: 'asc' | 'desc';
}

interface QueryResult {
  items: Item[];
  nextCursor?: string;
  prevCursor?: string;
}

class FeedDb {
  private db: D1Database;
  private env: Env;

  constructor(env: Env) {
    this.db = env.MICROFEED_DB;
    this.env = env;
  }

  async getContent(options: QueryOptions = {}): Promise<FeedContent> {
    const content = await this.db.prepare('SELECT * FROM feed_content').first();
    if (!content) {
      throw new Error('Feed content not found');
    }

    const feedContent: FeedContent = {
      channel: JSON.parse(content.channel as string) as ChannelData,
      settings: JSON.parse(content.settings as string) as SettingsData,
      items: JSON.parse(content.items as string || '[]') as Item[]
    };

    let filteredItems = feedContent.items || [];

    if (options.status !== undefined) {
      filteredItems = filteredItems.filter(item => item.status === options.status);
    }

    if (options.limit) {
      const startIndex = options.cursor ? parseInt(options.cursor) : 0;
      const endIndex = startIndex + options.limit;
      const sortedItems = [...filteredItems].sort((a, b) => {
        const aDate = a.pubDateMs || 0;
        const bDate = b.pubDateMs || 0;
        return options.sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      });

      const paginatedItems = sortedItems.slice(startIndex, endIndex);
      filteredItems = paginatedItems;

      if (endIndex < sortedItems.length) {
        feedContent.items_next_cursor = endIndex.toString();
      }
      if (startIndex > 0) {
        feedContent.items_prev_cursor = Math.max(0, startIndex - options.limit).toString();
      }
    }

    feedContent.items = filteredItems;
    return feedContent;
  }

  async updateContent(content: Partial<FeedContent>): Promise<void> {
    const currentContent = await this.getContent();
    const updatedContent: FeedContent = {
      ...currentContent,
      ...content,
      channel: content.channel || currentContent.channel,
      items: content.items || currentContent.items || [],
      settings: content.settings || currentContent.settings
    };

    await this.db.prepare(
      'UPDATE feed_content SET channel = ?, items = ?, settings = ?, updated_at = CURRENT_TIMESTAMP'
    ).bind(
      JSON.stringify(updatedContent.channel),
      JSON.stringify(updatedContent.items),
      JSON.stringify(updatedContent.settings)
    ).run();
  }

  async getItem(itemId: string): Promise<Item | undefined> {
    const content = await this.getContent();
    return content.items?.find(item => item.id === itemId);
  }

  async addItem(item: Item): Promise<void> {
    const content = await this.getContent();
    const items = content.items || [];
    items.push(item);
    await this.updateContent({ items });
  }

  async updateItem(itemId: string, updates: Partial<Item>): Promise<void> {
    const content = await this.getContent();
    const items = content.items || [];

    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    items[itemIndex] = {
      ...items[itemIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.updateContent({ items });
  }

  async deleteItem(itemId: string): Promise<void> {
    const content = await this.getContent();
    const items = content.items || [];

    const filteredItems = items.filter(item => item.id !== itemId);
    await this.updateContent({ items: filteredItems });
  }

  async updateChannel(updates: Partial<ChannelData>): Promise<void> {
    const content = await this.getContent();
    const updatedChannel = {
      ...content.channel,
      ...updates
    };
    await this.updateContent({ channel: updatedChannel });
  }

  async updateSettings(updates: Partial<SettingsData>): Promise<void> {
    const content = await this.getContent();
    const updatedSettings = {
      ...content.settings,
      ...updates
    };
    await this.updateContent({ settings: updatedSettings });
  }
}

export default FeedDb;
