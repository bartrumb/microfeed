import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {NAV_ITEMS_DICT, OUR_BRAND, NAV_ITEMS} from "../../common-src/constants";
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

interface EdgeCustomCodeEditorAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  themeTemplate: Record<string, any>;
}

class EdgeCustomCodeEditorApp extends React.Component<
  EdgeCustomCodeEditorAppProps & WithManifestProps
> {
  constructor(props: EdgeCustomCodeEditorAppProps & WithManifestProps) {
    super(props);
  }

  render(): React.ReactNode {
    const {feedContent, onboardingResult, manifest, themeTemplate} = this.props;

    // In development, we only need the entry point
    // In production, we need both entry points and critical chunks
    const scripts = [
      'admincustomcode'
    ];

    return (
      <AdminWholeHtml
        title={`${NAV_ITEMS_DICT[NAV_ITEMS.CUSTOM_CODE].name} | ${OUR_BRAND.domain}`}
        description=""
        scripts={scripts}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
        themeTemplate={themeTemplate}
        manifest={manifest}
      />
    );
  }
}

export default withManifest(EdgeCustomCodeEditorApp);
