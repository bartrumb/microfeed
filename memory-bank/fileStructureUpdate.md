# File Structure Update - TypeScript Migration

## Overview

This document tracks the progress of migrating the Microfeed project from JavaScript/JSX to TypeScript. It provides an overview of the current file structure, highlighting which components have been migrated to TypeScript and which files need to be removed.

## Components Migrated to TypeScript

The following components have been successfully migrated to TypeScript:

1. **client-src/components/ExternalLink**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)

2. **client-src/components/ExplainText**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)

3. **client-src/components/AdminRichEditor**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)
   - **component/RichEditorQuill**
     - ✅ index.tsx
     - ❌ index.jsx (to be removed)
   - **component/RichEditorMediaDialog**
     - ✅ index.tsx
     - ❌ index.jsx (to be removed)

4. **client-src/components/LabelWrapper**
   - ✅ index.tsx (new component, no JSX version)

5. **client-src/ClientAdminChannelApp/components/EditChannelApp**
   - ✅ index.tsx
   - ✅ types.ts
   - ❌ index.jsx (to be removed)
   - FormExplainTexts.js (not yet migrated)
   - FormExplainTexts.jsx (not yet migrated)

6. **client-src/components/AdminInput**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)

7. **client-src/components/AdminRadio**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)

8. **client-src/components/AdminTextarea**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)

9. **client-src/components/AdminSelect**
   - ✅ index.tsx
   - ❌ index.jsx (to be removed)

10. **edge-src/EdgeAdminItemsApp**
    - ✅ index.tsx
    - Edit/ (not yet migrated)
    - New/ (not yet migrated)

11. **edge-src/common**
    - ✅ withManifest.tsx

## Type Definitions

The following type definition files have been created:

1. **common-src/types/FeedContent.ts**
   - Core data structure interfaces
   - Type guards for safer data access

2. **client-src/components/types.ts**
   - Component prop interfaces
   - Shared type definitions

3. **client-src/ClientAdminChannelApp/components/EditChannelApp/types.ts**
   - Component-specific type definitions

## Next Steps for Migration

1. **Components to Migrate Next:**
   - AdminWholeHtml component
   - Remaining Edge components
   - Server-side handlers

2. **Utility Functions to Migrate:**
   - StringUtils.js → StringUtils.ts
   - TimeUtils.js → TimeUtils.ts
   - ManifestUtils.js → ManifestUtils.ts

3. **Clean Up Tasks:**
   - Remove redundant .jsx files
   - Update import statements
   - Verify build and runtime functionality

## Updated Project Structure

After completing the TypeScript migration, the project structure will follow this pattern:

```
client-src/
  ├── components/
  │   ├── index.js
  │   ├── types.ts
  │   ├── ComponentName/
  │   │   └── index.tsx
  │   └── ...
  ├── ClientAppName/
  │   ├── index.tsx
  │   └── components/
  │       └── ComponentName/
  │           ├── index.tsx
  │           └── types.ts
  └── ...

common-src/
  ├── types/
  │   └── FeedContent.ts
  ├── StringUtils.ts
  ├── TimeUtils.ts
  └── ...

edge-src/
  ├── common/
  │   ├── withManifest.tsx
  │   └── ...
  ├── components/
  │   └── ...
  ├── EdgeAppName/
  │   ├── index.tsx
  │   └── ...
  └── ...
```

This structure maintains a clear separation between client-side, common, and edge-side code while ensuring type safety throughout the application.