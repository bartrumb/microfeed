import React from "react";
import EdgeAdminItemsApp from '../../../../edge-src/EdgeAdminItemsApp/Edit';
import FeedDb from "../../../../edge-src/models/FeedDb";
import { renderReactToHtml } from "../../../../edge-src/common/PageUtils";
import { OnboardingChecker } from "../../../../common-src/OnboardingUtils";
import { STATUSES } from "../../../../common-src/Constants";
import { Env } from "../../../../common-src/types/CloudflareTypes";
import { FeedContent, OnboardingResult } from "../../../../common-src/types/FeedContent";

interface RequestParams {
  env: Env;
  params: {
    itemId: string;
  };
  request: Request;
}

export async function onRequestGet({ env, params, request }: RequestParams): Promise<Response> {
  const { itemId } = params;
  const feed = new FeedDb(env, request);
  
  // Get the specific item
  const item = await feed.getItem(itemId);
  if (!item || item.status === STATUSES.DELETED) {
    return new Response('Not found', { status: 404 });
  }

  // Get the full content with the item
  const content = await feed.getContent({
    limit: 1,
    status: item.status,
  });

  // Set the specific item in the content
  content.item = item;

  const onboardingChecker = new OnboardingChecker(env);
  const onboardingResult = await onboardingChecker.checkAll() as OnboardingResult;

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
}