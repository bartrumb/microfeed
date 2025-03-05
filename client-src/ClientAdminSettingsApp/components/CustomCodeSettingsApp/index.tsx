import React from 'react';
import { useHistory } from 'react-router-dom';
import { SettingsBase } from '../SettingsBase';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { ADMIN_URLS } from '../../../../common-src/StringUtils';

interface CustomCodeSettingsAppProps {
  origin: string;
}

export const CustomCodeSettingsApp: React.FC<CustomCodeSettingsAppProps> = ({
  origin
}) => {
  const history = useHistory();

  const handleOpenEditor = () => {
    history.push(ADMIN_URLS.codeEditorSettings());
  };

  return (
    <SettingsBase
      title="Custom Code"
      explainText={FORM_EXPLAIN_TEXTS['custom-code']}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Code Editor</h3>
          <div className="mt-4">
            <button
              type="button"
              className="btn-primary"
              onClick={handleOpenEditor}
            >
              Open Code Editor
            </button>
          </div>
        </div>
      </div>
    </SettingsBase>
  );
};

export default CustomCodeSettingsApp;