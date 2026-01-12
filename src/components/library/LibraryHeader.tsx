/**
 * @file components/library/LibraryHeader.tsx
 * @description Header for Library screen with title, sort, and import buttons.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

/** Sort modes for track list */
type SortMode = 'recent' | 'az' | 'za';

/** Get icon name for current sort mode */
function getSortIcon(mode: SortMode): keyof typeof Ionicons.glyphMap {
  switch (mode) {
    case 'az': return 'arrow-down';
    case 'za': return 'arrow-up';
    case 'recent':
    default: return 'time-outline';
  }
}

/** Get accessibility label for current sort mode */
function getSortLabel(mode: SortMode): string {
  switch (mode) {
    case 'az': return 'Sorted A to Z. Tap to sort Z to A';
    case 'za': return 'Sorted Z to A. Tap to sort by most recent';
    case 'recent':
    default: return 'Sorted by most recent. Tap to sort A to Z';
  }
}

interface LibraryHeaderProps {
  /** Called when import button is pressed */
  onImport: () => void;
  /** Whether import is in progress */
  isImporting?: boolean;
  /** Current sort mode */
  sortMode: SortMode;
  /** Called when sort button is pressed (cycles to next mode) */
  onSortChange: () => void;
  /** Optional test ID */
  testID?: string;
}

export function LibraryHeader({
  onImport,
  isImporting = false,
  sortMode,
  onSortChange,
  testID,
}: LibraryHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Library</Text>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.sortButton,
            pressed && styles.sortPressed,
          ]}
          onPress={onSortChange}
          accessibilityRole="button"
          accessibilityLabel={getSortLabel(sortMode)}
        >
          <Ionicons
            name={getSortIcon(sortMode)}
            size={18}
            color={Colors.text}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.importButton,
            pressed && !isImporting && styles.importPressed,
            isImporting && styles.importDisabled,
          ]}
          onPress={onImport}
          disabled={isImporting}
          accessibilityRole="button"
          accessibilityLabel={isImporting ? 'Importing...' : 'Import tracks'}
          accessibilityState={{ disabled: isImporting }}
        >
          <FontAwesome
            name={isImporting ? 'spinner' : 'plus'}
            size={14}
            color={Colors.text}
          />
          <Text style={styles.importText}>
            {isImporting ? 'Importing...' : 'Import'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 20,
    gap: Layout.spacing.xs,
  },
  importPressed: {
    backgroundColor: Colors.primaryDark,
  },
  importDisabled: {
    opacity: 0.7,
  },
  importText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
