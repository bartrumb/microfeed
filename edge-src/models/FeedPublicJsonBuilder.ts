import { FeedContent, Item, ChannelData } from '../../common-src/types/FeedContent';

interface JsonFeedAuthor {
  name?: string;
  url?: string;
}

interface JsonFeedAttachment {
  url: string;
  mime_type?: string;
  size_in_bytes?: number;
  duration_in_seconds?: number;
  title?: string;
}

interface JsonFeedItem {
  id: string;
  url?: string;
  title: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  image?: string;
  date_published?: string;
  date_modified?: string;
  authors?: JsonFeedAuthor[];
  tags?: string[];
  attachments?: JsonFeedAttachment[];
}

interface JsonFeed {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  icon?: string;
  authors?: JsonFeedAuthor[];
  language?: string;
  items: JsonFeedItem[];
}

class FeedPublicJsonBuilder {
  private channel: ChannelData;
  private items: Item[];
  private baseUrl: string;

  constructor(feedContent: FeedContent, baseUrl: string) {
    this.channel = feedContent.channel;
    this.items = feedContent.items || [];
    this.baseUrl = baseUrl;
  }

  private buildAuthor(authorName?: string): JsonFeedAuthor[] | undefined {
    if (!authorName) return undefined;
    return [{
      name: authorName
    }];
  }

  private buildAttachment(item: Item): JsonFeedAttachment[] | undefined {
    if (!item.mediaFile?.url) return undefined;

    const attachment: JsonFeedAttachment = {
      url: item.mediaFile.url,
      mime_type: item.mediaFile.contentType,
      size_in_bytes: item.mediaFile.size,
      duration_in_seconds: item.mediaFile.durationSecond
    };

    return [attachment];
  }

  private buildItem(item: Item): JsonFeedItem {
    const jsonItem: JsonFeedItem = {
      id: item.id,
      title: item.title,
      content_html: item.content,
      summary: item.description,
      url: item.link,
      date_published: item.pub_date,
      date_modified: item.updated_at,
      authors: this.buildAuthor(item.author),
      tags: item.categories,
      attachments: this.buildAttachment(item)
    };

    return jsonItem;
  }

  build(): JsonFeed {
    const jsonFeed: JsonFeed = {
      version: "https://jsonfeed.org/version/1.1",
      title: this.channel.title || "Untitled Feed",
      home_page_url: this.channel.link || this.baseUrl,
      feed_url: `${this.baseUrl}/json`,
      description: this.channel.description,
      icon: this.channel.image,
      language: this.channel.language,
      items: this.items
        .filter(item => item.status === 1) // Only published items
        .map(item => this.buildItem(item))
    };

    return jsonFeed;
  }
}

export default FeedPublicJsonBuilder;
