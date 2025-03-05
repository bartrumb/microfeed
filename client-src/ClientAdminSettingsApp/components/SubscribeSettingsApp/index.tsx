import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SettingsBase } from '../SettingsBase';
import AdminSwitch from '../../../components/AdminSwitch';
import AdminInput from '../../../components/AdminInput';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { randomHex } from '../../../../common-src/StringUtils';
import NewSubscribeDialog from './components/NewSubscribeDialog';
import type { SubscribeSettingsAppProps, SubscribeMethod } from './types';

export const SubscribeSettingsApp: React.FC<SubscribeSettingsAppProps> = ({
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);

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

  const handleToggleMethod = (methodId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      methods: prev.methods?.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    }));
  };

  const handleUpdateMethodUrl = (methodId: string, newUrl: string) => {
    setLocalSettings(prev => ({
      ...prev,
      methods: prev.methods?.map(method => 
        method.id === methodId 
          ? { ...method, url: newUrl }
          : method
      )
    }));
  };

  const handleAddMethod = (method: Omit<SubscribeMethod, 'id'>) => {
    const newMethod: SubscribeMethod = {
      ...method,
      id: randomHex(11)
    };

    setLocalSettings(prev => ({
      ...prev,
      methods: [...(prev.methods || []), newMethod]
    }));
    toast.success('Subscribe method added successfully');
  };

  return (
    <SettingsBase
      title="Subscribe Settings"
      explainText={FORM_EXPLAIN_TEXTS['subscribe-methods']}
    >
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Subscribe Methods</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowNewDialog(true)}
            >
              Add Method
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {localSettings.methods?.map(method => (
              <div key={method.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={method.image}
                    alt={method.name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{method.name}</div>
                  {method.editable && (
                    <AdminInput
                      value={method.url}
                      onChange={(e) => handleUpdateMethodUrl(method.id, e.target.value)}
                      placeholder="Enter URL"
                    />
                  )}
                </div>
                <div className="flex-shrink-0">
                  <AdminSwitch
                    enabled={method.enabled}
                    setEnabled={() => handleToggleMethod(method.id)}
                    customClass={method.editable ? '' : 'opacity-50 cursor-not-allowed'}
                  />
                </div>
              </div>
            ))}
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

      <NewSubscribeDialog
        isOpen={showNewDialog}
        setIsOpen={setShowNewDialog}
        onAdd={handleAddMethod}
      />
    </SettingsBase>
  );
};

export default SubscribeSettingsApp;