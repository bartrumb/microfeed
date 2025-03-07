import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SettingsBase from '../SettingsBase';
import AdminInput from '../../../components/AdminInput';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';
import ExplainText from '../../../components/ExplainText';

interface ApiSettings {
  apiKey?: string;
}

interface ApiSettingsAppProps {
  settings: ApiSettings;
  onSave: (settings: ApiSettings) => Promise<void>;
}

export const ApiSettingsApp: React.FC<ApiSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<ApiSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(localSettings);
      toast.success('API settings saved successfully');
    } catch (error) {
      console.error('Failed to save API settings:', error);
      toast.error('Failed to save API settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsBase
      title="API Settings"
      submitting={isSaving}
      currentType={SETTINGS_CATEGORY.API_SETTINGS}
      onSubmit={handleSave}
      titleComponent={
        <ExplainText
          title={FORM_EXPLAIN_TEXTS['api-key'].title}
          description={FORM_EXPLAIN_TEXTS['api-key'].description}
          learnMoreUrl={FORM_EXPLAIN_TEXTS['api-key'].learnMoreUrl}
        />
      }
    >
      <div className="space-y-6">
        <div>
          <AdminInput
            label="API Key"
            value={localSettings.apiKey || ''}
            onChange={(e) => setLocalSettings(prev => ({
              ...prev,
              apiKey: e.target.value
            }))}
            placeholder="Enter API key"
          />
        </div>
      </div>
    </SettingsBase>
  );
};

export default ApiSettingsApp;