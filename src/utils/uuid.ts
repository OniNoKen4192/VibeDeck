/**
 * @file utils/uuid.ts
 * @description UUID v4 generation utility for creating unique entity identifiers.
 */

import * as Crypto from 'expo-crypto';

/**
 * Generates a cryptographically secure UUID v4.
 * Uses expo-crypto for secure random bytes instead of Math.random().
 */
export function generateUUID(): string {
  return Crypto.randomUUID();
}
