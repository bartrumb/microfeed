import React from 'react';
import AdminWholeHtml from "../../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../../common-src/Constants";

// Use same environment detection as ViteUtils
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.CF_PAGES;

export default class AdminItemsNewApp extends React.Component {
  render() {
    const {feedContent, onboardingResult} = this.props;
    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.NEW_ITEM].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={isDev ? [
          'new_item_js'
        ] : [
          'react-vendor',
          'utils',
          'ui-components',
          'constants',
          'new_item_js'
        ]}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
      />
    );
  }
}
