import {ADMIN_URLS, urlJoin} from "../../common-src/StringUtils";
import FeedDb, {getFetchItemsParams} from "../../edge-src/models/FeedDb";
import OnboardingChecker from "../../common-src/OnboardingUtils";
import {STATUSES} from "../../common-src/Constants";

async function addSecurityHeaders({request, next}) {
  const response = await next();
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Remove unneeded headers
  newResponse.headers.delete('content-security-policy');
  
  // Add cache control for static assets
  const url = new URL(request.url);
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    newResponse.headers.set('Cache-Control', 'no-cache, must-revalidate');
  }
  
  return newResponse;
}

async function fetchFeed({request, next, env, data}) {
  const urlObj = new URL(request.url);

  if (urlObj.pathname.startsWith(urlJoin(ADMIN_URLS.home(), '/ajax/'))) {
    return next();
  }

  let fetchItems = null;
  if (urlObj.pathname.startsWith(urlJoin(ADMIN_URLS.home(), '/feed/json')) ||
      urlObj.pathname.startsWith(urlJoin(ADMIN_URLS.home(), '/items/list'))) {
    fetchItems = getFetchItemsParams(request, {
      'status__!=': STATUSES.DELETED,
    });
  } else if (urlObj.pathname.startsWith(urlJoin(ADMIN_URLS.home(), '/items/'))) {
    // Either /items/ or /items/{id}
    if (!urlObj.pathname.startsWith(urlJoin(ADMIN_URLS.home(), '/items/new'))) {
      return next();
    }
  } else if (urlObj.pathname.startsWith(urlJoin(ADMIN_URLS.home(), '/settings/code-editor'))) {
    fetchItems = getFetchItemsParams(request, {
      'status__!=': STATUSES.DELETED,
    }, 1);
  }

  const feedDb = new FeedDb(env, request);
  const contentFromDb = await feedDb.getContent(fetchItems)

  const onboardingChecker = new OnboardingChecker(contentFromDb, request, env);
  const onboardingResult = onboardingChecker.getResult();

  data.feedDb = feedDb;
  data.feedContent = contentFromDb;
  data.onboardingResult = onboardingResult;

  return next();
}

export const onRequest = [addSecurityHeaders, fetchFeed];
