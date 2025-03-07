import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AdminTextarea from "../../../components/AdminTextarea";
import { buildAudioUrlWithTracking } from "../../../../common-src/StringUtils";
import SettingsBase from '../SettingsBase';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';

interface TrackingSettings {
  urls: string[];
}

interface TrackingSettingsAppProps {
  settings: TrackingSettings;
  onSave: (settings: TrackingSettings) => Promise<void>;
}

export const TrackingSettingsApp: React.FC<TrackingSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [trackingUrls, setTrackingUrls] = useState(settings.urls.join('\n'));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const urls = trackingUrls.trim() !== '' ? trackingUrls.trim().split(/\n/) : [];
      await onSave({ urls });
      toast.success('Tracking settings saved successfully');
    } catch (error) {
      console.error('Failed to save tracking settings:', error);
      toast.error('Failed to save tracking settings');
    } finally {
      setIsSaving(false);
    }
  };

  const exampleAudio = 'https://example.com/audio.mp3';
  const urls = trackingUrls.trim() !== '' ? trackingUrls.trim().split(/\n/) : [];

  return (
    <SettingsBase
      title="Tracking URLs"
      submitting={isSaving}
      currentType={SETTINGS_CATEGORY.ANALYTICS}
      onSubmit={handleSave}
    >
      <div>
        <AdminTextarea
          placeholder="Put a tracking url on each line, e.g., https://op3.dev/e/, https://pdst.fm/e/, https://chrt.fm/track/..."
          value={trackingUrls}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            setTrackingUrls(e.target.value)
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
};

export default TrackingSettingsApp;