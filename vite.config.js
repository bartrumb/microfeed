import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Entry points configuration
const entryPoints = {
  'adminhome': 'client-src/ClientAdminHomeApp/index.jsx',
  'admincustomcode': 'client-src/ClientAdminCustomCodeEditorApp/index.jsx',
  'adminchannel': 'client-src/ClientAdminChannelApp/index.jsx',
  'adminitems': 'client-src/ClientAdminItemsApp/index.jsx',
  'adminsettings': 'client-src/ClientAdminSettingsApp/index.jsx'
};

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
  base: '',
  publicDir: 'public',
  server: {
    port: 3001,  // Use a different port to avoid conflict with Wrangler
    host: true,
    strictPort: true
  },
  build: {
    manifest: !isDev, // Only enable manifest in production
    outDir: 'dist',
    emptyOutDir: true,
    ssrManifest: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        ...entryPoints
        // Entry points are handled by manualChunks
      },
      output: {
        // In development, use simpler paths
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/^edge_/, '');
          return `_app/immutable/entry-${name}${isDev ? '' : '.[hash]'}.js`;
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          return `_app/immutable/chunks/${name}${isDev ? '' : '.[hash]'}.js`;
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            const name = assetInfo.name.replace('.css', '');
            return `_app/immutable/assets/${name}${isDev ? '' : '.[hash]'}.css`;
          }
          return `_app/immutable/assets/${assetInfo.name}`;
        },
        format: 'esm',
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'utils': [
 // Common utilities
            'slugify',
            'html-to-text',
            '@client/common/BrowserUtils',
            '@client/common/ClientUrlUtils',
            '@client/common/ToastUtils',
            '@common/StringUtils',
            '@common/TimeUtils'
          ],
          'ui-components': [
 // UI components
            '@client/components/AdminCodeEditor',
            '@client/components/AdminDialog',
            '@client/components/AdminInput',
            '@client/components/AdminSelect',
            '@client/components/AdminSwitch'
          ],
          'admin-styles': [
            'client-src/common/admin_styles.css'
,
            '@common/Constants'
          ]
        },
        intro: isDev ? '' : `if(!('modulepreload' in document.createElement('link'))){document.head.insertAdjacentHTML('beforeend','<script src="/_app/immutable/chunks/modulepreload-polyfill.js"></script>');}`
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