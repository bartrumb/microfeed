import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {OUR_BRAND} from "../../common-src/constants";
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

interface EdgeHomeAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
}

class EdgeHomeApp extends React.Component<
  EdgeHomeAppProps & WithManifestProps
> {
  constructor(props: EdgeHomeAppProps & WithManifestProps) {
    super(props);
  }

  render(): React.ReactNode {
    const {feedContent, onboardingResult, manifest} = this.props;

    // In development, we only need the entry point
    // In production, we need both entry points and critical chunks
    const scripts = [
      'adminhome'
    ];

    return (
      <AdminWholeHtml
        title={`Home | ${OUR_BRAND.domain}`}
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

export default withManifest(EdgeHomeApp);
