/**
 * @file stores/useTagStore.ts
 * @description Zustand store for tag management and track-tag associations.
 */

import { create } from 'zustand';
import type { Tag, TagWithCount, Track } from '../types';
import { generateUUID } from '../utils/uuid';
import { validateTagName } from '../utils/validation';
import * as tagQueries from '../db/queries/tags';
import * as trackTagQueries from '../db/queries/trackTags';
import { useButtonStore } from './useButtonStore';

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

  // Bulk operations
  /** Add a tag to multiple tracks. Reloads counts after completion. */
  addTagToTracks: (trackIds: string[], tagId: string) => Promise<void>;
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

  /**
   * Creates a new tag.
   *
   * @throws Error if name fails validation (empty, too long, or invalid characters)
   *
   * @remarks
   * **Validation:** Uses `validateTagName()` before DB insert. Trims whitespace.
   */
  addTag: async (name, color = null) => {
    // Validate tag name
    const validation = validateTagName(name);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const now = new Date().toISOString();
    const trimmedName = name.trim();
    const tag: Tag = {
      id: generateUUID(),
      name: trimmedName,
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
    // Validate tag name if provided
    if (updates.name !== undefined) {
      const validation = validateTagName(updates.name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      updates = { ...updates, name: updates.name.trim() };
    }

    const now = new Date().toISOString();
    await tagQueries.updateTag(id, { ...updates, updatedAt: now });
    set((state) => ({
      tags: state.tags
        .map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  /**
   * Deletes a tag and cascades to buttons.
   *
   * @remarks
   * **Cross-store cascade:** After deleting the tag from DB, calls
   * `useButtonStore.removeButtonsForTag()` to clean up orphaned buttons
   * from both database and in-memory state.
   */
  deleteTag: async (id) => {
    await tagQueries.deleteTag(id);
    // Cascade to button store — remove orphaned buttons from in-memory state
    await useButtonStore.getState().removeButtonsForTag(id);
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    }));
  },

  /**
   * Adds a tag to a track.
   *
   * @remarks
   * **Optimistic update with rollback:** Updates tag counts immediately in state,
   * then persists to database. If DB write fails, reloads full tag state to
   * restore accurate counts.
   */
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

  /**
   * Removes a tag from a track.
   *
   * @remarks
   * **Optimistic update with rollback:** Same pattern as `addTagToTrack`.
   */
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

  /**
   * Replaces all tags for a track atomically.
   *
   * @remarks
   * **Optimistic update with rollback:** Calculates delta between old and new
   * tag sets, updates counts immediately, then persists via transaction.
   * Full reload on error to restore consistency.
   *
   * **Transaction:** The underlying DB call uses `withTransactionAsync` to
   * ensure the delete-then-insert is atomic.
   */
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

  addTagToTracks: async (trackIds, tagId) => {
    // Perform all DB operations
    for (const trackId of trackIds) {
      await trackTagQueries.addTagToTrack(trackId, tagId);
    }
    // Reload tags to get accurate counts (avoids optimistic update drift)
    await get().loadTags();
  },
}));
