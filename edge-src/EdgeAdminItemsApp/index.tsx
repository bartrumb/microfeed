import React from 'react';
import { FeedContent, OnboardingResult } from '../../common-src/types/FeedContent';

export interface EdgeAdminItemsAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  mode: 'new' | 'edit' | 'list';
  itemId?: string;
}

const EdgeAdminItemsApp: React.FC<EdgeAdminItemsAppProps> = ({ 
  feedContent, 
  onboardingResult, 
  mode,
  itemId 
}) => {
  return (
    <div className="admin-items-app">
      {mode === 'new' && (
        <div className="new-item">
          <h1>New Item</h1>
          <div className="item-form">
            {/* New item form content will be rendered here by the client */}
          </div>
        </div>
      )}
      
      {mode === 'edit' && itemId && (
        <div className="edit-item">
          <h1>Edit Item</h1>
          <div className="item-form">
            {/* Edit item form content will be rendered here by the client */}
          </div>
        </div>
      )}
      
      {mode === 'list' && (
        <div className="items-list">
          <h1>Items</h1>
          <div className="items-grid">
            {/* Items list content will be rendered here by the client */}
          </div>
        </div>
      )}
    </div>
  );
};

export default EdgeAdminItemsApp;