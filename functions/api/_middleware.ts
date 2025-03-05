import { Context } from '../../common-src/types/CloudflareTypes';
import { FeedContent, SettingsData, SETTINGS_CATEGORY, ApiApp } from '../../common-src/types/FeedContent';

async function fetchFeedAndAuth({ request, next, env, data }: Context): Promise<Response> {
  const db = env.MICROFEED_DB;
  const contentFromDb = await db.prepare('SELECT * FROM feed_content').first() as FeedContent;
  
  // Initialize settings if not present
  const settings: SettingsData = contentFromDb.settings || {};
  data.feedContent = contentFromDb;

  // Check if API is enabled
  const apiKey = request.headers.get('X-API-KEY');
  if (!apiKey) {
    return new Response('API key is required', { status: 401 });
  }

  // Validate API key if settings exist
  if (contentFromDb.settings) {
    const apiSettings = contentFromDb.settings[SETTINGS_CATEGORY.API_SETTINGS];
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
}

export const onRequest = [fetchFeedAndAuth];
