/**
 * @file components/library/TrackRow.tsx
 * @description Individual track row for Library screen with preview button and tag dots.
 * @see docs/UI_DESIGN.md
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityRole,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import type { Track, Tag } from '../../types';
import { formatDuration } from '../../utils/time';

/** Height of track row for FlatList getItemLayout */
export const TRACK_ROW_HEIGHT = 72;

interface TrackRowProps {
  /** The track to display */
  track: Track;
  /** Tags associated with this track (for colored dots) */
  tags: Tag[];
  /** Whether selection mode is active */
  selectionMode?: boolean;
  /** Whether this track is selected (in selection mode) */
  isSelected?: boolean;
  /** Called when track row is tapped (opens detail modal) */
  onPress?: (track: Track) => void;
  /** Called when track row is long-pressed (enters selection mode) */
  onLongPress?: (track: Track) => void;
  /** Called when preview button is tapped */
  onPreview?: (track: Track) => void;
  /** Called when selection checkbox is toggled */
  onToggleSelect?: (track: Track) => void;
  /** Optional test ID */
  testID?: string;
}

export function TrackRow({
  track,
  tags,
  selectionMode = false,
  isSelected = false,
  onPress,
  onLongPress,
  onPreview,
  onToggleSelect,
  testID,
}: TrackRowProps) {
  const handlePress = useCallback(() => {
    if (selectionMode) {
      onToggleSelect?.(track);
    } else {
      onPress?.(track);
    }
  }, [selectionMode, onPress, onToggleSelect, track]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(track);
  }, [onLongPress, track]);

  const handlePreview = useCallback(() => {
    onPreview?.(track);
  }, [onPreview, track]);

  const displayTitle = track.title || track.fileName;
  const displayArtist = track.artist || 'Unknown Artist';

  // Limit visible tag dots to 5
  const visibleTags = tags.slice(0, 5);
  const tagCountText = tags.length > 0 ? `${tags.length} tag${tags.length !== 1 ? 's' : ''}` : '';

  const accessibilityLabel = [
    displayTitle,
    displayArtist,
    tagCountText,
    selectionMode && isSelected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isSelected && styles.selected,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected }}
      testID={testID}
    >
      {/* Left side: Preview button or checkbox */}
      {selectionMode ? (
        <Pressable
          style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          onPress={() => onToggleSelect?.(track)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
        >
          {isSelected && (
            <FontAwesome name="check" size={14} color={Colors.text} />
          )}
        </Pressable>
      ) : (
        <Pressable
          style={styles.previewButton}
          onPress={handlePreview}
          accessibilityLabel={`Preview ${displayTitle}`}
          accessibilityRole="button"
        >
          <FontAwesome name="play" size={16} color={Colors.text} />
        </Pressable>
      )}

      {/* Center: Track info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {displayTitle}
        </Text>
        <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">
          {displayArtist}
        </Text>
      </View>

      {/* Right side: Tag dots and count */}
      <View style={styles.tagSection}>
        {visibleTags.length > 0 && (
          <View style={styles.tagDots}>
            {visibleTags.map((tag) => (
              <View
                key={tag.id}
                style={[
                  styles.tagDot,
                  { backgroundColor: tag.color || Colors.primary },
                ]}
              />
            ))}
          </View>
        )}
        {tagCountText ? (
          <Text style={styles.tagCount}>{tagCountText}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: TRACK_ROW_HEIGHT,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: Layout.screenPadding,
    marginVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: Colors.surfaceLight,
  },
  selected: {
    backgroundColor: `${Colors.primaryDark}33`, // 20% opacity
  },
  previewButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
    marginLeft: 10, // Center in the 44px touch zone
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tagSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: Layout.spacing.sm,
  },
  tagDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
