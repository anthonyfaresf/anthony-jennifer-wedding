import { Env } from './env';

// Allowed types. HEIC/HEIF included because iPhones shoot them by default.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const EXT_TO_TYPE: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  heic: 'image/heic', heif: 'image/heif',
  mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
};
const TYPE_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'image/heic': 'heic', 'image/heif': 'heif',
  'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm',
};

// Long expiry so a big video on slow cellular can't hit signature expiry
// mid-upload (URLs are minted right before each upload, so this is generous).
// Multipart: 32 MB parts sail far under the Workers request-body limit on any
// plan, and 64 parts × 32 MB = the 2 GB video ceiling. Each part retries
// independently on the client, so a flaky venue connection costs one chunk,
// not the whole video.
export const CONFIG = {
  presignExpirySeconds: 21600, // 6 hours
  partSizeBytes: 32 * 1048576,
  maxParts: 64,
};

export function isImage(t: string): boolean { return IMAGE_TYPES.includes(t); }
export function isVideo(t: string): boolean { return VIDEO_TYPES.includes(t); }
export function isAllowedType(t: string): boolean { return isImage(t) || isVideo(t); }

// The HEIC gotcha: Safari frequently reports '' (or application/octet-stream)
// as the MIME type for .heic files. Fall back to the filename extension so a
// real iPhone photo is never rejected for a missing content-type.
export function resolveContentType(filename: string, provided?: string): string {
  const p = (provided || '').toLowerCase();
  if (p && p !== 'application/octet-stream') return p;
  const ext = (filename.split('.').pop() || '').toLowerCase();
  return EXT_TO_TYPE[ext] || 'application/octet-stream';
}

export function extFor(filename: string, contentType: string): string {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext && ext.length <= 4 && /^[a-z0-9]+$/.test(ext)) return ext;
  return TYPE_TO_EXT[contentType] || 'bin';
}

export function maxBytesFor(env: Env, contentType: string): number {
  const photoMb = parseInt(env.MAX_PHOTO_MB || '30', 10);
  const videoMb = parseInt(env.MAX_VIDEO_MB || '500', 10);
  return (isVideo(contentType) ? videoMb : photoMb) * 1024 * 1024;
}
