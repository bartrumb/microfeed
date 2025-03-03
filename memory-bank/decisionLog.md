# Decision Log

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