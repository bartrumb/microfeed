import { OnboardingResult } from '../../../../common-src/types/FeedContent';
import { CODE_FILES, CODE_TYPES } from '../../../../common-src/Constants';

// Add History State interface
export interface HistoryState {
  [key: string]: any;
}

export interface CodeTypeOption {
  label: string;
  value: string;
  theme?: string;
}

export interface CodeFileConfig {
  name: string;
  language: 'html' | 'css';
  viewUrl: (feed?: FeedContent) => string;
  description: JSX.Element;
}

export interface TabButtonProps {
  name: string;
  onClick: () => void;
  selected: boolean;
}

export interface CodeTabsProps {
  codeFile: string;
  codeType: string;
  themeName: string;
  setState: (state: Partial<CustomCodeEditorState>) => void;
}

export interface ThemeTemplate {
  themeName: string;
  rssStylesheet: string;
  webItem: string;
  webFeed: string;
  webBodyStart: string;
  webBodyEnd: string;
  webHeader: string;
}

export interface FeedContent {
  items?: Array<{
    id: string;
    title?: string;
  }>;
  settings: {
    [key: string]: {
      [key: string]: any;
    };
  };
}

export interface CustomCodeEditorProps {
  onboardingResult: OnboardingResult;
}

export interface CustomCodeEditorState {
  codeType: string;
  codeFile: string;
  submitStatus: number | null;
  themeName: string;
  rssStylesheet: string;
  webItem: string;
  webFeed: string;
  webBodyStart: string;
  webBodyEnd: string;
  webHeader: string;
  feed: FeedContent;
  onboardingResult: OnboardingResult;
  changed?: boolean;
  [key: string]: any; // For dynamic code file properties
}

export const CODE_FILES_MAPPING: { [key: string]: Array<string> } = {
  [CODE_TYPES.SHARED]: [
    CODE_FILES.WEB_HEADER,
    CODE_FILES.WEB_BODY_START,
    CODE_FILES.WEB_BODY_END,
  ],
  [CODE_TYPES.THEMES]: [
    CODE_FILES.WEB_FEED,
    CODE_FILES.WEB_ITEM,
    CODE_FILES.WEB_HEADER,
    CODE_FILES.WEB_BODY_START,
    CODE_FILES.WEB_BODY_END,
    CODE_FILES.RSS_STYLESHEET,
  ],
};