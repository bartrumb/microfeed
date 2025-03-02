import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS, NAV_ITEMS_DICT, OUR_BRAND} from "../../common-src/Constants";

const isDev = process.env.NODE_ENV === 'development';

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
        scripts={isDev ? [
          // In development, let Vite handle the dependencies
          'adminhome'
        ] : [
          // In production, load chunks in correct order
          'react-vendor',
          'utils',
          'ui-components',
          'Constants',
          'index',
          'adminhome'
        ]
        }
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
      />
    );
  }
}
