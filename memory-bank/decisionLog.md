# Decision Log

## 2025-03-03: Type Checking Implementation Strategy

### Context
The application has experienced runtime errors like "Cannot read properties of undefined" due to lack of type checking. While some fixes have been implemented (ErrorBoundary, null checks), a more systematic approach is needed to prevent these issues.

### Decisions Made

1. **TypeScript Implementation Approach**
   - Chose TypeScript over PropTypes for comprehensive type checking
   - Implemented a gradual migration strategy from JSX to TSX
   - Created a centralized type system in common-src/types/
   - Rationale: TypeScript provides stronger guarantees, better IDE support, and more comprehensive type checking than PropTypes

2. **Core Type Definitions Structure**
   - Created interfaces for main data structures (FeedContent, Item, Channel, Settings)
   - Used optional properties (?) for potentially undefined values
   - Added explicit type guards for critical data access
   - Rationale: Centralized type definitions improve consistency and make the codebase more maintainable

3. **Migration Strategy**
   - Adopted a phased approach starting with core types, then critical components
   - Configured TypeScript to allow mixing JavaScript and TypeScript files
   - Enabled strict mode for maximum type safety
   - Rationale: Gradual migration minimizes disruption while improving type safety incrementally

4. **Error Handling Enhancement**
   - Enhanced ErrorBoundary components with typed props
   - Added type guards for safer data access
   - Implemented default values for potentially undefined properties
   - Rationale: Combines static type checking with runtime safeguards for maximum reliability

5. **Build Process Configuration**
   - Configured TypeScript to report errors but not fail builds initially
   - Added path aliases for cleaner imports
   - Included all source directories in TypeScript compilation
   - Rationale: Allows for incremental adoption without breaking the build process

### Technical Details

1. **Type Definition Implementation**
   - Created FeedContent.ts with interfaces for main data structures
   - Added optional markers (?) for nullable fields
   - Implemented type guards for runtime type checking
   - Added utility types for common patterns

2. **Component Type Annotations**
   - Added props interfaces for React components
   - Implemented generic types for higher-order components
   - Added return type annotations for functions
   - Enhanced error boundaries with typed props

3. **Utility Function Type Safety**
   - Added type annotations to utility functions
   - Implemented typed versions of common functions
   - Added type guards for safer data access
   - Enhanced error handling with type-aware checks

### Impact
- Prevents "Cannot read properties of undefined" errors through static type checking
- Improves developer experience with better IDE support and documentation
- Makes refactoring safer and more predictable
- Provides a gradual migration path from JSX to TypeScript
- Enhances code quality and maintainability

### Alternatives Considered
1. **PropTypes Only**
   - Rejected due to runtime-only checking and less IDE support
   - Would require less setup but provide fewer guarantees

2. **Full TypeScript Conversion at Once**
   - Rejected due to potential disruption and higher risk
   - Would provide immediate benefits but at higher implementation cost

3. **Flow Type Checker**
   - Rejected due to declining community support
   - Would require different tooling and learning curve

4. **Custom Runtime Type Checking**
   - Rejected due to maintenance overhead and performance impact
   - Would provide runtime safety but no static analysis benefits

### Risks and Mitigations
1. **Risk**: Learning curve for developers unfamiliar with TypeScript
   - Mitigation: Provide documentation and examples in typeCheckingPlan.md

2. **Risk**: Build time increases due to type checking
   - Mitigation: Configure incremental compilation and optimize tsconfig.json

3. **Risk**: False positives in type checking
   - Mitigation: Use type assertions judiciously and document edge cases

4. **Risk**: Incomplete type definitions leading to false security
   - Mitigation: Implement comprehensive test coverage and runtime validation

### Follow-up Tasks
1. Implement core type definitions in common-src/types/
2. Convert critical components to TypeScript
3. Add type annotations to utility functions
4. Monitor error logs to ensure fixes are working
5. Consider adding automated tests for type guards
6. Evaluate TypeScript configuration for optimal performance

## 2025-03-02: Asset Loading and Manifest Handling Fixes

### Context
During preview deployment, we encountered 404 errors for JavaScript files due to mismatches between build output filenames and HTML references. The issue stemmed from improper manifest handling and environment detection.

### Decisions Made

