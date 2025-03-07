import { FeedContent, SETTINGS_CATEGORY } from '../../../common-src/types/FeedContent';
import React from 'react';

/**
 * Props interface for NavBlock component used in CustomCodeSettingsApp
 */
interface NavBlockProps {
  url: string;
  text: string;
}

/**
 * Props interface for SettingsBase component
 */
export interface SettingsBaseProps {
  title: string;
  submitting: boolean;
  submitForType?: SETTINGS_CATEGORY;
  currentType: SETTINGS_CATEGORY;
  onSubmit?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  titleComponent?: React.ReactNode;
}

/**
 * Base props interface shared by all settings components that handle settings changes
 */
export interface BaseSettingsProps {
  submitting: boolean;
  submitForType?: SETTINGS_CATEGORY;
  feed: FeedContent;
  onSubmit: (e: React.FormEvent, bundleKey: SETTINGS_CATEGORY, bundle: Record<string, unknown>) => void;
  setChanged: () => void;
}

/**
 * Props interface for TrackingSettingsApp component
 */
export interface TrackingSettingsAppProps extends BaseSettingsProps {}

/**
 * Props interface for AccessSettingsApp component
 */
export interface AccessSettingsAppProps extends BaseSettingsProps {}

/**
 * Props interface for SubscribeSettingsApp component
 */
export interface SubscribeSettingsAppProps extends BaseSettingsProps {}

/**
 * Props interface for WebGlobalSettingsApp component
 */
export interface WebGlobalSettingsAppProps extends BaseSettingsProps {}

/**
 * Props interface for CustomCodeSettingsApp component
 * This component has a simpler interface as it only displays navigation links
 */
export interface CustomCodeSettingsAppProps {
  submitting: boolean;
  submitForType?: SETTINGS_CATEGORY;
  feed: FeedContent;
}

/**
 * Props interface for ApiSettingsApp component
 */
export interface ApiSettingsAppProps extends BaseSettingsProps {}