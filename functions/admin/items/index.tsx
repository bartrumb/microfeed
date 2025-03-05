import { Context } from "../../../common-src/types/CloudflareTypes";
import { FeedContent, OnboardingResult } from "../../../common-src/types/FeedContent";
import EdgeAdminItemsApp from "../../../edge-src/EdgeAdminItemsApp";
import type { EdgeAdminItemsAppProps } from "../../../edge-src/EdgeAdminItemsApp";

interface AdminItemsData {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest: Record<string, { file: string }>;
}

export async function onRequestGet({ request, data }: Context): Promise<Response> {
  const itemsData: AdminItemsData = {
    feedContent: data.feedContent!,
    onboardingResult: data.onboardingResult!,
    manifest: data.manifest || {}
  };

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Items</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="app">
          <EdgeAdminItemsApp 
            feedContent={itemsData.feedContent}
            onboardingResult={itemsData.onboardingResult}
            mode="list"
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
