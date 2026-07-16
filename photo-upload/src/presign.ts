import { AwsClient } from 'aws4fetch';
import { Env } from './env';

// R2 exposes an S3-compatible API. We mint short-lived presigned URLs so the
// guest's phone uploads bytes DIRECTLY to R2 — the Worker never touches the
// file body, which sidesteps the Worker request-size limit (critical for
// large iPhone videos) and scales to many concurrent uploaders.
function client(env: Env): AwsClient {
  return new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || '',
    service: 's3',
    region: 'auto',
  });
}

function objectUrl(env: Env, key: string): URL {
  return new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`);
}

// Only the host header is signed (query signing), so the client is free to
// send whatever Content-Type header it likes without breaking the signature.
export async function presignPut(env: Env, key: string, expiry = 3600): Promise<string> {
  const url = objectUrl(env, key);
  url.searchParams.set('X-Amz-Expires', String(expiry));
  const signed = await client(env).sign(url.toString(), { method: 'PUT', aws: { signQuery: true } });
  return signed.url;
}

export async function presignGet(env: Env, key: string, expiry = 3600, downloadName?: string): Promise<string> {
  const url = objectUrl(env, key);
  url.searchParams.set('X-Amz-Expires', String(expiry));
  // Optional: force a real "Save" download with the original filename instead of
  // opening inline. R2 honours response-content-disposition on presigned GETs as
  // long as it's part of the signed query.
  if (downloadName) {
    const safe = downloadName.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'download';
    url.searchParams.set('response-content-disposition', 'attachment; filename="' + safe + '"');
  }
  const signed = await client(env).sign(url.toString(), { method: 'GET', aws: { signQuery: true } });
  return signed.url;
}
