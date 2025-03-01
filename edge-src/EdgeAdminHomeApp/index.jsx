import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../common-src/Constants";

export default class EdgeAdminHomeApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, onboardingResult} = this.props;
    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.ADMIN_HOME].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={['ClientAdminHomeApp']}
        styles={['index']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
      />
    );
  }
}
