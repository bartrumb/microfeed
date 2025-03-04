import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function updateWranglerConfig(env) {
  // Read database ID from wrangler.toml
  const wranglerToml = fs.readFileSync('wrangler.toml', 'utf8');
  let databaseId;
  
  if (env === 'preview') {
    // Extract preview database ID from wrangler.toml
    const match = wranglerToml.match(/\[\[env\.preview\.d1_databases\]\][^\[]*?database_id\s*=\s*"([^"]+)"/);
    databaseId = match ? match[1] : null;
  } else {
    // Extract production database ID from wrangler.toml (if needed in the future)
    const match = wranglerToml.match(/\[\[d1_databases\]\][^\[]*?database_id\s*=\s*"([^"]+)"/);
    databaseId = match ? match[1] : null;
  }

  const wranglerPath = 'wrangler.json';

  if (!databaseId || databaseId.trim() === '') {
    throw new Error(`Database ID not found in wrangler.toml for ${env} environment`);
  }

  // Read existing config
  const config = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));

  if (env === 'production') {
    // Update production environment config
    if (!config.env) config.env = {};
    if (!config.env.production) config.env.production = {};
    
    config.env.production.d1_databases = [{
      binding: "FEED_DB",
      database_name: "shop-dawg-microfeed_feed_db",
      database_id: databaseId
    }];
  } else {
    // Update preview/default config
    config.d1_databases = [{
      binding: "FEED_DB",
      database_name: "shop-dawg-microfeed_feed_db_preview",
      database_id: databaseId
    }];
  }

  // Write updated config back to file
  fs.writeFileSync(wranglerPath, JSON.stringify(config, null, 2));
  console.log(`Updated wrangler.json with database ID for ${env} environment`);
}

/**
 * Create an initial manifest file before build
 * This ensures the build process has access to manifest data
 */
async function createInitialManifest() {
  const virtualPath = path.join('edge-src', 'common', 'manifest-virtual.js');
  
  // Create a minimal initial manifest
  const initialContent = `// This file is auto-generated during build
// Do not edit manually

export const manifestData = {}; // Will be populated with real data after build
`;
  
  fs.writeFileSync(virtualPath, initialContent);
  console.log('Created initial manifest-virtual.js for build');
}

async function updateManifestAfterBuild() {
  const manifestPath = path.join('dist', '.vite', 'manifest.json');
  const virtualPath = path.join('edge-src', 'common', 'manifest-virtual.js');
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Manifest file not found. Build must be run first.');
  }
  
  // Read the manifest data
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Create the virtual module content
  const virtualContent = `// This file is auto-generated during build
// Do not edit manually

export const manifestData = ${JSON.stringify(manifestData, null, 2)};
`;
  
  // Write the virtual module
  fs.writeFileSync(virtualPath, virtualContent);
  console.log('Updated manifest-virtual.js with build manifest data');
  
  // Copy manifest to public directory for client access
  const publicManifestPath = path.join('dist', 'manifest.json');
  fs.copyFileSync(manifestPath, publicManifestPath);
}

/**
 * Copy static assets from public directory to dist directory
 * This is needed because we have publicDir: false in vite.config.js
 */
async function copyStaticAssets() {
  // Static assets from public directory
  const publicAssetDirs = [
    ['public/assets/favicon', 'assets/favicon'],
    ['public/assets/brands', 'assets/brands'],
    ['public/assets/howto', 'assets/howto'],
    ['public/assets/default', 'assets/default']
  ];

  // Copy public assets to dist
  publicAssetDirs.forEach(([src, dest]) => {
    const destPath = path.join('dist', dest);
    if (fs.existsSync(src)) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(src, destPath);
      console.log(`Copied ${src} to ${destPath}`);
    }
  });

  // Copy individual static files
  const filesToCopy = [
    ['public/robots.txt', 'dist/robots.txt'],
    ['public/humans.txt', 'dist/humans.txt'],
    ['public/openapi.yaml', 'dist/openapi.yaml']
  ];

  // Copy each static file
  filesToCopy.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${src} to ${dest}`);
    }
  });

  // Verify built assets exist
  const requiredAssets = [
    'dist/_app/immutable/assets/admin-styles.css',
    'dist/_app/immutable/assets/index.css',
    'dist/_app/immutable/chunks/constants.js',
    'dist/_app/immutable/chunks/ui-components.js',
    'dist/_app/immutable/chunks/react-vendor.js',
    'dist/_app/immutable/chunks/utils.js'
  ];

  const missingAssets = requiredAssets.filter(asset => !fs.existsSync(asset));
  if (missingAssets.length > 0) {
    throw new Error(`Missing required assets:\n${missingAssets.join('\n')}`);
  }

  console.log('Copied static assets to dist directory');
}

/**
 * Recursively copy a directory
 */
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Rebuild the project with updated manifest
 * This is needed to ensure the HTML files include correct script references
 */
async function rebuildWithManifest(env) {
  console.log(`Rebuilding project with updated manifest for ${env} environment...`);
  
  // Set environment variables for the second build
  const buildEnv = {
    ...process.env,
    REBUILD_WITH_MANIFEST: 'true', // Signal that this is a rebuild with manifest
    NODE_ENV: env === 'preview' ? 'development' : 'production'
  };
  
  // Run second build with manifest data available
  const buildScript = env === 'preview' ? 'pnpm build:dev' : 'pnpm build';
  execSync(buildScript, { stdio: 'inherit', env: buildEnv });
  console.log('Rebuild complete with proper manifest data');
}

async function deploy() {
  try {
    // Get environment from command line args
    const env = process.argv[2] || 'preview';
    
    // Update wrangler config with database ID
    await updateWranglerConfig(env);

    // Create initial manifest file
    await createInitialManifest();
    
    // First build - generates the manifest
    console.log(`Building project for ${env} environment...`);
    const buildScript = env === 'preview' ? 'pnpm build:dev' : 'pnpm build';
    execSync(buildScript, { stdio: 'inherit' });
    
    // Update manifest virtual module
    console.log('Updating manifest data...');
    await updateManifestAfterBuild();
    
    // Rebuild with updated manifest to ensure HTML has correct script references
    await rebuildWithManifest(env);
        
    // Copy static assets
    console.log('Copying static assets...');
    await copyStaticAssets();
    
    // Run deployment
    console.log(`Deploying to ${env}...`);
    
    // Use the same command for both environments as compatibility flags aren't supported
    const deployCommand = `wrangler pages deploy dist --project-name shop-dawg-microfeed --branch ${env} --no-bundle`;
    
    execSync(
      deployCommand,
      { stdio: 'inherit' }
    );
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();