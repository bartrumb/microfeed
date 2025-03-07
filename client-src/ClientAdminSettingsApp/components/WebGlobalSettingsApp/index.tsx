import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SettingsBase from '../SettingsBase';
import AdminInput from '../../../components/AdminInput';
import AdminSelect from '../../../components/AdminSelect';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';

interface WebGlobalSettings {
  title?: string;
  description?: string;
  language?: string;
  timezone?: string;
}

interface WebGlobalSettingsAppProps {
  settings: WebGlobalSettings;
  onSave: (settings: WebGlobalSettings) => Promise<void>;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Denver', label: 'America/Denver' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

export const WebGlobalSettingsApp: React.FC<WebGlobalSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<WebGlobalSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(localSettings);
      toast.success('Global settings saved successfully');
    } catch (error) {
      console.error('Failed to save global settings:', error);
      toast.error('Failed to save global settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsBase
      title="Global Settings"
      submitting={isSaving}
      currentType={SETTINGS_CATEGORY.WEB_GLOBAL}
      onSubmit={handleSave}
    >
      <div className="space-y-6">
        <div>
          <AdminInput
            label="Feed Title"
            value={localSettings.title || ''}
            onChange={(e) => setLocalSettings(prev => ({
              ...prev,
              title: e.target.value
            }))}
            placeholder="My Awesome Feed"
          />
        </div>

        <div>
          <AdminInput
            label="Feed Description"
            value={localSettings.description || ''}
            onChange={(e) => setLocalSettings(prev => ({
              ...prev,
              description: e.target.value
            }))}
            placeholder="A description of what this feed is about"
          />
        </div>

        <div>
          <AdminSelect
            label="Language"
            value={LANGUAGE_OPTIONS.find(opt => opt.value === localSettings.language)}
            options={LANGUAGE_OPTIONS}
            onChange={(option) => setLocalSettings(prev => ({
              ...prev,
              language: option?.value
            }))}
            extraParams={{
              placeholder: "Select language"
            }}
          />
        </div>

        <div>
          <AdminSelect
            label="Timezone"
            value={TIMEZONE_OPTIONS.find(opt => opt.value === localSettings.timezone)}
            options={TIMEZONE_OPTIONS}
            onChange={(option) => setLocalSettings(prev => ({
              ...prev,
              timezone: option?.value
            }))}
            extraParams={{
              placeholder: "Select timezone"
            }}
          />
        </div>
      </div>
    </SettingsBase>
  );
};

export default WebGlobalSettingsApp;