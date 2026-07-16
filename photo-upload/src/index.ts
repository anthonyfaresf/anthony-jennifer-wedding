import { Env } from './env';
import { CONFIG, resolveContentType, isAllowedType, isVideo, maxBytesFor, extFor } from './config';
import { presignPut } from './presign';
import { signFileUrl, verifyFileSig } from './signedUrl';
import { insertPending, getUpload, markUploaded, listUploads, setModeration, setMultipartId } from './db';
import type { UploadRow } from './db';
import { GUEST_PAGE_HTML } from './guestPage';
import { ADMIN_PAGE_HTML } from './adminPage';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const origin = req.headers.get('Origin') || '';

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });

    try {
      if (path === '/' && req.method === 'GET') {
        return new Response(GUEST_PAGE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      if (path === '/admin' && req.method === 'GET') {
        return new Response(ADMIN_PAGE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      if (path === '/api/health') return json({ ok: true, service: 'wedding-photo-upload' }, 200, origin);
      if (path === '/api/presign' && req.method === 'POST') return handlePresign(req, env, origin);
      if (path.startsWith('/api/upload/')) {
        // /api/upload/<id>                PUT   single-shot body
        // /api/upload/<id>/start         POST  begin multipart (large videos)
        // /api/upload/<id>/part/<n>      PUT   one 32MB chunk
        // /api/upload/<id>/finish        POST  assemble the chunks
        const seg = path.slice('/api/upload/'.length).split('/');
        const id = seg[0] || '';
        if (seg.length === 1 && req.method === 'PUT') return handleProxyUpload(req, env, origin, id);
        if (seg[1] === 'start' && req.method === 'POST') return handleMpStart(req, env, origin, id);
        if (seg[1] === 'part' && seg[2] && req.method === 'PUT') return handleMpPart(req, env, origin, id, parseInt(seg[2], 10));
        if (seg[1] === 'finish' && req.method === 'POST') return handleMpFinish(req, env, origin, id);
      }
      if (path === '/api/complete' && req.method === 'POST') return handleComplete(req, env, origin);
      if (path === '/api/admin/file' && req.method === 'GET') return handleAdminFile(req, env);
      if (path === '/api/admin/uploads' && req.method === 'GET') return handleAdminList(req, env, origin);
      if (path === '/api/admin/gallery' && req.method === 'GET') return handleAdminGallery(req, env, origin);
      if (path === '/api/admin/moderate' && req.method === 'POST') return handleModerate(req, env, origin);
      if (path === '/api/admin/download' && req.method === 'GET') return handleDownload(req, env, origin);
      return json({ error: 'not_found' }, 404, origin);
    } catch (err) {
      return json({ error: 'server_error', detail: String((err as Error)?.message || err) }, 500, origin);
    }
  },
};

// --- Guest endpoints ---------------------------------------------------------

// Step 1: reserve a slot + hand back a presigned URL the phone uploads to directly.
async function handlePresign(req: Request, env: Env, origin: string): Promise<Response> {
  const body = await req.json<Record<string, unknown>>().catch(() => null);
  if (!body || typeof body.filename !== 'string' || typeof body.sizeBytes !== 'number') {
    return json({ error: 'bad_request', detail: 'filename (string) and sizeBytes (number) required' }, 400, origin);
  }

  const contentType = resolveContentType(body.filename, body.contentType as string | undefined);
  if (!isAllowedType(contentType)) {
    return json({ error: 'unsupported_type', detail: contentType }, 415, origin);
  }

  const cap = effectiveCap(env, contentType);
  if (body.sizeBytes > cap) {
    return json({ error: 'too_large', detail: `max ${Math.round(cap / 1048576)} MB for this file type` }, 413, origin);
  }

  const id = crypto.randomUUID();
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const key = `${datePrefix}/${id}.${extFor(body.filename, contentType)}`;

  await insertPending(env.DB, {
    id,
    r2_key: key,
    original_filename: String(body.filename).slice(0, 255),
    content_type: contentType,
    size_bytes: body.sizeBytes,
    uploader_name: body.uploaderName ? String(body.uploaderName).slice(0, 120) : null,
    message: body.message ? String(body.message).slice(0, 500) : null,
    created_at: Date.now(),
  });

  // Default = PROXY mode: the phone PUTs to this same Worker (same-origin, no
  // CORS, no external credentials) and the Worker streams the body into R2 via
  // the native binding. Files bigger than one Worker request can carry
  // (singleShotMax) go through chunked multipart instead — full 2 GB videos,
  // still zero external credentials. Presign mode (direct-to-R2 via S3 URL)
  // survives only as an opt-in requiring a DEDICATED R2 token's secrets —
  // never the shared account token whose 2026-07-15 death caused the outage.
  if (env.UPLOAD_MODE === 'presign' && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) {
    const uploadUrl = await presignPut(env, key, CONFIG.presignExpirySeconds);
    return json({ uploadId: id, uploadUrl, key }, 200, origin);
  }
  const multipart = body.sizeBytes > singleShotMax(env);
  return json(
    { uploadId: id, uploadUrl: `/api/upload/${id}`, key, multipart, partSize: CONFIG.partSizeBytes },
    200, origin
  );
}

// The Workers request-body limit (100 MB on the Free plan) caps what one PUT
// can carry. Anything larger goes through multipart chunks.
function singleShotMax(env: Env): number {
  return parseInt(env.PROXY_MAX_MB || '95', 10) * 1048576;
}

function effectiveCap(env: Env, contentType: string): number {
  return maxBytesFor(env, contentType); // photos 30 MB · videos 2 GB (multipart)
}

// Shared guard for every upload-bytes route. The random UUID is the
// capability, exactly like a presigned URL. Row must exist, still be pending,
// and be younger than the expiry window.
async function guardUploadRow(env: Env, id: string): Promise<UploadRow | Response> {
  if (!id) return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400 });
  const row = await getUpload(env.DB, id);
  if (!row) return new Response(JSON.stringify({ error: 'unknown_upload' }), { status: 404 });
  if (row.status === 'uploaded') return new Response(JSON.stringify({ error: 'already_uploaded' }), { status: 409 });
  if (Date.now() - row.created_at > CONFIG.presignExpirySeconds * 1000) {
    return new Response(JSON.stringify({ error: 'expired' }), { status: 410 });
  }
  return row;
}

