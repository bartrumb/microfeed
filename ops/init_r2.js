const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { VarsReader } = require('./lib/utils');
const { fromIni } = require('@aws-sdk/credential-provider-ini');
const { Endpoint } = require('@aws-sdk/types');

class SetupR2 {
  constructor() {
    const currentEnv = process.env.DEPLOYMENT_ENVIRONMENT || 'production';
    this.v = new VarsReader(currentEnv);
    
    // Validate required variables
    const required = ['CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_BUCKET'];
    const missing = required.filter(key => !this.v.get(key));
    
    if (missing.length > 0) {
      console.error('Error: Missing required configuration variables:');
      missing.forEach(key => console.error(`  - ${key}`));
      console.error('Please check your .vars.toml file');
      process.exit(1);
    }

    const accountId = this.v.get('CLOUDFLARE_ACCOUNT_ID');
    this.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    
    this.s3 = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: this.v.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.v.get('R2_SECRET_ACCESS_KEY'),
      },
      endpoint: this.endpoint,
    });
  }

  async _setupBucket(bucket) {
    const bucketParams = {
      Bucket: bucket,
      // XXX: Not implemented yet on Cloudflare side - https://developers.cloudflare.com/r2/data-access/s3-api/api/
      // ACL: 'public-read',
    };

    try {
      await this.s3.send(new CreateBucketCommand(bucketParams));
      console.log(`Success: ${bucket} created`);
    } catch (err) {
      if (err.name === 'BucketAlreadyOwnedByYou') {
        console.log(`Bucket exists: ${bucket}`);
      } else {
        console.log("Error", err);
        process.exit(1);
      }
    }
  }

  async _setupCorsRules() {
    const params = {
      Bucket: this.v.get('R2_PUBLIC_BUCKET'),
      CORSConfiguration: {
        CORSRules: [{
          AllowedMethods: ['DELETE', 'POST', 'PUT'],
          AllowedOrigins: ['*'],
          AllowedHeaders: ['*'],
        }],
      },
    };

    console.log(`Setting up CORS rules for ${this.v.get('R2_PUBLIC_BUCKET')}...`);
    try {
      await this.s3.send(new PutBucketCorsCommand(params));
      console.log('Success!', params.CORSConfiguration.CORSRules);
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  async setupPublicBucket() {
    const bucket = this.v.get('R2_PUBLIC_BUCKET');
    await this._setupBucket(bucket);
    await this._setupCorsRules();
  }
}

(async () => {
  const setupR2 = new SetupR2();
  await setupR2.setupPublicBucket();
})();
