import { execSync } from 'child_process';

async function deploy() {
  try {
    // Run build
    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });
    
    // Process OpenAPI spec
    console.log('Processing OpenAPI spec...');
    execSync('node ops/process_openapi.js', { stdio: 'inherit' });
    
    // Get environment from command line args
    const env = process.argv[2] || 'preview';
    
    // Run deployment
    console.log(`Deploying to ${env}...`);
    const branch = env === 'production' ? 'main' : 'preview';
    execSync(
      `node ops/handle_vars.js ${env} && wrangler pages deploy dist --project-name shop-dawg-microfeed --branch ${branch} --commit-dirty=true`,
      { stdio: 'inherit' }
    );
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();