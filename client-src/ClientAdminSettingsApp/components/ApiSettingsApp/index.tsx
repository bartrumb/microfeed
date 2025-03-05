import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SettingsBase } from '../SettingsBase';
import AdminInput from '../../../components/AdminInput';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { randomHex } from '../../../../common-src/StringUtils';

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

  const generateNewApiKey = () => {
    const newKey = randomHex(32);
    setLocalSettings(prev => ({
      ...prev,
      apiKey: newKey
    }));
  };

  return (
    <SettingsBase
      title="API Settings"
      explainText={FORM_EXPLAIN_TEXTS['api-key']}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">API Key</h3>
          <div className="mt-4">
            <AdminInput
              label="API Key"
              value={localSettings.apiKey || ''}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                apiKey: e.target.value
              }))}
            />
            <div className="mt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={generateNewApiKey}
              >
                Generate New Key
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </SettingsBase>
  );
};

export default ApiSettingsApp;