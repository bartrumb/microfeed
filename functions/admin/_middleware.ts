import { Context } from "../../common-src/types/CloudflareTypes";
import { FeedContent, SETTINGS_CATEGORY } from "../../common-src/types/FeedContent";
import { OnboardingResult } from "../../common-src/types/FeedContent";

async function addSecurityHeaders({ request, next }: Context): Promise<Response> {
  const response = await next?.();
  if (!response) {
    return new Response('Internal Server Error', { status: 500 });
  }

  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.microfeed.org",
      "font-src 'self' data:",
      "manifest-src 'self'"
    ].join('; ')
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function fetchFeed({ request, next, env, data }: Context): Promise<Response> {
  try {
    const db = env.FEED_DB;

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

    // Get onboarding result
    const onboardingResult: OnboardingResult = {
      requiredOk: true,
      allOk: true,
      result: {
        db: {
          ready: true,
          required: true
        },
        r2: {
          ready: true,
          required: true
        }
      }
    };

    // Add data to context
    data.onboardingResult = onboardingResult;

    // Check access policy
    const accessSettings = data.feedContent.settings?.[SETTINGS_CATEGORY.ACCESS];
    if (accessSettings?.currentPolicy !== 'public') {
      return new Response('Access denied', { status: 403 });
    }

    return next?.() || new Response('Internal Server Error', { status: 500 });
  } catch (error) {
    console.error('Error in admin middleware:', error);
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

export const onRequest = [
  addSecurityHeaders,
  fetchFeed
];
