import React from 'react';
import AdminWholeHtml from "../../components/AdminWholeHtml";
import {OUR_BRAND} from "../../../common-src/Constants";

// Use same environment detection as ViteUtils
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.CF_PAGES;

export default class AdminItemsEditApp extends React.Component {
  render() {
    const {feedContent, itemId, onboardingResult} = this.props;
    return (
      <AdminWholeHtml
        title={`Edit item (id = ${itemId}) | ${OUR_BRAND.domain}`}
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
      >
        <div id="lh-data-params" data-item-id={itemId} />
      </AdminWholeHtml>
    );
  }
}
