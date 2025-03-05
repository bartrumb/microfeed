import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SettingsBase } from '../SettingsBase';
import AdminInput from '../../../components/AdminInput';
import AdminSelect from '../../../components/AdminSelect';
import AdminImageUploaderApp from '../../../components/AdminImageUploaderApp';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { ENCLOSURE_CATEGORIES } from '../../../../common-src/Constants';

interface WebGlobalSettings {
  favicon?: {
    url: string;
    contentType: string;
  };
  itemsSortOrder?: string;
  itemsPerPage?: number;
  publicBucketUrl?: string;
}

interface WebGlobalSettingsAppProps {
  settings: WebGlobalSettings;
  onSave: (settings: WebGlobalSettings) => Promise<void>;
}

const SORT_OPTIONS = [
  { value: 'newest_first', label: 'Newest First' },
  { value: 'oldest_first', label: 'Oldest First' }
];

const PER_PAGE_OPTIONS = [
  { value: 10, label: '10 items' },
  { value: 20, label: '20 items' },
  { value: 50, label: '50 items' },
  { value: 100, label: '100 items' }
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
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUploaded = (url: string, contentType: string) => {
    setLocalSettings(prev => ({
      ...prev,
      favicon: {
        url,
        contentType
      }
    }));
  };

  return (
    <SettingsBase
      title="Web Global Settings"
      explainText={FORM_EXPLAIN_TEXTS['web-global']}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Favicon</h3>
          <div className="mt-2">
            <AdminImageUploaderApp
              currentImageUrl={localSettings.favicon?.url}
              mediaType={ENCLOSURE_CATEGORIES.IMAGE}
              feed={{ settings: { webGlobalSettings: { publicBucketUrl: localSettings.publicBucketUrl } } }}
              onImageUploaded={handleImageUploaded}
              imageSizeNotOkayFunc={(width, height) => width < 32 || height < 32}
              imageSizeNotOkayMsgFunc={(width, height) => 
                `Favicon too small: ${width}x${height} pixels. Recommended minimum size is 32x32 pixels.`
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Content Display</h3>
          <div className="mt-4 space-y-4">
            <AdminSelect
              label="Sort Order"
              value={localSettings.itemsSortOrder || 'newest_first'}
              options={SORT_OPTIONS}
              onChange={(value) => setLocalSettings(prev => ({
                ...prev,
                itemsSortOrder: value
              }))}
            />

            <AdminSelect
              label="Items Per Page"
              value={localSettings.itemsPerPage || 20}
              options={PER_PAGE_OPTIONS}
              onChange={(value) => setLocalSettings(prev => ({
                ...prev,
                itemsPerPage: value
              }))}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Media Storage</h3>
          <div className="mt-4">
            <AdminInput
              label="Public Bucket URL"
              value={localSettings.publicBucketUrl || ''}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                publicBucketUrl: e.target.value
              }))}
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

export default WebGlobalSettingsApp;