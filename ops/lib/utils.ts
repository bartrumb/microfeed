import * as fs from 'fs';
import toml from 'toml';
import * as https from 'https';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import type { 
  VarsReaderOptions, 
  EnvVars, 
  CloudflareApiOptions, 
  WranglerConfig,
  DatabaseConfig,
  CloudflareDatabase,
  CloudflareApiResponse,
  VarsReaderBase,
  WranglerCmdBase
} from './types.js';

export class VarsReader implements VarsReaderBase {
  private currentEnv: string;
  private data: Record<string, any>;

  constructor(currentEnv: string, varsFilePath = '.vars.toml') {
    const varsBuffer = fs.readFileSync(varsFilePath);
    this.data = toml.parse(varsBuffer.toString());
    this.currentEnv = currentEnv;
  }

  get(key: string, defaultValue: any = null): any {
    const envDict = this.data[this.currentEnv] || {};
    return envDict[key] || this.data[key] || defaultValue;
  }

  flattenVars(): Record<string, any> {
    const varDict: Record<string, any> = {};
    // Get environment-specific variables first
    const envDict = this.data[this.currentEnv] || {};
    Object.keys(envDict).forEach((k) => {
      varDict[k] = envDict[k];
    });
    // Then get global variables that aren't overridden
    const globalKeys = Object.keys(this.data).filter((k) => !['production', 'preview', 'development'].includes(k));
    globalKeys.forEach((k) => {
      if (!varDict[k]) {
        varDict[k] = this.data[k];
      }
    });
    return varDict;
  }
}

export class WranglerCmd implements WranglerCmdBase {
  private currentEnv: string;
  private v: VarsReader;

  constructor(currentEnv: string) {
    this.currentEnv = currentEnv;
    this.v = new VarsReader(currentEnv);
  }

  _getEnvVars(): EnvVars {
    return {
      ...process.env as EnvVars,
      CLOUDFLARE_ACCOUNT_ID: this.v.get('CLOUDFLARE_ACCOUNT_ID'),
      CLOUDFLARE_API_TOKEN: this.v.get('CLOUDFLARE_API_TOKEN')
    };
  }

  _execWranglerCmd(cmd: string): Buffer {
    return execSync(`npx wrangler ${cmd}`, {
      stdio: 'inherit',
      env: this._getEnvVars()
    });
  }

  publishProject(): Buffer {
    const projectName = this.v.get('CLOUDFLARE_PROJECT_NAME');
    const productionBranch = this.v.get('PRODUCTION_BRANCH', 'main');
    const branch = this.currentEnv === 'production' ? productionBranch : `${productionBranch}-preview`;
    return this._execWranglerCmd(`pages publish public --project-name ${projectName} --branch ${branch}`);
  }

  _non_dev_db(): string {
    const baseName = this.v.get('D1_DATABASE_NAME') ||
      `${this.v.get('CLOUDFLARE_PROJECT_NAME')}_feed_db`;
    return `${baseName}_${this.currentEnv}`;
  }

  createFeedDb(): Buffer | string {
    if (this.currentEnv !== 'development') {
      return this._execWranglerCmd(`d1 create ${this._non_dev_db()}`);
    }
    return 'FEED_DB';
  }

  createFeedDbTables(): Buffer {
    const dbName = this._non_dev_db();
    return this._execWranglerCmd(`d1 execute ${dbName} --file ops/db/init.sql --env ${this.currentEnv}`);
  }

  createFeedDbTablesRemote(): Buffer {
    const dbName = this._non_dev_db();
    console.log(`Initializing remote database tables for ${dbName}...`);
    return this._execWranglerCmd(`d1 execute ${dbName} --file ops/db/init.sql --env ${this.currentEnv} --remote`);
  }

