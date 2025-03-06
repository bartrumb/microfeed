import { Context } from "../../common-src/types/CloudflareTypes";
import FeedDb from "../../edge-src/models/FeedDb";
import { FeedCrudManager, getFetchItemsParams } from "../../edge-src/models/FeedCrudManager";
import { OnboardingResult } from "../../common-src/types/FeedContent";
import DatabaseInitializer from "../../edge-src/models/DatabaseInitializer";

// Import InitializationResult interface
interface InitializationResult {
  success: boolean;
  error?: string;
}

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function initializeDatabase({ env }: Context): Promise<InitializationResult> {
  const initializer = new DatabaseInitializer(env);
  return initializer.initialize();
}

async function fetchFeed({ request, next, env, data }: Context): Promise<Response> {
  // Initialize database first
  const dbResult = await initializeDatabase({ request, next, env, data });
  if (!dbResult.success) {
    return new Response(`Database initialization failed: ${dbResult.error}`, { status: 500 });
  }

  const feedManager = new FeedCrudManager({ env });
  await feedManager.init();

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
  data.feedContent = await feedManager.getFeedContent();
  data.onboardingResult = onboardingResult;

  return next?.() || new Response('Internal Server Error', { status: 500 });
}

export const onRequest = [
  addSecurityHeaders,
  fetchFeed
];
