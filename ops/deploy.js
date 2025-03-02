import { execSync } from 'child_process';

async function deploy() {
  try {
    // Run build
    console.log('Building project...');
    execSync('pnpm build', { stdio: 'inherit' });
    
    // Get environment from command line args
    const env = process.argv[2] || 'preview';
    
    // Run deployment
    console.log(`Deploying to ${env}...`);
    execSync(
      `wrangler pages deploy dist --project-name shop-dawg-microfeed --branch ${env} --no-bundle`,
      { stdio: 'inherit' }
    );
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();