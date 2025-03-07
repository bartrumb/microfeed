import React from 'react';
import AdminNavApp from '../../components/AdminNavApp';
import TrackingSettingsApp from "./TrackingSettingsApp";
import AccessSettingsApp from "./AccessSettingsApp";
import SubscribeSettingsApp from "./SubscribeSettingsApp";
import CustomCodeSettingsApp from "./CustomCodeSettingsApp";
import WebGlobalSettingsApp from "./WebGlobalSettingsApp";
import Requests from "../../common/requests";
import { ADMIN_URLS, unescapeHtml } from "../../../common-src/StringUtils";
import { showToast } from "../../common/ToastUtils";
import { NAV_ITEMS } from "../../../common-src/Constants";
import { preventCloseWhenChanged } from "../../common/BrowserUtils";
import ApiSettingsApp from "./ApiSettingsApp";
import { 
  FeedContent, 
  OnboardingResult, 
  SETTINGS_CATEGORY, 
  isValidFeedContent 
} from '../../../common-src/types/FeedContent';
import { 
  BaseSettingsProps, 
  CustomCodeSettingsAppProps 
} from './types';

const SUBMIT_STATUS__START = 1;

interface SettingsAppState {
  feed: FeedContent;
  onboardingResult: OnboardingResult;
  submitStatus: number | null;
  submitForType?: SETTINGS_CATEGORY;
  changed: boolean;
}

export default class SettingsApp extends React.Component<Record<string, never>, SettingsAppState> {
  constructor(props: Record<string, never>) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.setChanged = this.setChanged.bind(this);

    const $feedContent = document.getElementById('feed-content');
    const $onboardingResult = document.getElementById('onboarding-result');

    if (!$feedContent || !$onboardingResult) {
      throw new Error('Required DOM elements not found');
    }

    const feed = JSON.parse(unescapeHtml($feedContent.innerHTML));
    const onboardingResult = JSON.parse(unescapeHtml($onboardingResult.innerHTML));

    if (!isValidFeedContent(feed)) {
      throw new Error('Invalid feed content structure');
    }

    this.state = {
      feed,
      onboardingResult,
      submitStatus: null,
      changed: false,
    };
  }

  componentDidMount(): void {
    preventCloseWhenChanged(() => this.state.changed);
  }

  setChanged(): void {
    this.setState({ changed: true });
  }

  onSubmit(e: React.FormEvent, bundleKey: SETTINGS_CATEGORY, bundle: Record<string, unknown>): void {
    e.preventDefault();
    this.setState({ submitForType: bundleKey, submitStatus: SUBMIT_STATUS__START });
    
    Requests.axiosPost(ADMIN_URLS.ajaxFeed(), { settings: { [bundleKey]: bundle } })
      .then(() => {
        this.setState({ submitStatus: null, submitForType: undefined, changed: false }, () => {
          showToast('Updated!', 'success');
        });
      })
      .catch((error: { response?: unknown }) => {
        this.setState({ submitStatus: null, submitForType: undefined }, () => {
          if (!error.response) {
            showToast('Network error. Please refresh the page and try again.', 'error');
          } else {
            showToast('Failed. Please try again.', 'error');
          }
        });
      });
  }

  render(): React.ReactNode {
    const { submitStatus, feed, submitForType, onboardingResult } = this.state;
    const submitting = submitStatus === SUBMIT_STATUS__START;

    const settingsProps: BaseSettingsProps = {
      submitting,
      submitForType,
      feed,
      onSubmit: this.onSubmit,
      setChanged: this.setChanged,
    };

    const customCodeProps: CustomCodeSettingsAppProps = {
      submitting,
      submitForType,
      feed,
    };

    return (
      <AdminNavApp
        currentPage={NAV_ITEMS.SETTINGS}
        onboardingResult={onboardingResult}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 h-full">
              <TrackingSettingsApp {...settingsProps} />
            </div>
            <div className="col-span-1 h-full">
              <AccessSettingsApp {...settingsProps} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 h-full">
              <SubscribeSettingsApp {...settingsProps} />
            </div>
            <div className="col-span-1 h-full">
              <WebGlobalSettingsApp {...settingsProps} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 h-full">
              <CustomCodeSettingsApp {...customCodeProps} />
            </div>
            <div className="col-span-1 h-full">
              <ApiSettingsApp {...settingsProps} />
            </div>
          </div>
        </div>
      </AdminNavApp>
    );
  }
}