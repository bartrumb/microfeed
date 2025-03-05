import { Context, R2RequestParams } from '../../../../common-src/types/CloudflareTypes';

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

interface PresignedUrlRequest {
  key?: string;
  contentType?: string;
}

async function onGetR2PresignedUrlRequestPost(params: R2RequestParams): Promise<PresignedUrlResponse> {
  const { inputParams, env } = params;
  const bucket = env.MICROFEED_BUCKET;
  
  if (!inputParams.key) {
    throw new Error('Key is required for presigned URL');
  }

  const uploadUrl = await bucket.createPresignedPost({
    key: inputParams.key,
    expiresIn: 3600 // 1 hour
  });

  return {
    uploadUrl,
    key: inputParams.key
  };
}

export async function onRequestPost(context: Context): Promise<Response> {
  try {
    const { request, env } = context;
    const requestData = await request.json() as PresignedUrlRequest;

    if (!requestData.key) {
      return new Response('Key is required', { status: 400 });
    }

    const result = await onGetR2PresignedUrlRequestPost({
      inputParams: {
        key: requestData.key
      },
      env
    });

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return new Response(error instanceof Error ? error.message : 'Internal server error', {
      status: 500
    });
  }
}

// Handle preflight requests
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY'
    }
  });
}
