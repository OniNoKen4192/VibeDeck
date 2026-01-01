import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song, TagGroup } from '../types';

interface SongState {
  songs: Song[];
  tagGroups: Record<string, TagGroup>;

  // Actions
  addSong: (song: Omit<Song, 'id' | 'addedAt'>) => string;
  updateSong: (id: string, updates: Partial<Omit<Song, 'id'>>) => void;
  removeSong: (id: string) => void;

  // Tag group actions
  markSongPlayed: (tag: string, songId: string) => void;
  resetTagGroup: (tag: string) => void;
  resetAllTagGroups: () => void;

  // Queries (these are methods, not selectors, for simplicity)
  getSongsForTag: (tag: string) => Song[];
  getUnplayedSongsForTag: (tag: string) => Song[];
  getAllTags: () => string[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useSongStore = create<SongState>()(
  persist(
    (set, get) => ({
      songs: [],
      tagGroups: {},

      addSong: (songData) => {
        const id = generateId();
        const song: Song = {
          ...songData,
          id,
          addedAt: Date.now(),
          tags: songData.tags.map((t) => t.toLowerCase().trim()),
        };

        set((state) => {
          const newTagGroups = { ...state.tagGroups };
          for (const tag of song.tags) {
            if (!newTagGroups[tag]) {
              newTagGroups[tag] = { tag, playedSongIds: [] };
            }
          }

          return {
            songs: [...state.songs, song],
            tagGroups: newTagGroups,
          };
        });

        return id;
      },

      updateSong: (id, updates) => {
        set((state) => {
          const songIndex = state.songs.findIndex((s) => s.id === id);
          if (songIndex === -1) return state;

          const updatedSongs = [...state.songs];
          const oldSong = updatedSongs[songIndex];
          const newTags = updates.tags
            ? updates.tags.map((t) => t.toLowerCase().trim())
            : oldSong.tags;

          updatedSongs[songIndex] = {
            ...oldSong,
            ...updates,
            tags: newTags,
          };

          const newTagGroups = { ...state.tagGroups };
          for (const tag of newTags) {
            if (!newTagGroups[tag]) {
              newTagGroups[tag] = { tag, playedSongIds: [] };
            }
          }

          return {
            songs: updatedSongs,
            tagGroups: newTagGroups,
          };
        });
      },

      removeSong: (id) => {
        set((state) => ({
          songs: state.songs.filter((s) => s.id !== id),
        }));
      },

      markSongPlayed: (tag, songId) => {
        set((state) => {
          const tagGroup = state.tagGroups[tag];
          if (!tagGroup) return state;
          if (tagGroup.playedSongIds.includes(songId)) return state;

          return {
            tagGroups: {
              ...state.tagGroups,
              [tag]: {
                ...tagGroup,
                playedSongIds: [...tagGroup.playedSongIds, songId],
              },
            },
          };
        });
      },

      resetTagGroup: (tag) => {
        set((state) => {
          const tagGroup = state.tagGroups[tag];
          if (!tagGroup) return state;

          return {
            tagGroups: {
              ...state.tagGroups,
              [tag]: { ...tagGroup, playedSongIds: [] },
            },
          };
        });
      },

      resetAllTagGroups: () => {
        set((state) => {
          const resetGroups: Record<string, TagGroup> = {};
          for (const [tag, group] of Object.entries(state.tagGroups)) {
            resetGroups[tag] = { ...group, playedSongIds: [] };
          }
          return { tagGroups: resetGroups };
        });
      },

      getSongsForTag: (tag) => {
        const { songs } = get();
        return songs.filter((s) => s.tags.includes(tag.toLowerCase()));
      },

      getUnplayedSongsForTag: (tag) => {
        const { songs, tagGroups } = get();
        const normalizedTag = tag.toLowerCase();
        const tagGroup = tagGroups[normalizedTag];
        const playedIds = new Set(tagGroup?.playedSongIds ?? []);

        return songs.filter(
          (s) => s.tags.includes(normalizedTag) && !playedIds.has(s.id)
        );
      },

      getAllTags: () => {
        const { songs } = get();
        const tagSet = new Set<string>();
        for (const song of songs) {
          for (const tag of song.tags) {
            tagSet.add(tag);
          }
        }
        return Array.from(tagSet).sort();
      },
    }),
    {
      name: 'vibedeck-songs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
