import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

// Check if hash is disabled (for preview deployment)
const disableHash = process.env.VITE_DISABLE_HASH === 'true';
// Check if optimizations should be disabled
const disableOptimizations = process.env.VITE_DISABLE_OPTIMIZATIONS === 'true';
// Check if exports should be preserved
const preserveExports = process.env.VITE_PRESERVE_EXPORTS === 'true';

// Entry points configuration
const entryPoints = {
  'adminhome': 'client-src/ClientAdminHomeApp/index.jsx',
  'admincustomcode': 'client-src/ClientAdminCustomCodeEditorApp/index.jsx',
  'adminchannel': 'client-src/ClientAdminChannelApp/index.jsx',
  'adminitems': 'client-src/ClientAdminItemsApp/index.jsx',
  'adminsettings': 'client-src/ClientAdminSettingsApp/index.jsx'
};

// Manual chunks configuration
const manualChunks = {
  'react-vendor': ['react', 'react-dom'],
  'utils': [
    'slugify',
    'html-to-text',
    '@client/common/BrowserUtils',
    '@client/common/ClientUrlUtils',
    '@client/common/ToastUtils',
    '@common/StringUtils',
    '@common/TimeUtils'
  ],
  'ui-components': [
    '@client/components/AdminCodeEditor',
    '@client/components/AdminDialog',
    '@client/components/AdminInput',
    '@client/components/AdminSelect',
    '@client/components/AdminSwitch'
  ],
  'admin-styles': [
    'client-src/common/admin_styles.css'
  ],
  'constants': [
    '@common/Constants'
  ]
  // Note: withManifest should not be its own chunk - it should be imported inline
  // where needed to prevent 404 errors
};

// Add functions entry points
const functionsDir = './functions';
if (fs.existsSync(functionsDir)) {
  const addFunctionEntries = (dir, base = '') => {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const relativePath = path.join(base, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        addFunctionEntries(fullPath, relativePath);
      } else if (entry.endsWith('.jsx') || entry.endsWith('.js')) {
        const name = relativePath.replace(/\.[^/.]+$/, '').replace(/\\/g, '/');
        entryPoints[`functions/${name}`] = path.relative('.', fullPath);
      }
    });
  };
  addFunctionEntries(functionsDir);
}

// Development-specific configuration
const isDev = process.env.NODE_ENV === 'development';

// Ensure directories exist in development
if (isDev) {
  const dirs = ['public/_app/immutable/chunks', 'public/_app/immutable/assets'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    })
  ],
  base: '/',
  publicDir: false,
  server: {
    port: 3001,
    host: true,
    strictPort: true
  },
  build: {
    // Environment-specific build options to prevent export name mangling
    minify: !disableHash && !disableOptimizations,
    target: (disableHash || disableOptimizations) ? 'esnext' : 'es2019',
    sourcemap: true, // Always enable source maps for better debugging
    modulePreload: !(disableHash || disableOptimizations),
    manifest: true,
    outDir: 'dist',
    emptyOutDir: true,
    ssrManifest: true,
    cssCodeSplit: true,
    terserOptions: { 
      mangle: !(disableHash || preserveExports),
      // Preserve export names in preview mode
      keep_fnames: disableHash || preserveExports,
      keep_classnames: true, // Preserve class names for better error traces
      compress: !(disableHash || disableOptimizations) ? {
        passes: 2
      } : false,
      format: {
        // Keep comments in preview mode
        comments: disableHash ? 'all' : false,
        beautify: disableHash
      }
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: entryPoints,
      output: {
        manualChunks: (id, { getModuleInfo }) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('quill') || id.includes('blot-formatter')) {
              return 'quill-vendor';
            }
            if (id.includes('@heroicons') || id.includes('@headlessui')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
          
          // App chunks
          if (id.includes('/common/')) {
            return 'utils';
          }
          if (id.includes('/components/')) {
            return 'ui-components';
          }
          
          // Let Rollup handle other chunks
          return null;
        },
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith('functions/')) {
            return `${chunkInfo.name}.js`;
          } else if (disableHash) {
            // For manual chunks in preview environment, force them to chunks directory
            if (Object.keys(manualChunks).includes(chunkInfo.name)) {
              return `_app/immutable/chunks/${chunkInfo.name}.js`;
            }
            return `_app/immutable/entry-${chunkInfo.name}.js`;
          } else {
            // Use hash in production
            return `_app/immutable/entry-${chunkInfo.name}-[hash:8].js`;
          }
        },
        chunkFileNames: (chunkInfo) => {
          // In preview, don't use hashes at all
          if (disableHash) {
            return `_app/immutable/chunks/${chunkInfo.name}.js`;
          }
          
          // For manual chunks, use the chunk name directly
          if (Object.keys(manualChunks).includes(chunkInfo.name)) {
            return `_app/immutable/chunks/${chunkInfo.name}.js`;
          }
          
          // For dynamic chunks, use a generic name with hash
          return `_app/immutable/chunks/${chunkInfo.name}-[hash:8].js`;
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            const name = assetInfo.name.replace('.css', '');
            if (disableHash) {
              return `_app/immutable/assets/${name}.css`;
            }
            return `_app/immutable/assets/${name}-[hash:8].css`;
          }
          
          if (disableHash) {
            return `assets/[name][extname]`;
          }
          return `assets/[name]-[hash:8][extname]`;
        },
        
        format: 'esm',
        manualChunks: (id, { getModuleInfo }) => {
          // Check if this module is part of a manual chunk
          for (const [name, modules] of Object.entries(manualChunks || {})) {
            if (modules.some(pattern => id.includes(pattern))) {
              return name;
            }
          }
          // Let Rollup handle dynamic chunks
          return null;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, './client-src'),
      '@edge': path.resolve(__dirname, './edge-src'),
      '@common': path.resolve(__dirname, './common-src')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'axios',
      'clsx'
    ]
  },
  envPrefix: ['VITE_', 'CLOUDFLARE_'],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
      hashPrefix: 'microfeed'
    }
  }
});