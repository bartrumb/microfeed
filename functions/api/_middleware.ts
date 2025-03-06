import { Context } from '../../common-src/types/CloudflareTypes';
import { FeedContent, SettingsData, SETTINGS_CATEGORY, ApiApp } from '../../common-src/types/FeedContent';

async function fetchFeedAndAuth({ request, next, env, data }: Context): Promise<Response> {
  const db = env.FEED_DB;
  
  try {
    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS feed_content (
        channel TEXT NOT NULL,
        items TEXT,
        settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const contentFromDb = await db.prepare('SELECT * FROM feed_content').first();
    if (!contentFromDb) {
      // Initialize with default content
      const defaultContent: FeedContent = {
        channel: {
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
        },
        items: [],
        settings: {
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
        }
      };

      await db.prepare(
        'INSERT INTO feed_content (channel, items, settings) VALUES (?, ?, ?)'
      ).bind(
        JSON.stringify(defaultContent.channel),
        JSON.stringify(defaultContent.items),
        JSON.stringify(defaultContent.settings)
      ).run();

      data.feedContent = defaultContent;
    } else {
      data.feedContent = {
        channel: JSON.parse(contentFromDb.channel as string),
        items: JSON.parse(contentFromDb.items as string || '[]'),
        settings: JSON.parse(contentFromDb.settings as string || '{}')
      };
    }

    // Check if API is enabled
    const apiKey = request.headers.get('X-API-KEY');
    if (!apiKey) {
      return new Response('API key is required', { status: 401 });
    }

    // Validate API key if settings exist
    if (data.feedContent.settings) {
      const apiSettings = data.feedContent.settings[SETTINGS_CATEGORY.API_SETTINGS];
      if (!apiSettings?.enabled) {
        return new Response('API is not enabled', { status: 403 });
      }

      if (apiSettings.apps && apiSettings.apps.length > 0) {
        const tokenMatched = apiSettings.apps.some((app: ApiApp) => app.token === apiKey);
        if (!tokenMatched) {
          return new Response('Invalid API key', { status: 401 });
        }
      }
    }

    return next?.() || new Response('Internal server error', { status: 500 });
  } catch (error) {
    console.error('Error in API middleware:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const onRequest = [fetchFeedAndAuth];
