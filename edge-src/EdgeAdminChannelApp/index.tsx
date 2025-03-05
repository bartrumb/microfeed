import React from 'react';
import { FeedContent, OnboardingResult } from '../../common-src/types/FeedContent';

export interface EdgeAdminChannelAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
}

const EdgeAdminChannelApp: React.FC<EdgeAdminChannelAppProps> = ({ feedContent, onboardingResult }) => {
  return (
    <div className="admin-channel-app">
      <h1>Channel Settings</h1>
      <div className="channel-form">
        {/* Channel form content will be rendered here by the client */}
      </div>
    </div>
  );
};

export default EdgeAdminChannelApp;
