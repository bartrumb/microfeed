import React from "react";
import AdminSettingsApp from "../../../edge-src/EdgeSettingsApp";
import {renderReactToHtml} from "../../../edge-src/common/PageUtils";
import { withRouteManifest } from "../../../edge-src/common/withManifest";

async function handleSettingsRequest({data}) {
  const {feedContent, onboardingResult} = data;

  const fromReact = renderReactToHtml(
    <AdminSettingsApp
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

export const onRequestGet = withRouteManifest(handleSettingsRequest);
