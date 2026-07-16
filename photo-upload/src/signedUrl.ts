// HMAC-signed, expiring URLs for admin media streaming — replaces presigned S3
// GETs so the gallery keeps working with ZERO external credentials. Key material
// is ADMIN_TOKEN (already a deployed secret), so a leaked page URL still expires
// and can't be forged.

const enc = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function signFileUrl(secret: string, id: string, exp: number, dl: boolean): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${id}.${exp}.${dl ? 1 : 0}`));
  return `/api/admin/file?id=${encodeURIComponent(id)}&exp=${exp}&dl=${dl ? 1 : 0}&sig=${hex(sig)}`;
}

export async function verifyFileSig(secret: string, id: string, exp: number, dl: boolean, sig: string): Promise<boolean> {
  if (!secret || !sig || !Number.isFinite(exp) || exp < Date.now()) return false;
  const key = await hmacKey(secret);
  const expected = hex(await crypto.subtle.sign('HMAC', key, enc.encode(`${id}.${exp}.${dl ? 1 : 0}`)));
  // Constant-time-ish compare (same length hex strings).
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
