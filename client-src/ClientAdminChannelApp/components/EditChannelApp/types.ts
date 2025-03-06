import { ReactNode } from 'react';
import { OnboardingResult } from '../../../../common-src/types/OnboardingTypes';

export interface LanguageCode {
  code: string;
  name: string;
  value: string;
  label: ReactNode;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface Channel {
  id?: string;
  image?: string;
  title?: string;
  publisher?: string;
  link?: string;
  categories?: string[];
  language?: string;
  description?: string;
  copyright?: string;
  'itunes:explicit'?: boolean;
  'itunes:title'?: string;
  'itunes:type'?: 'episodic' | 'serial';
  'itunes:email'?: string;
  'itunes:new-feed-url'?: string;
  'itunes:block'?: boolean;
  'itunes:complete'?: boolean;
}

export interface WebGlobalSettings {
  publicBucketUrl?: string;
}

export interface Feed {
  channel: Channel;
  settings: {
    webGlobalSettings: WebGlobalSettings;
  };
}

export type { OnboardingResult };

export interface EditChannelAppState {
  feed: Feed;
  onboardingResult: OnboardingResult;
  channel: Channel;
  submitStatus: number | null;
  changed: boolean;
}