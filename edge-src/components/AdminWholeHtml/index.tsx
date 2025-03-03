import React from 'react';
import HtmlHeader from "../HtmlHeader";
import {escapeHtml} from "../../../common-src/StringUtils";
import { FeedContent, OnboardingResult } from "../../../common-src/types/FeedContent";

interface AdminWholeHtmlProps {
  title: string;
  description?: string;
  scripts: string[];
  styles: string[];
  feedContent?: FeedContent;
  onboardingResult?: OnboardingResult;
  manifest?: Record<string, any>;
  themeTemplate?: Record<string, any>;
  children?: React.ReactNode;
}

export default class AdminWholeHtml extends React.Component<
  AdminWholeHtmlProps
> {
  render() {
    const {
      title,
      description,
      scripts,
      styles,
      feedContent,
      onboardingResult,
      manifest,
      themeTemplate,
    } = this.props;

    return (
      <html lang="en">
        <HtmlHeader
          title={title}
          description={description}
          scripts={scripts}
          styles={styles}
          manifest={manifest}
          favicon={{
            'apple-touch-icon': '/assets/favicon/apple-touch-icon.png',
            '32x32': '/assets/favicon/favicon-32x32.png',
            '16x16': '/assets/favicon/favicon-16x16.png',
            'manifest': '/assets/favicon/site.webmanifest',
            'mask-icon': {
              'href': '/assets/favicon/safari-pinned-tab.svg',
              'color': '#5bbad5',
            },
            'msapplication-TileColor': '#2c2b3d',
            'theme-color': '#2c2b3d',
          }}
        />
        <body>
          <div id="client-side-root"/>
          {this.props.children}
          {feedContent && <script
            id="feed-content"
            type="application/json"
            dangerouslySetInnerHTML={{__html: escapeHtml(JSON.stringify(feedContent))}}
          />}
          {onboardingResult && <script
            id="onboarding-result"
            type="application/json"
            dangerouslySetInnerHTML={{__html: escapeHtml(JSON.stringify(onboardingResult))}}
          />}
          {themeTemplate && <script
            id="theme-tmpl-json"
            type="application/json"
            dangerouslySetInnerHTML={{__html: escapeHtml(JSON.stringify(themeTemplate))}}
          />}
        </body>
      </html>
    );
  }
}
