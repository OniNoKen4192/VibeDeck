/**
 * @file components/modals/TagChipPicker.tsx
 * @description Chip picker for toggling tag assignments on a track.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, getButtonTextColor } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import type { Tag } from '../../types';

interface TagChipPickerProps {
  /** All available tags */
  allTags: Tag[];
  /** IDs of tags currently assigned to the track */
  selectedTagIds: Set<string>;
  /** Called when a tag chip is pressed */
  onToggle: (tagId: string) => void;
  /** Optional test ID */
  testID?: string;
}

export function TagChipPicker({
  allTags,
  selectedTagIds,
  onToggle,
  testID,
}: TagChipPickerProps) {
  if (allTags.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText}>No tags created yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {allTags.map((tag) => {
        const isSelected = selectedTagIds.has(tag.id);
        const tagColor = tag.color || Colors.primary;
        const textColor = isSelected
          ? getButtonTextColor(tagColor)
          : Colors.textSecondary;

        return (
          <Pressable
            key={tag.id}
            style={({ pressed }) => [
              styles.chip,
              isSelected
                ? { backgroundColor: tagColor }
                : styles.chipUnselected,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onToggle(tag.id)}
            accessibilityRole="checkbox"
            accessibilityLabel={tag.name}
            accessibilityState={{ checked: isSelected }}
          >
            {!isSelected && (
              <View
                style={[styles.colorDot, { backgroundColor: tagColor }]}
              />
            )}
            <Text style={[styles.chipText, { color: textColor }]}>
              {tag.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  emptyContainer: {
    padding: Layout.spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: 18,
    gap: Layout.spacing.xs,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  chipPressed: {
    opacity: 0.7,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
