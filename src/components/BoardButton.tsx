/**
 * @file components/BoardButton.tsx
 * @description Core button component for the Button Board with tag and direct button variants.
 * @see docs/UI_DESIGN.md
 */

import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors, darkenColor, getButtonTextColor } from '../constants/colors';
import { Layout } from '../constants/layout';
import { CountBadge } from './CountBadge';
import { TypeIndicator } from './TypeIndicator';
import type { ButtonResolved } from '../types';

export type ButtonState = 'default' | 'playing' | 'exhausted' | 'disabled';

interface BoardButtonProps {
  /** Resolved button data from useButtonStore.resolveButton() */
  button: ButtonResolved;
  /** Current state of the button */
  state?: ButtonState;
  /** Called when button is pressed */
  onPress?: (button: ButtonResolved) => void;
  /** Called when button is long-pressed (for edit mode) */
  onLongPress?: (button: ButtonResolved) => void;
  /** Optional test ID for testing */
  testID?: string;
}

export function BoardButton({
  button,
  state = 'default',
  onPress,
  onLongPress,
  testID,
}: BoardButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = state === 'disabled' || button.isDisabled;
  const isEmpty = button.isEmpty === true;
  const isExhausted = state === 'exhausted' || (button.type === 'tag' && button.availableTracks === 0 && !isEmpty);
  const isPlaying = state === 'playing';

  // Empty tag buttons get special styling per UI_DESIGN.md §Empty Tag Button State
  const backgroundColor = isEmpty
    ? Colors.surface
    : isDisabled
      ? Colors.disabledBackground
      : button.displayColor;

  const textColor = isEmpty
    ? Colors.textMuted
    : isDisabled
      ? Colors.textMuted
      : getButtonTextColor(backgroundColor);

  // Empty and exhausted buttons should not accept presses for PLAY action.
  // However, if button is currently playing, tap-to-stop must always work (HT-021).
  const isInteractive = !isDisabled && !isEmpty && (!isExhausted || isPlaying);

  const handlePressIn = useCallback(() => {
    if (!isInteractive) return;
    Animated.timing(scaleAnim, {
      toValue: Layout.pressScale,
      duration: Layout.pressDuration,
      useNativeDriver: true,
    }).start();
  }, [isInteractive, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: Layout.pressDuration,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (!isInteractive) return;
    onPress?.(button);
  }, [isInteractive, onPress, button]);

  const handleLongPress = useCallback(() => {
    // Allow long press on exhausted and empty buttons (for context menu/edit)
    // Only truly disabled buttons (deleted tag/track) block long press
    if (isDisabled && !isEmpty) return;
    onLongPress?.(button);
  }, [isDisabled, isEmpty, onLongPress, button]);

  // Compute button styles based on state
  const buttonStyle: ViewStyle[] = [styles.button];

  if (isPlaying) {
    buttonStyle.push(styles.playing);
  }

  if (isEmpty) {
    buttonStyle.push(styles.empty);
  } else if (isExhausted && !isDisabled) {
    buttonStyle.push(styles.exhausted);
  }

  // Accessibility label construction
  const getAccessibilityLabel = (): string => {
    const typeLabel = button.type === 'tag' ? 'Tag button' : 'Direct button';
    const stateLabel = isPlaying
      ? 'now playing'
      : isEmpty
        ? 'no tracks assigned'
        : isExhausted
          ? 'pool exhausted'
          : isDisabled
            ? 'disabled'
            : '';
    const countLabel =
      button.type === 'tag' && button.availableTracks !== undefined && !isEmpty
        ? `${button.availableTracks} tracks remaining`
        : '';

    return [typeLabel, button.name, stateLabel, countLabel]
      .filter(Boolean)
      .join(', ');
  };

  // Display label: always show button name (HT-020: preserve identity for empty buttons)
  const displayLabel = button.name;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        isPlaying && styles.playingGlow,
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          ...buttonStyle,
          {
            backgroundColor: pressed && isInteractive
              ? darkenColor(backgroundColor, 15)
              : backgroundColor,
          },
          (isEmpty || (isExhausted && !isDisabled)) && { opacity: Colors.exhaustedOpacity },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole={'button' as AccessibilityRole}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityState={{
          disabled: isDisabled,
          selected: isPlaying,
        }}
        testID={testID}
      >
        {/* Persistent pin indicator */}
        {button.persistent && (
          <View style={styles.persistentIcon}>
            <FontAwesome
              name="thumb-tack"
              size={Layout.persistentIconSize}
              color={textColor}
              style={{ opacity: 0.7 }}
            />
          </View>
        )}

        {/* Tag button: count badge (hidden when empty) */}
        {button.type === 'tag' && button.availableTracks !== undefined && !isEmpty && (
          <CountBadge count={button.availableTracks} />
        )}

        {/* Direct button: music icon */}
        {button.type === 'direct' && (
          <View style={styles.directIcon}>
            <FontAwesome
              name="music"
              size={Layout.directIconSize}
              color={textColor}
              style={{ opacity: 0.5 }}
            />
          </View>
        )}

        {/* Exhausted warning icon */}
        {isExhausted && !isDisabled && (
          <View style={styles.exhaustedIcon}>
            <FontAwesome
              name="exclamation-triangle"
              size={16}
              color={Colors.warning}
            />
          </View>
        )}

        {/* Playing speaker icon */}
        {isPlaying && (
          <View style={styles.playingIcon}>
            <FontAwesome
              name="volume-up"
              size={16}
              color={textColor}
            />
          </View>
        )}

        {/* Button label */}
        <Text
          style={[styles.label, { color: textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {displayLabel}
        </Text>

        {/* Tag button: type indicator bar (reduced opacity when empty) */}
        {button.type === 'tag' && !isDisabled && (
          <View style={isEmpty ? { opacity: 0.3 } : undefined}>
            <TypeIndicator />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Layout.buttonMinSize,
  },
  button: {
    flex: 1,
    minHeight: Layout.buttonMinSize,
    borderRadius: Layout.buttonBorderRadius,
    padding: Layout.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playing: {
    borderWidth: Colors.playingBorderWidth,
    borderColor: Colors.playingBorder,
  },
  playingGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  exhausted: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.textMuted,
  },
  empty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.surfaceLight,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  persistentIcon: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm,
  },
  directIcon: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
  },
  exhaustedIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -8,
  },
  playingIcon: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm + Layout.persistentIconSize + Layout.spacing.xs,
  },
});
