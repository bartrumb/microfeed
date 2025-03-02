import { execSync } from 'child_process';
import fs from 'fs';

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

async function deploy() {
  try {
    // Get environment from command line args
    const env = process.argv[2] || 'preview';
    
    // Update wrangler config with database ID
    await updateWranglerConfig(env);

    // Run build
    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });
    
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