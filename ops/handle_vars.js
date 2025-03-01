const { VarsReader } = require('./lib/utils');

function getEnvVars(environment) {
  const v = new VarsReader(environment);
  const vars = v.flattenVars();
  vars.DEPLOYMENT_ENVIRONMENT = environment;
  return vars;
}

function formatEnvVars(vars) {
  const isWindows = process.platform === 'win32';
  const entries = Object.entries(vars);
  
  if (isWindows) {
    // Windows format
    return entries.map(([key, value]) => `$env:${key}="${value}"`).join('; ');
  } else {
    // Unix format
    return entries.map(([key, value]) => `export ${key}="${value}"`).join('; ');
  }
}

// If called directly
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  const vars = getEnvVars(environment);
  console.log(formatEnvVars(vars));
}

module.exports = {
  getEnvVars,
  formatEnvVars
};