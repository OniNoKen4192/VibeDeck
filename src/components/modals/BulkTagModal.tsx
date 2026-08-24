/**
 * @file components/modals/BulkTagModal.tsx
 * @description Modal for applying a single tag to multiple selected tracks.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import type { Tag } from '../../types';

interface BulkTagModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Number of tracks selected */
  trackCount: number;
  /** Available tags to choose from */
  tags: Tag[];
  /** Called when modal is closed */
  onClose: () => void;
  /** Called when a tag is selected */
  onSelectTag: (tagId: string) => void;
  /** Optional test ID */
  testID?: string;
}

export function BulkTagModal({
  visible,
  trackCount,
  tags,
  onClose,
  onSelectTag,
  testID,
}: BulkTagModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        {/* HT-035: bottom-anchored sheet must clear the system nav bar */}
        <View style={[styles.modal, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Add Tag to {trackCount} Track{trackCount !== 1 ? 's' : ''}
            </Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <FontAwesome name="times" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Content */}
          <Text style={styles.subtitle}>Select a tag to add:</Text>

          {tags.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No tags available. Create tags first.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.tagListScroll} contentContainerStyle={styles.tagList}>
              {tags.map((tag) => (
                <Pressable
                  key={tag.id}
                  style={({ pressed }) => [
                    styles.tagRow,
                    pressed && styles.tagRowPressed,
                  ]}
                  onPress={() => onSelectTag(tag.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add tag ${tag.name}`}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: tag.color || Colors.primary },
                    ]}
                  />
                  <Text style={styles.tagName}>{tag.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.spacing.xl,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  // HT-042: see TrackDetailModal.scrollArea — keeps the list inside the
  // sheet's safe-area padding when it exceeds maxHeight.
  tagListScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  tagList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: Layout.spacing.lg,
    borderRadius: 12,
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.md,
  },
  tagRowPressed: {
    backgroundColor: Colors.background,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagName: {
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
