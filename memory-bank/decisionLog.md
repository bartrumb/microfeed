# Decision Log

## Asset Bundling Configuration Update (2025-03-01)
- **Context**: Asset loading issues with unbundled assets and undefined Cloudflare configuration
- **Decision**: Enhanced Vite build configuration for better asset handling
- **Changes**:
  1. Enabled manifest generation for better asset tracking
  2. Implemented CSS code splitting for optimized loading
  3. Reorganized output structure:
     - Moved all assets to 'assets/' directory
     - Improved naming patterns for better caching
     - Fixed CSS file paths to use explicit paths instead of globs
  4. Added dedicated styles chunk for CSS bundling
  5. Configured CSS modules with scoped class names
- **Rationale**:
  - Manifest helps with asset versioning and cache invalidation
  - CSS code splitting reduces initial bundle size
  - Consistent asset directory structure improves caching
  - Scoped CSS names prevent style conflicts
  - Explicit CSS paths avoid filesystem glob issues
- **Implementation**: Updated vite.config.js with new build options

## WSL/Windows Filesystem Interaction (2025-03-01)
- **Context**: Encountered I/O errors when trying to remove dist directory using WSL
- **Decision**: Implemented a hybrid approach using PowerShell for file cleanup operations
- **Rationale**: 
  - WSL can sometimes have filesystem permission issues with Windows directories
  - PowerShell provides more reliable file operations on Windows filesystems
  - This approach maintains development workflow while avoiding filesystem conflicts
- **Implementation**: 
  - Use PowerShell's Remove-Item for cleanup operations
  - Document this pattern for future reference
  - Added to activeContext.md for tracking

## Asset Path Standardization (2025-03-02)
- **Context**: Asset loading issues with inconsistent paths and missing files
- **Decision**: Standardized asset paths across build config and components
- **Changes**:
  1. Updated Vite output configuration:
     - JS files: /assets/client/ for entry points
     - Chunks: /assets/client/chunks/ for code splitting
     - CSS files: /assets/ for stylesheets
  2. Updated HtmlHeader component:
     - Proper path resolution for chunks vs entry points
     - Consistent CSS file paths
     - Removed dependency on process.env
  3. Simplified development paths:
     - Predictable structure matching production
     - No manifest dependency in development
- **Rationale**:
  - Consistent paths between development and production
  - Simpler asset resolution without environment checks
  - Better organization of bundled files
  - Improved caching and versioning support

## Next Steps
- Monitor build output and asset loading in production environment
- Consider creating a utility script to handle cross-platform file operations
- Document any additional filesystem-related workarounds as needed
- Test CSS bundling and code splitting in production