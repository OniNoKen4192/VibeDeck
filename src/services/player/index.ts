/**
 * @file services/player/index.ts
 * @description Audio playback service wrapping react-native-track-player.
 */

import TrackPlayer, {
  Capability,
  Event,
  State,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import type { EmitterSubscription } from 'react-native';
import { File } from 'expo-file-system';
import type { Track } from '../../types';
import { Audio } from '../../constants/audio';

// Re-export Event and State for consumers
export { Event, State } from 'react-native-track-player';

/** Player initialization state */
let isPlayerInitialized = false;

/** Stored event subscriptions for cleanup */
let eventSubscriptions: EmitterSubscription[] = [];

/**
 * Error codes for playback failures
 */
export type PlaybackErrorCode = 'file_not_found' | 'playback_error' | 'not_initialized';

/**
 * Playback error with user-friendly message
 *
 * @remarks For UI: Display `userMessage` in toasts/alerts.
 * Use `code` for programmatic handling (e.g., offer to remove track if file_not_found).
 */
export interface PlaybackError {
  code: PlaybackErrorCode;
  /** User-friendly message for display */
  userMessage: string;
  /** Technical details for debugging */
  details?: string;
  /** The track that failed (if applicable) */
  track?: Track;
}

/**
 * Result of a playback attempt
 *
 * @remarks For UI: Check `success` before updating play state.
 * On failure, show `error.userMessage` to user.
 */
export interface PlaybackResult {
  success: boolean;
  error?: PlaybackError;
}

/**
 * Callback type for playback state changes
 *
 * @param isPlaying - Whether audio is currently playing
 * @param currentTrack - The track that's playing (null if stopped)
 *
 * @remarks For UI: Register this to sync player store with actual playback.
 */
export type PlaybackStateCallback = (isPlaying: boolean, currentTrack: Track | null) => void;

/**
 * Callback type for playback errors
 *
 * @param error - The playback error that occurred
 *
 * @remarks For UI: Register this to show error toasts.
 */
export type PlaybackErrorCallback = (error: PlaybackError) => void;

// Event callbacks
let onPlaybackStateChange: PlaybackStateCallback | null = null;
let onPlaybackError: PlaybackErrorCallback | null = null;

// Current track reference (TrackPlayer doesn't store our full Track object)
let currentTrackRef: Track | null = null;

/**
 * Initializes the track player. Call once at app startup.
 *
 * @returns True if initialization succeeded
 *
 * @remarks For UI (Seraphelle): Call this in your App.tsx useEffect.
 * Wait for this to complete before enabling playback controls.
 *
 * @example
 * ```typescript
 * // In App.tsx:
 * useEffect(() => {
 *   const setup = async () => {
 *     const success = await initializePlayer();
 *     if (!success) {
 *       console.error('Failed to initialize audio player');
 *     }
 *     await usePlayerStore.getState().loadPersistedState();
 *     setPlayerReady(true);
 *   };
 *   setup();
 *   return () => { destroyPlayer(); };
 * }, []);
 * ```
 */
export async function initializePlayer(): Promise<boolean> {
  if (isPlayerInitialized) {
    return true;
  }

  try {
    await TrackPlayer.setupPlayer({
      // Reasonable buffer for mobile
      minBuffer: 15,
      maxBuffer: 50,
      playBuffer: 2.5,
      backBuffer: 0,
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
    });

    // Register event listeners
    registerEventListeners();

    isPlayerInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize player:', error);
    return false;
  }
}

/**
 * Destroys the player instance. Call on app unmount.
 */
export async function destroyPlayer(): Promise<void> {
  if (!isPlayerInitialized) {
    return;
  }

  try {
    // Remove event listeners before reset
    removeEventListeners();

    await TrackPlayer.reset();
    isPlayerInitialized = false;
    currentTrackRef = null;
    onPlaybackStateChange = null;
    onPlaybackError = null;
  } catch (error) {
    console.error('Error destroying player:', error);
  }
}

/**
 * Removes all registered event listeners.
 * Called by destroyPlayer() and before re-registering.
 */
function removeEventListeners(): void {
  for (const subscription of eventSubscriptions) {
    subscription.remove();
  }
  eventSubscriptions = [];
}

/**
 * Checks if the player is initialized and ready
 */
export function isReady(): boolean {
  return isPlayerInitialized;
}

/**
 * Validates that a track's file exists before playback.
 * Implements Chatterwind's requirement for graceful missing file handling.
 *
 * @param track - The track to validate
 * @returns True if file exists and is accessible
 */
async function validateTrackFile(track: Track): Promise<boolean> {
  try {
    const file = new File(track.filePath);
    return file.exists;
  } catch {
    return false;
  }
}

/**
 * Plays a track. Validates file existence before attempting playback.
 *
 * @param track - The track to play
 * @returns Result indicating success or failure with error details
 *
 * @remarks For UI (Seraphelle): This is the main playback entry point.
 *
 * @example
 * ```typescript
 * // In button press handler:
 * const result = await playTrack(selectedTrack);
 * if (!result.success) {
 *   showToast(result.error.userMessage);
 *   if (result.error.code === 'file_not_found') {
 *     // Optionally offer to remove the track from library
 *   }
 * }
 * ```
 */
export async function playTrack(track: Track): Promise<PlaybackResult> {
  if (!isPlayerInitialized) {
    const error: PlaybackError = {
      code: 'not_initialized',
      userMessage: 'Audio player is not ready. Please try again.',
    };
    onPlaybackError?.(error);
    return { success: false, error };
  }

  // Validate file exists (Chatterwind's requirement)
  const fileExists = await validateTrackFile(track);
  if (!fileExists) {
    const error: PlaybackError = {
      code: 'file_not_found',
      userMessage: 'Track file not found. It may have been moved or deleted.',
      track,
    };
    onPlaybackError?.(error);
    return { success: false, error };
  }

  try {
    // Stop any current playback
    await TrackPlayer.reset();

    // Add the track to the queue
    await TrackPlayer.add({
      id: track.id,
      url: track.filePath,
      title: track.title || track.fileName,
      artist: track.artist || 'Unknown Artist',
      album: track.album || undefined,
      duration: track.durationMs ? track.durationMs / 1000 : undefined,
    });

    // Store reference to our Track object
    currentTrackRef = track;

    // Start playback
    await TrackPlayer.play();

    return { success: true };
  } catch (error) {
    const playbackError: PlaybackError = {
      code: 'playback_error',
      userMessage: 'Failed to play track. Please try again.',
      details: error instanceof Error ? error.message : String(error),
      track,
    };
    onPlaybackError?.(playbackError);
    return { success: false, error: playbackError };
  }
}

/**
 * Pauses the current playback.
 *
 * @remarks For UI: Wire to pause button. State change will be emitted via callback.
 */
export async function pause(): Promise<void> {
  if (!isPlayerInitialized) return;

  try {
    await TrackPlayer.pause();
  } catch (error) {
    console.error('Error pausing:', error);
  }
}

/**
 * Resumes playback from paused state.
 *
 * @remarks For UI: Wire to play button when already paused.
 */
export async function resume(): Promise<void> {
  if (!isPlayerInitialized) return;

  try {
    await TrackPlayer.play();
  } catch (error) {
    console.error('Error resuming:', error);
  }
}

/**
 * Stops playback and clears the queue.
 *
 * @remarks For UI: Wire to stop button. Will clear currentTrack in store.
 */
export async function stop(): Promise<void> {
  if (!isPlayerInitialized) return;

  try {
    await TrackPlayer.reset();
    currentTrackRef = null;
    onPlaybackStateChange?.(false, null);
  } catch (error) {
    console.error('Error stopping:', error);
  }
}

/**
 * Seeks to a position in the current track.
 *
 * @param positionMs - Position in milliseconds (will be clamped to valid range)
 *
 * @remarks For UI: Wire to scrubber/progress bar interactions.
 * Will no-op if no track is loaded or duration is unknown.
 */
export async function seekTo(positionMs: number): Promise<void> {
  if (!isPlayerInitialized) return;

  // Cannot seek if no track or duration unknown
  if (!currentTrackRef?.durationMs) {
    console.warn('Cannot seek: no track loaded or duration unknown');
    return;
  }

  try {
    const clampedMs = Math.max(0, Math.min(currentTrackRef.durationMs, positionMs));
    await TrackPlayer.seekTo(clampedMs / 1000);
  } catch (error) {
    console.error('Error seeking:', error);
  }
}

/**
 * Sets the playback volume.
 *
 * @param volume - Volume level 0-100
 *
 * @remarks For UI: Wire to volume slider. Also update usePlayerStore.
 */
export async function setVolume(volume: number): Promise<void> {
  if (!isPlayerInitialized) return;

  try {
    // TrackPlayer uses 0-1 range
    const normalized = Math.max(0, Math.min(100, volume)) / 100;
    await TrackPlayer.setVolume(normalized);
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

/**
 * Gets the current playback position.
 *
 * @returns Position in milliseconds
 *
 * @remarks For UI: Call periodically to update progress bar.
 */
export async function getPosition(): Promise<number> {
  if (!isPlayerInitialized) return 0;

  try {
    const position = await TrackPlayer.getProgress();
    return position.position * 1000;
  } catch {
    return 0;
  }
}

/**
 * Gets the current playback state.
 *
 * @returns Current state (Playing, Paused, etc.)
 */
export async function getState(): Promise<State> {
  if (!isPlayerInitialized) return State.None;

  try {
    const playbackState = await TrackPlayer.getPlaybackState();
    return playbackState.state;
  } catch {
    return State.None;
  }
}

/**
 * Gets the currently playing track.
 *
 * @returns The current Track object or null
 */
export function getCurrentTrack(): Track | null {
  return currentTrackRef;
}

/**
 * Registers a callback for playback state changes.
 *
 * @param callback - Function called when playback state changes
 *
 * @remarks For UI (Seraphelle): Register this to sync usePlayerStore.
 *
 * @example
 * ```typescript
 * // In your player setup:
 * registerPlaybackStateCallback((isPlaying, track) => {
 *   if (track) {
 *     usePlayerStore.getState().play(track);
 *   }
 *   usePlayerStore.getState().setIsPlaying(isPlaying);
 * });
 * ```
 */
export function registerPlaybackStateCallback(callback: PlaybackStateCallback): void {
  onPlaybackStateChange = callback;
}

/**
 * Registers a callback for playback errors.
 *
 * @param callback - Function called when a playback error occurs
 *
 * @remarks For UI: Register this to show error toasts.
 */
export function registerPlaybackErrorCallback(callback: PlaybackErrorCallback): void {
  onPlaybackError = callback;
}

/**
 * Sets up internal event listeners for react-native-track-player
 */
function registerEventListeners(): void {
  // Clear any existing subscriptions first (safety for hot reload)
  removeEventListeners();

  // Playback state changes
  const stateSubscription = TrackPlayer.addEventListener(
    Event.PlaybackState,
    async (event) => {
      const isPlaying = event.state === State.Playing;
      onPlaybackStateChange?.(isPlaying, currentTrackRef);
    }
  );

  // Track ends
  const queueEndedSubscription = TrackPlayer.addEventListener(
    Event.PlaybackQueueEnded,
    () => {
      currentTrackRef = null;
      onPlaybackStateChange?.(false, null);
    }
  );

  // Playback errors
  const errorSubscription = TrackPlayer.addEventListener(
    Event.PlaybackError,
    (event) => {
      const error: PlaybackError = {
        code: 'playback_error',
        userMessage: 'An error occurred during playback.',
        details: event.message,
        track: currentTrackRef ?? undefined,
      };
      onPlaybackError?.(error);
    }
  );

  eventSubscriptions = [stateSubscription, queueEndedSubscription, errorSubscription];
}

/**
 * Applies the current volume from settings.
 * Call after loading persisted state.
 *
 * @param volume - Volume level 0-100 from usePlayerStore
 *
 * @remarks For UI: Call this after loadPersistedState completes.
 */
export async function applyVolume(volume: number): Promise<void> {
  await setVolume(volume);
}
