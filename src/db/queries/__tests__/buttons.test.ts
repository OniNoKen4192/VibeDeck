/**
 * @file db/queries/__tests__/buttons.test.ts
 * @description Tests for button resolution logic (HT-025: tag buttons derive display from linked tag).
 */

import { rowToButtonResolved } from '../buttons';
import { DEFAULT_BUTTON_COLOR } from '../../../constants/colors';

/** Builds a resolved row as returned by getAllButtonsResolved, with overrides. */
function makeTagButtonRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'btn-1',
    name: 'Old Name',
    type: 'tag',
    tag_id: 'tag-1',
    track_id: null,
    position: 0,
    persistent: 0,
    color: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    tag_name: 'Current Name',
    tag_color: '#123456',
    tag_created_at: '2026-01-01T00:00:00.000Z',
    tag_updated_at: '2026-01-01T00:00:00.000Z',
    track_file_path: null,
    track_file_name: null,
    track_title: null,
    track_artist: null,
    track_album: null,
    track_genre: null,
    track_duration_ms: null,
    track_start_time_ms: null,
    track_end_time_ms: null,
    track_volume_adjust: null,
    track_played: null,
    track_created_at: null,
    track_updated_at: null,
    available_tracks: 3,
    total_tracks: 5,
    ...overrides,
  };
}

describe('rowToButtonResolved (HT-025)', () => {
  test('tag button displays current tag name, not the name copied at creation', () => {
    const resolved = rowToButtonResolved(makeTagButtonRow() as never);
    expect(resolved.displayName).toBe('Current Name');
  });

  test('tag button displays current tag color when no explicit color override', () => {
    const resolved = rowToButtonResolved(makeTagButtonRow() as never);
    expect(resolved.displayColor).toBe('#123456');
  });

  test('explicit button color override wins over tag color', () => {
    const resolved = rowToButtonResolved(
      makeTagButtonRow({ color: '#abcdef' }) as never
    );
    expect(resolved.displayColor).toBe('#abcdef');
  });

  test('falls back to stored button name when tag is missing', () => {
    const resolved = rowToButtonResolved(
      makeTagButtonRow({ tag_name: null, tag_color: null }) as never
    );
    expect(resolved.displayName).toBe('Old Name');
    expect(resolved.displayColor).toBe(DEFAULT_BUTTON_COLOR);
  });

  test('direct button displays its own stored name', () => {
    const resolved = rowToButtonResolved(
      makeTagButtonRow({
        type: 'direct',
        tag_id: null,
        tag_name: null,
        tag_color: null,
        track_id: 'trk-1',
        track_file_path: 'file:///music/song.mp3',
        track_file_name: 'song.mp3',
        track_created_at: '2026-01-01T00:00:00.000Z',
        track_updated_at: '2026-01-01T00:00:00.000Z',
      }) as never
    );
    expect(resolved.displayName).toBe('Old Name');
  });
});
