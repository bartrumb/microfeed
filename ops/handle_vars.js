import { VarsReader } from './lib/utils.js';

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
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const environment = process.argv[2] || 'development';
  const vars = getEnvVars(environment);
  console.log(formatEnvVars(vars));
}

export {
  getEnvVars,
  formatEnvVars
};