// Step 1b (small files): receive the bytes same-origin in ONE request and
// stream them into R2 via the native binding.
async function handleProxyUpload(req: Request, env: Env, origin: string, id: string): Promise<Response> {
  const row = await guardUploadRow(env, id);
  if (row instanceof Response) return row;

  const len = parseInt(req.headers.get('Content-Length') || '', 10);
  if (!Number.isFinite(len) || len <= 0) return json({ error: 'length_required' }, 411, origin);
  if (len > Math.min(effectiveCap(env, row.content_type || ''), singleShotMax(env))) {
    return json({ error: 'too_large' }, 413, origin);
  }
  if (!req.body) return json({ error: 'empty_body' }, 400, origin);

  await env.BUCKET.put(row.r2_key, req.body, {
    httpMetadata: { contentType: row.content_type || 'application/octet-stream' },
  });
  return json({ ok: true, uploadId: id }, 200, origin);
}

// Step 1b (large videos): chunked multipart through the Worker. Each chunk is
// its own retryable request, so one network blip on venue cellular costs 32 MB,
// not the whole video.
async function handleMpStart(req: Request, env: Env, origin: string, id: string): Promise<Response> {
  const row = await guardUploadRow(env, id);
  if (row instanceof Response) return row;

  // A re-tapped Send after a failed attempt starts over — abort the previous
  // multipart so its parts don't linger as orphaned storage.
  if (row.mp_upload_id) {
    try { await env.BUCKET.resumeMultipartUpload(row.r2_key, row.mp_upload_id).abort(); } catch {}
  }
  const mp = await env.BUCKET.createMultipartUpload(row.r2_key, {
    httpMetadata: { contentType: row.content_type || 'application/octet-stream' },
  });
  await setMultipartId(env.DB, row.id, mp.uploadId);
  return json({ ok: true, partSize: CONFIG.partSizeBytes, maxParts: CONFIG.maxParts }, 200, origin);
}

