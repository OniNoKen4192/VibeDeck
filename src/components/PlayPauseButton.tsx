/**
 * @file components/PlayPauseButton.tsx
 * @description Toggle button for pause/resume playback with press animation.
 * @see docs/UI_DESIGN.md
 */

import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Animated,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, darkenColor } from '../constants/colors';
import { Layout } from '../constants/layout';

interface PlayPauseButtonProps {
  /** True if audio is currently playing */
  isPlaying: boolean;
  /** True if paused (track loaded but not playing) */
  isPaused: boolean;
  /** Called when pause is pressed */
  onPause: () => void;
  /** Called when resume is pressed */
  onResume: () => void;
  /** Disable the button (no track loaded) */
  disabled?: boolean;
}

export function PlayPauseButton({
  isPlaying,
  isPaused,
  onPause,
  onResume,
  disabled = false,
}: PlayPauseButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: Layout.pressScale,
      duration: Layout.pressDuration,
      useNativeDriver: true,
    }).start();
  }, [disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: Layout.pressDuration,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (isPlaying) {
      onPause();
    } else if (isPaused) {
      onResume();
    }
  }, [isPlaying, isPaused, onPause, onResume]);

  // Determine icon: pause when playing, play when paused or disabled
  const iconName = isPlaying ? 'pause' : 'play';
  const accessibilityLabel = isPlaying ? 'Pause playback' : 'Resume playback';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor:
              pressed && !disabled
                ? darkenColor(Colors.primary, 15)
                : Colors.primary,
          },
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={isPlaying ? 'Pauses the currently playing audio' : 'Resumes paused audio'}
      >
        <Ionicons
          name={iconName}
          size={Layout.tabIconSize}
          color={disabled ? Colors.textMuted : Colors.text}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: Layout.stopButtonHeight, // Square button, 44x44
    height: Layout.stopButtonHeight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: Colors.disabledBackground,
  },
});
