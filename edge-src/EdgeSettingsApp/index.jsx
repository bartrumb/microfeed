import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS_DICT, OUR_BRAND, NAV_ITEMS} from "../../common-src/Constants";
import { isDev, loadManifest } from '../common/ManifestUtils';

// Load manifest data
const manifest = loadManifest();

export default class AdminSettingsApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, onboardingResult} = this.props;
    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.SETTINGS].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={isDev ? [
          'adminsettings'
        ] : [
          'react-vendor',
          'utils',
          'ui-components',
          'constants',
          'adminsettings'
        ]}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      />
    );
  }
}