async function handleMpPart(req: Request, env: Env, origin: string, id: string, partNumber: number): Promise<Response> {
  const row = await guardUploadRow(env, id);
  if (row instanceof Response) return row;
  if (!row.mp_upload_id) return json({ error: 'multipart_not_started' }, 409, origin);
  if (!Number.isFinite(partNumber) || partNumber < 1 || partNumber > CONFIG.maxParts) {
    return json({ error: 'bad_part_number' }, 400, origin);
  }
  const len = parseInt(req.headers.get('Content-Length') || '', 10);
  // Every part must be exactly partSize except the final one (smaller is fine —
  // R2 enforces the 5 MB minimum for non-final parts at complete()-time).
  if (!Number.isFinite(len) || len <= 0 || len > CONFIG.partSizeBytes) {
    return json({ error: 'bad_part_size' }, 413, origin);
  }
  if (!req.body) return json({ error: 'empty_body' }, 400, origin);

  const part = await env.BUCKET.resumeMultipartUpload(row.r2_key, row.mp_upload_id).uploadPart(partNumber, req.body);
  return json({ ok: true, partNumber: part.partNumber, etag: part.etag }, 200, origin);
}

async function handleMpFinish(req: Request, env: Env, origin: string, id: string): Promise<Response> {
  const row = await guardUploadRow(env, id);
  if (row instanceof Response) return row;
  if (!row.mp_upload_id) return json({ error: 'multipart_not_started' }, 409, origin);

  const body = await req.json<{ parts?: Array<{ partNumber?: number; etag?: string }> }>().catch(() => null);
  const parts = body?.parts;
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > CONFIG.maxParts ||
      parts.some((p) => !p || !Number.isFinite(p.partNumber) || typeof p.etag !== 'string')) {
    return json({ error: 'bad_parts' }, 400, origin);
  }
  const sorted = [...parts].sort((a, b) => (a.partNumber! - b.partNumber!)) as Array<{ partNumber: number; etag: string }>;
  try {
    await env.BUCKET.resumeMultipartUpload(row.r2_key, row.mp_upload_id).complete(sorted);
  } catch (err) {
    return json({ error: 'assemble_failed', detail: String((err as Error)?.message || err) }, 400, origin);
  }
  await setMultipartId(env.DB, row.id, null);
  return json({ ok: true, uploadId: id }, 200, origin);
}

// Step 2: the guest only sees success AFTER we confirm the object is really in
// R2. This is the "no false-success" guarantee — never mark uploaded on the
// client's word alone.
async function handleComplete(req: Request, env: Env, origin: string): Promise<Response> {
  const body = await req.json<{ uploadId?: string }>().catch(() => null);
  if (!body || !body.uploadId) return json({ error: 'bad_request' }, 400, origin);

  const row = await getUpload(env.DB, body.uploadId);
  if (!row) return json({ error: 'unknown_upload' }, 404, origin);

  const head = await env.BUCKET.head(row.r2_key);
  if (!head || head.size <= 0) {
    return json({ ok: false, reason: 'not_in_storage' }, 200, origin);
  }

  await markUploaded(env.DB, row.id, head.size, Date.now());
  return json({ ok: true, uploadId: row.id }, 200, origin);
}

// --- Admin endpoints (bearer-token gated) ------------------------------------

function isAdmin(req: Request, env: Env): boolean {
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}

async function handleAdminList(req: Request, env: Env, origin: string): Promise<Response> {
  if (!isAdmin(req, env)) return json({ error: 'unauthorized' }, 401, origin);
  const rows = await listUploads(env.DB);
  return json({ count: rows.length, uploads: rows }, 200, origin);
}

// Gallery view — same data as the list, but only verified uploads, each with an
// HMAC-signed Worker-streamed URL (1h) so the browser can render the image/video
// directly, plus a download-disposition URL for a real "Save". Streams via the
// native R2 binding — no S3 credentials involved. Powers the /admin page.
async function handleAdminGallery(req: Request, env: Env, origin: string): Promise<Response> {
  if (!isAdmin(req, env)) return json({ error: 'unauthorized' }, 401, origin);
  const rows = await listUploads(env.DB);
  const done = rows.filter((r) => r.status === 'uploaded');
  const exp = Date.now() + 3600_000;
  const uploads = await Promise.all(
    done.map(async (r) => ({
      id: r.id,
      filename: r.original_filename,
      contentType: r.content_type,
      size: r.size_bytes,
      uploaderName: r.uploader_name,
      message: r.message,
      createdAt: r.completed_at || r.created_at,
      moderation: r.moderation,
      url: await signFileUrl(env.ADMIN_TOKEN, r.id, exp, false),
      downloadUrl: await signFileUrl(env.ADMIN_TOKEN, r.id, exp, true),
    }))
  );
  const totalBytes = uploads.reduce((a, u) => a + (u.size || 0), 0);
  return json({ count: uploads.length, totalBytes, uploads }, 200, origin);
}

