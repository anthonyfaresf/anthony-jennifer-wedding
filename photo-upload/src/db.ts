import { Env } from './env';

export interface UploadRow {
  id: string;
  r2_key: string;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  uploader_name: string | null;
  message: string | null;
  status: 'pending' | 'uploaded' | 'failed';
  moderation: 'unreviewed' | 'approved' | 'rejected';
  created_at: number;
  completed_at: number | null;
  mp_upload_id: string | null;
}

export interface PendingInsert {
  id: string;
  r2_key: string;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  uploader_name: string | null;
  message: string | null;
  created_at: number;
}

export async function insertPending(db: D1Database, row: PendingInsert): Promise<void> {
  await db
    .prepare(
      `INSERT INTO uploads
         (id, r2_key, original_filename, content_type, size_bytes, uploader_name, message, status, moderation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unreviewed', ?)`
    )
    .bind(
      row.id, row.r2_key, row.original_filename, row.content_type,
      row.size_bytes, row.uploader_name, row.message, row.created_at
    )
    .run();
}

export async function getUpload(db: D1Database, id: string): Promise<UploadRow | null> {
  return db.prepare(`SELECT * FROM uploads WHERE id = ?`).bind(id).first<UploadRow>();
}

export async function setMultipartId(db: D1Database, id: string, mpId: string | null): Promise<void> {
  await db.prepare(`UPDATE uploads SET mp_upload_id = ? WHERE id = ?`).bind(mpId, id).run();
}

export async function markUploaded(db: D1Database, id: string, sizeBytes: number, at: number): Promise<void> {
  await db
    .prepare(`UPDATE uploads SET status = 'uploaded', size_bytes = ?, completed_at = ? WHERE id = ?`)
    .bind(sizeBytes, at, id)
    .run();
}

export async function listUploads(db: D1Database): Promise<UploadRow[]> {
  const res = await db.prepare(`SELECT * FROM uploads ORDER BY created_at DESC`).all<UploadRow>();
  return res.results ?? [];
}

export async function setModeration(
  db: D1Database,
  id: string,
  decision: 'approved' | 'rejected' | 'unreviewed'
): Promise<void> {
  await db.prepare(`UPDATE uploads SET moderation = ? WHERE id = ?`).bind(decision, id).run();
}
