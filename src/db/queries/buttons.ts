/**
 * @file db/queries/buttons.ts
 * @description SQLite query functions for button CRUD operations and position management.
 */

import { getDatabase } from '../init';
import type { Button, ButtonType, ButtonResolved, Tag, Track } from '../../types';
import { DEFAULT_BUTTON_COLOR } from '../../constants/colors';

interface ButtonRow {
  id: string;
  name: string;
  type: string;
  tag_id: string | null;
  track_id: string | null;
  position: number;
  persistent: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

function rowToButton(row: ButtonRow): Button {
  return {
    id: row.id,
    name: row.name,
    type: row.type as ButtonType,
    tagId: row.tag_id,
    trackId: row.track_id,
    position: row.position,
    persistent: row.persistent === 1,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllButtons(): Promise<Button[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<ButtonRow>('SELECT * FROM buttons ORDER BY position ASC');
  return rows.map(rowToButton);
}

export async function getButtonById(id: string): Promise<Button | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<ButtonRow>('SELECT * FROM buttons WHERE id = ?', [id]);
  return row ? rowToButton(row) : null;
}

export async function getButtonsByTagId(tagId: string): Promise<Button[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<ButtonRow>(
    'SELECT * FROM buttons WHERE tag_id = ? ORDER BY position ASC',
    [tagId]
  );
  return rows.map(rowToButton);
}

export async function getButtonsByTrackId(trackId: string): Promise<Button[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<ButtonRow>(
    'SELECT * FROM buttons WHERE track_id = ? ORDER BY position ASC',
    [trackId]
  );
  return rows.map(rowToButton);
}

export async function getPersistentButtons(): Promise<Button[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<ButtonRow>(
    'SELECT * FROM buttons WHERE persistent = 1 ORDER BY position ASC'
  );
  return rows.map(rowToButton);
}

export async function getNextPosition(): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ max_pos: number | null }>(
    'SELECT MAX(position) as max_pos FROM buttons'
  );
  return (result?.max_pos ?? -1) + 1;
}

export async function insertButton(button: Button): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO buttons (id, name, type, tag_id, track_id, position, persistent, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      button.id,
      button.name,
      button.type,
      button.tagId,
      button.trackId,
      button.position,
      button.persistent ? 1 : 0,
      button.color,
      button.createdAt,
      button.updatedAt,
    ]
  );
}

export async function updateButton(id: string, updates: Partial<Omit<Button, 'id' | 'createdAt'>>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.tagId !== undefined) {
    fields.push('tag_id = ?');
    values.push(updates.tagId);
  }
  if (updates.trackId !== undefined) {
    fields.push('track_id = ?');
    values.push(updates.trackId);
  }
  if (updates.position !== undefined) {
    fields.push('position = ?');
    values.push(updates.position);
  }
  if (updates.persistent !== undefined) {
    fields.push('persistent = ?');
    values.push(updates.persistent ? 1 : 0);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (updates.updatedAt !== undefined) {
    fields.push('updated_at = ?');
    values.push(updates.updatedAt);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE buttons SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteButton(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM buttons WHERE id = ?', [id]);
}

export async function reorderButtons(orderedIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync(
        'UPDATE buttons SET position = ?, updated_at = ? WHERE id = ?',
        [i, now, orderedIds[i]]
      );
    }
  });
}

// --- Batch query for resolving all buttons in a single query ---

interface ButtonResolvedRow {
  // Button fields
  id: string;
  name: string;
  type: string;
  tag_id: string | null;
  track_id: string | null;
  position: number;
  persistent: number;
  color: string | null;
  created_at: string;
  updated_at: string;
  // Tag fields (nullable)
  tag_name: string | null;
  tag_color: string | null;
  tag_created_at: string | null;
  tag_updated_at: string | null;
  // Track fields (nullable)
  track_file_path: string | null;
  track_file_name: string | null;
  track_title: string | null;
  track_artist: string | null;
  track_album: string | null;
  track_genre: string | null;
  track_duration_ms: number | null;
  track_played: number | null;
  track_created_at: string | null;
  track_updated_at: string | null;
  // Computed
  available_tracks: number | null;
}

/**
 * Fetches all buttons with their related tags/tracks in a single query.
 * Eliminates N+1 query problem in resolveAllButtons.
 */
export async function getAllButtonsResolved(): Promise<ButtonResolvedRow[]> {
  const db = getDatabase();
  return db.getAllAsync<ButtonResolvedRow>(`
    SELECT
      b.id,
      b.name,
      b.type,
      b.tag_id,
      b.track_id,
      b.position,
      b.persistent,
      b.color,
      b.created_at,
      b.updated_at,
      -- Tag fields
      t.name as tag_name,
      t.color as tag_color,
      t.created_at as tag_created_at,
      t.updated_at as tag_updated_at,
      -- Track fields (for direct buttons)
      tr.file_path as track_file_path,
      tr.file_name as track_file_name,
      tr.title as track_title,
      tr.artist as track_artist,
      tr.album as track_album,
      tr.genre as track_genre,
      tr.duration_ms as track_duration_ms,
      tr.played as track_played,
      tr.created_at as track_created_at,
      tr.updated_at as track_updated_at,
      -- Available tracks count (for tag buttons)
      (
        SELECT COUNT(*)
        FROM track_tags tt2
        JOIN tracks tr2 ON tt2.track_id = tr2.id
        WHERE tt2.tag_id = b.tag_id AND tr2.played = 0
      ) as available_tracks
    FROM buttons b
    LEFT JOIN tags t ON b.tag_id = t.id
    LEFT JOIN tracks tr ON b.track_id = tr.id
    ORDER BY b.position ASC
  `);
}

/**
 * Maps a raw database row to a ButtonResolved object.
 */
export function rowToButtonResolved(row: ButtonResolvedRow): ButtonResolved {
  const button: Button = {
    id: row.id,
    name: row.name,
    type: row.type as ButtonType,
    tagId: row.tag_id,
    trackId: row.track_id,
    position: row.position,
    persistent: row.persistent === 1,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  let tag: Tag | undefined;
  let track: Track | undefined;
  let isDisabled = false;

  if (button.type === 'tag' && button.tagId) {
    if (row.tag_name !== null) {
      tag = {
        id: button.tagId,
        name: row.tag_name,
        color: row.tag_color,
        createdAt: row.tag_created_at!,
        updatedAt: row.tag_updated_at!,
      };
    } else {
      isDisabled = true; // Tag was deleted
    }
  } else if (button.type === 'direct' && button.trackId) {
    if (row.track_file_path !== null) {
      track = {
        id: button.trackId,
        filePath: row.track_file_path,
        fileName: row.track_file_name!,
        title: row.track_title,
        artist: row.track_artist,
        album: row.track_album,
        genre: row.track_genre,
        durationMs: row.track_duration_ms,
        played: row.track_played === 1,
        createdAt: row.track_created_at!,
        updatedAt: row.track_updated_at!,
      };
    } else {
      isDisabled = true; // Track was deleted
    }
  }

  const displayColor = button.color ?? tag?.color ?? DEFAULT_BUTTON_COLOR;

  return {
    ...button,
    tag,
    track,
    availableTracks: row.available_tracks ?? undefined,
    displayColor,
    isDisabled,
  };
}
