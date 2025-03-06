export interface EnvVars {
  [key: string]: string;
}

export function getEnvVars(environment: string): EnvVars {
  // Implementation here
  const vars: EnvVars = {};
  
  // Add environment-specific variables
  switch (environment) {
    case 'production':
      vars.NODE_ENV = 'production';
      break;
    case 'development':
      vars.NODE_ENV = 'development';
      break;
    default:
      vars.NODE_ENV = 'development';
  }
  
  // Add common variables
  vars.DEPLOYMENT_ENVIRONMENT = environment;
  
  return vars;
}

export function formatEnvVars(vars: EnvVars): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}