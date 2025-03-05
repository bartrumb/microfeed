import { FeedContent, Item, ChannelData } from '../../common-src/types/FeedContent';

interface RssEnclosure {
  url: string;
  type: string;
  length?: number;
}

interface RssItem {
  title: string;
  link?: string;
  description?: string;
  author?: string;
  categories?: string[];
  enclosure?: RssEnclosure;
  guid: string;
  pubDate?: string;
  'content:encoded'?: string;
  'itunes:duration'?: string;
}

class FeedPublicRssBuilder {
  private channel: ChannelData;
  private items: Item[];
  private baseUrl: string;

  constructor(feedContent: FeedContent, baseUrl: string) {
    this.channel = feedContent.channel;
    this.items = feedContent.items || [];
    this.baseUrl = baseUrl;
  }

  private formatDate(dateString?: string): string | undefined {
    if (!dateString) return undefined;
    return new Date(dateString).toUTCString();
  }

  private formatDuration(seconds?: number): string | undefined {
    if (!seconds) return undefined;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private buildItem(item: Item): RssItem {
    const rssItem: RssItem = {
      title: item.title,
      link: item.link,
      description: item.description,
      author: item.author,
      categories: item.categories,
      guid: item.id,
      pubDate: this.formatDate(item.pub_date),
      'content:encoded': item.content
    };

    if (item.mediaFile) {
      rssItem.enclosure = {
        url: item.mediaFile.url,
        type: item.mediaFile.contentType || 'application/octet-stream',
        length: item.mediaFile.size
      };
      rssItem['itunes:duration'] = this.formatDuration(item.mediaFile.durationSecond);
    }

    return rssItem;
  }

  private escapeXml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
  }

  build(): string {
    const rssItems = this.items
      .filter(item => item.status === 1) // Only published items
      .map(item => this.buildItem(item));

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss/stylesheet"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${this.escapeXml(this.channel.title)}</title>
    <link>${this.escapeXml(this.channel.link || this.baseUrl)}</link>
    <description>${this.escapeXml(this.channel.description || '')}</description>
    <language>${this.escapeXml(this.channel.language)}</language>
    <copyright>${this.escapeXml(this.channel.copyright)}</copyright>
    <image>
      <url>${this.escapeXml(this.channel.image)}</url>
      <title>${this.escapeXml(this.channel.title)}</title>
      <link>${this.escapeXml(this.channel.link || this.baseUrl)}</link>
    </image>
    <itunes:explicit>${this.channel['itunes:explicit'] ? 'yes' : 'no'}</itunes:explicit>
    <itunes:type>${this.escapeXml(this.channel['itunes:type'])}</itunes:type>
    <itunes:complete>${this.channel['itunes:complete'] ? 'yes' : 'no'}</itunes:complete>
    <itunes:block>${this.channel['itunes:block'] ? 'yes' : 'no'}</itunes:block>
    ${rssItems.map(item => this.itemToXml(item)).join('\n    ')}
  </channel>
</rss>`;

    return rss;
  }

  private itemToXml(item: RssItem): string {
    return `<item>
      <title>${this.escapeXml(item.title)}</title>
      ${item.link ? `<link>${this.escapeXml(item.link)}</link>` : ''}
      ${item.description ? `<description>${this.escapeXml(item.description)}</description>` : ''}
      ${item.author ? `<author>${this.escapeXml(item.author)}</author>` : ''}
      ${item.categories?.map(category => `<category>${this.escapeXml(category)}</category>`).join('\n      ') || ''}
      ${item.enclosure ? `<enclosure url="${this.escapeXml(item.enclosure.url)}" type="${this.escapeXml(item.enclosure.type)}"${item.enclosure.length ? ` length="${item.enclosure.length}"` : ''}/>` : ''}
      <guid isPermaLink="false">${this.escapeXml(item.guid)}</guid>
      ${item.pubDate ? `<pubDate>${item.pubDate}</pubDate>` : ''}
      ${item['content:encoded'] ? `<content:encoded>${this.escapeXml(item['content:encoded'])}</content:encoded>` : ''}
      ${item['itunes:duration'] ? `<itunes:duration>${item['itunes:duration']}</itunes:duration>` : ''}
    </item>`;
  }
}

export default FeedPublicRssBuilder;
