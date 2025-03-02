import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
    manifest: true,
    outDir: 'dist',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        // Client-side entry points
        'adminhome': 'client-src/ClientAdminHomeApp/index.jsx',
        'admincustomcode': 'client-src/ClientAdminCustomCodeEditorApp/index.jsx',
        'adminchannel': 'client-src/ClientAdminChannelApp/index.jsx',
        'adminitems': 'client-src/ClientAdminItemsApp/index.jsx',
        'adminsettings': 'client-src/ClientAdminSettingsApp/index.jsx',
        // Edge entry points
        'edge_admin_channel_js': 'edge-src/EdgeAdminChannelApp/index.jsx',
        'edge_admin_home_js': 'edge-src/EdgeAdminHomeApp/index.jsx',
        'edge_admin_items_js': 'edge-src/EdgeAdminItemsApp/index.jsx',
        'edge_custom_code_js': 'edge-src/EdgeCustomCodeEditorApp/index.jsx',
        'edge_home_js': 'edge-src/EdgeHomeApp/index.jsx',
        'edge_item_js': 'edge-src/EdgeItemApp/index.jsx',
        'edge_settings_js': 'edge-src/EdgeSettingsApp/index.jsx'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return process.env.NODE_ENV === 'development' 
            ? `${chunkInfo.name}.js` 
            : `${chunkInfo.name}-48e9e372204a37a79e94.js`;
        },
        chunkFileNames: (chunkInfo) => {
          return process.env.NODE_ENV === 'development' 
            ? 'chunks/[name].js' 
            : 'chunks/[name]-48e9e372204a37a79e94.js';
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name.replace('.css', '_css');
          return process.env.NODE_ENV === 'development'
            ? `${name}.[ext]`
            : `${name}-48e9e372204a37a79e94.[ext]`;
        },
        format: 'es',
        manualChunks: {
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
          ]
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
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  }
});