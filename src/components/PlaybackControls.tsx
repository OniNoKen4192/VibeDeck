/**
 * @file components/PlaybackControls.tsx
 * @description Combined stop button and volume slider for playback control.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';
import { StopButton } from './StopButton';
import { VolumeSlider } from './VolumeSlider';

/**
 * Returns the appropriate volume icon name based on current volume level.
 * - 0%: muted
 * - 1-33%: low
 * - 34-66%: medium
 * - 67-100%: high
 */
function getVolumeIconName(volume: number): keyof typeof Ionicons.glyphMap {
  if (volume === 0) return 'volume-mute';
  if (volume <= 33) return 'volume-low';
  if (volume <= 66) return 'volume-medium';
  return 'volume-high';
}

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
      <Ionicons
        name={getVolumeIconName(volume)}
        size={Layout.tabIconSize}
        color={Colors.textSecondary}
        accessibilityLabel={`Volume ${volume} percent`}
      />
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
