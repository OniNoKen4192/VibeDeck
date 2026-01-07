/**
 * @file db/queries/tracks.ts
 * @description SQLite query functions for track CRUD operations and played flag management.
 */

import { getDatabase } from '../init';
import type { Track } from '../../types';

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

export async function getAllTracks(): Promise<Track[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TrackRow>('SELECT * FROM tracks ORDER BY created_at DESC');
  return rows.map(rowToTrack);
}

export async function getTrackById(id: string): Promise<Track | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<TrackRow>('SELECT * FROM tracks WHERE id = ?', [id]);
  return row ? rowToTrack(row) : null;
}

export async function getTrackByFilePath(filePath: string): Promise<Track | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<TrackRow>('SELECT * FROM tracks WHERE file_path = ?', [filePath]);
  return row ? rowToTrack(row) : null;
}

export async function getUnplayedTracks(): Promise<Track[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TrackRow>('SELECT * FROM tracks WHERE played = 0');
  return rows.map(rowToTrack);
}

export async function insertTrack(track: Track): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO tracks (id, file_path, file_name, title, artist, album, genre, duration_ms, played, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      track.id,
      track.filePath,
      track.fileName,
      track.title,
      track.artist,
      track.album,
      track.genre,
      track.durationMs,
      track.played ? 1 : 0,
      track.createdAt,
      track.updatedAt,
    ]
  );
}

export async function updateTrack(id: string, updates: Partial<Omit<Track, 'id' | 'createdAt'>>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.filePath !== undefined) {
    fields.push('file_path = ?');
    values.push(updates.filePath);
  }
  if (updates.fileName !== undefined) {
    fields.push('file_name = ?');
    values.push(updates.fileName);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.artist !== undefined) {
    fields.push('artist = ?');
    values.push(updates.artist);
  }
  if (updates.album !== undefined) {
    fields.push('album = ?');
    values.push(updates.album);
  }
  if (updates.genre !== undefined) {
    fields.push('genre = ?');
    values.push(updates.genre);
  }
  if (updates.durationMs !== undefined) {
    fields.push('duration_ms = ?');
    values.push(updates.durationMs);
  }
  if (updates.played !== undefined) {
    fields.push('played = ?');
    values.push(updates.played ? 1 : 0);
  }
  if (updates.updatedAt !== undefined) {
    fields.push('updated_at = ?');
    values.push(updates.updatedAt);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE tracks SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTrack(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM tracks WHERE id = ?', [id]);
}

export async function markTrackPlayed(id: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync('UPDATE tracks SET played = 1, updated_at = ? WHERE id = ?', [now, id]);
}

export async function resetAllPlayedFlags(): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync('UPDATE tracks SET played = 0, updated_at = ?', [now]);
}
