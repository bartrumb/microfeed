# Type Checking Implementation Plan

## Overview

This document outlines the architectural approach for implementing type checking in the Microfeed application to prevent runtime errors and improve code quality.

## Goals

1. Prevent "Cannot read properties of undefined" errors through static type checking
2. Improve developer experience with better IDE support and documentation
3. Make refactoring safer and more predictable
4. Provide a gradual migration path from JSX to TypeScript

## Core Type Definitions

We'll create a centralized type system in `common-src/types/` with these key interfaces:

```typescript
// FeedContent.ts - Core data structure interfaces

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

export interface Item {
  id: string;
  status: number;
  title: string;
  name?: string;
  pub_date?: string;
  pubDateMs?: number;
  created_at?: string;
  updated_at?: string;
  mediaFile?: {
    category: number;
    url: string;
    durationSecond?: number;
  };
}

export interface SettingsData {
  subscribeMethods?: {
    methods: Array<{
      name: string;
      type: string;
      url: string;
      image: string;
      enabled: boolean;
      editable: boolean;
      id: string;
    }>;
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

// Component props interfaces

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: string;
}

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

export interface EdgeAdminItemsAppProps {
  feedContent: FeedContent;
  onboardingResult: OnboardingResult;
  manifest?: Record<string, { file: string }>;
}
```

## Migration Strategy

### Phase 1: Core Type Definitions

1. Create the `common-src/types/` directory
2. Define interfaces for core data structures
3. Create utility types for common patterns

### Phase 2: Critical Component Migration

1. Convert ErrorBoundary component to TypeScript
2. Convert EdgeAdminItemsApp and related components
3. Add type annotations to server-side handlers

### Phase 3: Utility Functions Migration

1. Convert utility files to TypeScript
2. Add type guards for safer data access
3. Implement typed versions of common functions

### Phase 4: Progressive Codebase Migration

1. Convert remaining components based on dependency order
2. Update build process to handle mixed JSX/TSX files
3. Add ESLint rules for TypeScript

## Type Guards Implementation

For critical data access, implement type guards:

```typescript
// Type guards for FeedContent
export function isValidFeedContent(obj: any): obj is FeedContent {
  return obj && 
    typeof obj === 'object' && 
    obj.channel && 
    typeof obj.channel === 'object' &&
    obj.settings && 
    typeof obj.settings === 'object';
}

// Type guard for Items array
export function hasItems(feed: FeedContent): feed is FeedContent & { items: Item[] } {
  return Array.isArray(feed.items) && feed.items.length > 0;
}

// Safe accessor for nested properties
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj ? obj[key] : undefined;
}
```

## Best Practices

1. **Optional Properties**: Use the `?` modifier for properties that might be undefined
2. **Default Values**: Always provide default values when accessing potentially undefined properties
3. **Type Guards**: Use type guards before accessing properties that might not exist
4. **Error Boundaries**: Wrap components in error boundaries with typed props
5. **Gradual Migration**: Convert files incrementally, starting with the most critical ones

## Monitoring and Validation

1. Configure TypeScript to report errors but not fail builds initially
2. Add runtime validation for critical data structures
3. Implement logging for type-related errors
4. Add unit tests for type guards and utility functions