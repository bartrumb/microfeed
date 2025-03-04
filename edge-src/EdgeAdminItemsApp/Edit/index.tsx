import React from 'react';
import AdminWholeHtml from "../../components/AdminWholeHtml";
import { OUR_BRAND } from "../../../common-src/Constants";
import { isDev } from '../../common/ManifestUtils';
import { FeedContent, OnboardingResult } from "../../../common-src/types/FeedContent";

interface AdminItemsEditAppProps {
  feedContent: FeedContent;
  itemId: string;
  onboardingResult: OnboardingResult;
}

export default class AdminItemsEditApp extends React.Component<AdminItemsEditAppProps> {
  render(): React.ReactNode {
    const { feedContent, itemId, onboardingResult } = this.props;
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