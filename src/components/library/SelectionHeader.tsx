/**
 * @file components/library/SelectionHeader.tsx
 * @description Header shown when selection mode is active in Library screen.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface SelectionHeaderProps {
  /** Number of selected items */
  selectedCount: number;
  /** Called when cancel button is pressed */
  onCancel: () => void;
  /** Optional test ID */
  testID?: string;
}

export function SelectionHeader({
  selectedCount,
  onCancel,
  testID,
}: SelectionHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.count}>
        {selectedCount} selected
      </Text>
      <Pressable
        onPress={onCancel}
        style={styles.cancelButton}
        accessibilityRole="button"
        accessibilityLabel="Cancel selection"
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
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
  count: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