  deleteDatabase(databaseId: string, onSuccess: (success: boolean) => void): void {
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    
    const options: CloudflareApiOptions = {
      host: 'api.cloudflare.com',
      port: '443',
      path: `/client/v4/accounts/${accountId}/d1/database/${databaseId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk.toString();
      });

      response.on('end', () => {
        const body = JSON.parse(data) as CloudflareApiResponse;
        if (body.success) {
          console.log(`Successfully deleted database: ${databaseId}`);
          onSuccess(true);
        } else {
          console.error('Database deletion failed:', body.errors || body.messages || 'Unknown error');
          onSuccess(false);
        }
      });
    });

    request.on('error', (error) => {
      console.error('Database deletion error:', error);
      onSuccess(false);
    });

    request.end();
  }

  createDatabaseViaApi(onSuccess: (result: { uuid: string; name: string } | null) => void): void {
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    
    const options: CloudflareApiOptions = {
      host: 'api.cloudflare.com',
      port: '443',
      path: `/client/v4/accounts/${accountId}/d1/database`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk.toString();
      });

      response.on('end', () => {
        const body = JSON.parse(data) as CloudflareApiResponse;
        if (body.success && body.result && !Array.isArray(body.result)) {
          onSuccess({
            uuid: body.result.uuid,
            name: body.result.name
          });
        } else {
          console.error('Database creation failed:', body.errors || body.messages || 'Unknown error');
          onSuccess(null);
        }
      });
    });

    // Generate a unique version identifier to ensure unique database names
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const uniqueId = crypto.randomBytes(4).toString('hex');
    const uniqueDbName = `${this._non_dev_db()}_${timestamp.substring(0, 14)}_${uniqueId}`;

    request.write(JSON.stringify({ name: uniqueDbName }));
    request.on('error', (error) => {
      console.error('Database creation error:', error);
      onSuccess(null);
    });
    request.end();
  }

  getDatabaseId(onSuccess: (databaseId: string) => void): void {
    // Try to get the database ID from wrangler.json first
    try {
      const wranglerConfig = JSON.parse(fs.readFileSync('wrangler.json', 'utf8')) as WranglerConfig;
      let databaseId = '';
      
      if (this.currentEnv === 'production' && wranglerConfig.env?.production) {
        const dbConfig = wranglerConfig.env.production.d1_databases?.find((db: DatabaseConfig) => db.binding === 'FEED_DB');
        if (dbConfig) {
          databaseId = dbConfig.database_id;
          console.log(`Found database ID in wrangler.json for production: ${databaseId}`);
          onSuccess(databaseId);
          return;
        }
      } else if (wranglerConfig.d1_databases) {
        const dbConfig = wranglerConfig.d1_databases.find((db: DatabaseConfig) => db.binding === 'FEED_DB');
        if (dbConfig) {
          databaseId = dbConfig.database_id;
          console.log(`Found database ID in wrangler.json for preview: ${databaseId}`);
          onSuccess(databaseId);
          return;
        }
      }
    } catch (error) {
      console.log('Error reading wrangler.json:', error);
    }
    
    // Fall back to API lookup if not found in wrangler.json
    const dbName = this._non_dev_db();
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    const options: CloudflareApiOptions = {
      host: 'api.cloudflare.com',
      port: '443',
      path: `/client/v4/accounts/${accountId}/d1/database?name=${dbName}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk.toString();
      });

      response.on('end', () => {
        const body = JSON.parse(data) as CloudflareApiResponse;
        let databaseId = '';
        if (body.success && body.result && Array.isArray(body.result)) {
          // Get the most recently created database that matches our name pattern
          const databases = body.result
            .filter((result: CloudflareDatabase) => result.name.startsWith(dbName))
            .sort((a: CloudflareDatabase, b: CloudflareDatabase) => b.created_at - a.created_at);
          
          if (databases.length > 0) {
            databaseId = databases[0].uuid;
          }
        }
        if (!databaseId) {
          console.log('No matching database found for name pattern:', dbName);
          if (body.errors) {
            console.error('API errors:', body.errors);
          }
        }
        onSuccess(databaseId);
      });
    });

    request.on('error', (error) => {
      console.error('Database lookup error:', error);
      onSuccess('');
    });

    request.end();
  }
}