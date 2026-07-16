// Bindings + secrets available to the Worker at runtime.
// Bindings (BUCKET, DB) come from wrangler.jsonc.
// Secrets (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, ADMIN_TOKEN) come from
// .dev.vars locally / `wrangler secret put` in deployed environments.
export interface Env {
  BUCKET: R2Bucket;
  DB: D1Database;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  // Optional since 2026-07-16: uploads/admin media now go through the native
  // BUCKET binding (proxy mode). S3 creds are only needed if UPLOAD_MODE is
  // flipped back to 'presign' for >100MB direct-to-R2 video uploads.
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  ADMIN_TOKEN: string;
  MAX_PHOTO_MB: string;
  MAX_VIDEO_MB: string;
  // Hard ceiling for proxy-mode uploads — must stay under the Workers
  // request-body limit for the account plan (100 MB on Free).
  PROXY_MAX_MB?: string;
  UPLOAD_MODE?: string; // 'proxy' (default) | 'presign'
}
