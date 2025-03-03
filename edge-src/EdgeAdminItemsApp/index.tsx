import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS_DICT, OUR_BRAND, NAV_ITEMS} from "../../common-src/Constants";
import { isDev } from '../common/ManifestUtils';
import { withManifest, WithManifestProps } from '../common/withManifest';
import { EdgeAdminItemsAppProps } from '../../common-src/types/FeedContent';

// Critical chunks that must be loaded before rendering
// Note: These are now handled by the fallback manifest in withManifest
const CRITICAL_CHUNKS: ReadonlyArray<string> = [
  'react-vendor',
  'utils',
  'ui-components',
  'constants'  // Contains NAV_ITEMS_DICT needed by render()
] as const;

class EdgeAdminItemsApp extends React.Component<EdgeAdminItemsAppProps & WithManifestProps> {
  constructor(props: EdgeAdminItemsAppProps & WithManifestProps) {
    super(props);
  }

  render(): React.ReactNode {
    const {feedContent, onboardingResult, manifest} = this.props;

    // Only specify the entry point - HtmlHeader will combine with CRITICAL_CHUNKS
    const scripts: string[] = [
      'adminitems'
    ];

    // Add empty state handling script with proper null checks
    const emptyStateScript = `
      window.addEventListener('DOMContentLoaded', function() {
        const root = document.getElementById('client-side-root');
        if (!root) return;

        const feedContentElement = document.getElementById('feed-content');
        const feedContent = feedContentElement ? JSON.parse(
          decodeURIComponent(
            feedContentElement.innerHTML.replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, '&')
          ) || '{}'
        ) : {};
        
        if (feedContent.hasNoItems) {
          root.innerHTML = '<div class="lh-page-card grid grid-cols-1 gap-4">' +
            '<div class="lh-page-title">' + 
            '${NAV_ITEMS_DICT[NAV_ITEMS.ALL_ITEMS].name}' +
            '</div>' +
            '<div>' +
            '<div class="mb-8">No items yet.</div>' +
            '<a href="/admin/items/new/">Add a new item now <span class="lh-icon-arrow-right"></span></a>' +
            '</div>' +
            '</div>';
        }
      });
    `;

    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.ALL_ITEMS].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={scripts}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      >
        <script dangerouslySetInnerHTML={{ __html: emptyStateScript }} />
      </AdminWholeHtml>
    );
  }
}

// withManifest HOC uses fallback manifest that includes CRITICAL_CHUNKS
export default withManifest(EdgeAdminItemsApp);