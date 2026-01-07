/**
 * @file utils/time.ts
 * @description Time and duration formatting utilities for display and timestamps.
 */

/**
 * Format milliseconds as MM:SS or HH:MM:SS
 */
export function formatDuration(ms: number | null): string {
  if (ms === null || ms <= 0) return '0:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get current ISO 8601 timestamp
 */
export function nowISO(): string {
  return new Date().toISOString();
}
