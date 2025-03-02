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
   import { createCloudflareWorkers } from '@cloudflare/workers-vite';

   export default defineConfig({
     plugins: [
       react(),
       createCloudflareWorkers({
         entry: 'functions/index.jsx',
         pagesDir: 'dist'
       })
     ],
     build: {
       outDir: 'dist',
       manifest: !isDev,
       rollupOptions: {
         output: {
           entryFileNames: '_app/immutable/[name].[hash].js',
           chunkFileNames: '_app/immutable/chunks/[name].[hash].js',
           assetFileNames: '_app/immutable/assets/[name].[hash][extname]'
         }
       }
     }
   });
   ```

3. **ViteUtils.js Standardization**
   ```js
   // Unified path resolution
   export function getViteAssetPath(name, type = 'js') {
     const base = isDev ? '' : '/_app/immutable';
     const dir = type === 'css' ? 'assets' : isDev ? '' : '';
     return `${base}/${dir}/${name}.${type}`;
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

## Asset Path Standardization (2025-03-02)
[Previous entry preserved...]

## WSL/Windows Filesystem Interaction (2025-03-01)
[Previous entry preserved...]

## Next Steps
- Monitor build output and asset loading in production environment
- Consider creating a utility script to handle cross-platform file operations
- Document any additional filesystem-related workarounds as needed
- Test CSS bundling and code splitting in production