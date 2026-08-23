/**
 * @file services/import/__tests__/import.test.ts
 * @description Tests for duplicate-import classification (HT-036).
 */

import { importFromPath } from '../index';

describe('importFromPath (HT-036)', () => {
  test('classifies a UNIQUE file_path violation as a duplicate with a friendly message', async () => {
    const addTrack = jest
      .fn()
      .mockRejectedValue(new Error('UNIQUE constraint failed: tracks.file_path'));

    const result = await importFromPath('file:///music/song.mp3', addTrack);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('duplicate');
    expect(result.error).toBe('Already in your library');
  });

  test('other insert failures keep their original error and are not duplicates', async () => {
    const addTrack = jest.fn().mockRejectedValue(new Error('disk I/O error'));

    const result = await importFromPath('file:///music/song.mp3', addTrack);

    expect(result.success).toBe(false);
    expect(result.reason).not.toBe('duplicate');
    expect(result.error).toBe('disk I/O error');
  });

  test('successful import has no failure reason', async () => {
    const addTrack = jest.fn().mockResolvedValue({ id: 't1' });

    const result = await importFromPath('file:///music/song.mp3', addTrack);

    expect(result.success).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});
