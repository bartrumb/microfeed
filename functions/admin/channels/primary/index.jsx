import React from "react";
import EdgeAdminChannelApp from '../../../../edge-src/EdgeAdminChannelApp';
import {renderReactToHtml} from "../../../../edge-src/common/PageUtils";
import { withRouteManifest } from "../../../../edge-src/common/withManifest";

async function handleChannelRequest({ data }) {
  const {feedContent, onboardingResult} = data;

  const fromReact = renderReactToHtml(
    <EdgeAdminChannelApp
      feedContent={feedContent}
      onboardingResult={onboardingResult}
      manifest={data.manifest}
    />
  );

  return new Response(fromReact, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export const onRequestGet = withRouteManifest(handleChannelRequest);
