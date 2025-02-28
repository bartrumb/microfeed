const {exec} = require('child_process');
const {WranglerCmd} = require("./lib/utils");

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
