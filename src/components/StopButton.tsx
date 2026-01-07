/**
 * @file components/StopButton.tsx
 * @description Emergency stop button for audio playback with press animation.
 * @see docs/UI_DESIGN.md
 */

import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  AccessibilityRole,
} from 'react-native';
import { Colors, darkenColor } from '../constants/colors';
import { Layout } from '../constants/layout';

interface StopButtonProps {
  /** Called when stop is pressed */
  onPress: () => void;
  /** Disable the button */
  disabled?: boolean;
}

export function StopButton({ onPress, disabled = false }: StopButtonProps) {
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor:
              pressed && !disabled
                ? darkenColor(Colors.error, 15)
                : Colors.error,
          },
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel="Stop playback"
        accessibilityHint="Stops the currently playing audio"
      >
        <Text style={[styles.text, disabled && styles.textDisabled]}>STOP</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: Layout.stopButtonWidth,
    height: Layout.stopButtonHeight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: Colors.disabledBackground,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
});
