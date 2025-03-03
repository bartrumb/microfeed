import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../common-src/Constants";
import { isDev } from '../common/ManifestUtils';
import { withManifest } from '../common/withManifest';

class EdgeAdminHomeApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, onboardingResult, manifest} = this.props;
    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.ADMIN_HOME].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={[
          'adminhome'
 // Only include actual entry points, not chunks
        ]}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      />
    );
  }
}

export default withManifest(EdgeAdminHomeApp);
