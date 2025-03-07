import React from 'react';
import { useHistory } from 'react-router-dom';
import SettingsBase from '../SettingsBase';
import { FORM_EXPLAIN_TEXTS } from '../FormExplainTexts';
import { ADMIN_URLS } from '../../../../common-src/StringUtils';
import { SETTINGS_CATEGORY } from '../../../../common-src/types/FeedContent';
import ExplainText from '../../../components/ExplainText';

export const CustomCodeSettingsApp: React.FC = () => {
  const history = useHistory();

  const handleNavigate = () => {
    history.push(ADMIN_URLS.codeEditorSettings());
  };

  return (
    <SettingsBase
      title="Custom Code"
      submitting={false}
      currentType={SETTINGS_CATEGORY.CUSTOM_CODE}
      titleComponent={
        <ExplainText
          title={FORM_EXPLAIN_TEXTS['custom-code'].title}
          description={FORM_EXPLAIN_TEXTS['custom-code'].description}
          learnMoreUrl={FORM_EXPLAIN_TEXTS['custom-code'].learnMoreUrl}
        />
      }
    >
      <div className="space-y-6">
        <div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleNavigate}
          >
            Open Code Editor
          </button>
        </div>
      </div>
    </SettingsBase>
  );
};

export default CustomCodeSettingsApp;