import React from "react";
import EdgeAdminItemsApp from '../../../../edge-src/EdgeAdminItemsApp';
import {renderReactToHtml} from "../../../../edge-src/common/PageUtils";

import { withRouteManifest } from "../../../../edge-src/common/withManifest";

export const onRequestGet = withRouteManifest(async ({data}) => {
  const {feedContent, onboardingResult} = data;
  const fromReact = renderReactToHtml(<EdgeAdminItemsApp
    feedContent={feedContent}
    onboardingResult={onboardingResult}
    manifest={data.manifest}
  />);
  return new Response(fromReact, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
);
