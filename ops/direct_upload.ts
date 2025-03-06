import { exec } from './lib/exec.js';
import { WranglerCmd } from './lib/utils.js';

async function uploadProject(): Promise<void> {
  const cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'production');
  
  try {
    const { stdout, stderr } = await exec(`pnpm run build:production && ${cmd.publishProject()}`);
    console.log('Build and upload completed');
    console.log('stdout:', stdout);
    
    if (stderr) {
      console.error('stderr:', stderr);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during build and upload:', error.message);
    } else {
      console.error('Error during build and upload:', error);
    }
    process.exit(1);
  }
}

uploadProject();
