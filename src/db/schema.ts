/**
 * SQLite schema definitions for VibeDeck
 * Codified by Vaelthrix the Astral
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
-- Enable foreign keys
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    album TEXT,
    genre TEXT,
    duration_ms INTEGER,
    played INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS track_tags (
    track_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (track_id, tag_id),
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buttons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('tag', 'direct')),
    tag_id TEXT,
    track_id TEXT,
    position INTEGER NOT NULL,
    persistent INTEGER NOT NULL DEFAULT 0,
    color TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    CHECK (
        (type = 'tag' AND tag_id IS NOT NULL AND track_id IS NULL) OR
        (type = 'direct' AND track_id IS NOT NULL AND tag_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tracks_played ON tracks(played);
CREATE INDEX IF NOT EXISTS idx_track_tags_track ON track_tags(track_id);
CREATE INDEX IF NOT EXISTS idx_track_tags_tag ON track_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_buttons_position ON buttons(position);
CREATE INDEX IF NOT EXISTS idx_buttons_tag ON buttons(tag_id);
CREATE INDEX IF NOT EXISTS idx_buttons_track ON buttons(track_id);
`;
