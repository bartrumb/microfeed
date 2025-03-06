import * as https from 'https';
import { VarsReader } from './lib/utils.js';
import type { InitProject as InitProjectType } from './lib/types.js';

class InitProject implements InitProjectType {
  readonly currentEnv: string;
  readonly v: VarsReader;

  constructor() {
    this.currentEnv = 'production';
    this.v = new VarsReader(this.currentEnv);
  }

  _getCurrentProject(data: any, onProjectExists: (json: any) => void, onCreateProject: () => void): void {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${this.v.get('CLOUDFLARE_ACCOUNT_ID')}/pages/projects/${this.v.get('CLOUDFLARE_PROJECT_NAME')}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.v.get('CLOUDFLARE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d: Buffer) => {
        body += d.toString();
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (json.success) {
            onProjectExists(json);
          } else {
            onCreateProject();
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          }
          process.exit(1);
        }
      });
    });

    req.on('error', (e) => {
      console.error(e);
      process.exit(1);
    });
    req.end();
  }

  _createProject(data: any, onSuccess: (json: any) => void): void {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${this.v.get('CLOUDFLARE_ACCOUNT_ID')}/pages/projects/`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.v.get('CLOUDFLARE_API_TOKEN')}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d: Buffer) => {
        body += d.toString();
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          onSuccess(json);
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          }
          process.exit(1);
        }
      });
    });

    req.on('error', (e) => {
      console.error(e);
      process.exit(1);
    });
    req.write(data)
    req.end();
  }

  initProject(): void {
    console.log(`Init project ${this.v.get('CLOUDFLARE_PROJECT_NAME')} [${this.currentEnv}]...`);
    this._getCurrentProject({}, (json) => {
      // Project exists
      console.log(`${this.v.get('CLOUDFLARE_PROJECT_NAME')} exists.`);
      process.exit(0);
    }, () => {
      // Project does not exist
      console.log(`Creating project: ${this.v.get('CLOUDFLARE_PROJECT_NAME')}...`)
      const data = JSON.stringify({
        'subdomain': this.v.get('CLOUDFLARE_PROJECT_NAME'),
        'production_branch': this.v.get('PRODUCTION_BRANCH', 'main'),
        'name': this.v.get('CLOUDFLARE_PROJECT_NAME'),
      });
      this._createProject(data, (json) => {
        if (json.success) {
          console.log('Project created successfully!');
          process.exit(0);
        } else {
          console.error('Failed to create project:', json.errors || json.messages || 'Unknown error');
          process.exit(1);
        }
      });
    });
  }
}

const initProject = new InitProject();
initProject.initProject();
