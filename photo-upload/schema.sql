-- D1 schema for wedding guest photo uploads.
-- One row per upload attempt. status tracks storage durability;
-- moderation gates whether an item may appear on any public screen.

CREATE TABLE IF NOT EXISTS uploads (
  id                TEXT PRIMARY KEY,              -- uuid
  r2_key            TEXT NOT NULL UNIQUE,          -- object key in R2
  original_filename TEXT,
  content_type      TEXT,
  size_bytes        INTEGER,
  uploader_name     TEXT,                          -- optional
  message           TEXT,                          -- optional guestbook note
  status            TEXT NOT NULL DEFAULT 'pending',      -- pending | uploaded | failed
  moderation        TEXT NOT NULL DEFAULT 'unreviewed',   -- unreviewed | approved | rejected
  created_at        INTEGER NOT NULL,              -- epoch ms
  completed_at      INTEGER,
  mp_upload_id      TEXT                           -- active R2 multipart upload id (large videos)
);

CREATE INDEX IF NOT EXISTS idx_uploads_status     ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_moderation ON uploads(moderation);
CREATE INDEX IF NOT EXISTS idx_uploads_created    ON uploads(created_at);
