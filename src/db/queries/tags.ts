/**
 * @file db/queries/tags.ts
 * @description SQLite query functions for tag CRUD operations and track count aggregations.
 */

import { getDatabase } from '../init';
import type { Tag, TagWithCount } from '../../types';

interface TagRow {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface TagWithCountRow extends TagRow {
  track_count: number;
  unplayed_count: number;
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

function rowToTagWithCount(row: TagWithCountRow): TagWithCount {
  return {
    ...rowToTag(row),
    trackCount: row.track_count,
    unplayedCount: row.unplayed_count,
  };
}

export async function getAllTags(): Promise<Tag[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TagRow>('SELECT * FROM tags ORDER BY name ASC');
  return rows.map(rowToTag);
}

export async function getTagById(id: string): Promise<Tag | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<TagRow>('SELECT * FROM tags WHERE id = ?', [id]);
  return row ? rowToTag(row) : null;
}

export async function getTagByName(name: string): Promise<Tag | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<TagRow>('SELECT * FROM tags WHERE name = ?', [name]);
  return row ? rowToTag(row) : null;
}

export async function getAllTagsWithCounts(): Promise<TagWithCount[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<TagWithCountRow>(`
    SELECT
      t.*,
      COUNT(tt.track_id) as track_count,
      SUM(CASE WHEN tr.played = 0 THEN 1 ELSE 0 END) as unplayed_count
    FROM tags t
    LEFT JOIN track_tags tt ON t.id = tt.tag_id
    LEFT JOIN tracks tr ON tt.track_id = tr.id
    GROUP BY t.id
    ORDER BY t.name ASC
  `);
  return rows.map(rowToTagWithCount);
}

export async function insertTag(tag: Tag): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO tags (id, name, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [tag.id, tag.name, tag.color, tag.createdAt, tag.updatedAt]
  );
}

export async function updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
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
  await db.runAsync(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTag(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
}
