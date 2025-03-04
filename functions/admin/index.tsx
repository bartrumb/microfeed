import React from "react";
import { renderReactToHtml } from "../../edge-src/common/PageUtils";
import EdgeAdminHomeApp from "../../edge-src/EdgeAdminHomeApp";
import { FeedContent, OnboardingResult } from "../../common-src/types/FeedContent";

interface RequestData {
  data: {
    feedContent: FeedContent;
    onboardingResult: OnboardingResult;
  };
}

export async function onRequestGet({ data }: RequestData): Promise<Response> {
  const { feedContent, onboardingResult } = data;

  const fromReact = renderReactToHtml(
    <EdgeAdminHomeApp
      feedContent={feedContent}
      onboardingResult={onboardingResult}
    />
  );

  return new Response(fromReact, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}