import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}',
    })
  ],
  base: '/',
  publicDir: 'public',
  server: {
    port: 3001,  // Use a different port to avoid conflict with Wrangler
    host: true,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        // Client-side entry points
        'ClientAdminChannelApp': 'client-src/ClientAdminChannelApp/index.jsx',
        'ClientAdminCustomCodeEditorApp': 'client-src/ClientAdminCustomCodeEditorApp/index.jsx',
        'ClientAdminHomeApp': 'client-src/ClientAdminHomeApp/index.jsx',
        'ClientAdminItemsApp': 'client-src/ClientAdminItemsApp/index.jsx',
        'ClientAdminSettingsApp': 'client-src/ClientAdminSettingsApp/index.jsx',
        // Edge entry points
        'EdgeAdminChannelApp': 'edge-src/EdgeAdminChannelApp/index.jsx',
        'EdgeAdminHomeApp': 'edge-src/EdgeAdminHomeApp/index.jsx',
        'EdgeAdminItemsApp': 'edge-src/EdgeAdminItemsApp/index.jsx',
        'EdgeCustomCodeEditorApp': 'edge-src/EdgeCustomCodeEditorApp/index.jsx',
        'EdgeHomeApp': 'edge-src/EdgeHomeApp/index.jsx',
        'EdgeItemApp': 'edge-src/EdgeItemApp/index.jsx',
        'EdgeSettingsApp': 'edge-src/EdgeSettingsApp/index.jsx'
      },
      output: {
        entryFileNames: 'build/[name]_js-[hash].js',
        chunkFileNames: 'build/chunks/[name]-[hash].js',
        assetFileNames: 'build/[name]_[ext]-[hash].[ext]',
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
  envPrefix: ['VITE_', 'CLOUDFLARE_']
});