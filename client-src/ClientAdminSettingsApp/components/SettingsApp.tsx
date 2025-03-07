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
  SETTINGS_CATEGORY
} from '../../../common-src/types/FeedContent';

const SUBMIT_STATUS__START = 1;

interface SettingsAppProps {
  // Empty props as the component gets data from DOM
}

interface SettingsAppState {
  feed: FeedContent;
  onboardingResult: OnboardingResult;
  submitStatus: number | null;
  submitForType?: SETTINGS_CATEGORY;
  changed: boolean;
}

// Default settings for each component
const defaultSettings = {
  [SETTINGS_CATEGORY.ANALYTICS]: { urls: [] },
  [SETTINGS_CATEGORY.ACCESS]: { currentPolicy: undefined },
  [SETTINGS_CATEGORY.SUBSCRIBE]: { enabled: false, buttonText: '', successMessage: '' },
  [SETTINGS_CATEGORY.WEB_GLOBAL]: { title: '', description: '', language: '', timezone: '' },
  [SETTINGS_CATEGORY.API_SETTINGS]: { apiKey: '' }
};

export default class SettingsApp extends React.Component<SettingsAppProps, SettingsAppState> {
  constructor(props: SettingsAppProps) {
    super(props);

    const $feedContent = document.getElementById('feed-content');
    const $onboardingResult = document.getElementById('onboarding-result');

    if (!$feedContent || !$onboardingResult) {
      throw new Error('Required DOM elements not found');
    }

    const feed = JSON.parse(unescapeHtml($feedContent.innerHTML)) as FeedContent;
    const onboardingResult = JSON.parse(unescapeHtml($onboardingResult.innerHTML)) as OnboardingResult;

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

  createSettingsSaveHandler = (category: SETTINGS_CATEGORY) => {
    return async (settings: unknown): Promise<void> => {
      try {
        this.setState({ submitForType: category, submitStatus: SUBMIT_STATUS__START });
        await Requests.axiosPost(ADMIN_URLS.ajaxFeed(), { 
          settings: { [category]: settings } 
        });
        
        // Update local state with new settings
        this.setState(prevState => ({
          submitStatus: null,
          submitForType: undefined,
          changed: false,
          feed: {
            ...prevState.feed,
            settings: {
              ...prevState.feed.settings,
              [category]: settings
            }
          }
        }), () => {
          showToast('Updated!', 'success');
        });
      } catch (error) {
        this.setState({ submitStatus: null, submitForType: undefined }, () => {
          if (!error || !(error as any).response) {
            showToast('Network error. Please refresh the page and try again.', 'error');
          } else {
            showToast('Failed. Please try again.', 'error');
          }
        });
        throw error;
      }
    };
  };

  render(): React.ReactNode {
    const { submitStatus, feed, onboardingResult } = this.state;

    // Get settings with defaults for each component
    const trackingSettings = {
      ...defaultSettings[SETTINGS_CATEGORY.ANALYTICS],
      ...feed.settings[SETTINGS_CATEGORY.ANALYTICS]
    };

    const accessSettings = {
      ...defaultSettings[SETTINGS_CATEGORY.ACCESS],
      ...feed.settings[SETTINGS_CATEGORY.ACCESS]
    };

    const subscribeSettings = {
      ...defaultSettings[SETTINGS_CATEGORY.SUBSCRIBE],
      ...feed.settings[SETTINGS_CATEGORY.SUBSCRIBE]
    };

    const webGlobalSettings = {
      ...defaultSettings[SETTINGS_CATEGORY.WEB_GLOBAL],
      ...feed.settings[SETTINGS_CATEGORY.WEB_GLOBAL]
    };

    const apiSettings = {
      ...defaultSettings[SETTINGS_CATEGORY.API_SETTINGS],
      ...feed.settings[SETTINGS_CATEGORY.API_SETTINGS]
    };

    return (
      <AdminNavApp
        currentPage={NAV_ITEMS.SETTINGS}
        onboardingResult={onboardingResult}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 h-full">
              <TrackingSettingsApp
                settings={trackingSettings}
                onSave={this.createSettingsSaveHandler(SETTINGS_CATEGORY.ANALYTICS)}
              />
            </div>
            <div className="col-span-1 h-full">
              <AccessSettingsApp
                settings={accessSettings}
                onSave={this.createSettingsSaveHandler(SETTINGS_CATEGORY.ACCESS)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 h-full">
              <SubscribeSettingsApp
                settings={subscribeSettings}
                onSave={this.createSettingsSaveHandler(SETTINGS_CATEGORY.SUBSCRIBE)}
              />
            </div>
            <div className="col-span-1 h-full">
              <WebGlobalSettingsApp
                settings={webGlobalSettings}
                onSave={this.createSettingsSaveHandler(SETTINGS_CATEGORY.WEB_GLOBAL)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 h-full">
              <CustomCodeSettingsApp />
            </div>
            <div className="col-span-1 h-full">
              <ApiSettingsApp
                settings={apiSettings}
                onSave={this.createSettingsSaveHandler(SETTINGS_CATEGORY.API_SETTINGS)}
              />
            </div>
          </div>
        </div>
      </AdminNavApp>
    );
  }
}