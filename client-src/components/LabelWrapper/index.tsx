import React from 'react';
import { ExplainBundle } from '../ExplainText';
import ExplainText from '../ExplainText';

interface LabelWrapperProps {
  bundle: ExplainBundle;
}

const LabelWrapper = React.memo(function LabelWrapper({ bundle }: LabelWrapperProps): React.ReactElement {
  return (
    <div className="lh-page-subtitle">
      <ExplainText bundle={bundle} customClass="lh-page-subtitle" />
    </div>
  );
});

LabelWrapper.displayName = 'LabelWrapper';

export default LabelWrapper;