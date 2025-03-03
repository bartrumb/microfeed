import React, { ReactNode } from 'react';
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
import { LabelRenderer } from "../../../components/types";
import LabelWrapper from "../../../components/LabelWrapper";
import {preventCloseWhenChanged} from "../../../common/BrowserUtils";
import { EditChannelAppState, LanguageCode, CategoryOption, Channel } from './types';

const SUBMIT_STATUS__START = 1;

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
  private renderLabel = (bundle: ExplainBundle | null): ReactNode => {
    if (!bundle) return null;
    return (
      <div className="lh-page-subtitle">
        <LabelWrapper bundle={bundle} />
      </div>
    );
  }

  constructor(props: {}) {
    super(props);

    let feed = { 
      channel: {}, 
      settings: { 
        webGlobalSettings: {} 
      } 
    };
    let onboardingResult = {};
    
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
                  <div className="lh-page-subtitle">
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
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.TITLE])}
                    value={channel.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('title', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput
                      label=""
                      labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.PUBLISHER])}
                      value={channel.publisher || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('publisher', e.target.value)}
                    />
                    <AdminInput
                      label=""
                      labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.WEBSITE])}
                      value={channel.link || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('link', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminSelect
                      label=""
                      labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.CATEGORIES])}
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
                      labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.LANGUAGE])}
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
                  labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.DESCRIPTION])}
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
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_EXPLICIT])}
                    groupName="lh-explicit"
                    buttons={[{
                      name: 'yes',
                      checked: Boolean(channel['itunes:explicit']),
                    }, {
                      name: 'no',
                      checked: !Boolean(channel['itunes:explicit']),
                    }]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:explicit', e.target.value === 'yes')}
                  />
                  <AdminInput
                    label=""
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.COPYRIGHT])}
                    value={channel.copyright || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('copyright', e.target.value)}
                  />
                  <AdminInput
                    label=""
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_TITLE])}
                    value={channel['itunes:title'] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:title', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <AdminRadio
                    label=""
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_TYPE])}
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
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_EMAIL])}
                    type="email"
                    value={channel['itunes:email'] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:email', e.target.value)}
                  />
                  <AdminInput
                    label=""
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_NEW_RSS_URL])}
                    type="url"
                    value={channel['itunes:new-feed-url'] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:new-feed-url', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <AdminRadio
                    label=""
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_BLOCK])}
                    groupName="feed-itunes-block"
                    buttons={[{
                      name: 'yes',
                      checked: Boolean(channel['itunes:block']),
                    }, {
                      name: 'no',
                      checked: !Boolean(channel['itunes:block']),
                    }]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onUpdateChannelMeta('itunes:block', e.target.value === 'yes')}
                  />
                  <AdminRadio
                    label=""
                    labelComponent={this.renderLabel(CONTROLS_TEXTS_DICT[CHANNEL_CONTROLS.ITUNES_COMPLETE])}
                    groupName="feed-itunes-complete"
                    buttons={[{
                      name: 'yes',
                      checked: Boolean(channel['itunes:complete']),
                    }, {
                      name: 'no',
                      checked: !Boolean(channel['itunes:complete']),
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