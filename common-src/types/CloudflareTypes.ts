/**
 * Type definitions for Cloudflare Workers and Pages
 */

/// <reference types="@cloudflare/workers-types" />
import { FeedContent, OnboardingResult } from './FeedContent';
import React from 'react';

// Extend R2Bucket type with presigned URLs
interface R2PresignedPostOptions {
  key: string;
  expiresIn?: number;
}

interface ExtendedR2Bucket extends R2Bucket {
  createPresignedPost(options: R2PresignedPostOptions): Promise<string>;
}

export interface Env {
  // Database and Storage
  MICROFEED_DB: D1Database;
  MICROFEED_BUCKET: ExtendedR2Bucket;
  MICROFEED_KV: KVNamespace;

  // Cloudflare Configuration
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_PROJECT_NAME: string;
  R2_PUBLIC_BUCKET: string;

  // R2 Credentials
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}

export interface Context {
  request: Request;
  env: Env;
  data: {
    feedContent?: FeedContent;
    manifest?: Record<string, { file: string }>;
    onboardingResult?: OnboardingResult;
    env?: Env;
  };
  next?: () => Promise<Response>;
}

export interface RequestContext {
  request: Request;
  env: Env;
  data: Record<string, any>;
}

export interface R2RequestParams {
  inputParams: {
    key: string;
  };
  env: Env;
}

export interface MiddlewareData {
  feedContent: FeedContent;
  manifest?: Record<string, { file: string }>;
  onboardingResult?: OnboardingResult;
  env?: Env;
}

export interface AdminNavAppProps {
  currentPage: string;
  onboardingResult?: OnboardingResult;
  children?: React.ReactNode;
}

export interface EdgeSettingsAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
}

export interface WithManifestProps {
  manifest: Record<string, { file: string }>;
}

export interface ItemStatus {
  published: number;
  unpublished: number;
  unlisted: number;
}

export const ITEM_STATUSES: ItemStatus = {
  published: 1,
  unpublished: 0,
  unlisted: 2
};

export const ITEM_STATUSES_STRINGS_DICT: Record<string, number> = {
  published: ITEM_STATUSES.published,
  unpublished: ITEM_STATUSES.unpublished,
  unlisted: ITEM_STATUSES.unlisted
};