import * as fs from 'fs';
import { WranglerCmd } from './lib/utils.js';
import type { CloudflareDatabase } from './lib/types.js';

function updateWranglerToml(databaseId: string): void {
  const wranglerPath = './wrangler.toml';
  
  if (fs.existsSync(wranglerPath)) {
    let content = fs.readFileSync(wranglerPath, 'utf8');
    // Update the database ID in the content
    content = content.replace(/database_id = ".*"/, `database_id = "${databaseId}"`);
    fs.writeFileSync(wranglerPath, content);
    console.log('Updated wrangler.toml with new database ID');
  } else {
    console.error('wrangler.toml not found');
    process.exit(1);
  }
}

async function createDatabase(): Promise<void> {
  const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'development');

  try {
    // Create a new database
    console.log('Creating new database...');
    await new Promise<void>((resolve, reject) => {
      cmd.createDatabaseViaApi((result) => {
        if (result && result.uuid) {
          console.log('Database created successfully:', result.uuid);
          console.log('Database name:', result.name);
          updateWranglerToml(result.uuid);
          resolve();
        } else {
          reject(new Error('Failed to create database'));
        }
      });
    });

    // Initialize tables
    console.log('Initializing database tables...');
    cmd.createFeedDbTablesRemote();
    console.log('Database tables initialized successfully');
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during database initialization:', error.message);
    } else {
      console.error('Error during database initialization:', error);
    }
    process.exit(1);
  }
}

createDatabase();
