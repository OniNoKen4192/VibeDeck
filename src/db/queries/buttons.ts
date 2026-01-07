/**
 * @file db/queries/buttons.ts
 * @description SQLite query functions for button CRUD operations and position management.
 */

import { getDatabase } from '../init';
import type { Button, ButtonType } from '../../types';

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

  for (let i = 0; i < orderedIds.length; i++) {
    await db.runAsync(
      'UPDATE buttons SET position = ?, updated_at = ? WHERE id = ?',
      [i, now, orderedIds[i]]
    );
  }
}
