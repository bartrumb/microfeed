import * as https from 'https';
import { VarsReader, WranglerCmd } from './lib/utils.js';
import type { VarDict, SyncProjectConfig as SyncProjectConfigType } from './lib/types.js';

const ALLOWED_VARS: VarDict[] = [
  {name: 'CLOUDFLARE_ACCOUNT_ID', encrypted: true, required: true},
  {name: 'CLOUDFLARE_PROJECT_NAME', encrypted: true, required: true},
  {name: 'CLOUDFLARE_API_TOKEN', encrypted: true, required: true},
  {name: 'DEPLOYMENT_ENVIRONMENT', encrypted: false, required: false},

  {name: 'R2_ACCESS_KEY_ID', encrypted: true, required: true},
  {name: 'R2_SECRET_ACCESS_KEY', encrypted: true, required: true},
  {name: 'R2_PUBLIC_BUCKET', encrypted: true, required: false},

  {name: 'D1_DATABASE_NAME', encrypted: true, required: false},

  {name: 'NODE_VERSION', encrypted: false, required: false},  // Cloudflare Pages CI needs this to use the right Node version.
  {name: 'MICROFEED_VERSION', encrypted: false, required: false},
];

class SyncProjectConfig implements SyncProjectConfigType {
  readonly currentEnv: string;
  readonly v: VarsReader;
  readonly cmd: WranglerCmd;

  constructor() {
    this.currentEnv = process.env.DEPLOYMENT_ENVIRONMENT || 'production';
    this.v = new VarsReader(this.currentEnv);
    this.cmd = new WranglerCmd(process.env.DEPLOYMENT_ENVIRONMENT || 'development');
  }

  _getEnvVarsFromFilesJson(envName: string, databaseId: string): Record<string, any> {
    const envVarsJson: Record<string, any> = {
      [envName]: {
        'env_vars': {
          'DEPLOYMENT_ENVIRONMENT': this.currentEnv,
        },
      },
    };
    if (databaseId) {
      envVarsJson[envName]['d1_databases'] = {
        FEED_DB: {
          id: databaseId,
        }
      };
    }
    ALLOWED_VARS.forEach((varDict) => {
      const varValue = this.v.get(varDict.name) || '';
      envVarsJson[envName]['env_vars'][varDict.name] = {
        'value': varValue,
        'type': varDict.encrypted ? 'secret_text' : 'plain_text',
      };
    });
    return envVarsJson;
  }

  _updateEnvVars(data: string, onSuccess: (json: any) => void): void {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${this.v.get('CLOUDFLARE_ACCOUNT_ID')}/pages/projects/${this.v.get('CLOUDFLARE_PROJECT_NAME')}`,
      method: 'PATCH',
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

  syncEnvVars(): void {
    console.log(`Sync-ing for [${this.currentEnv}]...`);

    // ensure that required vars are set
    const missingVars: string[] = [];
    ALLOWED_VARS.forEach((varDict) => {
      if (varDict.required && !this.v.get(varDict.name)) {
        missingVars.push(varDict.name);
      }
    });
    if (missingVars.length > 0) {
      console.error(`Missing required vars: ${missingVars.join(', ')}`);
      process.exit(1);
    }
    // ensure that the project name is valid
    if (!this.v.get('CLOUDFLARE_PROJECT_NAME').match(/^[a-zA-Z0-9-]+$/)) {
      console.error(`Invalid project name: ${this.v.get('CLOUDFLARE_PROJECT_NAME')}`);
      process.exit(1);
    }

    this.cmd.getDatabaseId((databaseId) => {
      console.log('Database id (num of chars): ', databaseId.length)
      const varsToAddOrUpdate = JSON.stringify({
        'deployment_configs': {
          ...this._getEnvVarsFromFilesJson(this.currentEnv, databaseId),
        },
      });

      this._updateEnvVars(varsToAddOrUpdate, (json) => {
        console.log(`Successfully synced for [${this.currentEnv}]!`);
        if (json.result && json.result.deployment_configs) {
          console.log(json.result.deployment_configs[this.currentEnv].env_vars);
        } else if (json) {
          console.log(json);
        }
      });
    });
  }
}

const syncProjectConfig = new SyncProjectConfig();
syncProjectConfig.syncEnvVars();
