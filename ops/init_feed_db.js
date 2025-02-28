const {exec} = require('child_process');
const {WranglerCmd} = require("./lib/utils");
const fs = require('fs');

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

// Create database using direct API call
cmd.createDatabaseViaApi((result) => {
  if (!result) {
    // Check if database already exists
    cmd.getDatabaseId((existingId) => {
      if (!existingId) {
        console.error('Failed to create or find database');
        process.exit(1);
        return;
      }
      
      console.log('Using existing database:', existingId);
      updateWranglerToml(existingId);
      
      // Create tables
      exec(cmd.createFeedDbTables(), (error, stdout, stderr) => {
        if (stdout) console.log(`stdout: ${stdout}`);
        if (stderr) console.log(`stderr: ${stderr}`);

        if (error) {
          console.error(`Table creation error: ${error.message}`);
          process.exit(1);
          return;
        }
        
        console.log('Database and tables setup completed successfully');
      });
    });
    return;
  }

  console.log('Database created successfully:', result.uuid);
  updateWranglerToml(result.uuid);

  // Create tables
  exec(cmd.createFeedDbTables(), (error, stdout, stderr) => {
    if (stdout) console.log(`stdout: ${stdout}`);
    if (stderr) console.log(`stderr: ${stderr}`);

    if (error) {
      console.error(`Table creation error: ${error.message}`);
      process.exit(1);
      return;
    }
    
    console.log('Database and tables setup completed successfully');
  });
});