1. **Environment Detection Enhancement**
   - Added `PREVIEW` environment check alongside `CF_PAGES`
   - Ensures correct path generation in Cloudflare Pages environments
   - Rationale: More reliable detection of deployment environments

2. **Manifest Data Management**
   - Updated manifest-virtual.js to load production manifest
   - Enhanced withManifest HOC to properly inject manifest data
   - Added manifest copying to public directory
   - Rationale: Ensures consistent manifest data availability across all environments

3. **Asset Loading Strategy**
   - Implemented proper critical chunk loading
   - Added support for dynamic chunk dependencies
   - Removed modulepreload links in favor of direct script loading
   - Rationale: More reliable asset loading and better dependency management

4. **Edge Component Script Loading Fix**
    - Removed duplicate script references from all Edge components
    - Fixed edge components to only include their own entry points
    - Let HtmlHeader component handle critical chunks loading
    - Rationale: Prevents duplicate script loading and 404 errors for non-existent paths

5. **Build Process Enhancement**
   - Added manifest data injection during build
   - Implemented manifest virtual module population
   - Added manifest copying for client access
   - Rationale: Ensures build artifacts are properly available in production

6. **Disable JavaScript Minification in Preview**
   - Disabled JavaScript minification, mangling, and compression in the preview environment
   - Added `keep_fnames: disableHash` to preserve function names
   - Made code beautified with comments in preview mode for easier debugging
   - Rationale: Prevents export names from being mangled, which was causing module loading errors

### Technical Details

1. **ManifestUtils.js Changes**
   - Enhanced environment detection logic
   - Added Cloudflare Pages-specific manifest loading
   - Improved fallback handling for missing assets
   - Improved chunk name pattern matching with case-insensitive search
   - Added null check for manifest file entries

2. **HtmlHeader Component Updates**
   - Reorganized script loading order
   - Added support for additional chunk dependencies
   - Improved manifest data injection

3. **Edge Component Updates**
    - Fixed script loading in EdgeSettingsApp, EdgeAdminHomeApp, EdgeAdminChannelApp, EdgeAdminItemsApp, 
      EdgeHomeApp, and EdgeCustomCodeEditorApp components
    - Removed conditional script inclusion based on environment
    - Let the HtmlHeader component handle critical chunks loading automatically
    - Resolved duplicate script loading issue causing 404 errors

4. **ViteUtils.js Updates**
   - Synchronized environment detection logic with ManifestUtils.js
   - Added PREVIEW environment variable check
   - Ensures consistent path resolution across utilities
   - Resolves environment detection inconsistencies

5. **Deploy Script Enhancements**
   - Added manifest virtual module population
   - Implemented manifest copying to public directory
   - Enhanced error handling
   - Fixed compatibility flags for Cloudflare Pages

6. **Vite Configuration Updates**
   - Added terserOptions to control minification in preview mode
   - Preserved function names by disabling mangling
   - Added beautify option for preview builds
   - Fixed asset path generation for static resources

### Impact
- Resolves 404 errors for JavaScript files in preview environment
- Improves asset loading reliability
- Enhances build output consistency
- Better supports Cloudflare Pages deployments
- Fixes export name mangling in preview environment
- Enables easier debugging in preview mode

### Alternatives Considered
1. Client-side manifest loading only
   - Rejected due to potential race conditions
2. Static manifest paths
   - Rejected due to cache invalidation concerns
3. Runtime manifest generation
   - Rejected due to performance impact
4. Using named exports only
   - Rejected due to increased development complexity and refactoring needs

### Risks and Mitigations
1. **Risk**: Build-time manifest generation failure
   - Mitigation: Added fallback to development paths
2. **Risk**: Environment detection issues
   - Mitigation: Enhanced detection logic with multiple checks
3. **Risk**: Missing chunk dependencies
   - Mitigation: Added dependency scanning in manifest
4. **Risk**: Export name conflicts in compressed code
   - Mitigation: Disabled minification in preview environment

### Follow-up Tasks
1. Monitor asset loading performance
2. Consider implementing automated tests for build output
3. Evaluate chunk naming strategy for optimal caching
4. Consider implementing build output validation
5. Add build output validation to CI/CD pipeline
6. Monitor deploy performance with disabled minification