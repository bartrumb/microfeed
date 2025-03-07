import React from 'react';
import AdminTextarea from "../../../components/AdminTextarea";
import { buildAudioUrlWithTracking } from "../../../../common-src/StringUtils";
import SettingsBase from '../SettingsBase';
import { SETTINGS_CATEGORIES } from "../../../../common-src/Constants";
import { BaseSettingsProps } from '../types';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';

interface TrackingSettingsState {
  trackingUrls: string;
  currentType: SETTINGS_CATEGORY;
}

export default class TrackingSettingsApp extends React.Component<BaseSettingsProps, TrackingSettingsState> {
  constructor(props: BaseSettingsProps) {
    super(props);

    const currentType = SETTINGS_CATEGORIES.ANALYTICS as SETTINGS_CATEGORY;
    const { feed } = props;
    let trackingUrls = '';
    
    // Type-safe access using SETTINGS_CATEGORY enum
    const analyticsSettings = feed.settings[SETTINGS_CATEGORY.ANALYTICS];
    if (analyticsSettings?.urls) {
      trackingUrls = analyticsSettings.urls.join('\n');
    }

    this.state = {
      trackingUrls,
      currentType,
    };
  }

  render() {
    const { trackingUrls, currentType } = this.state;
    const { submitting, submitForType, setChanged } = this.props;
    const urls = trackingUrls.trim() !== '' ? trackingUrls.trim().split(/\n/) : [];
    const exampleAudio = 'https://example.com/audio.mp3';
    
    return (
      <SettingsBase
        title="Tracking urls"
        submitting={submitting}
        submitForType={submitForType}
        currentType={currentType}
        onSubmit={(e: React.MouseEvent) => {
          this.props.onSubmit(e, currentType, {
            urls,
          });
        }}
      >
        <div>
          <AdminTextarea
            placeholder="Put a tracking url on each line, e.g., https://op3.dev/e/, https://pdst.fm/e/, https://chrt.fm/track/..."
            value={trackingUrls}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              this.setState({ trackingUrls: e.target.value }, () => setChanged())
            }
          />
        </div>
        <div className="mt-4 text-xs text-helper-color">
          microfeed will automatically add 3rd-party tracking urls (e.g., <a href="https://op3.dev/">OP3</a>, <a
          href="http://analytics.podtrac.com/">Podtrac</a>, <a href="https://chartable.com/">Chartable</a>...) before the url of a media file, so you can easily track download stats. This is a <a href="https://lowerstreet.co/blog/podcast-tracking" target="_blank" rel="noopener noreferrer">common practice in the podcast industry</a>.
        </div>
        {urls.length > 0 && <div className="mt-4 text-xs break-all text-helper-color">
          <div className="mb-2">
            Example: if an audio url is {exampleAudio}, then the final url in the rss feed will be:
          </div>
          <b>{buildAudioUrlWithTracking(exampleAudio, urls)}</b>
        </div>}
      </SettingsBase>
    );
  }
}