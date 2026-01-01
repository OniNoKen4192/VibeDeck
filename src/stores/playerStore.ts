import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { PlaybackState, AppSettings } from '../types';

interface PlayerState {
  currentlyPlaying: PlaybackState | null;
  settings: AppSettings;
  isInitialized: boolean;

  // Internal audio objects (not persisted)
  _sound: Audio.Sound | null;
  _goalHornSound: Audio.Sound | null;

  // Actions
  initialize: () => Promise<void>;
  play: (songId: string, tagGroup: string, fileUri: string) => Promise<void>;
  stop: () => Promise<void>;
  fadeOut: () => Promise<void>;
  playGoalHorn: () => Promise<void>;
  setVolume: (volume: number) => void;
  setGoalHornUri: (uri: string) => Promise<void>;
  setFadeOutDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  currentlyPlaying: null,
  settings: {
    volume: 0.8,
    goalHornUri: null,
    fadeOutDuration: 3,
  },
  isInitialized: false,
  _sound: null,
  _goalHornSound: null,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      set({ isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },

  play: async (songId, tagGroup, fileUri) => {
    const { _sound, settings } = get();

    // Stop current playback
    if (_sound) {
      try {
        await _sound.stopAsync();
        await _sound.unloadAsync();
      } catch {
        // Ignore errors on cleanup
      }
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true, volume: settings.volume },
        (status: AVPlaybackStatus) => {
          // Handle playback completion
          if (status.isLoaded && status.didJustFinish) {
            set({ currentlyPlaying: null });
          }
        }
      );

      set({
        _sound: newSound,
        currentlyPlaying: {
          songId,
          tagGroup,
          startedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  },

  stop: async () => {
    const { _sound } = get();

    if (_sound) {
      try {
        await _sound.stopAsync();
        await _sound.unloadAsync();
      } catch {
        // Ignore errors
      }
    }

    set({ _sound: null, currentlyPlaying: null });
  },

  fadeOut: async () => {
    const { _sound, settings } = get();

    if (!_sound) {
      set({ currentlyPlaying: null });
      return;
    }

    const duration = settings.fadeOutDuration * 1000;
    const steps = 20;
    const stepDuration = duration / steps;
    const startVolume = settings.volume;

    for (let i = 1; i <= steps; i++) {
      const newVolume = startVolume * (1 - i / steps);
      try {
        await _sound.setVolumeAsync(Math.max(0, newVolume));
      } catch {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
    }

    // Clean up
    try {
      await _sound.stopAsync();
      await _sound.unloadAsync();
    } catch {
      // Ignore
    }

    set({ _sound: null, currentlyPlaying: null });
  },

  playGoalHorn: async () => {
    const { _goalHornSound, settings } = get();

    if (!settings.goalHornUri) {
      console.warn('No goal horn configured');
      return;
    }

    // Unload previous goal horn if exists
    if (_goalHornSound) {
      try {
        await _goalHornSound.unloadAsync();
      } catch {
        // Ignore
      }
    }

    try {
      const { sound: newGoalHorn } = await Audio.Sound.createAsync(
        { uri: settings.goalHornUri },
        { shouldPlay: true, volume: settings.volume }
      );

      set({ _goalHornSound: newGoalHorn });
    } catch (error) {
      console.error('Failed to play goal horn:', error);
    }
  },

  setVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const { _sound } = get();

    if (_sound) {
      _sound.setVolumeAsync(clampedVolume).catch(() => {});
    }

    set((state) => ({
      settings: { ...state.settings, volume: clampedVolume },
    }));
  },

  setGoalHornUri: async (uri) => {
    set((state) => ({
      settings: { ...state.settings, goalHornUri: uri },
    }));
  },

  setFadeOutDuration: (duration) => {
    const clampedDuration = Math.max(1, Math.min(10, duration));
    set((state) => ({
      settings: { ...state.settings, fadeOutDuration: clampedDuration },
    }));
  },
}));
