import { S3Client, CreateBucketCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { VarsReader } from './lib/utils.js';
import type { SetupR2 as SetupR2Type } from './lib/types.js';

class SetupR2 implements SetupR2Type {
  readonly v: VarsReader;
  readonly endpoint: string;
  readonly s3: S3Client;

  constructor(currentEnv: string) {
    this.v = new VarsReader(currentEnv);

    const required = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_BUCKET', 'CLOUDFLARE_ACCOUNT_ID'];
    const missing = required.filter(key => !this.v.get(key));
    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(', ')}`);
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

  async _setupBucket(bucket: string): Promise<void> {
    const bucketParams = {
      Bucket: bucket,
    };

    try {
      console.log(`Creating bucket ${bucket}...`);
      await this.s3.send(new CreateBucketCommand(bucketParams));
      console.log('Bucket created successfully');
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'BucketAlreadyOwnedByYou') {
        console.log('Bucket already exists');
      } else {
        console.error('Error creating bucket:', err);
        throw err;
      }
    }
  }

  async setupR2(): Promise<void> {
    const params = {
      Bucket: this.v.get('R2_PUBLIC_BUCKET'),
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['PUT', 'GET', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: [],
          },
        ],
      },
    };

    console.log(`Setting up CORS rules for ${this.v.get('R2_PUBLIC_BUCKET')}...`);
    try {
      await this.s3.send(new PutBucketCorsCommand(params));
      console.log('CORS rules set successfully');
    } catch (err) {
      console.error('Error setting CORS rules:', err);
      throw err;
    }
  }
}

async function main(): Promise<void> {
  const bucket = process.env.R2_PUBLIC_BUCKET;
  if (!bucket) {
    console.error('R2_PUBLIC_BUCKET environment variable is required');
    process.exit(1);
  }

  const setupR2 = new SetupR2(process.env.DEPLOYMENT_ENVIRONMENT || 'development');
  try {
    await setupR2._setupBucket(bucket);
    await setupR2.setupR2();
    console.log('R2 setup completed successfully');
  } catch (err) {
    console.error('R2 setup failed:', err);
    process.exit(1);
  }
}

main();
