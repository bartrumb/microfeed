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
    }),
    {
      name: 'copy-manifest',
      writeBundle: {
        sequential: true,
        order: 'post',
        handler: async (options, bundle) => {
          // Copy manifest to dist directory
          const manifestPath = path.resolve(__dirname, '.vite/manifest.json');
          const destPath = path.resolve(__dirname, 'dist/.vite');
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          fs.copyFileSync(manifestPath, path.join(destPath, 'manifest.json'));
        }
      }
    }
  ],
  base: '/',
  publicDir: false,
  server: {
    port: 3001,
    host: true,
    strictPort: true
  },
  build: {
    manifest: true,
    outDir: 'dist',
    emptyOutDir: true,
    ssrManifest: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: entryPoints,
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith('functions/')) {
            return `${chunkInfo.name}.js`;
          }
          return `_app/immutable/entry-${chunkInfo.name}-[hash:8].js`;
        },
        chunkFileNames: `_app/immutable/chunks/[name]-[hash:8].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            const name = assetInfo.name.replace('.css', '');
            return `_app/immutable/assets/${name}-[hash:8].css`;
          }
          return `_app/immutable/assets/[name]-[hash:8][extname]`;
        },
        format: 'esm',
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
          ],
          'constants': [
            '@common/Constants'
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
      generateScopedName: '[name]__[local]__[hash:base64:5]',
      hashPrefix: 'microfeed'
    }
  }
});