import React from "react";
import AdminItemsNewApp from '../../../../edge-src/EdgeAdminItemsApp/New';
import {renderReactToHtml} from "../../../../edge-src/common/PageUtils";
import { withRouteManifest } from "../../../../edge-src/common/withManifest";

async function handleNewItemRequest({data}) {
  const {feedContent, onboardingResult} = data;

  const fromReact = renderReactToHtml(
    <AdminItemsNewApp
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

export const onRequestGet = withRouteManifest(handleNewItemRequest);
