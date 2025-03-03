import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

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
    minify: false,
    target: 'esnext',
    sourcemap: true,
    modulePreload: false,
    manifest: true,
    outDir: 'dist',
    emptyOutDir: true,
    ssrManifest: true,
    cssCodeSplit: true,
    terserOptions: { 
      mangle: false,
      keep_fnames: true,
      keep_classnames: true,
      compress: false,
      format: {
        comments: true,
        beautify: true
      }
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: entryPoints,
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith('functions/')) {
            return `${chunkInfo.name}.js`;
          } else {
            return `_app/immutable/entry-${chunkInfo.name}.js`;
          }
        },
        chunkFileNames: (chunkInfo) => {
          if (Object.keys(manualChunks).includes(chunkInfo.name)) {
            return `_app/immutable/chunks/${chunkInfo.name}.js`;
          }
          return `_app/immutable/chunks/${chunkInfo.name}.js`;
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            const name = assetInfo.name.replace('.css', '');
            return `_app/immutable/assets/${name}.css`;
          }
          return `assets/[name][extname]`;
        },
        format: 'esm',
        manualChunks: (id) => {
          for (const [name, modules] of Object.entries(manualChunks)) {
            if (modules.some(pattern => id.includes(pattern))) {
              return name;
            }
          }
          return null;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, './client-src'),
      '@edge': path.resolve(__dirname, './edge-src'),
      '@common': path.resolve(__dirname, './common-src'),
      // Only alias our app's utils, not node_modules
      '@client/common/utils.js': path.resolve(__dirname, './client-src/common/utils-dev.js')
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