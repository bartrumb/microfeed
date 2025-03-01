import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}', // Enable JSX in .js files
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Client-side entry points
        'ClientAdminChannelApp': 'client-src/ClientAdminChannelApp/index.js',
        'ClientAdminCustomCodeEditorApp': 'client-src/ClientAdminCustomCodeEditorApp/index.js',
        'ClientAdminHomeApp': 'client-src/ClientAdminHomeApp/index.js',
        'ClientAdminItemsApp': 'client-src/ClientAdminItemsApp/index.js',
        'ClientAdminSettingsApp': 'client-src/ClientAdminSettingsApp/index.js',
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
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, './client-src'),
      '@edge': path.resolve(__dirname, './edge-src'),
      '@common': path.resolve(__dirname, './common-src')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'] // Add support for various extensions
  },
  server: {
    port: 3000,
    host: true
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