import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../common-src/Constants";
import { isDev, loadManifest } from '../common/ManifestUtils';

// Load manifest data
const manifest = loadManifest();

export default class EdgeAdminChannelApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, onboardingResult} = this.props;
    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.EDIT_CHANNEL].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={isDev ? [
          'adminchannel'
        ] : [
          'react-vendor',
          'utils',
          'ui-components',
          'constants',
          'adminchannel'
        ]}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      />
    );
  }
}
