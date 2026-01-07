/**
 * @file stores/useTagStore.ts
 * @description Zustand store for tag management and track-tag associations.
 */

import { create } from 'zustand';
import type { Tag, TagWithCount, Track } from '../types';
import { generateUUID } from '../utils/uuid';
import * as tagQueries from '../db/queries/tags';
import * as trackTagQueries from '../db/queries/trackTags';

/**
 * Adjusts tag counts in memory for optimistic updates.
 * Used to avoid full database reloads on every association change.
 */
function adjustTagCount(
  tags: TagWithCount[],
  tagId: string,
  trackCountDelta: number,
  unplayedCountDelta: number
): TagWithCount[] {
  return tags.map((tag) =>
    tag.id === tagId
      ? {
          ...tag,
          trackCount: Math.max(0, tag.trackCount + trackCountDelta),
          unplayedCount: Math.max(0, tag.unplayedCount + unplayedCountDelta),
        }
      : tag
  );
}

/**
 * Tag store interface
 *
 * @remarks For UI:
 * - `tags`: Array of TagWithCount for rendering tag lists with badges
 * - `addTag`: Wire to "Create Tag" form/modal
 * - `setTagsForTrack`: Use in track edit screen with multi-select checkboxes
 * - `resetPlayedForTag`: Wire to "Reset" button on tag or button context menu
 *
 * @example Tag list item with counts:
 * ```tsx
 * {tags.map(tag => (
 *   <TagItem
 *     key={tag.id}
 *     name={tag.name}
 *     color={tag.color}
 *     badge={`${tag.unplayedCount}/${tag.trackCount}`}
 *   />
 * ))}
 * ```
 */
interface TagStore {
  /** All tags with counts, sorted alphabetically by name */
  tags: TagWithCount[];
  /** True while loading from database */
  isLoading: boolean;

  // Actions
  /** Load all tags from database. Call on app startup. */
  loadTags: () => Promise<void>;
  /** Create a new tag. Returns the created tag for immediate use. */
  addTag: (name: string, color?: string | null) => Promise<Tag>;
  /** Update tag name or color. */
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  /** Delete tag. Cascades to track associations and buttons. */
  deleteTag: (id: string) => Promise<void>;

  // Track-tag associations
  /** Add a single tag to a track. Reloads tag counts. */
  addTagToTrack: (trackId: string, tagId: string) => Promise<void>;
  /** Remove a single tag from a track. Reloads tag counts. */
  removeTagFromTrack: (trackId: string, tagId: string) => Promise<void>;
  /** Replace all tags for a track. Use for multi-select tag editor. */
  setTagsForTrack: (trackId: string, tagIds: string[]) => Promise<void>;
  /** Get tags for a specific track. Use for track detail display. */
  getTagsForTrack: (trackId: string) => Promise<Tag[]>;
  /** Get all tracks with a tag. Use for tag detail screen. */
  getTracksForTag: (tagId: string) => Promise<Track[]>;
  /** Get unplayed tracks for tag. Used by tag pool service. */
  getUnplayedTracksForTag: (tagId: string) => Promise<Track[]>;
  /** Reset played flags for all tracks with this tag. */
  resetPlayedForTag: (tagId: string) => Promise<void>;

  // Helpers
  /** Get single tag by ID. Use for resolving tag in button display. */
  getTagById: (id: string) => TagWithCount | undefined;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  isLoading: false,

  loadTags: async () => {
    set({ isLoading: true });
    try {
      const tags = await tagQueries.getAllTagsWithCounts();
      set({ tags });
    } finally {
      set({ isLoading: false });
    }
  },

  addTag: async (name, color = null) => {
    const now = new Date().toISOString();
    const tag: Tag = {
      id: generateUUID(),
      name,
      color,
      createdAt: now,
      updatedAt: now,
    };

    await tagQueries.insertTag(tag);

    const tagWithCount: TagWithCount = {
      ...tag,
      trackCount: 0,
      unplayedCount: 0,
    };

    set((state) => ({
      tags: [...state.tags, tagWithCount].sort((a, b) => a.name.localeCompare(b.name)),
    }));

    return tag;
  },

  updateTag: async (id, updates) => {
    const now = new Date().toISOString();
    await tagQueries.updateTag(id, { ...updates, updatedAt: now });
    set((state) => ({
      tags: state.tags
        .map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  deleteTag: async (id) => {
    await tagQueries.deleteTag(id);
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    }));
  },

  addTagToTrack: async (trackId, tagId) => {
    // Optimistically update counts (assume track is unplayed)
    set((state) => ({
      tags: adjustTagCount(state.tags, tagId, 1, 1),
    }));

    try {
      await trackTagQueries.addTagToTrack(trackId, tagId);
    } catch (error) {
      // Rollback on error
      await get().loadTags();
      throw error;
    }
  },

  removeTagFromTrack: async (trackId, tagId) => {
    // Optimistically update counts (assume track was unplayed)
    set((state) => ({
      tags: adjustTagCount(state.tags, tagId, -1, -1),
    }));

    try {
      await trackTagQueries.removeTagFromTrack(trackId, tagId);
    } catch (error) {
      // Rollback on error
      await get().loadTags();
      throw error;
    }
  },

  setTagsForTrack: async (trackId, tagIds) => {
    // Get previous tags to calculate deltas
    const previousTags = await trackTagQueries.getTagsForTrack(trackId);
    const previousTagIds = new Set(previousTags.map((t) => t.id));
    const newTagIds = new Set(tagIds);

    // Calculate which tags were added/removed
    const addedTagIds = tagIds.filter((id) => !previousTagIds.has(id));
    const removedTagIds = [...previousTagIds].filter((id) => !newTagIds.has(id));

    // Optimistically update counts
    set((state) => {
      let updatedTags = state.tags;
      for (const id of addedTagIds) {
        updatedTags = adjustTagCount(updatedTags, id, 1, 1);
      }
      for (const id of removedTagIds) {
        updatedTags = adjustTagCount(updatedTags, id, -1, -1);
      }
      return { tags: updatedTags };
    });

    try {
      await trackTagQueries.setTagsForTrack(trackId, tagIds);
    } catch (error) {
      // Rollback on error
      await get().loadTags();
      throw error;
    }
  },

  getTagsForTrack: async (trackId) => {
    return trackTagQueries.getTagsForTrack(trackId);
  },

  getTracksForTag: async (tagId) => {
    return trackTagQueries.getTracksForTag(tagId);
  },

  getUnplayedTracksForTag: async (tagId) => {
    return trackTagQueries.getUnplayedTracksForTag(tagId);
  },

  resetPlayedForTag: async (tagId) => {
    await trackTagQueries.resetPlayedFlagsForTag(tagId);
    // Reload tags to update unplayed counts
    await get().loadTags();
  },

  getTagById: (id) => {
    return get().tags.find((t) => t.id === id);
  },
}));
