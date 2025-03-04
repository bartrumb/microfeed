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

export interface OnboardState {
  ready: boolean;
  required?: boolean;
}

export interface CloudflareUrls {
  r2BucketSettingsUrl?: string;
  pagesDevUrl?: string;
  addAccessGroupUrl?: string;
  addAppUrl?: string;
  pagesCustomDomainUrl?: string;
}

export interface OnboardingResult {
  allOk?: boolean;
  result?: {
    [key: string]: OnboardState;
  };
  cloudflareUrls?: CloudflareUrls;
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