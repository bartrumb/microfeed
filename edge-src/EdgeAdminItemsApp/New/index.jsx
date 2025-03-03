import React from 'react';
import AdminWholeHtml from "../../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../../common-src/Constants";
import { isDev, loadManifest } from '../../common/ManifestUtils';

// Load manifest data
const manifest = loadManifest('../../../dist/.vite/manifest.json');

export default class AdminItemsNewApp extends React.Component {
  render() {
    const {feedContent, onboardingResult} = this.props;
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
