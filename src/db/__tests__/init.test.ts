/**
 * @file db/__tests__/init.test.ts
 * @description Tests for database initialization and migration sequencing (HT-034:
 * fresh installs must not run ALTER TABLE migrations against freshly created tables).
 */

import * as SQLite from 'expo-sqlite';
import { initDatabase, closeDatabase } from '../init';
import {
  CREATE_TABLES_SQL,
  SCHEMA_VERSION,
  MIGRATION_V2,
  MIGRATION_V3,
  MIGRATION_V4,
} from '../schema';

function makeMockDb(userVersion: number) {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue({ user_version: userVersion }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  };
}

async function initWithVersion(userVersion: number) {
  const mockDb = makeMockDb(userVersion);
  (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  await initDatabase();
  return mockDb.execAsync.mock.calls.map((call) => call[0] as string);
}

describe('initDatabase migration sequencing', () => {
  afterEach(async () => {
    await closeDatabase();
  });

  test('fresh install creates tables without running ALTER TABLE migrations', async () => {
    const executed = await initWithVersion(0);

    expect(executed).toContain(CREATE_TABLES_SQL);
    // CREATE_TABLES_SQL already includes all current columns; re-running the
    // ALTER TABLE migrations would throw "duplicate column name"
    expect(executed).not.toContain(MIGRATION_V2);
    expect(executed).not.toContain(MIGRATION_V3);
    expect(executed).toContain(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  });

  test('v1 database runs every migration without recreating tables', async () => {
    const executed = await initWithVersion(1);

    expect(executed).not.toContain(CREATE_TABLES_SQL);
    expect(executed).toContain(MIGRATION_V2);
    expect(executed).toContain(MIGRATION_V3);
    expect(executed).toContain(MIGRATION_V4);
    expect(executed).toContain(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  });

  test('v3 database runs only the v4 migration', async () => {
    const executed = await initWithVersion(3);

    expect(executed).not.toContain(CREATE_TABLES_SQL);
    expect(executed).not.toContain(MIGRATION_V2);
    expect(executed).not.toContain(MIGRATION_V3);
    expect(executed).toContain(MIGRATION_V4);
  });

  test('current-version database runs no schema statements', async () => {
    const executed = await initWithVersion(SCHEMA_VERSION);

    expect(executed).not.toContain(CREATE_TABLES_SQL);
    expect(executed).not.toContain(MIGRATION_V2);
    expect(executed).not.toContain(MIGRATION_V3);
    expect(executed).not.toContain(MIGRATION_V4);
  });
});
