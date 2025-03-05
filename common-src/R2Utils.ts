import { Env } from './types/CloudflareTypes';

export function projectPrefix(env: Env): string {
  return `${env.CLOUDFLARE_PROJECT_NAME}/`;
}

export function getPublicUrl(env: Env, key: string): string {
  return `https://${env.R2_PUBLIC_BUCKET}.r2.dev/${key}`;
}

export function getPublicBucketUrl(env: Env): string {
  return `https://${env.R2_PUBLIC_BUCKET}.r2.dev`;
}

export async function uploadToR2(env: Env, key: string, data: ArrayBuffer | Blob | ReadableStream, contentType?: string): Promise<void> {
  const options: R2PutOptions = {};
  if (contentType) {
    options.httpMetadata = {
      contentType
    };
  }
  await env.MICROFEED_BUCKET.put(key, data, options);
}

export async function deleteFromR2(env: Env, key: string): Promise<void> {
  await env.MICROFEED_BUCKET.delete(key);
}

export async function getFromR2(env: Env, key: string): Promise<R2ObjectBody | null> {
  return env.MICROFEED_BUCKET.get(key);
}

export async function listFromR2(env: Env, prefix?: string): Promise<R2Objects> {
  return env.MICROFEED_BUCKET.list({
    prefix,
    limit: 1000
  });
}
