/**
 * @file services/player/__tests__/player.test.ts
 * @description Tests for pre-playback SAF permission validation (HT-039/HT-041:
 * ghost tracks from device migration must fail fast with the missing-file message).
 */

import type { Track } from '../../../types';

const mockHasPermission = jest.fn();

jest.mock('../../../../modules/expo-saf-uri-permission/src', () => ({
  takePersistablePermission: jest.fn().mockResolvedValue(true),
  releasePersistablePermission: jest.fn().mockResolvedValue(undefined),
  hasPermission: (uri: string) => mockHasPermission(uri),
  listPersistedPermissions: jest.fn().mockResolvedValue([]),
}));

import { initializePlayer, playTrack } from '../index';

const ghostTrack: Track = {
  id: 'trk-ghost',
  filePath: 'content://com.android.providers.downloads.documents/document/999',
  fileName: 'ghost.mp3',
  title: 'Ghost Song',
  artist: null,
  album: null,
  genre: null,
  durationMs: 120000,
  startTimeMs: null,
  endTimeMs: null,
  volumeAdjust: null,
  played: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('playTrack SAF permission pre-flight (HT-039)', () => {
  beforeAll(async () => {
    await initializePlayer();
  });

  beforeEach(() => {
    mockHasPermission.mockReset();
  });

  test('content:// track without a persisted permission fails with the missing-file message', async () => {
    mockHasPermission.mockResolvedValue(false);

    const result = await playTrack(ghostTrack);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('file_not_found');
    expect(result.error?.userMessage).toBe(
      "Can't find this track's audio file. Delete the track, or import it again."
    );
    expect(mockHasPermission).toHaveBeenCalledWith(ghostTrack.filePath);
  });

  test('content:// track with a persisted permission plays normally', async () => {
    mockHasPermission.mockResolvedValue(true);

    const result = await playTrack(ghostTrack);

    expect(result.success).toBe(true);
  });

  test('permission check failure fails open and lets playback proceed', async () => {
    mockHasPermission.mockRejectedValue(new Error('native module unavailable'));

    const result = await playTrack(ghostTrack);

    expect(result.success).toBe(true);
  });
});
