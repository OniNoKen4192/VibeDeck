/**
 * @file db/index.ts
 * @description Database module exports for schema, initialization, and query functions.
 */

export { SCHEMA_VERSION, CREATE_TABLES_SQL } from './schema';
export { getDatabase, initDatabase, closeDatabase } from './init';
