import { OnboardingResult } from '../../../../common-src/types/OnboardingTypes';

export interface WebGlobalSettings {
  publicBucketUrl?: string;
  favicon?: {
    url: string;
    contentType: string;
  };
  itemsSortOrder?: string;
  itemsPerPage?: number;
  [key: string]: any;
}

export interface AdminHomeAppProps {
  // No props required for this component
}

export interface Feed {
  settings?: {
    [key: string]: WebGlobalSettings;
  };
}

export interface AdminHomeAppState {
  feed: Feed;
  onboardingResult: OnboardingResult;
}

export interface SetupChecklistAppProps {
  feed: Feed;
  onboardingResult: OnboardingResult;
}

export interface DistributionAppProps {
  // No props required for this component
}

export interface WhatsNewAppProps {
  // No props required for this component
}