import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { WranglerCmd } from './lib/utils';
import { Stats } from 'fs';

interface DatabaseResult {
  uuid: string;
  name: string;
}

async function ensureDatabase(env: string): Promise<string> {
  console.log(`Checking database for ${env} environment...`);
  const cmd = new WranglerCmd(env);

  // Check for existing database
  const existingId = await new Promise<string>((resolve) => cmd.getDatabaseId(resolve));
  
  if (existingId) {
    console.log('Using existing database:', existingId);
    return existingId;
  }

  // Create new database if none exists
  console.log('No existing database found, creating new one...');
  const result = await new Promise<DatabaseResult | null>((resolve) => cmd.createDatabaseViaApi(resolve));

  if (!result) {
    throw new Error('Failed to create database');
  }

  console.log('Database created successfully:', result.uuid);
  console.log('Database name:', result.name);

  // Initialize database tables for new database
  console.log('Initializing database tables...');
  cmd.createFeedDbTables();
  
  return result.uuid;
}

async function updateWranglerConfig(env: string): Promise<void> {
  // First ensure database exists
  const databaseId = await ensureDatabase(env);

  const wranglerPath = 'wrangler.json';

  // Create the config file if it doesn't exist
  if (!fs.existsSync(wranglerPath)) {
    fs.writeFileSync(wranglerPath, '{}');
  }

  // Read existing config
  const config = JSON.parse(fs.readFileSync(wranglerPath, 'utf8'));

  const cmd = new WranglerCmd(env);
  const dbName = cmd._non_dev_db();

  if (env === 'production') {
    // Update production environment config
    if (!config.env) config.env = {};
    if (!config.env.production) config.env.production = {};
    
    config.env.production.d1_databases = [{
      binding: "FEED_DB",
      database_name: dbName,
      database_id: databaseId
    }];
  } else {
    // Update preview/default config
    config.d1_databases = [{
      binding: "FEED_DB",
      database_name: dbName,
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
async function createInitialManifest(): Promise<void> {
  const virtualPath = path.join('edge-src', 'common', 'manifest-virtual.js');
  
  // Create a minimal initial manifest
  const initialContent = `// This file is auto-generated during build
// Do not edit manually

export const manifestData = {}; // Will be populated with real data after build
`;
  
  fs.writeFileSync(virtualPath, initialContent);
  console.log('Created initial manifest-virtual.js for build');
}

async function updateManifestAfterBuild(): Promise<void> {
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
async function copyStaticAssets(): Promise<void> {
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
    'dist/_app/immutable/chunks/Constants.js',
    'dist/_app/immutable/chunks/ui-components.js',
    'dist/_app/immutable/chunks/react-vendor.js',
    'dist/_app/immutable/chunks/utils.js'
  ];

  const missingAssets = requiredAssets.filter(asset => !fs.existsSync(asset));
  if (missingAssets.length > 0) {
    throw new Error(`Missing required assets:\n${missingAssets.join('\n')}`);
  }

  // Check for source map files in development mode
  const env = process.argv[2] || 'preview';
  if (env === 'development' || env === 'preview') {
    // In development and preview, we expect source maps
    const sourceMapFiles = requiredAssets
      .filter(asset => asset.endsWith('.js') || asset.endsWith('.css'))
      .map(asset => `${asset}.map`);
    
    console.log('Checking for source map files...');
    const missingSourceMaps = sourceMapFiles.filter(file => !fs.existsSync(file));
    
    if (missingSourceMaps.length > 0) {
      console.warn(`Warning: Some source map files are missing:\n${missingSourceMaps.join('\n')}`);
      console.warn('This is expected in production builds where source maps are disabled.');
    }
  }

  console.log('Copied static assets to dist directory');
}

/**
 * Recursively copy a directory
 */
function copyRecursive(src: string, dest: string): void {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && (stats as Stats).isDirectory();

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
async function rebuildWithManifest(env: string): Promise<void> {
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

async function deploy(): Promise<void> {
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
    
    // Run deployment using WranglerCmd
    console.log(`Deploying to ${env}...`);
    const cmd = new WranglerCmd(env);
    execSync(`npx wrangler pages deploy dist --project-name shop-dawg-microfeed --branch ${env} --no-bundle`, {
      stdio: 'inherit',
      env: { ...process.env, ...cmd._getEnvVars() }
    });
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();