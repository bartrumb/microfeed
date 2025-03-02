# Decision Log

## Vite and Cloudflare Pages Integration (2025-03-02)
- **Context**: Need to standardize asset handling between local development and Cloudflare Pages deployment
- **Decision**: Implement comprehensive asset path standardization and Cloudflare integration
- **Changes Required**:

1. **Asset Directory Structure**
   - Current: `/assets/client/` and `/assets/`
   - Target: `/_app/immutable/` (Cloudflare Pages standard)
   - Rationale: Match Cloudflare Pages expectations while maintaining clean separation

2. **Vite Configuration Updates**
   ```js
   // vite.config.js changes
   export default defineConfig({
     plugins: [
       react({
         include: '**/*.{jsx,js}',
       })
     ],
     base: '',
     publicDir: 'public',
     server: {
       port: 3001,
       host: true,
       strictPort: true
     },
     build: {
       outDir: 'dist',
       manifest: !isDev,
       cssCodeSplit: true,
       chunkSizeWarningLimit: 1000,
       rollupOptions: {
         input: {
           adminhome: 'client-src/ClientAdminHomeApp/index.jsx',
           admincustomcode: 'client-src/ClientAdminCustomCodeEditorApp/index.jsx',
           adminchannel: 'client-src/ClientAdminChannelApp/index.jsx',
           adminitems: 'client-src/ClientAdminItemsApp/index.jsx',
           adminsettings: 'client-src/ClientAdminSettingsApp/index.jsx'
         },
         output: {
           entryFileNames: isDev
             ? '_app/assets/client/[name].js'
             : '_app/immutable/entry-[name].[hash].js',
           chunkFileNames: isDev
             ? '_app/assets/client/chunks/[name].js'
             : '_app/immutable/chunks/[name].[hash].js',
           assetFileNames: (assetInfo) => {
             if (assetInfo.name && assetInfo.name.endsWith('.css')) {
               const baseName = assetInfo.name.replace('.css', '');
               return isDev
                 ? `_app/assets/${baseName}.css`
                 : `_app/immutable/assets/${baseName}.[hash].css`;
             }
             return isDev
               ? `_app/assets/[name].[ext]`
               : `_app/immutable/assets/[name].[hash].[ext]`;
           }
         }
       }
     }
   });
   ```

3. **ViteUtils.js Standardization**
   ```js
   // Unified path resolution
   const base = '/_app/immutable';
   export function getViteAssetPath(name, type = 'js') {
     if (isDev) {
       if (type === 'js') {
         return `/_app/assets/client/chunks/${name}.js`;
       } else {
         return `/_app/assets/${name}.css`;
       }
     } else {
       if (type === 'js') {
         return `${base}/chunks/${name}${isDev ? '' : '.[hash]'}.js`;
       } else {
         return `${base}/assets/${name}${isDev ? '' : '.[hash]'}.css`;
       }
     }
   }
   ```

4. **HtmlHeader Component Updates**
   ```jsx
   // Consistent path resolution
   const assetPath = isDev
     ? `/${js}.js`
     : `/_app/immutable/${js}.[hash].js`;
   ```

5. **Module Preload Configuration**
   ```js
   // Update polyfill path
   intro: isDev ? '' : `if(!('modulepreload' in document.createElement('link'))){
     document.head.insertAdjacentHTML('beforeend',
     '<script src="/_app/immutable/chunks/modulepreload-polyfill.[hash].js"></script>');
   }`
   ```

6. **Wrangler Configuration**
   ```toml
   # wrangler.toml updates
   pages_build_output_dir = "dist"
   compatibility_date = "2024-02-28"
   main = "functions/index.jsx"

   [env.development]
   # Development-specific settings

   [env.preview]
   # Preview-specific settings
   ```

- **Implementation Steps**:
  1. Install Cloudflare Vite plugin: `pnpm add -D @cloudflare/workers-vite`
  2. Update Vite configuration with new output structure
  3. Modify ViteUtils.js for unified path handling
  4. Update HtmlHeader component path resolution
  5. Move and rename modulepreload-polyfill.js
  6. Verify wrangler.toml configuration

- **Testing Strategy**:
  1. Local Development:
     - `pnpm dev` should serve assets correctly
     - Hot module replacement should work
     - CSS changes should reflect immediately
  
  2. Preview Deployment:
     - `pnpm deploy:preview` should build and deploy successfully
     - Assets should load from /_app/immutable/
     - No 404 errors in browser console
  
  3. Production Deployment:
     - `pnpm deploy:prod` should mirror preview success
     - Performance metrics should be maintained
     - Cache headers should be properly set

- **Rollback Plan**:
  - Keep copy of original configuration files
  - Document current asset paths
  - Maintain ability to revert to previous structure if needed

- **Port Configuration Note**:
   - Using port 3001 for Vite dev server
   - Avoids conflicts with Wrangler's default ports
   - Added strictPort: true to fail on port conflicts
   - Can be adjusted if needed, but must avoid port conflicts

## Asset Path Resolution Fix (2025-03-02)
- **Context**: Asset paths were failing with 404s due to inconsistent path handling
- **Changes Made**:
  1. Updated wrangler.toml to use correct build output directory (dist)
  2. Standardized asset paths in vite.config.js to use /_app/immutable/ in both dev and prod
  3. Updated ViteUtils.js to use consistent path structure
  4. Cleaned up old development directories

## Environment Detection and Asset Path Fixes (2025-03-02)
- **Context**: Asset paths were failing in Cloudflare Workers environment due to unreliable environment detection
- **Decision**: Implement more robust environment detection and standardize asset paths
- **Changes Made**:

1. **Improved Environment Detection**
   ```js
   const isDev = typeof process !== 'undefined' && 
     process.env.NODE_ENV === 'development' && 
     !process.env.CF_PAGES;
   ```
   - Added check for process existence
   - Added CF_PAGES environment check
   - Implemented in both ViteUtils.js and HtmlHeader component

2. **Production Path Structure**
   - Updated chunk paths to use proper Cloudflare Pages structure
   - JS entries: `/_app/immutable/entries/[name].[hash].js`
   - JS chunks: `/_app/immutable/chunks/[name].[hash].js`
   - CSS files: `/_app/immutable/assets/[name].[hash].css`

- **Testing Required**:
  1. Verify asset loading in development environment
  2. Test asset paths in Cloudflare Pages preview deployment
  3. Confirm proper path resolution in production environment
  4. Check modulepreload functionality in all environments

## WSL/Windows Filesystem Interaction (2025-03-01)
[Previous entry preserved...]

## Next Steps
- Monitor build output and asset loading in production environment
- Consider creating a utility script to handle cross-platform file operations
- Document any additional filesystem-related workarounds as needed
- Test CSS bundling and code splitting in production
- Verify environment detection in all deployment scenarios
- Monitor asset loading performance in production