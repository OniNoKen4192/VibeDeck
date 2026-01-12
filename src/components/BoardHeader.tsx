/**
 * @file components/BoardHeader.tsx
 * @description Header component for the Board screen with title, reset, and about icons.
 * @see docs/UI_DESIGN.md §Board Screen Header
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

interface BoardHeaderProps {
  /** Called when the reset button is pressed */
  onResetPress: () => void;
  /** Called when the about button is pressed */
  onAboutPress: () => void;
}

export function BoardHeader({ onResetPress, onAboutPress }: BoardHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>VibeDeck</Text>
      <View style={styles.icons}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={onResetPress}
          accessibilityRole="button"
          accessibilityLabel="Reset all played tracks"
        >
          <FontAwesome name="refresh" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={onAboutPress}
          accessibilityRole="button"
          accessibilityLabel="Open about screen"
        >
          <FontAwesome name="bars" size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: -4, // Compensate for touch target padding to align with edge
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  iconButtonPressed: {
    backgroundColor: Colors.surfaceLight,
  },
});
