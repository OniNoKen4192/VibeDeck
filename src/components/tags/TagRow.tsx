/**
 * @file components/tags/TagRow.tsx
 * @description Individual tag row for Tags screen with color dot and track count.
 * @see docs/UI_DESIGN.md
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import type { TagWithCount } from '../../types';

interface TagRowProps {
  /** The tag to display */
  tag: TagWithCount;
  /** Called when tag row is tapped (opens edit modal) */
  onPress?: (tag: TagWithCount) => void;
  /** Optional test ID */
  testID?: string;
}

export function TagRow({ tag, onPress, testID }: TagRowProps) {
  const handlePress = useCallback(() => {
    onPress?.(tag);
  }, [onPress, tag]);

  const tagColor = tag.color || Colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${tag.name}, ${tag.trackCount} tracks`}
      testID={testID}
    >
      {/* Color dot */}
      <View style={[styles.colorDot, { backgroundColor: tagColor }]} />

      {/* Tag name */}
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {tag.name}
      </Text>

      {/* Track count */}
      <Text style={styles.count}>{tag.trackCount}</Text>

      {/* Chevron */}
      <FontAwesome name="chevron-right" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: Layout.screenPadding,
    marginVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: Colors.surfaceLight,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.md,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  count: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: Layout.spacing.md,
  },
});
