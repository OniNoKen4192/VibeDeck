/**
 * @file components/library/__tests__/TrackRow.test.tsx
 * @description Tests for TrackRow playing-state affordance (HT-038).
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TrackRow } from '../TrackRow';
import type { Track } from '../../../types';

const track: Track = {
  id: 'trk-1',
  filePath: 'content://media/song.mp3',
  fileName: 'song.mp3',
  title: 'Danza Kuduro',
  artist: 'Unknown Artist',
  album: null,
  genre: null,
  durationMs: 180000,
  startTimeMs: null,
  endTimeMs: null,
  volumeAdjust: null,
  played: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TrackRow (HT-038)', () => {
  test('shows a preview affordance when the track is not playing', () => {
    const { getByLabelText } = render(
      <TrackRow track={track} tags={[]} onPreview={jest.fn()} />
    );
    expect(getByLabelText('Preview Danza Kuduro')).toBeTruthy();
  });

  test('shows a stop affordance while this track is playing', () => {
    const { getByLabelText } = render(
      <TrackRow track={track} tags={[]} isPlaying onPreview={jest.fn()} />
    );
    expect(getByLabelText('Stop Danza Kuduro')).toBeTruthy();
  });

  test('preview press fires regardless of playing state', () => {
    const onPreview = jest.fn();
    const { getByLabelText } = render(
      <TrackRow track={track} tags={[]} isPlaying onPreview={onPreview} />
    );
    fireEvent.press(getByLabelText('Stop Danza Kuduro'));
    expect(onPreview).toHaveBeenCalledWith(track);
  });
});
