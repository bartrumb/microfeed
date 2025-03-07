import React from "react";
import EdgeHomeApp from '../edge-src/EdgeHomeApp';
import { WebResponseBuilder } from '../edge-src/common/PageUtils';
import { STATUSES } from "../common-src/constants";
import { FeedContent, OnboardingResult } from "../common-src/types/FeedContent";
import Theme from "../edge-src/models/Theme";
import type { Env } from '../common-src/types/CloudflareTypes';

interface RequestContext {
  env: Env;
  request: Request;
}

interface JsonData {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
}

export async function onRequestGet({ env, request }: RequestContext): Promise<Response> {
  const webResponseBuilder = new WebResponseBuilder(env, request, {
    queryKwargs: {
      status: STATUSES.PUBLISHED,
    },
  });
  return webResponseBuilder.getResponse({
    getComponent: (content: FeedContent, jsonData: JsonData, theme: Theme) => {
      return <EdgeHomeApp 
        feedContent={content} 
        onboardingResult={jsonData.onboardingResult}
      />;
    },
  });
}