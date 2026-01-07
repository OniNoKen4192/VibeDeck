/**
 * @file components/PlaybackControls.tsx
 * @description Combined stop button and volume slider for playback control.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';
import { StopButton } from './StopButton';
import { VolumeSlider } from './VolumeSlider';

interface PlaybackControlsProps {
  /** Current volume 0-100 */
  volume: number;
  /** Called when volume changes during sliding */
  onVolumeChange: (value: number) => void;
  /** Called when sliding completes (for persistence) */
  onVolumeChangeComplete?: (value: number) => void;
  /** Called when stop is pressed */
  onStop: () => void;
  /** True if audio is currently playing */
  isPlaying?: boolean;
}

export function PlaybackControls({
  volume,
  onVolumeChange,
  onVolumeChangeComplete,
  onStop,
  isPlaying = false,
}: PlaybackControlsProps) {
  return (
    <View style={styles.container}>
      <StopButton onPress={onStop} disabled={!isPlaying} />
      <View style={styles.sliderContainer}>
        <VolumeSlider
          value={volume}
          onValueChange={onVolumeChange}
          onSlidingComplete={onVolumeChangeComplete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  sliderContainer: {
    flex: 1,
  },
});
