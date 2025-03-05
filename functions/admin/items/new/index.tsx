import { Context } from "../../../../common-src/types/CloudflareTypes";
import { FeedContent, OnboardingResult } from "../../../../common-src/types/FeedContent";
import EdgeAdminItemsApp from "../../../../edge-src/EdgeAdminItemsApp";
import type { EdgeAdminItemsAppProps } from "../../../../edge-src/EdgeAdminItemsApp";

interface AdminItemsData {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest: Record<string, { file: string }>;
}

async function handleNewItemRequest({ data }: Context): Promise<Response> {
  const itemsData: AdminItemsData = {
    feedContent: data.feedContent!,
    onboardingResult: data.onboardingResult!,
    manifest: data.manifest || {}
  };

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>New Item</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="app">
          <EdgeAdminItemsApp 
            feedContent={itemsData.feedContent}
            onboardingResult={itemsData.onboardingResult}
            mode="new"
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

export const onRequest = [handleNewItemRequest];
