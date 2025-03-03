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
    '@common/Constants',
    'slugify',
    'html-to-text',
    path.resolve(__dirname, './client-src/common/utils.ts'),
    '@client/common/BrowserUtils',
    '@client/common/ClientUrlUtils',
    '@client/common/ToastUtils',
    '@common/StringUtils',
    '@common/TimeUtils'
  ],
  'ui-components': {
    include: [
      'client-src/components/AdminCodeEditor',
      '@client/components/AdminDialog',
      '@client/components/AdminInput',
      '@client/components/AdminSelect',
      '@client/components/AdminSwitch'
    ],
    enforce: true
  },
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

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      include: '**/*.{jsx,js,tsx,ts}',  // Added TypeScript extensions
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
    minify: mode === 'development' ? false : 'esbuild',  // Only minify in production
    target: 'esnext',
    sourcemap: true,
    modulePreload: false,
    manifest: true,
    outDir: 'dist',
    emptyOutDir: false, // Don't empty the output directory to preserve assets
    ssrManifest: true,
    cssCodeSplit: false, // Disable CSS code splitting to ensure all styles are in one file
    assetsDir: '_app/immutable',
    terserOptions: mode === 'development' || process.env.PREVIEW ? { 
      mangle: false,
      keep_fnames: true,
      keep_classnames: true,
      compress: false,
      format: {
        comments: true,
        beautify: true
      }
    } : {
      // Production terser options
      mangle: {
        keep_fnames: true  // Preserve function names in production
      },
      compress: {
        drop_console: false,  // Keep console logs for debugging
        pure_funcs: []  // Don't remove any functions
      },
      format: {
        comments: false
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
            return `_app/immutable/assets/${name.includes('admin') ? 'admin-styles' : 'index'}.css`;
           }
          return `assets/[name][extname]`;
        },
        format: 'esm',
        manualChunks: (id) => {
          for (const [name, modules] of Object.entries(manualChunks)) {
            // Handle enforced chunks
            if (modules.enforce && modules.include) {
              if (modules.include.some(pattern => id.includes(pattern))) {
                return name;
              }
            }
            // Handle regular array patterns
            else if (Array.isArray(modules)) {
              if (modules.some(pattern => {
                if (typeof pattern === 'string' && pattern.endsWith('.ts')) {
                  // For explicit TypeScript files, do exact path matching
                  return id === pattern;
                }
                // For other patterns, use includes matching
                return id.includes(pattern);
              })) {
                return name;
              }
            }
          }
          return null;
        },
        preserveModules: false,
        hoistTransitiveImports: false
      }
    }
  },
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, './client-src'),
      '@edge': path.resolve(__dirname, './edge-src'),
      '@common': path.resolve(__dirname, './common-src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css']  // Added .css extension
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
,
    },
    // Ensure CSS is extracted to a single file
    extract: {
      filename: '_app/immutable/assets/[name].css'
    }
  }
}));