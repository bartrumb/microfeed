import { Context } from "../../../common-src/types/CloudflareTypes";
import { FeedContent, OnboardingResult } from "../../../common-src/types/FeedContent";
import EdgeSettingsApp from "../../../edge-src/EdgeSettingsApp";
import type { EdgeSettingsAppProps } from "../../../edge-src/EdgeSettingsApp";

interface AdminSettingsData {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest: Record<string, { file: string }>;
}

async function handleSettingsRequest({ data }: Context): Promise<Response> {
  const settingsData: AdminSettingsData = {
    feedContent: data.feedContent!,
    onboardingResult: data.onboardingResult!,
    manifest: data.manifest || {}
  };

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Settings</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="app">
          <EdgeSettingsApp 
            feedContent={settingsData.feedContent}
            onboardingResult={settingsData.onboardingResult}
          />
        </div>
      </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

export const onRequest = [handleSettingsRequest];
