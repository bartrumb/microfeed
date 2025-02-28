const {exec} = require('child_process');
const {WranglerCmd} = require("./lib/utils");
const fs = require('fs');
const toml = require('toml');

const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'development');

// Helper function to update wrangler.toml with database ID
function updateWranglerToml(databaseId) {
  const wranglerPath = 'wrangler.toml';
  const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
  const config = toml.parse(wranglerContent);
  const currentEnv = process.env.DEPLOYMENT_ENVIRONMENT || 'development';

  // Update the appropriate section based on environment
  if (currentEnv === 'development') {
    if (!config.d1_databases) config.d1_databases = [];
    config.d1_databases[0] = {
      binding: "FEED_DB",
      database_name: cmd._non_dev_db(),
      database_id: databaseId
    };
  } else {
    const envSection = `env.${currentEnv}`;
    if (!config[envSection]) config[envSection] = {};
    if (!config[envSection].d1_databases) config[envSection].d1_databases = {};
    config[envSection].d1_databases = {
      binding: "FEED_DB",
      database_name: cmd._non_dev_db(),
      database_id: databaseId
    };
  }

  // Convert config back to TOML format
  const updatedContent = Object.entries(config).map(([key, value]) => {
    if (key === 'd1_databases') {
      return `[[d1_databases]]\nbinding = "${value[0].binding}"\ndatabase_name = "${value[0].database_name}"\ndatabase_id = "${value[0].database_id}"`;
    } else if (key.startsWith('env.')) {
      const [,] = key.split('.');
      return `[${key}]\nd1_databases = { binding = "${value.d1_databases.binding}", database_name = "${value.d1_databases.database_name}", database_id = "${value.d1_databases.database_id}" }`;
    }
    return `${key} = ${JSON.stringify(value)}`;
  }).join('\n\n');

  fs.writeFileSync(wranglerPath, updatedContent);
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
