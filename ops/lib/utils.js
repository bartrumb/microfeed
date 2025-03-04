import fs from 'fs';
import toml from 'toml';
import https from 'https';
import crypto from 'crypto';
import { execSync } from 'child_process';

export class VarsReader {
  constructor(currentEnv, varsFilePath = '.vars.toml') {
    const varsBuffer = fs.readFileSync(varsFilePath);
    this.data = toml.parse(varsBuffer);
    this.currentEnv = currentEnv;
  }

  get(key, defaultValue = null) {
    const envDict = this.data[this.currentEnv] || {};
    return envDict[key] || this.data[key] || defaultValue;
  }

  flattenVars() {
    const varDict = {};
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

export class WranglerCmd {
  constructor(currentEnv) {
    this.currentEnv = currentEnv;
    this.v = new VarsReader(currentEnv);
  }

  _getEnvVars() {
    return {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: this.v.get('CLOUDFLARE_ACCOUNT_ID'),
      CLOUDFLARE_API_TOKEN: this.v.get('CLOUDFLARE_API_TOKEN')
    };
  }

  _execWranglerCmd(cmd) {
    return execSync(`npx wrangler ${cmd}`, {
      stdio: 'inherit',
      env: this._getEnvVars()
    });
  }

  publishProject() {
    const projectName = this.v.get('CLOUDFLARE_PROJECT_NAME');
    const productionBranch = this.v.get('PRODUCTION_BRANCH', 'main');
    const branch = this.currentEnv === 'production' ? productionBranch : `${productionBranch}-preview`;
    return this._execWranglerCmd(`pages publish public --project-name ${projectName} --branch ${branch}`);
  }

  _non_dev_db() {
    const baseName = this.v.get('D1_DATABASE_NAME') ||
      `${this.v.get('CLOUDFLARE_PROJECT_NAME')}_feed_db`;
    return `${baseName}_${this.currentEnv}`;
  }

  createFeedDb() {
    if (this.currentEnv !== 'development') {
      return this._execWranglerCmd(`d1 create ${this._non_dev_db()}`);
    }
    return 'FEED_DB';
  }

  createFeedDbTables() {
    const dbName = this._non_dev_db();
    return this._execWranglerCmd(`d1 execute ${dbName} --file ops/db/init.sql --env ${this.currentEnv}`);
  }

  deleteDatabase(databaseId, onSuccess) {
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    
    const options = {
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
        const body = JSON.parse(data);
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

  createDatabaseViaApi(onSuccess) {
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    
    const options = {
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
        const body = JSON.parse(data);
        if (body.success) {
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
    const uniqueDbName = `${this._non_dev_db()}_${timestamp}_${uniqueId}`;

    request.write(JSON.stringify({ name: uniqueDbName }));
    request.on('error', (error) => {
      console.error('Database creation error:', error);
      onSuccess(null);
    });
    request.end();
  }

  getDatabaseId(onSuccess) {
    const dbName = this._non_dev_db();
    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    const apiKey = this.v.get('CLOUDFLARE_API_TOKEN');
    const options = {
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
        const body = JSON.parse(data);
        let databaseId = '';
        if (body.result && Array.isArray(body.result)) {
          // Get the most recently created database that matches our name pattern
          const databases = body.result
            .filter(result => result.name.startsWith(dbName))
            .sort((a, b) => b.created_at - a.created_at);
          
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
    })

    request.on('error', (error) => {
      console.error('Database lookup error:', error);
      onSuccess('');
    });

    request.end();
  }
}
