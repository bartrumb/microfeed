import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS_DICT, OUR_BRAND, NAV_ITEMS} from "../../common-src/Constants";
import { isDev } from '../common/ManifestUtils';
import { withManifest } from '../common/withManifest';

// Critical chunks that must be loaded before rendering
// This informs withManifest + HtmlHeader about required dependencies
const CRITICAL_CHUNKS = [
  'react-vendor',
  'utils',
  'ui-components',
  'constants'  // Contains NAV_ITEMS_DICT needed by render()
];

class EdgeAdminItemsApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, onboardingResult, manifest} = this.props;

    // Only specify the entry point - HtmlHeader will combine with CRITICAL_CHUNKS
    const scripts = [
      'adminitems'
    ];

    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.ITEMS].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={scripts}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      />
    );
  }
}

// withManifest HOC uses CRITICAL_CHUNKS to ensure dependencies are loaded
export default withManifest(EdgeAdminItemsApp);
