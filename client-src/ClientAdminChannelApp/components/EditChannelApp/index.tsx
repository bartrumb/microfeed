import React from 'react';
import Requests from '../../../common/requests';
import AdminNavApp from '../../../components/AdminNavApp';
import AdminImageUploaderApp from '../../../components/AdminImageUploaderApp';
import AdminInput from "../../../components/AdminInput";
import AdminRadio from "../../../components/AdminRadio";
import {unescapeHtml} from '../../../../common-src/StringUtils';
import {showToast} from "../../../common/ToastUtils";
import * as AdminSideQuickLinksModule from "../../../components/AdminSideQuickLinks";
import AdminRichEditor from "../../../components/AdminRichEditor";
import AdminSelect from "../../../components/AdminSelect";
import {LANGUAGE_CODES_LIST, ITUNES_CATEGORIES_DICT, NAV_ITEMS} from "../../../../common-src/Constants";
import ExplainText, { ExplainBundle } from "../../../components/ExplainText";
import {CHANNEL_CONTROLS, CONTROLS_TEXTS_DICT} from "./FormExplainTexts";
import {preventCloseWhenChanged} from "../../../common/BrowserUtils";

const SUBMIT_STATUS__START = 1;

interface LanguageCode {
  code: string;
  name: string;
  value: string;
  label: React.ReactNode;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface Channel {
  id?: string;
  image?: string;
  title?: string;
  publisher?: string;
  link?: string;
  categories?: string[];
  language?: string;
  description?: string;
  copyright?: string;
  'itunes:explicit'?: boolean;
  'itunes:title'?: string;
  'itunes:type'?: 'episodic' | 'serial';
  'itunes:email'?: string;
  'itunes:new-feed-url'?: string;
  'itunes:block'?: boolean;
  'itunes:complete'?: boolean;
}

interface WebGlobalSettings {
  publicBucketUrl?: string;
}

interface Feed {
  channel: Channel;
  settings: {
    webGlobalSettings: WebGlobalSettings;
  };
}

interface OnboardingResult {
  [key: string]: any;
}

interface EditChannelAppState {
  feed: Feed;
  onboardingResult: OnboardingResult;
  channel: Channel;
  submitStatus: number | null;
  changed: boolean;
}

const LANGUAGE_CODES_DICT: { [key: string]: LanguageCode } = {};
const LANGUAGE_CODES_SELECT_OPTIONS: LanguageCode[] = [];

LANGUAGE_CODES_LIST.forEach((lc: { code: string; name: string }) => {
  LANGUAGE_CODES_DICT[lc.code] = {
    code: lc.code,
    name: lc.name,
    value: `${lc.name} ${lc.code}`,
    label: <div>
      <div>{lc.name}</div>
      <div className="text-muted-color text-sm">{lc.code}</div>
    </div>,
  };
  LANGUAGE_CODES_SELECT_OPTIONS.push(LANGUAGE_CODES_DICT[lc.code]);
});

const CATEGORIES_SELECT_OPTIONS: CategoryOption[] = [];
const CATEGORIES_DICT: { [key: string]: CategoryOption } = {};

Object.keys(ITUNES_CATEGORIES_DICT as Record<string, string[]>).forEach((topLevel: string) => {
  const topLevelOption = {
    value: topLevel,
    label: topLevel,
  };
  CATEGORIES_SELECT_OPTIONS.push(topLevelOption);
  CATEGORIES_DICT[topLevel] = topLevelOption;
  (ITUNES_CATEGORIES_DICT as Record<string, string[]>)[topLevel].forEach((subLevel: string) => {
    const subLevelValue = `${topLevel} / ${subLevel}`;
    const subLevelOption = {
      value: subLevelValue,
      label: subLevelValue,
    };
    CATEGORIES_SELECT_OPTIONS.push(subLevelOption);
    CATEGORIES_DICT[subLevelValue] = subLevelOption;
  });
});

export default class EditChannelApp extends React.Component<{}, EditChannelAppState> {
  constructor(props: {}) {
    super(props);

    let feed: Feed = { 
      channel: {}, 
      settings: { 
        webGlobalSettings: {} 
      } 
    };
    let onboardingResult: OnboardingResult = {};
    
    try {
      const feedContent = document.getElementById('feed-content')?.innerHTML;
      const onboardingContent = document.getElementById('onboarding-result')?.innerHTML;
      
      if (feedContent) feed = JSON.parse(unescapeHtml(feedContent));
      if (onboardingContent) onboardingResult = JSON.parse(unescapeHtml(onboardingContent));
    } catch (error) {
      console.error('Error parsing feed or onboarding content:', error);
    }

    const channel = feed.channel || {};

    this.state = {
      feed,
      onboardingResult,
      channel,
      submitStatus: null,
      changed: false,
    };
  }

