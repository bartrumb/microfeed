const {exec} = require('child_process');
const {WranglerCmd} = require("./lib/utils");
const fs = require('fs');
const toml = require('toml');

const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'development');

// Create database (ignoring "already exists" error)
exec(cmd.createFeedDb(), (error, stdout, stderr) => {
  // Log output for debugging
  if (stdout) console.log(`stdout: ${stdout}`);
  if (stderr) console.log(`stderr: ${stderr}`);
  
  // Database creation error that's not "already exists"
  const isNonExistsError = error && !stderr.includes('already exists');
  if (isNonExistsError) {
    console.error(`Database creation error: ${error.message}`);
    process.exit(1);
    return;
  }

  // Get database ID and update wrangler.toml
  cmd.getDatabaseId((databaseId) => {
    if (!databaseId) {
      console.error('Failed to get database ID');
      process.exit(1);
      return;
    }

    // Read and parse wrangler.toml
    const wranglerPath = 'wrangler.toml';
    const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
    const config = toml.parse(wranglerContent);

    // Update database_id in the appropriate section based on environment
    const env = process.env.DEPLOYMENT_ENVIRONMENT || 'development';
    if (env === 'development') {
      if (!config.d1_databases) config.d1_databases = [];
      config.d1_databases[0] = {
        ...config.d1_databases[0],
        database_id: databaseId
      };
    } else {
      const envKey = `env.${env}.d1_databases`;
      if (!config[envKey]) config[envKey] = {};
      config[envKey] = {
        ...config[envKey],
        database_id: databaseId
      };
    }

    // Write updated config back to wrangler.toml
    const updatedContent = Object.entries(config).map(([key, value]) => {
      if (key === 'd1_databases') {
        return `[[d1_databases]]\nbinding = "${value[0].binding}"\ndatabase_name = "${value[0].database_name}"\ndatabase_id = "${value[0].database_id}"`;
      } else if (key.startsWith('env.')) {
        const [, env, section] = key.split('.');
        return `[env.${env}.${section}]\nbinding = "${value.binding}"\ndatabase_name = "${value.database_name}"\ndatabase_id = "${value.database_id}"`;
      }
      return `${key} = ${JSON.stringify(value)}`;
    }).join('\n\n');

    fs.writeFileSync(wranglerPath, updatedContent);
    console.log(`Updated wrangler.toml with database ID: ${databaseId}`);

    // Proceed with table creation
    exec(cmd.createFeedDbTables(), (error, stdout, stderr) => {
      // Log output for debugging
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
});
