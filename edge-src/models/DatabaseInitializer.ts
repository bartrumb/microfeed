import { Env } from '../../common-src/types/CloudflareTypes';
import { FeedContent, ChannelData, SettingsData, SETTINGS_CATEGORY } from '../../common-src/types/FeedContent';

interface InitializationResult {
  success: boolean;
  error?: string;
}

interface TableSchema {
  name: string;
  sql: string;
}

class DatabaseInitializer {
  private db: D1Database;
  private env: Env;

  constructor(env: Env) {
    this.db = env.FEED_DB;
    this.env = env;
  }

  private async createTables(): Promise<InitializationResult> {
    const tables: TableSchema[] = [
      {
        name: 'feed_content',
        sql: `
          CREATE TABLE IF NOT EXISTS feed_content (
            channel TEXT NOT NULL,
            items TEXT,
            settings TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];

    try {
      for (const table of tables) {
        await this.db.prepare(table.sql).run();
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating tables'
      };
    }
  }

  private getDefaultChannel(): ChannelData {
    return {
      id: crypto.randomUUID(),
      title: 'My Feed',
      description: 'A new microfeed instance',
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
    };
  }

  private getDefaultSettings(): SettingsData {
    return {
      [SETTINGS_CATEGORY.WEB_GLOBAL]: {
        itemsSortOrder: 'desc',
        itemsPerPage: 10
      },
      [SETTINGS_CATEGORY.API_SETTINGS]: {
        enabled: false,
        apps: []
      },
      [SETTINGS_CATEGORY.SUBSCRIBE]: {
        methods: []
      },
      [SETTINGS_CATEGORY.ACCESS]: {
        currentPolicy: 'public'
      },
      [SETTINGS_CATEGORY.ANALYTICS]: {
        urls: []
      },
      [SETTINGS_CATEGORY.CUSTOM_CODE]: {}
    };
  }

  private async insertDefaultContent(): Promise<InitializationResult> {
    try {
      // First check if any content exists
      const existingContent = await this.db.prepare('SELECT COUNT(*) as count FROM feed_content').first();
      if (existingContent && (existingContent.count as number) > 0) {
        return { success: true };
      }

      const defaultContent: FeedContent = {
        channel: this.getDefaultChannel(),
        items: [],
        settings: this.getDefaultSettings()
      };

      await this.db.prepare(
        'INSERT INTO feed_content (channel, items, settings) VALUES (?, ?, ?)'
      ).bind(
        JSON.stringify(defaultContent.channel),
        JSON.stringify(defaultContent.items),
        JSON.stringify(defaultContent.settings)
      ).run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error inserting default content'
      };
    }
  }

  async initialize(): Promise<InitializationResult> {
    try {
      // Create tables
      const tablesResult = await this.createTables();
      if (!tablesResult.success) {
        return tablesResult;
      }

      // Insert default content if none exists
      const contentResult = await this.insertDefaultContent();
      if (!contentResult.success) {
        return contentResult;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during initialization'
      };
    }
  }
}

export default DatabaseInitializer;