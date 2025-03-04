import { WranglerCmd } from "./lib/utils.js";
import fs from 'fs';

const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'development');

// Helper function to update wrangler.toml with database ID
function updateWranglerToml(databaseId) {
  const wranglerPath = 'wrangler.toml';
  const currentEnv = process.env.DEPLOYMENT_ENVIRONMENT || 'development';

  // Read existing config
  let existingConfig = '';
  try {
    existingConfig = fs.readFileSync(wranglerPath, 'utf8');
  } catch (error) {
    console.warn('No existing wrangler.toml found, creating new one');
  }

  // Remove any existing database configurations for the current environment
  if (currentEnv === 'development') {
    // Remove base database config
    existingConfig = existingConfig.replace(/\[\[d1_databases\]\][^\[]*/, '');
  } else {
    // Remove environment-specific config
    const envRegex = new RegExp(`\\[\\[env\\.${currentEnv}\\.d1_databases\\]\\][^\\[]*`, 'g');
    existingConfig = existingConfig.replace(envRegex, '');
  }

  // Create new database configuration
  const dbConfig = currentEnv === 'development'
    ? `[[d1_databases]]
binding = "FEED_DB"
database_name = "${cmd._non_dev_db()}"
database_id = "${databaseId}"`
    : `[[env.${currentEnv}.d1_databases]]
binding = "FEED_DB"
database_name = "${cmd._non_dev_db()}"
database_id = "${databaseId}"`;

  // Write updated configuration
  fs.writeFileSync(wranglerPath, existingConfig ? `${existingConfig.trim()}\n\n${dbConfig}\n` : `${dbConfig}\n`);
  console.log(`Updated wrangler.toml with database ID: ${databaseId}`);
}

async function initializeDatabase() {
  try {
    // Check for existing database
    const existingId = await new Promise((resolve) => cmd.getDatabaseId(resolve));
    
    if (existingId) {
      console.log('Found existing database:', existingId);
      console.log('Deleting existing database...');
      await new Promise((resolve) => cmd.deleteDatabase(existingId, resolve));
    }

    // Create new database
    console.log('Creating new database...');
    const result = await new Promise((resolve) => cmd.createDatabaseViaApi(resolve));

    if (!result) {
      throw new Error('Failed to create database');
    }

    console.log('Database created successfully:', result.uuid);
    console.log('Database name:', result.name);
    
    updateWranglerToml(result.uuid);

    // Initialize database tables using new command execution method
    console.log('Creating tables...');
    cmd.createFeedDbTables();

    // Execute SQL initialization script on remote database
    console.log('Initializing remote database tables...');
    cmd.createFeedDbTablesRemote();
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
