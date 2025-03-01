import { exec } from 'child_process';
import { WranglerCmd } from "./lib/utils.js";
import fs from 'fs';

const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'development');

// Helper function to update wrangler.toml with database ID
function updateWranglerToml(databaseId) {
  const wranglerPath = 'wrangler.toml';
  const currentEnv = process.env.DEPLOYMENT_ENVIRONMENT || 'development';

  // Update the appropriate section based on environment
  if (currentEnv === 'development') {
    // Update base configuration
    const baseConfig = `[[d1_databases]]
binding = "FEED_DB"
database_name = "${cmd._non_dev_db()}"
database_id = "${databaseId}"`;
    fs.writeFileSync(wranglerPath, baseConfig);
  } else {
    // Read existing config to preserve other environments
    let existingConfig = '';
    try {
      existingConfig = fs.readFileSync(wranglerPath, 'utf8');
    } catch (error) {
      console.warn('No existing wrangler.toml found, creating new one');
    }
    
    // Create environment-specific configuration
    const envConfig = `[[env.${currentEnv}.d1_databases]]
binding = "FEED_DB"
database_name = "${cmd._non_dev_db()}"
database_id = "${databaseId}"`;

    // If we have existing config, append to it
    if (existingConfig) {
      // Remove any existing config for this environment
      const envRegex = new RegExp(`\\[\\[env\\.${currentEnv}\\.d1_databases\\]\\][^\\[]*`, 'g');
      existingConfig = existingConfig.replace(envRegex, '');
      
      // Append new config
      fs.writeFileSync(wranglerPath, `${existingConfig.trim()}\n\n${envConfig}`);
    } else {
      fs.writeFileSync(wranglerPath, envConfig);
    }
  }

  console.log(`Updated wrangler.toml with database ID: ${databaseId}`);
}

async function initializeDatabase() {
  try {
    // First try to get existing database
    const existingId = await new Promise((resolve) => cmd.getDatabaseId(resolve));
    
    if (existingId) {
      console.log('Using existing database:', existingId);
      updateWranglerToml(existingId);
      await createTables();
      return;
    }

    // If no existing database, create new one
    const result = await new Promise((resolve) => cmd.createDatabaseViaApi(resolve));

    if (!result) {
      throw new Error('Failed to create database');
    }

    console.log('Database created successfully:', result.uuid);
    updateWranglerToml(result.uuid);
    await createTables();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

async function createTables() {
  return new Promise((resolve, reject) => {
    exec(cmd.createFeedDbTables(), (error, stdout, stderr) => {
      if (error) reject(error);
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      console.log('Tables created successfully');
      resolve();
    });
  });
}

initializeDatabase();
