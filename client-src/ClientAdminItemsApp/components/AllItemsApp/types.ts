import { ReactNode } from 'react';
import { OnboardingResult } from '../../../../common-src/types/FeedContent';
import { ENCLOSURE_CATEGORIES } from '../../../../common-src/constants';

export type EnclosureCategory = typeof ENCLOSURE_CATEGORIES[keyof typeof ENCLOSURE_CATEGORIES];

export interface MediaFile {
  category: EnclosureCategory;
  url: string;
  durationSecond?: number;
  contentType?: string;
}

export interface Item {
  id: string;
  status: number;
  title?: string;
  pubDateMs?: number;
  mediaFile?: MediaFile;
}

export interface WebGlobalSettings {
  publicBucketUrl?: string;
  [key: string]: any;
}

export interface Feed {
  items?: Item[];
  settings?: {
    webGlobalSettings?: WebGlobalSettings;
  };
  items_next_cursor?: string;
  items_prev_cursor?: string;
  items_sort_order?: string;
}

export interface TableItem {
  status: number;
  pubDateMs?: number;
  title: ReactNode;
  mediaFile: ReactNode;
}

export interface ItemListTableProps {
  data: TableItem[];
  feed: Feed;
}

export interface AllItemsAppProps {
  // No props required for this component
}

export interface AllItemsAppState {
  feed: Feed;
  onboardingResult: OnboardingResult;
  items: Item[];
}

export interface AdminRadioButton {
  name: string;
  value: string;
  checked: boolean;
}

// Default values for required properties
export const DEFAULT_ONBOARDING_RESULT: OnboardingResult = {
  requiredOk: false,
  allOk: false,
  result: {}
};

export const DEFAULT_FEED: Feed = {
  items: [],
  settings: {
    webGlobalSettings: {}
  }
};

// Type guard for MediaFile
export function isValidMediaFileType(mediaFile: any): mediaFile is MediaFile {
  return mediaFile && 
    typeof mediaFile === 'object' && 
    typeof mediaFile.url === 'string' &&
    Object.values(ENCLOSURE_CATEGORIES).includes(mediaFile.category);
}

// Helper functions
export function formatDuration(duration: number | undefined): string {
  if (typeof duration !== 'number') return '0';
  return duration.toString();
}

export function getMediaFileUrl(mediaFile: MediaFile, publicBucketUrl: string): string {
  if (mediaFile.category === ENCLOSURE_CATEGORIES.EXTERNAL_URL) {
    return mediaFile.url;
  }
  
  if (mediaFile.url.startsWith('/')) {
    return mediaFile.url;
  }
  
  if (publicBucketUrl) {
    return `${publicBucketUrl}/${mediaFile.url}`;
  }
  
  return `/${mediaFile.url}`;
}