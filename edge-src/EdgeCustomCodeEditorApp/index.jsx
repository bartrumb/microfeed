import React from 'react';
import AdminWholeHtml from "../components/AdminWholeHtml";
import {escapeHtml} from "../../common-src/StringUtils";
import {OUR_BRAND} from "../../common-src/Constants";

// Use same environment detection as ViteUtils
const isDev = typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'development' && 
  !process.env.CF_PAGES;

export default class EdgeCustomCodeEditorApp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {feedContent, theme, onboardingResult} = this.props;
    const currentThemeTmplJson = {
      themeName: theme.name(),
      rssStylesheet: theme.getRssStylesheetTmpl(),
      webItem: theme.getWebItemTmpl(),
      webFeed: theme.getWebFeedTmpl(),
      webBodyStart: theme.getWebBodyStartTmpl(),
      webBodyEnd: theme.getWebBodyEndTmpl(),
      webHeader: theme.getWebHeaderTmpl(),
    };
    return (
      <AdminWholeHtml
        title={`Code Editor | ${OUR_BRAND.domain}`}
        description=""
        scripts={isDev ? [
          'admincustomcode'
        ] : [
          'react-vendor',
          'utils',
          'ui-components',
          'constants',
          'admincustomcode'
        ]}
        styles={['index', 'admin-styles']}
        feedContent={feedContent}
        onboardingResult={onboardingResult}
      >
      <script
        id="theme-tmpl-json"
        type="application/json"
        dangerouslySetInnerHTML={{__html: escapeHtml(JSON.stringify(currentThemeTmplJson))}}
      />
      </AdminWholeHtml>
    );
  }
}