  componentDidMount() {
    preventCloseWhenChanged(() => this.state.changed);
  }

  onUpdateFeed = (props: Partial<Channel>, onSucceed: () => void) => {
    this.setState(prevState => ({
      feed: {
        ...prevState.feed,
        channel: {
          ...prevState.channel,
          ...props,
        },
      },
    }), onSucceed);
  }

  onUpdateChannelMeta = (keyName: keyof Channel, value: any) => {
    this.setState((prevState) => ({
      changed: true,
      channel: {
        ...prevState.channel,
        [keyName]: value,
      },
    }));
  }

  onUpdateChannelMetaToFeed = (onSucceed: () => void) => {
    this.onUpdateFeed(this.state.channel, onSucceed);
  }

  onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.onUpdateChannelMetaToFeed(() => {
      const {feed} = this.state;
      this.setState({submitStatus: SUBMIT_STATUS__START});
      Requests.axiosPost('/admin/ajax/feed/', {channel: feed.channel})
        .then(() => {
          this.setState({submitStatus: null, changed: false}, () => {
            showToast('Updated!', 'success');
          });
        })
        .catch((error: any) => {
          this.setState({submitStatus: null}, () => {
            if (!error.response) {
              showToast('Network error. Please refresh the page and try again.', 'error');
            } else {
              showToast('Failed. Please try again.', 'error');
            }
          });
        });
    });
  }

