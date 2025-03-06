import { exec } from './lib/exec.js';

const MICROFEED_VERSION = process.env.MICROFEED_VERSION || '0.0.1';

async function syncVersion(): Promise<void> {
  try {
    const { stdout, stderr } = await exec(`pnpm version ${MICROFEED_VERSION}`);
    console.log('Version sync completed');
    console.log('stdout:', stdout);
    
    if (stderr) {
      console.error('stderr:', stderr);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during version sync:', error.message);
    } else {
      console.error('Error during version sync:', error);
    }
    process.exit(1);
  }
}

syncVersion();
