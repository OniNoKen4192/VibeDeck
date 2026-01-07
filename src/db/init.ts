/**
 * @file db/init.ts
 * @description Database initialization, connection management, and schema versioning.
 */

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema';

const DATABASE_NAME = 'vibedeck.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance. Throws if not initialized.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Initialize the database and create tables.
 * Should be called once at app startup.
 */
export async function initDatabase(): Promise<void> {
  if (db) {
    return; // Already initialized
  }

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Check current schema version
  const versionResult = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    // Run schema creation (CREATE IF NOT EXISTS is idempotent)
    await db.execAsync(CREATE_TABLES_SQL);

    // Update schema version
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}

/**
 * Close the database connection.
 * Useful for testing or cleanup.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
