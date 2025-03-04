# Decision Log

## 2025-03-04: Source Map 404 Errors Analysis and Solution

### Context
- Production deployment is experiencing 404 errors for source map files
- Specifically: ReactToastify.css.map and Constants.js.map
- These errors appear in the browser console but don't affect functionality
- Source maps are enabled in the build configuration but not properly handled in deployment

### Analysis
1. **Source Maps Generation**:
   - Source maps are enabled in vite.config.js with `sourcemap: true`
   - Browser requests source maps for debugging but they're not available

2. **Case Sensitivity Issue**:
   - Browser requests `constants.js.map` (lowercase)
   - Chunk is defined as `'constants': ['@common/Constants']` in vite.config.js
   - This case sensitivity mismatch causes the 404 error

3. **CSS Map Files**:
   - ReactToastify CSS is imported in client-src/components/AdminNavApp/index.jsx
   - CSS extraction configuration may not properly handle source maps

4. **Deployment Process**:
   - deploy.js script doesn't verify source map files
   - The `--no-bundle` flag prevents Cloudflare Pages from processing files further

### Decision
We will implement the following solutions:

1. **Disable Source Maps in Production**:
   - Update vite.config.js to only enable source maps in development
   - This is the simplest solution that eliminates the 404 errors

2. **Fix Case Sensitivity Issue**:
   - Update chunk naming to ensure consistency between definition and output
   - This addresses the root cause of the Constants.js.map 404 error

3. **Update Deployment Verification**:
   - Add source map verification to the deploy.js script
   - This ensures all required files are included in the deployment

### Rationale
- Source maps are primarily useful for development and debugging
- They increase bundle size and aren't necessary in production
- Disabling them is a clean solution that eliminates the 404 errors
- Fixing the case sensitivity issue ensures consistent naming throughout the build process

### Technical Details
- Will modify vite.config.js to conditionally enable source maps based on mode
- Will update chunk naming to ensure case consistency
- Will add verification steps to the deployment process

### Impact
- Eliminates 404 errors in the browser console
- Reduces bundle size in production
- Improves overall user experience
- Maintains development debugging capabilities

## 2025-03-03: Fixed Development Database Configuration Issue

### Context
- Local development server was failing to find the D1 database configuration
- Error: "Couldn't find a D1 DB with the name or binding 'shop-dawg-microfeed_feed_db_development_development'"
- Project had configuration split between wrangler.json and wrangler.toml

### Decision
Updated wrangler.json to include development database configuration:
- Set correct database name: "shop-dawg-microfeed_feed_db_development_development"
- Added database ID from initialization: "c9f68fba-4b41-465f-bafe-e27608125941"
- Kept binding as "FEED_DB" for consistency

### Rationale
- Local development server specifically looks for configuration in wrangler.json
- Database was successfully created but binding configuration was missing
- Maintaining consistent binding name across environments

### Technical Details
- Database initialization scripts update wrangler.toml
- Deployment scripts update wrangler.json
- Both files need to be kept in sync for now
- Long-term recommendation: standardize on single configuration file

### Impact
- Enables local development server to connect to D1 database
- Maintains separation between development, preview, and production databases
- Preserves existing preview and production configurations