import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SettingsBase from '../SettingsBase';
import AdminRadio from '../../../components/AdminRadio';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { CHANNEL_STATUSES, CHANNEL_STATUSES_DICT } from '../../../../common-src/constants';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';
import ExplainText from '../../../components/ExplainText';

interface AccessSettings {
  currentPolicy?: string;
}

interface AccessSettingsAppProps {
  settings: AccessSettings;
  onSave: (settings: AccessSettings) => Promise<void>;
}

const ACCESS_OPTIONS = Object.entries(CHANNEL_STATUSES_DICT).map(([value, { name, description }]) => ({
  name,
  value,
  description
}));

export const AccessSettingsApp: React.FC<AccessSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<AccessSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(localSettings);
      toast.success('Access settings saved successfully');
    } catch (error) {
      console.error('Failed to save access settings:', error);
      toast.error('Failed to save access settings');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPolicy = localSettings.currentPolicy || CHANNEL_STATUSES.PUBLIC;
  const radioButtons = ACCESS_OPTIONS.map(option => ({
    name: option.name,
    value: option.value,
    checked: option.value === currentPolicy
  }));

  return (
    <SettingsBase
      title="Access Settings"
      submitting={isSaving}
      currentType={SETTINGS_CATEGORY.ACCESS}
      onSubmit={handleSave}
      titleComponent={
        <ExplainText
          title={FORM_EXPLAIN_TEXTS['access-policy'].title}
          description={FORM_EXPLAIN_TEXTS['access-policy'].description}
          learnMoreUrl={FORM_EXPLAIN_TEXTS['access-policy'].learnMoreUrl}
        />
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Access Policy</h3>
          <div className="mt-4">
            <AdminRadio
              groupName="access-policy"
              buttons={radioButtons}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                currentPolicy: e.target.value
              }))}
            />
            <div className="mt-2 text-sm text-helper-color">
              {CHANNEL_STATUSES_DICT[currentPolicy]?.description}
            </div>
          </div>
        </div>
      </div>
    </SettingsBase>
  );
};

export default AccessSettingsApp;