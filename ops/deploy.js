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

async function updateManifestVirtual() {
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
  fs.copyFileSync(manifestPath, path.join('dist', 'manifest.json'));
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

async function deploy() {
  try {
    // Get environment from command line args
    const env = process.argv[2] || 'preview';
    
    // Update wrangler config with database ID
    await updateWranglerConfig(env);

    // Run build
    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });
    
    // Update manifest virtual module
    console.log('Updating manifest data...');
    await updateManifestVirtual();
    
    // Copy static assets
    console.log('Copying static assets...');
    await copyStaticAssets();
    
    // Run deployment
    console.log(`Deploying to ${env}...`);
    execSync(
      `wrangler pages deploy dist --project-name shop-dawg-microfeed --branch ${env} --no-bundle`,
      { stdio: 'inherit' }
    );
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();