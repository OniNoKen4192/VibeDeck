/**
 * @file stores/usePlayerStore.ts
 * @description Zustand store for audio playback state and volume persistence.
 */

import { create } from 'zustand';
import type { Track } from '../types';
import { Audio } from '../constants/audio';
import * as settingsQueries from '../db/queries/settings';

const VOLUME_KEY = 'player_volume';

/**
 * Player store interface
 *
 * @remarks For UI:
 * - `currentTrack`: The track currently loaded (null = nothing playing)
 * - `isPlaying`: True if audio is actively playing (false = paused/stopped)
 * - `volume`: Current volume 0-100 for volume slider
 * - `outputDevice`: Selected audio output (future: Bluetooth selection)
 *
 * Flow when button is pressed:
 * 1. Tag button → call services/tagPool/selectTrackForTag()
 * 2. Direct button → get track from store
 * 3. Call play(track) to update state
 * 4. Wire react-native-track-player to actually play audio
 */
interface PlayerStore {
  /** Currently loaded track, or null if nothing playing */
  currentTrack: Track | null;
  /** True if actively playing audio */
  isPlaying: boolean;
  /** Volume level 0-100. Persisted across sessions. */
  volume: number;
  /** Selected output device ID, or null for default */
  outputDevice: string | null;

  // Actions
  /** Load persisted settings (volume). Call on app startup. */
  loadPersistedState: () => Promise<void>;
  /** Set current track and start playback state. */
  play: (track: Track) => void;
  /** Clear current track and stop playback state. */
  stop: () => void;
  /** Update playing state (e.g., from player callbacks). */
  setIsPlaying: (isPlaying: boolean) => void;
  /** Set volume and persist to storage. */
  setVolume: (volume: number) => Promise<void>;
  /** Set output device for audio routing. */
  setOutputDevice: (deviceId: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: Audio.defaultVolume,
  outputDevice: null,

  loadPersistedState: async () => {
    try {
      const savedVolume = await settingsQueries.getSetting(VOLUME_KEY);
      if (savedVolume !== null) {
        const volume = parseInt(savedVolume, 10);
        if (!isNaN(volume) && volume >= 0 && volume <= 100) {
          set({ volume });
        }
      }
    } catch {
      // Ignore errors loading persisted state
    }
  },

  play: (track) => {
    set({ currentTrack: track, isPlaying: true });
  },

  stop: () => {
    set({ currentTrack: null, isPlaying: false });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setVolume: async (volume) => {
    const clamped = Math.max(0, Math.min(100, volume));
    set({ volume: clamped });
    await settingsQueries.setSetting(VOLUME_KEY, clamped.toString());
  },

  setOutputDevice: (deviceId) => {
    set({ outputDevice: deviceId });
  },
}));
