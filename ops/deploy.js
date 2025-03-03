import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';


async function updateWranglerConfig(env) {
  const wranglerPath = 'wrangler.json';
  const databaseId = process.env.D1_DATABASE_ID;

  if (!databaseId) {
    throw new Error('D1_DATABASE_ID environment variable is required');
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
  // Ensure destination directories exist
  fs.mkdirSync(path.join('dist', 'assets', 'favicon'), { recursive: true });
  
  // Copy favicon files
  const faviconDir = path.join('public', 'assets', 'favicon');
  fs.readdirSync(faviconDir).forEach(file => {
    fs.copyFileSync(path.join(faviconDir, file), path.join('dist', 'assets', 'favicon', file));
  });
  console.log('Copied static assets to dist directory');
}

/**
 * Rebuild the project with updated manifest
 * This is needed to ensure the HTML files include correct script references
 */
async function rebuildWithManifest() {
  console.log('Rebuilding project with updated manifest...');
  
  // Set environment variables for the second build
  const env = {
    ...process.env,
    REBUILD_WITH_MANIFEST: 'true', // Signal that this is a rebuild with manifest
    VITE_DISABLE_OPTIMIZATIONS: process.env.VITE_DISABLE_HASH, // Pass through the disable optimization flag
    VITE_PRESERVE_EXPORTS: process.env.VITE_DISABLE_HASH, // Preserve export names 
    NODE_ENV: process.env.VITE_DISABLE_HASH === 'true' ? 'development' : 'production', // Use development mode for preview to prevent minification
  };
  
  // Run second build with manifest data available
  execSync('pnpm build', { stdio: 'inherit', env });
  console.log('Rebuild complete with proper manifest data');
}

async function deploy() {
  try {
    // Get environment from command line args
    const env = process.argv[2] || 'preview';
    
    // Disable hashing for preview environment to solve module loading issues
    const isPreview = env === 'preview';
    process.env.VITE_DISABLE_HASH = isPreview ? 'true' : 'false';
    
    // Update wrangler config with database ID
    await updateWranglerConfig(env);

    // Create initial manifest file
    await createInitialManifest();
    
    // First build - generates the manifest
    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });
    
    // Update manifest virtual module
    console.log('Updating manifest data...');
    await updateManifestAfterBuild();
    
    // Rebuild with updated manifest to ensure HTML has correct script references
    await rebuildWithManifest();
        
    // Copy static assets
    console.log('Copying static assets...');
    await copyStaticAssets();
    
    // Run deployment
    console.log(`Deploying to ${env}...`);
    
    // For preview, use compatibility flags to ensure proper module resolution
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