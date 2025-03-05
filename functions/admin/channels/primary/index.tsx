import { Context } from "../../../../common-src/types/CloudflareTypes";
import { FeedContent, OnboardingResult } from "../../../../common-src/types/FeedContent";
import EdgeAdminChannelApp from "../../../../edge-src/EdgeAdminChannelApp";
import type { EdgeAdminChannelAppProps } from "../../../../edge-src/EdgeAdminChannelApp";

interface AdminChannelData {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest: Record<string, { file: string }>;
}

async function handleChannelRequest({ data }: Context): Promise<Response> {
  const channelData: AdminChannelData = {
    feedContent: data.feedContent!,
    onboardingResult: data.onboardingResult!,
    manifest: data.manifest || {}
  };

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Channel Settings</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="app">
          <EdgeAdminChannelApp 
            feedContent={channelData.feedContent}
            onboardingResult={channelData.onboardingResult}
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

export const onRequest = [handleChannelRequest];
