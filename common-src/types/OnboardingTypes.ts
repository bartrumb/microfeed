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
  requiredOk: boolean;
  allOk?: boolean;
  result?: {
    [key: string]: OnboardState;
  };
  cloudflareUrls?: CloudflareUrls;
}