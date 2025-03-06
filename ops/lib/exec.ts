import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);
export { exec, execCallback as execSync };