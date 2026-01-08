/**
 * @file app/(tabs)/library.tsx
 * @description Library screen - browse, import, and manage audio tracks.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  LibraryHeader,
  SearchBar,
  TrackRow,
  SelectionHeader,
  BulkActionBar,
  EmptyLibrary,
  TRACK_ROW_HEIGHT,
} from '../../src/components/library';
import {
  TrackDetailModal,
  BulkTagModal,
  DeleteConfirmation,
} from '../../src/components/modals';
import { Toast } from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { Layout } from '../../src/constants/layout';
import { useTrackStore } from '../../src/stores/useTrackStore';
import { useTagStore } from '../../src/stores/useTagStore';
import { useButtonStore } from '../../src/stores/useButtonStore';
import { usePlayerStore } from '../../src/stores/usePlayerStore';
import { pickAndImportTracks } from '../../src/services/import';
import { playTrack, stop as playerStop } from '../../src/services/player';
import type { Track, Tag } from '../../src/types';

/** FlatList virtualization config per ARCHITECTURE.md */
const FLATLIST_CONFIG = {
  initialNumToRender: 15,
  maxToRenderPerBatch: 10,
  windowSize: 5,
};

export default function LibraryScreen() {
  // Store connections
  const tracks = useTrackStore((state) => state.tracks);
  const isLoadingTracks = useTrackStore((state) => state.isLoading);
  const addTrack = useTrackStore((state) => state.addTrack);
  const deleteTrack = useTrackStore((state) => state.deleteTrack);

  const tags = useTagStore((state) => state.tags);
  const addTagToTrack = useTagStore((state) => state.addTagToTrack);
  const addTagToTracks = useTagStore((state) => state.addTagToTracks);
  const removeTagFromTrack = useTagStore((state) => state.removeTagFromTrack);
  const getTagsForTrack = useTagStore((state) => state.getTagsForTrack);

  const addDirectButton = useButtonStore((state) => state.addDirectButton);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());

  // Track tags cache for display
  const [trackTagsMap, setTrackTagsMap] = useState<Map<string, Tag[]>>(new Map());

  // Modal state
  const [detailTrack, setDetailTrack] = useState<Track | null>(null);
  const [detailTrackTags, setDetailTrackTags] = useState<Tag[]>([]);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'warning' | 'success' | 'info'>('info');

  /**
   * Load tags for all tracks (for tag dots display).
   */
  useEffect(() => {
    async function loadTrackTags() {
      const map = new Map<string, Tag[]>();
      for (const track of tracks) {
        try {
          const trackTags = await getTagsForTrack(track.id);
          map.set(track.id, trackTags);
        } catch (err) {
          console.error('[LibraryScreen] Failed to load tags for track:', track.id, err);
          map.set(track.id, []);
        }
      }
      setTrackTagsMap(map);
    }

    if (tracks.length > 0) {
      loadTrackTags();
    }
  }, [tracks, getTagsForTrack]);

  /**
   * Filter tracks by search query (client-side per ARCHITECTURE.md).
   */
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tracks;
    }
    const query = searchQuery.toLowerCase().trim();
    return tracks.filter((track) => {
      const title = (track.title || track.fileName).toLowerCase();
      const artist = (track.artist || '').toLowerCase();
      return title.includes(query) || artist.includes(query);
    });
  }, [tracks, searchQuery]);

  /**
   * Show a toast notification.
   */
  const showToast = useCallback((message: string, type: 'error' | 'warning' | 'success' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  /**
   * Handle import button press.
   */
  const handleImport = useCallback(async () => {
    setIsImporting(true);
    try {
      const result = await pickAndImportTracks(addTrack);

      if (result.total === 0) {
        // User cancelled
        return;
      }

      if (result.succeeded > 0) {
        showToast(`Imported ${result.succeeded} track${result.succeeded !== 1 ? 's' : ''}`, 'success');
      }
      if (result.failed > 0) {
        showToast(`${result.failed} file${result.failed !== 1 ? 's' : ''} failed to import`, 'warning');
      }
    } catch (err) {
      console.error('[LibraryScreen] Import failed:', err);
      showToast('Import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  }, [addTrack, showToast]);

  /**
   * Handle track row press (open detail modal).
   */
  const handleTrackPress = useCallback(async (track: Track) => {
    const trackTags = await getTagsForTrack(track.id);
    setDetailTrackTags(trackTags);
    setDetailTrack(track);
  }, [getTagsForTrack]);

  /**
   * Handle track row long press (enter selection mode).
   */
  const handleTrackLongPress = useCallback((track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectionMode(true);
    setSelectedTrackIds(new Set([track.id]));
  }, []);

  /**
   * Handle preview button press.
   */
  const handlePreview = useCallback(async (track: Track) => {
    if (isPreviewPlaying) {
      await playerStop();
      setIsPreviewPlaying(false);
    } else {
      const result = await playTrack(track);
      if (result.success) {
        setIsPreviewPlaying(true);
        usePlayerStore.getState().play(track);
      } else {
        showToast(result.error?.userMessage || 'Playback failed', 'error');
      }
    }
  }, [isPreviewPlaying, showToast]);

  /**
   * Handle toggle selection of a track.
   */
  const handleToggleSelect = useCallback((track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(track.id)) {
        next.delete(track.id);
      } else {
        next.add(track.id);
      }
      return next;
    });
  }, []);

  /**
   * Cancel selection mode.
   */
  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedTrackIds(new Set());
  }, []);

  /**
   * Handle bulk "Add Tag" action.
   */
  const handleBulkAddTag = useCallback(() => {
    setShowBulkTagModal(true);
  }, []);

  /**
   * Handle bulk "Delete" action.
   */
  const handleBulkDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  /**
   * Apply bulk tag to selected tracks.
   */
  const handleSelectBulkTag = useCallback(async (tagId: string) => {
    setShowBulkTagModal(false);
    const count = selectedTrackIds.size;
    const trackIdsArray = [...selectedTrackIds];

    try {
      // Use bulk operation (reloads tag counts after completion)
      await addTagToTracks(trackIdsArray, tagId);

      // Update local trackTagsMap cache inline
      const selectedTag = tags.find((t) => t.id === tagId);
      if (selectedTag) {
        setTrackTagsMap((prev) => {
          const next = new Map(prev);
          for (const trackId of trackIdsArray) {
            const existingTags = next.get(trackId) || [];
            // Only add if not already present
            if (!existingTags.some((t) => t.id === tagId)) {
              next.set(trackId, [...existingTags, selectedTag]);
            }
          }
          return next;
        });
      }

      showToast(`Added tag to ${count} track${count !== 1 ? 's' : ''}`, 'success');
      handleCancelSelection();
    } catch (err) {
      console.error('[LibraryScreen] Bulk tag failed:', err);
      showToast('Failed to add tag', 'error');
    }
  }, [selectedTrackIds, addTagToTracks, tags, showToast, handleCancelSelection]);

  /**
   * Confirm bulk delete.
   */
  const handleConfirmBulkDelete = useCallback(async () => {
    setShowDeleteConfirm(false);
    const count = selectedTrackIds.size;

    try {
      for (const trackId of selectedTrackIds) {
        await deleteTrack(trackId);
      }
      showToast(`Deleted ${count} track${count !== 1 ? 's' : ''}`, 'success');
      handleCancelSelection();
    } catch (err) {
      console.error('[LibraryScreen] Bulk delete failed:', err);
      showToast('Failed to delete tracks', 'error');
    }
  }, [selectedTrackIds, deleteTrack, showToast, handleCancelSelection]);

  /**
   * Handle tag toggle in detail modal.
   */
  const handleToggleTag = useCallback(async (trackId: string, tagId: string, isAdding: boolean) => {
    try {
      if (isAdding) {
        await addTagToTrack(trackId, tagId);
      } else {
        await removeTagFromTrack(trackId, tagId);
      }
      // Update detail track tags
      const updatedTags = await getTagsForTrack(trackId);
      setDetailTrackTags(updatedTags);
      // Update cache
      setTrackTagsMap((prev) => new Map(prev).set(trackId, updatedTags));
    } catch (err) {
      console.error('[LibraryScreen] Toggle tag failed:', err);
      showToast('Failed to update tags', 'error');
    }
  }, [addTagToTrack, removeTagFromTrack, getTagsForTrack, showToast]);

  /**
   * Handle "Add to Board" in detail modal.
   */
  const handleAddToBoard = useCallback(async (track: Track) => {
    try {
      const name = track.title || track.fileName;
      await addDirectButton(name, track.id);
      showToast(`Added "${name}" to board`, 'success');
      setDetailTrack(null);
    } catch (err) {
      console.error('[LibraryScreen] Add to board failed:', err);
      showToast('Failed to add to board', 'error');
    }
  }, [addDirectButton, showToast]);

  /**
   * Handle track delete from detail modal.
   */
  const handleDeleteTrack = useCallback(async (track: Track) => {
    try {
      // Stop preview if playing before deleting the track
      if (isPreviewPlaying) {
        await playerStop();
        setIsPreviewPlaying(false);
      }
      await deleteTrack(track.id);
      showToast('Track deleted', 'success');
    } catch (err) {
      console.error('[LibraryScreen] Delete track failed:', err);
      showToast('Failed to delete track', 'error');
    }
  }, [deleteTrack, showToast, isPreviewPlaying]);

  /**
   * Close detail modal.
   */
  const handleCloseDetail = useCallback(() => {
    // Stop preview if playing
    if (isPreviewPlaying) {
      playerStop();
      setIsPreviewPlaying(false);
    }
    setDetailTrack(null);
  }, [isPreviewPlaying]);

  /**
   * Get item layout for FlatList virtualization (fixed 72px rows).
   */
  const getItemLayout = useCallback(
    (_data: ArrayLike<Track> | null | undefined, index: number) => ({
      length: TRACK_ROW_HEIGHT + Layout.spacing.xs * 2, // Row height + margins
      offset: (TRACK_ROW_HEIGHT + Layout.spacing.xs * 2) * index,
      index,
    }),
    []
  );

  /**
   * Render a track row.
   */
  const renderTrackRow: ListRenderItem<Track> = useCallback(
    ({ item: track }) => (
      <TrackRow
        track={track}
        tags={trackTagsMap.get(track.id) || []}
        selectionMode={selectionMode}
        isSelected={selectedTrackIds.has(track.id)}
        onPress={handleTrackPress}
        onLongPress={handleTrackLongPress}
        onPreview={handlePreview}
        onToggleSelect={handleToggleSelect}
      />
    ),
    [
      trackTagsMap,
      selectionMode,
      selectedTrackIds,
      handleTrackPress,
      handleTrackLongPress,
      handlePreview,
      handleToggleSelect,
    ]
  );

  /**
   * Key extractor for FlatList.
   */
  const keyExtractor = useCallback((item: Track) => item.id, []);

  // Loading state
  if (isLoadingTracks) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Empty state
  if (tracks.length === 0 && !isImporting) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <EmptyLibrary onImport={handleImport} />
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
      {selectionMode ? (
        <SelectionHeader
          selectedCount={selectedTrackIds.size}
          onCancel={handleCancelSelection}
        />
      ) : (
        <LibraryHeader onImport={handleImport} isImporting={isImporting} />
      )}

      {/* Search bar (hidden in selection mode for cleaner UX) */}
      {!selectionMode && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tracks..."
        />
      )}

      {/* Track list */}
      <FlatList
        data={filteredTracks}
        renderItem={renderTrackRow}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={FLATLIST_CONFIG.initialNumToRender}
        maxToRenderPerBatch={FLATLIST_CONFIG.maxToRenderPerBatch}
        windowSize={FLATLIST_CONFIG.windowSize}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Bulk action bar (visible in selection mode) */}
      {selectionMode && (
        <BulkActionBar
          onAddTag={handleBulkAddTag}
          onDelete={handleBulkDelete}
          disabled={selectedTrackIds.size === 0}
        />
      )}

      {/* Track detail modal */}
      <TrackDetailModal
        visible={detailTrack !== null}
        track={detailTrack}
        allTags={tags}
        trackTags={detailTrackTags}
        isPreviewPlaying={isPreviewPlaying}
        onClose={handleCloseDetail}
        onToggleTag={handleToggleTag}
        onPreview={handlePreview}
        onAddToBoard={handleAddToBoard}
        onDelete={handleDeleteTrack}
      />

      {/* Bulk tag modal */}
      <BulkTagModal
        visible={showBulkTagModal}
        trackCount={selectedTrackIds.size}
        tags={tags}
        onClose={() => setShowBulkTagModal(false)}
        onSelectTag={handleSelectBulkTag}
      />

      {/* Bulk delete confirmation */}
      <DeleteConfirmation
        visible={showDeleteConfirm}
        title={`Delete ${selectedTrackIds.size} Track${selectedTrackIds.size !== 1 ? 's' : ''}?`}
        message="These tracks will be removed from your library. This cannot be undone."
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
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