async function handleModerate(req: Request, env: Env, origin: string): Promise<Response> {
  if (!isAdmin(req, env)) return json({ error: 'unauthorized' }, 401, origin);
  const body = await req.json<{ uploadId?: string; decision?: string }>().catch(() => null);
  const decision = body?.decision;
  if (!body?.uploadId || (decision !== 'approved' && decision !== 'rejected' && decision !== 'unreviewed')) {
    return json({ error: 'bad_request', detail: 'uploadId + decision (approved|rejected|unreviewed) required' }, 400, origin);
  }
  await setModeration(env.DB, body.uploadId, decision);
  return json({ ok: true }, 200, origin);
}

async function handleDownload(req: Request, env: Env, origin: string): Promise<Response> {
  if (!isAdmin(req, env)) return json({ error: 'unauthorized' }, 401, origin);
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'bad_request', detail: 'id required' }, 400, origin);
  const row = await getUpload(env.DB, id);
  if (!row) return json({ error: 'unknown_upload' }, 404, origin);
  const signedPath = await signFileUrl(env.ADMIN_TOKEN, row.id, Date.now() + 600_000, true);
  return Response.redirect(new URL(signedPath, req.url).toString(), 302);
}

// Streams a verified upload from R2 through the Worker. Auth = HMAC signature
// minted by the gallery/download endpoints (keyed on ADMIN_TOKEN, expiring) —
// works in bare <img>/<video> tags where an Authorization header can't go.
async function handleAdminFile(req: Request, env: Env): Promise<Response> {
  const q = new URL(req.url).searchParams;
  const id = q.get('id') || '';
  const exp = parseInt(q.get('exp') || '', 10);
  const dl = q.get('dl') === '1';
  const ok = await verifyFileSig(env.ADMIN_TOKEN, id, exp, dl, q.get('sig') || '');
  if (!ok) return new Response('forbidden', { status: 403 });

  const row = await getUpload(env.DB, id);
  if (!row) return new Response('not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', row.content_type || 'application/octet-stream');
  headers.set('Cache-Control', 'private, max-age=300');
  headers.set('Accept-Ranges', 'bytes');
  if (dl) {
    const safe = (row.original_filename || row.r2_key.split('/').pop() || 'download').replace(/[^\w.\- ]+/g, '_').slice(0, 120);
    headers.set('Content-Disposition', `attachment; filename="${safe}"`);
  }

  // Range support — iOS Safari refuses to play <video> from servers that
  // ignore Range headers, and the admin reviews videos on a phone. Handles
  // bytes=a-b, bytes=a-, bytes=-n; malformed ranges fall back to the full body.
  const rangeHeader = req.headers.get('Range') || '';
  const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (m && (m[1] !== '' || m[2] !== '')) {
    const head = await env.BUCKET.head(row.r2_key);
    if (!head) return new Response('not in storage', { status: 404 });
    const size = head.size;
    let start: number, end: number;
    if (m[1] === '') { // suffix: last N bytes
      const n = Math.min(parseInt(m[2], 10), size);
      start = size - n; end = size - 1;
    } else {
      start = parseInt(m[1], 10);
      end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
    }
    if (!Number.isFinite(start) || start >= size || start > end) {
      return new Response('range not satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    const obj = await env.BUCKET.get(row.r2_key, { range: { offset: start, length: end - start + 1 } });
    if (!obj) return new Response('not in storage', { status: 404 });
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(obj.body, { status: 206, headers });
  }

  const obj = await env.BUCKET.get(row.r2_key);
  if (!obj) return new Response('not in storage', { status: 404 });
  headers.set('Content-Length', String(obj.size));
  return new Response(obj.body, { status: 200, headers });
}

// --- helpers -----------------------------------------------------------------

function cors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) },
  });
}
