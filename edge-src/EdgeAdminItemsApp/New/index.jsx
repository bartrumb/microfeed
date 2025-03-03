import React from 'react';
import AdminWholeHtml from "../../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../../common-src/Constants";
import { isDev } from '../../common/ManifestUtils';
import { withManifest } from '../../common/withManifest';

class AdminItemsNewApp extends React.Component {
  render() {
    const {feedContent, onboardingResult, manifest} = this.props;
    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.NEW_ITEM].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={isDev ? [
          'adminitems'
        ] : [
          'react-vendor',
          'utils',
          'ui-components',
          'constants',
          'adminitems'
        ]}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      />
    );
  }
}

export default withManifest(AdminItemsNewApp);
