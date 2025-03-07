import React from "react";
import EdgeAdminItemsApp from '../../../../edge-src/EdgeAdminItemsApp/Edit';
import FeedDb from "../../../../edge-src/models/FeedDb";
import { renderReactToHtml } from "../../../../edge-src/common/PageUtils";
import { OnboardingChecker } from "../../../../common-src/OnboardingUtils";
import { STATUSES } from "../../../../common-src/Constants";
import { Env } from "../../../../common-src/types/CloudflareTypes";
import { FeedContent } from "../../../../common-src/types/FeedContent";
import { QueryOptions } from "../../../../edge-src/models/FeedDb";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const itemId = (params as Record<string, string>).itemId;

  // Initialize FeedDb with full env object
  const feed = new FeedDb(env, request);

  // Use proper QueryOptions interface
  const queryOptions: QueryOptions = {
    limit: 1,
    status: undefined,
    cursor: undefined,
    sortOrder: 'desc'
  };

  // Get content with proper query options
  const content = await feed.getContent(queryOptions);

  // Set the first item if available
  if (content.items && content.items.length > 0) {
    content.item = content.items[0];
  }

  // Check if item exists and is not deleted
  if (!content.item || content.item.status === STATUSES.DELETED) {
    return new Response('Not found', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }

  // Initialize onboarding checker with full env object
  const onboardingChecker = new OnboardingChecker(env);
  const onboardingResult = await onboardingChecker.checkAll();

  // Render the React component
  const fromReact = renderReactToHtml(
    <EdgeAdminItemsApp
      feedContent={content}
      itemId={itemId}
      onboardingResult={onboardingResult}
    />
  );

  return new Response(fromReact, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};