import React from "react";
import EdgeAdminItemsApp from '../../../../edge-src/EdgeAdminItemsApp';
import { renderReactToHtml } from "../../../../edge-src/common/PageUtils";
 
import { withRouteManifest } from "../../../../edge-src/common/withManifest";
import { FeedContent, OnboardingResult } from "../../../../common-src/types/FeedContent";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Add error boundary component for graceful error handling
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
          <h1>Something went wrong</h1>
          <p>There was an error loading the items list.</p>
          <p>
            <a 
              href="/admin/items/new/" 
              style={{ 
                display: "inline-block", 
                padding: "8px 16px", 
                backgroundColor: "#0070f3", 
                color: "white", 
                textDecoration: "none", 
                borderRadius: "4px" 
              }}
            >
              Create a new item
            </a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface RequestData {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest: Record<string, any>;
}

interface RequestProps {
  data: RequestData;
}

async function handleItemsListRequest({ data }: RequestProps): Promise<Response> {
  const {feedContent, onboardingResult} = data;
  
  // Ensure items array always exists and add empty state flag
  if (!feedContent.items) {
    feedContent.items = [];
  }
  feedContent.hasNoItems = feedContent.items.length === 0;

  const fromReact = renderReactToHtml(
    <ErrorBoundary>
      <EdgeAdminItemsApp
        feedContent={feedContent}
        onboardingResult={onboardingResult}
      />
    </ErrorBoundary>
  );

  return new Response(fromReact, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export const onRequestGet = withRouteManifest(handleItemsListRequest as any);
