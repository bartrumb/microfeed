import { Env } from './types/CloudflareTypes';
import { uploadToR2, getPublicUrl, projectPrefix } from './R2Utils';

interface MediaFileMetadata {
  category: number;
  url: string;
  contentType?: string;
  durationSecond?: number;
  size?: number;
}

interface UploadOptions {
  category: number;
  contentType?: string;
  durationSecond?: number;
}

export async function uploadMediaFile(
  env: Env,
  file: ArrayBuffer | Blob | ReadableStream,
  filename: string,
  options: UploadOptions
): Promise<MediaFileMetadata> {
  const key = `${projectPrefix(env)}media/${filename}`;
  
  await uploadToR2(env, key, file, options.contentType);

  let size: number | undefined;
  if (file instanceof Blob) {
    size = file.size;
  } else if (file instanceof ArrayBuffer) {
    size = file.byteLength;
  }

  return {
    category: options.category,
    url: getPublicUrl(env, key),
    contentType: options.contentType,
    durationSecond: options.durationSecond,
    size
  };
}

export function getMediaFileUrl(env: Env, filename: string): string {
  const key = `${projectPrefix(env)}media/${filename}`;
  return getPublicUrl(env, key);
}

export function getMediaFileKey(env: Env, filename: string): string {
  return `${projectPrefix(env)}media/${filename}`;
}