  render() {
    const {submitStatus, channel, feed, onboardingResult, changed} = this.state;
    const categories = channel.categories || [];
    const submitting = submitStatus === SUBMIT_STATUS__START;
    const webGlobalSettings = feed.settings.webGlobalSettings || {};
    const publicBucketUrl = webGlobalSettings.publicBucketUrl || '';

    return (
      <AdminNavApp currentPage={NAV_ITEMS.EDIT_CHANNEL} onboardingResult={onboardingResult}>
        <form className="grid grid-cols-12 gap-4">
          <div className="col-span-9 grid grid-cols-1 gap-4">
            <div className="lh-page-card">
              <div className="flex">
                <div className="flex-none">
                  <div>
                    <ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.IMAGE]} customClass="lh-page-subtitle" />
                  </div>
                  <AdminImageUploaderApp
                    mediaType="channel"
                    feed={feed}
                    currentImageUrl={channel.image}
                    onImageUploaded={(cdnUrl) => this.onUpdateChannelMeta('image', cdnUrl)}
                  />
                </div>
                <div className="flex-1 ml-8 grid grid-cols-1 gap-3">
                  <AdminInput
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.TITLE]} customClass="lh-page-subtitle" /></div>}
                    value={channel.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('title', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput
                      label=""
                      labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.PUBLISHER]} customClass="lh-page-subtitle" /></div>}
                      value={channel.publisher || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('publisher', e.target.value)}
                    />
                    <AdminInput
                      label=""
                      labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.WEBSITE]} customClass="lh-page-subtitle" /></div>}
                      value={channel.link || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('link', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminSelect
                      label=""
                      labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.CATEGORIES]} customClass="lh-page-subtitle" /></div>}
                      value={categories.map((c) => (CATEGORIES_DICT[c]))}
                      options={CATEGORIES_SELECT_OPTIONS}
                      onChange={(selectedOptions: CategoryOption[]) => {
                        this.onUpdateChannelMeta('categories', selectedOptions.map((o) => o.value));
                      }}
                      extraParams={{
                        isMulti: true,
                        isOptionDisabled: () => categories.length >= 3,
                      }}
                    />
                    <AdminSelect
                      label=""
                      labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.LANGUAGE]} customClass="lh-page-subtitle" /></div>}
                      value={LANGUAGE_CODES_DICT[channel.language || '']}
                      options={LANGUAGE_CODES_SELECT_OPTIONS}
                      onChange={(selected: LanguageCode) => {
                        this.onUpdateChannelMeta('language', selected.code);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t">
                <AdminRichEditor
                  labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.DESCRIPTION]} customClass="lh-page-subtitle" /></div>}
                  value={channel.description || ''}
                  onChange={(value: string) => {
                    this.onUpdateChannelMeta('description', value);
                  }}
                  extra={{
                    publicBucketUrl,
                    folderName: `channels/${channel.id}`,
                  }}
                />
              </div>
            </div>
            <details className="lh-page-card">
              <summary className="m-page-summary">
                Podcast-specific fields
              </summary>
              <div className="mt-8 grid grid-cols-1 gap-8">
                <div className="grid grid-cols-3 gap-4">
                  <AdminRadio
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_EXPLICIT]} customClass="lh-page-subtitle" /></div>}
                    groupName="lh-explicit"
                    buttons={[{
                      name: 'yes',
                      checked: channel['itunes:explicit'],
                    }, {
                      name: 'no',
                      checked: !channel['itunes:explicit'],
                    }]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:explicit', e.target.value === 'yes')}
                  />
                  <AdminInput
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.COPYRIGHT]} customClass="lh-page-subtitle" /></div>}
                    value={channel.copyright || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('copyright', e.target.value)}
                  />
                  <AdminInput
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_TITLE]} customClass="lh-page-subtitle" /></div>}
                    value={channel['itunes:title'] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:title', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <AdminRadio
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_TYPE]} customClass="lh-page-subtitle" /></div>}
                    groupName="feed-itunes-type"
                    buttons={[{
                      name: 'episodic',
                      checked: channel['itunes:type'] === 'episodic',
                    }, {
                      name: 'serial',
                      checked: channel['itunes:type'] === 'serial',
                    }]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:type', e.target.value as 'episodic' | 'serial')}
                  />
                  <AdminInput
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_EMAIL]} customClass="lh-page-subtitle" /></div>}
                    type="email"
                    value={channel['itunes:email'] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:email', e.target.value)}
                  />
                  <AdminInput
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_NEW_RSS_URL]} customClass="lh-page-subtitle" /></div>}
                    type="url"
                    value={channel['itunes:new-feed-url'] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:new-feed-url', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <AdminRadio
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_BLOCK]} customClass="lh-page-subtitle" /></div>}
                    groupName="feed-itunes-block"
                    buttons={[{
                      name: 'yes',
                      checked: channel['itunes:block'] || false,
                    }, {
                      name: 'no',
                      checked: !channel['itunes:block'],
                    }]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:block', e.target.value === 'yes')}
                  />
                  <AdminRadio
                    label=""
                    labelComponent={<div><ExplainText bundle={CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_COMPLETE]} customClass="lh-page-subtitle" /></div>}
                    groupName="feed-itunes-complete"
                    buttons={[{
                      name: 'yes',
                      checked: channel['itunes:complete'] || false,
                    }, {
                      name: 'no',
                      checked: !channel['itunes:complete'],
                    }]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:complete', e.target.value === 'yes')}
                  />
                </div>
              </div>
            </details>
          </div>
          <div className="col-span-3">
            <div className="sticky top-8">
              <div className="text-center lh-page-card">
                <button
                  type="submit"
                  className="lh-btn lh-btn-brand-dark lh-btn-lg"
                  onClick={this.onSubmit}
                  disabled={submitting || !changed}
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
              <AdminSideQuickLinksModule.AdminSideQuickLinks AdditionalLinksDiv={null} />
            </div>
          </div>
        </form>
      </AdminNavApp>
    );
  }
}