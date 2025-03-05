import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SettingsBase } from '../SettingsBase';
import AdminTextarea from '../../../components/AdminTextarea';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';

interface TrackingSettings {
  code?: string;
}

interface TrackingSettingsAppProps {
  settings: TrackingSettings;
  onSave: (settings: TrackingSettings) => Promise<void>;
}

export const TrackingSettingsApp: React.FC<TrackingSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<TrackingSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(localSettings);
      toast.success('Tracking settings saved successfully');
    } catch (error) {
      console.error('Failed to save tracking settings:', error);
      toast.error('Failed to save tracking settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsBase
      title="Tracking Settings"
      explainText={FORM_EXPLAIN_TEXTS['tracking-code']}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Tracking Code</h3>
          <div className="mt-4">
            <AdminTextarea
              label="HTML Code"
              value={localSettings.code || ''}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                code: e.target.value
              }))}
              placeholder="<!-- Paste your tracking code here -->"
            />
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

export default TrackingSettingsApp;