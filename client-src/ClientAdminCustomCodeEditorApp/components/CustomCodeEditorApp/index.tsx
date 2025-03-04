// Previous imports remain the same...
import React from 'react';
import AdminNavApp from '../../../components/AdminNavApp';
import {ADMIN_URLS, PUBLIC_URLS, escapeHtml, unescapeHtml} from "../../../../common-src/StringUtils";
import {showToast} from "../../../common/ToastUtils";
import Requests from "../../../common/requests";
import clsx from "clsx";
import ExternalLink from "../../../components/ExternalLink";
import AdminCodeEditor from "../../../components/AdminCodeEditor";
import {
  CODE_TYPES,
  CODE_FILES,
  SETTINGS_CATEGORIES,
} from "../../../../common-src/Constants";
import AdminSelect from "../../../components/AdminSelect";
import {
  CodeTypeOption,
  CodeFileConfig,
  TabButtonProps,
  CodeTabsProps,
  ThemeTemplate,
  FeedContent,
  CustomCodeEditorProps,
  CustomCodeEditorState,
  CODE_FILES_MAPPING,
  HistoryState
} from './types';

// ... Previous constants remain the same ...

function updateUrlParams(codeType: string, codeFile: string, theme = '', push = true): void {
  if ('URLSearchParams' in window) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('type', codeType);
    if (codeType === CODE_TYPES.THEMES) {
      searchParams.set('theme', theme);
    }
    const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}${codeFile ? `#${codeFile}` : ''}`;
    const state: HistoryState = {};
    const title = ''; // History API requires a title string, even if unused
    if (push) {
      history.pushState(state, title, newRelativePathQuery);
    } else {
      history.replaceState(state, title, newRelativePathQuery);
    }
  }
}

// ... Rest of the code remains the same ...