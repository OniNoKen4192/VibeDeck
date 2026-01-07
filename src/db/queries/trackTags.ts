/**
 * @file db/queries/trackTags.ts
 * @description SQLite query functions for track-tag associations and tag pool queries.
 */

import { getDatabase } from '../init';
import type { Track, Tag, TrackTag } from '../../types';

interface TrackTagRow {
  track_id: string;
  tag_id: string;
  created_at: string;
}

interface TrackRow {
  id: string;
  file_path: string;
  file_name: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  duration_ms: number | null;
  played: number;
  created_at: string;
  updated_at: string;
}

interface TagRow {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTrack(row: TrackRow): Track {
  return {
    id: row.id,
    filePath: row.file_path,
    fileName: row.file_name,
    title: row.title,
    artist: row.artist,
    album: row.album,
    genre: row.genre,
    durationMs: row.duration_ms,
    played: row.played === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function addTagToTrack(trackId: string, tagId: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO track_tags (track_id, tag_id, created_at) VALUES (?, ?, ?)`,
    [trackId, tagId, now]
  );
}

export async function removeTagFromTrack(trackId: string, tagId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM track_tags WHERE track_id = ? AND tag_id = ?', [trackId, tagId]);
}

export async function getTagsForTrack(trackId: string): Promise<Tag[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TagRow>(
    `SELECT t.* FROM tags t
     INNER JOIN track_tags tt ON t.id = tt.tag_id
     WHERE tt.track_id = ?
     ORDER BY t.name ASC`,
    [trackId]
  );
  return rows.map(rowToTag);
}

export async function getTracksForTag(tagId: string): Promise<Track[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TrackRow>(
    `SELECT tr.* FROM tracks tr
     INNER JOIN track_tags tt ON tr.id = tt.track_id
     WHERE tt.tag_id = ?
     ORDER BY tr.created_at DESC`,
    [tagId]
  );
  return rows.map(rowToTrack);
}

export async function getUnplayedTracksForTag(tagId: string): Promise<Track[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TrackRow>(
    `SELECT tr.* FROM tracks tr
     INNER JOIN track_tags tt ON tr.id = tt.track_id
     WHERE tt.tag_id = ? AND tr.played = 0
     ORDER BY tr.created_at DESC`,
    [tagId]
  );
  return rows.map(rowToTrack);
}

export async function resetPlayedFlagsForTag(tagId: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE tracks SET played = 0, updated_at = ?
     WHERE id IN (SELECT track_id FROM track_tags WHERE tag_id = ?)`,
    [now, tagId]
  );
}

export async function setTagsForTrack(trackId: string, tagIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  // Remove all existing associations
  await db.runAsync('DELETE FROM track_tags WHERE track_id = ?', [trackId]);

  // Add new associations
  for (const tagId of tagIds) {
    await db.runAsync(
      `INSERT INTO track_tags (track_id, tag_id, created_at) VALUES (?, ?, ?)`,
      [trackId, tagId, now]
    );
  }
}
