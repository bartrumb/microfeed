import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS_DICT, OUR_BRAND, NAV_ITEMS} from "../../common-src/Constants";
import { isDev } from '../common/ManifestUtils';
import { withManifest } from '../common/withManifest';

// Critical chunks that should be loaded first
const CRITICAL_CHUNKS = [
  'react-vendor',
  'utils',
  'ui-components',
  'constants'
];

class EdgeAdminItemsApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, onboardingResult, manifest} = this.props;

    // In development, we only need the entry point 
    // In production/preview, we need both entry points and critical chunks
    const scripts = isDev ? [
      'adminitems'
    ] : [
      'react-vendor',
      'utils',
      'ui-components',
      'constants',
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

export default withManifest(EdgeAdminItemsApp);
