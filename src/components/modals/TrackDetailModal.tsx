/**
 * @file components/modals/TrackDetailModal.tsx
 * @description Modal for viewing and editing a single track's details.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { TagChipPicker } from './TagChipPicker';
import { DeleteConfirmation } from './DeleteConfirmation';
import { formatDuration } from '../../utils/time';
import type { Track, Tag } from '../../types';

interface TrackDetailModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** The track to display (null when closed) */
  track: Track | null;
  /** All available tags */
  allTags: Tag[];
  /** Tags currently assigned to this track */
  trackTags: Tag[];
  /** Whether preview is currently playing */
  isPreviewPlaying?: boolean;
  /** Called when modal is closed */
  onClose: () => void;
  /** Called when tag assignment changes */
  onToggleTag: (trackId: string, tagId: string, isAdding: boolean) => void;
  /** Called when preview button is pressed */
  onPreview: (track: Track) => void;
  /** Called when "Add to Board" is pressed */
  onAddToBoard: (track: Track) => void;
  /** Called when track is deleted */
  onDelete: (track: Track) => void;
  /** Optional test ID */
  testID?: string;
}

export function TrackDetailModal({
  visible,
  track,
  allTags,
  trackTags,
  isPreviewPlaying = false,
  onClose,
  onToggleTag,
  onPreview,
  onAddToBoard,
  onDelete,
  testID,
}: TrackDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  // Sync selected tags when track or trackTags change
  useEffect(() => {
    setSelectedTagIds(new Set(trackTags.map((t) => t.id)));
  }, [trackTags]);

  const handleToggleTag = useCallback(
    (tagId: string) => {
      if (!track) return;

      const isAdding = !selectedTagIds.has(tagId);

      // Optimistic update
      setSelectedTagIds((prev) => {
        const next = new Set(prev);
        if (isAdding) {
          next.add(tagId);
        } else {
          next.delete(tagId);
        }
        return next;
      });

      onToggleTag(track.id, tagId, isAdding);
    },
    [track, selectedTagIds, onToggleTag]
  );

  const handleDelete = useCallback(() => {
    if (!track) return;
    setShowDeleteConfirm(false);
    onClose();
    onDelete(track);
  }, [track, onClose, onDelete]);

  if (!track) return null;

  const displayTitle = track.title || track.fileName;
  const displayArtist = track.artist || 'Unknown Artist';
  const displayDuration = track.durationMs
    ? formatDuration(track.durationMs)
    : 'Unknown duration';

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        testID={testID}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Track Details</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <FontAwesome name="times" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.content}>
              {/* Track info */}
              <View style={styles.trackInfo}>
                <FontAwesome
                  name="music"
                  size={24}
                  color={Colors.primary}
                  style={styles.musicIcon}
                />
                <View style={styles.trackDetails}>
                  <Text style={styles.title} numberOfLines={2}>
                    {displayTitle}
                  </Text>
                  <Text style={styles.artist}>{displayArtist}</Text>
                  <Text style={styles.duration}>{displayDuration}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Tags section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <TagChipPicker
                  allTags={allTags}
                  selectedTagIds={selectedTagIds}
                  onToggle={handleToggleTag}
                />
              </View>

              <View style={styles.divider} />

              {/* Action buttons */}
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.previewButton,
                    pressed && styles.previewPressed,
                  ]}
                  onPress={() => onPreview(track)}
                  accessibilityRole="button"
                  accessibilityLabel={isPreviewPlaying ? 'Stop preview' : 'Preview track'}
                >
                  <FontAwesome
                    name={isPreviewPlaying ? 'stop' : 'play'}
                    size={16}
                    color={Colors.text}
                  />
                  <Text style={styles.actionButtonText}>
                    {isPreviewPlaying ? 'Stop' : 'Preview'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.addToBoardButton,
                    pressed && styles.addToBoardPressed,
                  ]}
                  onPress={() => onAddToBoard(track)}
                  accessibilityRole="button"
                  accessibilityLabel="Add to Board"
                >
                  <FontAwesome name="th-large" size={16} color={Colors.text} />
                  <Text style={styles.actionButtonText}>Add to Board</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.deleteButton,
                    pressed && styles.deletePressed,
                  ]}
                  onPress={() => setShowDeleteConfirm(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete track"
                >
                  <FontAwesome name="trash" size={16} color={Colors.error} />
                  <Text style={[styles.actionButtonText, styles.deleteText]}>
                    Delete Track
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation */}
      <DeleteConfirmation
        visible={showDeleteConfirm}
        title="Delete Track?"
        message={`"${displayTitle}" will be removed from your library. This cannot be undone.`}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  content: {
    padding: Layout.spacing.xl,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  musicIcon: {
    marginRight: Layout.spacing.lg,
    marginTop: 4,
  },
  trackDetails: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceLight,
    marginVertical: Layout.spacing.lg,
  },
  section: {
    marginBottom: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },
  actions: {
    gap: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
    borderRadius: 12,
    gap: Layout.spacing.sm,
  },
  previewButton: {
    backgroundColor: Colors.surfaceLight,
  },
  previewPressed: {
    backgroundColor: Colors.surface,
  },
  addToBoardButton: {
    backgroundColor: Colors.primary,
  },
  addToBoardPressed: {
    backgroundColor: Colors.primaryDark,
  },
  deleteButton: {
    backgroundColor: 'transparent',
  },
  deletePressed: {
    backgroundColor: Colors.surfaceLight,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteText: {
    color: Colors.error,
  },
});
