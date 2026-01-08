/**
 * @file app/(tabs)/tags.tsx
 * @description Tags screen - create and manage tags for organizing tracks.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import {
  TagsHeader,
  TagRow,
  EmptyTags,
  TagModal,
} from '../../src/components/tags';
import { Toast } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { Layout } from '../../src/constants/layout';
import { useTagStore } from '../../src/stores/useTagStore';
import { useButtonStore } from '../../src/stores/useButtonStore';
import type { TagWithCount } from '../../src/types';

export default function TagsScreen() {
  // Store connections
  const tags = useTagStore((state) => state.tags);
  const isLoadingTags = useTagStore((state) => state.isLoading);
  const addTag = useTagStore((state) => state.addTag);
  const updateTag = useTagStore((state) => state.updateTag);
  const deleteTag = useTagStore((state) => state.deleteTag);

  const addTagButton = useButtonStore((state) => state.addTagButton);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'warning' | 'success' | 'info'>('info');

  /**
   * Show a toast notification.
   */
  const showToast = useCallback((message: string, type: 'error' | 'warning' | 'success' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  /**
   * Open modal for creating a new tag.
   */
  const handleNewTag = useCallback(() => {
    setEditingTag(null);
    setModalVisible(true);
  }, []);

  /**
   * Open modal for editing an existing tag.
   */
  const handleTagPress = useCallback((tag: TagWithCount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingTag(tag);
    setModalVisible(true);
  }, []);

  /**
   * Close the modal.
   */
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingTag(null);
  }, []);

  /**
   * Save tag (create or update).
   */
  const handleSaveTag = useCallback(async (name: string, color: string) => {
    try {
      if (editingTag) {
        // Update existing tag
        await updateTag(editingTag.id, { name, color });
        showToast('Tag updated', 'success');
      } else {
        // Create new tag
        const newTag = await addTag(name, color);
        showToast(`Created "${name}"`, 'success');

        // Ask if user wants to add a button for this tag
        // For now, we auto-create a button for the tag
        try {
          await addTagButton(name, newTag.id, false, color);
        } catch (buttonErr) {
          // Silently fail button creation - tag was still created
          console.warn('[TagsScreen] Failed to create button for tag:', buttonErr);
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('[TagsScreen] Save tag failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save tag';
      showToast(errorMessage, 'error');
    }
  }, [editingTag, addTag, updateTag, addTagButton, showToast, handleCloseModal]);

  /**
   * Delete a tag.
   */
  const handleDeleteTag = useCallback(async (tag: TagWithCount) => {
    try {
      await deleteTag(tag.id);
      showToast(`Deleted "${tag.name}"`, 'success');
    } catch (err) {
      console.error('[TagsScreen] Delete tag failed:', err);
      showToast('Failed to delete tag', 'error');
    }
  }, [deleteTag, showToast]);

  /**
   * Render a tag row.
   */
  const renderTagRow: ListRenderItem<TagWithCount> = useCallback(
    ({ item: tag }) => (
      <TagRow tag={tag} onPress={handleTagPress} />
    ),
    [handleTagPress]
  );

  /**
   * Key extractor for FlatList.
   */
  const keyExtractor = useCallback((item: TagWithCount) => item.id, []);

  // Loading state
  if (isLoadingTags) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Empty state
  if (tags.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <EmptyTags onCreate={handleNewTag} />
        <TagModal
          visible={modalVisible}
          tag={editingTag}
          onClose={handleCloseModal}
          onSave={handleSaveTag}
          onDelete={handleDeleteTag}
        />
        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onDismiss={() => setToastVisible(false)}
          position="top"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <TagsHeader onNewTag={handleNewTag} />

      {/* Tag list */}
      <FlatList
        data={tags}
        renderItem={renderTagRow}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Create/Edit modal */}
      <TagModal
        visible={modalVisible}
        tag={editingTag}
        onClose={handleCloseModal}
        onSave={handleSaveTag}
        onDelete={handleDeleteTag}
      />

      {/* Toast notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        position="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
});
