import React from 'react';
import ExplainText from '../../../components/ExplainText';
import type { ExplainTextProps } from '../../../components/types';

interface SettingsBaseProps {
  title: string;
  explainText?: {
    title: string;
    description: string;
    learnMoreUrl?: string;
    customClass?: string;
  };
  children: React.ReactNode;
}

export const SettingsBase: React.FC<SettingsBaseProps> = ({ 
  title, 
  explainText,
  children 
}) => {
  return (
    <div className="settings-base">
      <div className="settings-base__header">
        <h2 className="settings-base__title">{title}</h2>
        {explainText && (
          <div className="settings-base__explain">
            <ExplainText 
              title={explainText.title}
              description={explainText.description}
              learnMoreUrl={explainText.learnMoreUrl}
              customClass={explainText.customClass}
            />
          </div>
        )}
      </div>
      <div className="settings-base__content">
        {children}
      </div>
    </div>
  );
};

export default SettingsBase;