import React from "react";
import EdgeAdminItemsApp from '../../../../edge-src/EdgeAdminItemsApp';
import {renderReactToHtml} from "../../../../edge-src/common/PageUtils";
import { withRouteManifest } from "../../../../edge-src/common/withManifest";

// Add error boundary component for graceful error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
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

async function handleItemsListRequest({data}) {
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
        manifest={data.manifest}
      />
    </ErrorBoundary>
  );

  return new Response(fromReact, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export const onRequestGet = withRouteManifest(handleItemsListRequest);
