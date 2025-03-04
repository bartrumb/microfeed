import React from "react";
import EdgeHomeApp from '../edge-src/EdgeHomeApp';
import { WebResponseBuilder } from '../edge-src/common/PageUtils';
import { STATUSES } from "../common-src/Constants";
import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  FEED_DB: D1Database;
}

interface RequestContext {
  env: Env;
  request: Request;
}

export async function onRequestGet({ env, request }: RequestContext): Promise<Response> {
  const webResponseBuilder = new WebResponseBuilder(env, request, {
    queryKwargs: {
      status: STATUSES.PUBLISHED,
    },
  });
  return webResponseBuilder.getResponse({
    getComponent: (content, jsonData, theme) => {
      return <EdgeHomeApp jsonData={jsonData} theme={theme} />;
    },
  });
}