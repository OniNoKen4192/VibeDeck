/**
 * @file components/library/BulkActionBar.tsx
 * @description Bottom action bar for bulk operations in selection mode.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface BulkActionBarProps {
  /** Called when "Add Tag" button is pressed */
  onAddTag: () => void;
  /** Called when "Delete" button is pressed */
  onDelete: () => void;
  /** Whether actions are disabled (e.g., no items selected) */
  disabled?: boolean;
  /** Optional test ID */
  testID?: string;
}

export function BulkActionBar({
  onAddTag,
  onDelete,
  disabled = false,
  testID,
}: BulkActionBarProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.addTagButton,
          pressed && !disabled && styles.addTagPressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onAddTag}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Add tag to selected tracks"
        accessibilityState={{ disabled }}
      >
        <FontAwesome name="tag" size={16} color={Colors.text} />
        <Text style={styles.buttonText}>Add Tag</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.deleteButton,
          pressed && !disabled && styles.deletePressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onDelete}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Delete selected tracks"
        accessibilityState={{ disabled }}
      >
        <FontAwesome name="trash" size={16} color={Colors.text} />
        <Text style={styles.buttonText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: Layout.spacing.sm,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
  },
  addTagPressed: {
    backgroundColor: Colors.primaryDark,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  deletePressed: {
    backgroundColor: '#dc2626', // Darker red
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
