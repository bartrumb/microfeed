import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS_DICT, OUR_BRAND, NAV_ITEMS} from "../../common-src/Constants";
import { isDev } from '../common/ManifestUtils';
import { withManifest, WithManifestProps } from '../common/withManifest';
import { FeedContent, OnboardingResult } from '../../common-src/types/FeedContent';

// Critical chunks that should be loaded first
const CRITICAL_CHUNKS = [
  'react-vendor',
  'utils',
  'ui-components',
  'constants'
];

interface EdgeSettingsAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
}

class EdgeSettingsApp extends React.Component<
  EdgeSettingsAppProps & WithManifestProps
> {
  constructor(props: EdgeSettingsAppProps & WithManifestProps) {
    super(props);
  }

  render(): React.ReactNode {
    const {feedContent, onboardingResult, manifest} = this.props;

    // In development, we only need the entry point
    // In production, we need both entry points and critical chunks
    const scripts = [
      'adminsettings'
    ];

    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.SETTINGS].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={scripts}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        manifest={manifest}
      />
    );
  }
}

export default withManifest(EdgeSettingsApp);
