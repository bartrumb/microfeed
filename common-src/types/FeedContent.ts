/**
 * Core type definitions for the Microfeed application.
 * These interfaces define the shape of the main data structures used throughout
 * the application, providing type safety and documentation.
 */

import React from 'react';

/**
 * Channel data structure representing feed channel information
 */
export interface ChannelData {
  id: string;
  status: number;
  is_primary: number;
  image: string;
  link: string;
  language: string;
  categories: string[];
  "itunes:explicit": boolean;
  "itunes:type": string;
  "itunes:complete": boolean;
  "itunes:block": boolean;
  copyright: string;
}

/**
 * Media file information for feed items
 */
export interface MediaFile {
  category: number;
  url: string;
  durationSecond?: number;
  contentType?: string;
  size?: number;
}

/**
 * Feed item structure representing individual content entries
 */
export interface Item {
  id: string;
  status: number;
  title: string;
  name?: string;
  pub_date?: string;
  pubDateMs?: number;
  created_at?: string;
  updated_at?: string;
  mediaFile?: MediaFile;
  content?: string;
  description?: string;
  link?: string;
  author?: string;
  categories?: string[];
  enclosure?: {
    url: string;
    type: string;
    length?: number;
  };
}

/**
 * Subscribe method configuration
 */
export interface SubscribeMethod {
  name: string;
  type: string;
  url: string;
  image: string;
  enabled: boolean;
  editable: boolean;
  id: string;
}

/**
 * Settings data structure containing all configuration options
 */
export interface SettingsData {
  subscribeMethods?: {
    methods: SubscribeMethod[];
  };
  webGlobalSettings?: {
    favicon?: {
      url: string;
      contentType: string;
    };
    publicBucketUrl?: string;
    itemsSortOrder?: string;
    itemsPerPage?: number;
  };
  access?: {
    currentPolicy?: string;
  };
  analytics?: {
    urls?: string[];
  };
  customCode?: Record<string, any>;
  apiSettings?: {
    enabled?: boolean;
    apps?: Array<{
      id: string;
      name: string;
      token: string;
      createdAtMs: number;
    }>;
  };
}

/**
 * Main feed content structure containing all feed data
 */
export interface FeedContent {
  channel: ChannelData;
  items?: Item[];
  item?: Item;
  settings: SettingsData;
  hasNoItems?: boolean;
  items_next_cursor?: string;
  items_prev_cursor?: string;
  items_sort_order?: string;
}

/**
 * Onboarding result structure for setup status tracking
 */
export interface OnboardingResult {
  requiredOk: boolean;
  allOk: boolean;
  result: Record<string, {
    ready: boolean;
    required: boolean;
  }>;
  cloudflareUrls?: {
    r2BucketSettingsUrl?: string;
    addAccessGroupUrl?: string;
    addAppUrl?: string;
    pagesCustomDomainUrl?: string;
    pagesDevUrl?: string;
  };
}

/**
 * Props interface for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: string;
}

/**
 * Props interface for the AdminWholeHtml component
 */
export interface AdminWholeHtmlProps {
  title: string;
  description: string;
  scripts: string[];
  styles: string[];
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest?: Record<string, { file: string }>;
  children?: React.ReactNode;
}

/**
 * Props interface for the EdgeAdminItemsApp component
 */
export interface EdgeAdminItemsAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest?: Record<string, { file: string }>;
}

/**
 * Type guard to check if a feed content object is valid
 */
export function isValidFeedContent(obj: any): obj is FeedContent {
  return obj &&
    typeof obj === 'object' &&
    obj.channel &&
    typeof obj.channel === 'object' &&
    obj.settings &&
    typeof obj.settings === 'object';
}

/**
 * Type guard to check if a feed content object has items
 */
export function hasItems(feed: FeedContent): feed is FeedContent & { items: Item[] } {
  return Array.isArray(feed.items) && feed.items.length > 0;
}

/**
 * Safe accessor for nested properties
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj ? obj[key] : undefined;
}