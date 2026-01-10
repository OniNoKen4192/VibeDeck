/**
 * @file stores/useTrackStore.ts
 * @description Zustand store for track library management including CRUD and played flags.
 */

import { create } from 'zustand';
import type { Track } from '../types';
import { generateUUID } from '../utils/uuid';
import * as trackQueries from '../db/queries/tracks';
import * as trackTagQueries from '../db/queries/trackTags';
import { releasePersistablePermission } from '../../modules/expo-saf-uri-permission/src';

/**
 * Track store interface
 *
 * @remarks For UI:
 * - `tracks`: Full library, use for FlatList/ScrollView rendering
 * - `isLoading`: Show ActivityIndicator while true
 * - `markPlayed`: Called automatically by tag pool selection; don't call from UI
 * - `resetAllPlayed`: Wire to "Reset All" button in settings
 * - `getTrackById`: Use for detail views when you have an ID from navigation
 */
interface TrackStore {
  /** All tracks in library, sorted by creation date (newest first) */
  tracks: Track[];
  /** True while loading from database */
  isLoading: boolean;

  // Actions
  /** Load all tracks from database. Call once on app startup. */
  loadTracks: () => Promise<void>;
  /** Add a track to library. Prefer using import service instead. */
  addTrack: (
    track: Omit<Track, 'id' | 'played' | 'createdAt' | 'updatedAt'>
  ) => Promise<Track>;
  /** Update track metadata (title, artist, etc.) */
  updateTrack: (id: string, updates: Partial<Track>) => Promise<void>;
  /** Remove track from library. Cascades to tag associations. */
  deleteTrack: (id: string) => Promise<void>;
  /** Mark track as played. Called by tag pool service. */
  markPlayed: (id: string) => Promise<void>;
  /** Reset all played flags. Wire to "Reset All" UI action. */
  resetAllPlayed: () => Promise<void>;
  /** Get single track by ID. Returns undefined if not found. */
  getTrackById: (id: string) => Track | undefined;
}

export const useTrackStore = create<TrackStore>((set, get) => ({
  tracks: [],
  isLoading: false,

  loadTracks: async () => {
    set({ isLoading: true });
    try {
      const tracks = await trackQueries.getAllTracks();
      set({ tracks });
    } finally {
      set({ isLoading: false });
    }
  },

  addTrack: async (trackData) => {
    const now = new Date().toISOString();
    const track: Track = {
      ...trackData,
      id: generateUUID(),
      played: false,
      createdAt: now,
      updatedAt: now,
    };

    await trackQueries.insertTrack(track);
    set((state) => ({ tracks: [track, ...state.tracks] }));
    return track;
  },

  updateTrack: async (id, updates) => {
    const now = new Date().toISOString();
    await trackQueries.updateTrack(id, { ...updates, updatedAt: now });
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: now } : t
      ),
    }));
  },

  /**
   * Deletes a track from the library.
   *
   * @remarks
   * **Cross-store refresh:** Deleting a track affects tag counts and button states.
   * After deletion, this triggers `useTagStore.loadTags()` and `useButtonStore.loadButtons()`
   * to ensure UI reflects the cascaded changes.
   *
   * **SAF cleanup:** Releases persistent URI permission for the deleted file.
   */
  deleteTrack: async (id) => {
    // Get track before deletion to access filePath
    const track = get().tracks.find((t) => t.id === id);

    await trackQueries.deleteTrack(id);
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    }));

    // HT-018: Release persistent URI permission
    if (track?.filePath) {
      try {
        await releasePersistablePermission(track.filePath);
      } catch {
        // Ignore - permission may not have been persisted
      }
    }

    // HT-019: Cross-store refresh to update tag counts and button states
    // Import dynamically to avoid circular dependency
    const { useTagStore } = await import('./useTagStore');
    const { useButtonStore } = await import('./useButtonStore');
    useTagStore.getState().loadTags();
    useButtonStore.getState().loadButtons();
  },

  markPlayed: async (id) => {
    await trackQueries.markTrackPlayed(id);
    const now = new Date().toISOString();
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === id ? { ...t, played: true, updatedAt: now } : t
      ),
    }));
  },

  resetAllPlayed: async () => {
    await trackQueries.resetAllPlayedFlags();
    const now = new Date().toISOString();
    set((state) => ({
      tracks: state.tracks.map((t) => ({ ...t, played: false, updatedAt: now })),
    }));
  },

  getTrackById: (id) => {
    return get().tracks.find((t) => t.id === id);
  },
}));
