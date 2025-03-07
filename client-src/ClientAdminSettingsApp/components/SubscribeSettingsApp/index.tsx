import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SettingsBase from '../SettingsBase';
import AdminSwitch from '../../../components/AdminSwitch';
import AdminInput from '../../../components/AdminInput';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';

interface SubscribeSettings {
  enabled?: boolean;
  buttonText?: string;
  successMessage?: string;
}

interface SubscribeSettingsAppProps {
  settings: SubscribeSettings;
  onSave: (settings: SubscribeSettings) => Promise<void>;
}

export const SubscribeSettingsApp: React.FC<SubscribeSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<SubscribeSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(localSettings);
      toast.success('Subscribe settings saved successfully');
    } catch (error) {
      console.error('Failed to save subscribe settings:', error);
      toast.error('Failed to save subscribe settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsBase
      title="Subscribe Settings"
      submitting={isSaving}
      currentType={SETTINGS_CATEGORY.SUBSCRIBE}
      onSubmit={handleSave}
    >
      <div className="space-y-6">
        <div>
          <AdminSwitch
            label="Enable Subscribe Button"
            enabled={localSettings.enabled ?? false}
            setEnabled={(enabled) => setLocalSettings(prev => ({
              ...prev,
              enabled
            }))}
          />
        </div>

        {localSettings.enabled && (
          <>
            <div>
              <AdminInput
                label="Button Text"
                value={localSettings.buttonText || ''}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  buttonText: e.target.value
                }))}
                placeholder="Subscribe"
              />
            </div>

            <div>
              <AdminInput
                label="Success Message"
                value={localSettings.successMessage || ''}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  successMessage: e.target.value
                }))}
                placeholder="Thanks for subscribing!"
              />
            </div>
          </>
        )}
      </div>
    </SettingsBase>
  );
};

export default SubscribeSettingsApp;