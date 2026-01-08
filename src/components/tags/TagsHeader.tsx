/**
 * @file components/tags/TagsHeader.tsx
 * @description Header for Tags screen with title and new tag button.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface TagsHeaderProps {
  /** Called when new tag button is pressed */
  onNewTag: () => void;
  /** Optional test ID */
  testID?: string;
}

export function TagsHeader({ onNewTag, testID }: TagsHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Tags</Text>
      <Pressable
        style={({ pressed }) => [
          styles.newButton,
          pressed && styles.newPressed,
        ]}
        onPress={onNewTag}
        accessibilityRole="button"
        accessibilityLabel="Create new tag"
      >
        <FontAwesome name="plus" size={14} color={Colors.text} />
        <Text style={styles.newText}>New</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 20,
    gap: Layout.spacing.xs,
  },
  newPressed: {
    backgroundColor: Colors.primaryDark,
  },
  newText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
