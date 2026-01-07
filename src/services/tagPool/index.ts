/**
 * @file services/tagPool/index.ts
 * @description Tag pool selection service for random unplayed track selection.
 */

import type { Track } from '../../types';
import * as trackTagQueries from '../../db/queries/trackTags';
import * as trackQueries from '../../db/queries/tracks';

/**
 * Result of a tag pool selection
 *
 * @remarks For UI: Check `track` presence to determine if playback can proceed.
 * Use `remainingCount` to show "X tracks remaining" on the button.
 *
 * With auto-reset enabled:
 * - `poolExhausted` is now mainly for logging (pool auto-resets)
 * - `poolEmpty` indicates tag has ZERO tracks — button should be disabled
 */
export interface SelectionResult {
  /** The randomly selected track, or null if tag has no tracks */
  track: Track | null;
  /** Number of unplayed tracks remaining AFTER this selection */
  remainingCount: number;
  /** True if pool was exhausted (now auto-resets, so mainly for logging) */
  poolExhausted: boolean;
  /** True if tag has ZERO tracks associated — button should be disabled */
  poolEmpty: boolean;
}

/**
 * Selects a random unplayed track for a tag button.
 * Automatically resets the pool if exhausted (music must flow).
 * Marks the selected track as played.
 *
 * @param tagId - The tag ID to select from
 * @param markPlayed - Function to mark track as played (from useTrackStore)
 * @returns Selection result with track and remaining count
 *
 * @remarks For UI (Seraphelle): This is the main function for tag button behavior.
 *
 * **"The music must flow."** — At a sporting event, silence is the worst outcome.
 * This function auto-resets the pool when exhausted, so pressing a tag button
 * always produces music (as long as the tag has tracks).
 *
 * Flow when user presses a tag button:
 * 1. Call this function with the button's tagId
 * 2. If result.poolEmpty is true, tag has NO tracks — show disabled state
 * 3. If result.track exists, start playback (always the case if !poolEmpty)
 * 4. Update button UI with result.remainingCount
 *
 * @example
 * ```typescript
 * // In your tag button press handler:
 * const handleTagButtonPress = async (button: ButtonResolved) => {
 *   if (button.type !== 'tag' || !button.tagId) return;
 *
 *   const result = await selectTrackForTag(
 *     button.tagId,
 *     useTrackStore.getState().markPlayed
 *   );
 *
 *   if (result.poolEmpty) {
 *     // Tag has no tracks — button should already be disabled
 *     return;
 *   }
 *
 *   // Start playback (track is always present if !poolEmpty)
 *   await playerStore.playTrack(result.track!);
 * };
 * ```
 */
export async function selectTrackForTag(
  tagId: string,
  markPlayed: (trackId: string) => Promise<void>
): Promise<SelectionResult> {
  // Get all unplayed tracks for this tag
  let unplayedTracks = await trackTagQueries.getUnplayedTracksForTag(tagId);

  // Pool exhausted — check if tag has any tracks at all
  if (unplayedTracks.length === 0) {
    const allTracks = await trackTagQueries.getTracksForTag(tagId);

    // Tag has NO tracks — true empty state
    if (allTracks.length === 0) {
      return {
        track: null,
        remainingCount: 0,
        poolExhausted: true,
        poolEmpty: true,
      };
    }

    // Tag has tracks but all played — auto-reset and continue
    // "The music must flow"
    await trackTagQueries.resetPlayedFlagsForTag(tagId);
    unplayedTracks = await trackTagQueries.getUnplayedTracksForTag(tagId);

    // Verify reset worked — guard against silent database failure
    if (unplayedTracks.length === 0) {
      console.error('Failed to reset played flags for tag', tagId);
      return {
        track: null,
        remainingCount: 0,
        poolExhausted: true,
        poolEmpty: false, // We know tracks exist, reset just failed
      };
    }
  }

  // Select random track from pool
  const randomIndex = Math.floor(Math.random() * unplayedTracks.length);
  const selectedTrack = unplayedTracks[randomIndex];

  // Mark as played
  await markPlayed(selectedTrack.id);

  // Remaining count is current pool size minus 1 (the one we just selected)
  const remainingCount = unplayedTracks.length - 1;

  return {
    track: selectedTrack,
    remainingCount,
    poolExhausted: false,
    poolEmpty: false,
  };
}

/**
 * Gets the count of unplayed tracks for a tag without selecting one.
 * Useful for displaying availability on tag buttons.
 *
 * @param tagId - The tag ID to count
 * @returns Number of unplayed tracks with this tag
 *
 * @remarks For UI (Seraphelle): Use this to display remaining counts on buttons.
 * Call on initial load and after any track is marked played.
 *
 * @example
 * ```typescript
 * // In button component or resolver:
 * const availableCount = await getUnplayedCountForTag(button.tagId);
 * // Display as badge: "5 remaining"
 * ```
 */
export async function getUnplayedCountForTag(tagId: string): Promise<number> {
  const tracks = await trackTagQueries.getUnplayedTracksForTag(tagId);
  return tracks.length;
}

/**
 * Resets played flags for all tracks with a specific tag.
 * Use when the user wants to "refill" a tag's pool.
 *
 * @param tagId - The tag ID to reset
 *
 * @remarks For UI (Seraphelle): Offer this when a tag's pool is exhausted.
 * Could be a "Reset" button on the tag button long-press menu,
 * or an automatic prompt when poolExhausted is true.
 *
 * @example
 * ```typescript
 * // After pool exhaustion:
 * if (result.poolExhausted) {
 *   const shouldReset = await showConfirm('All tracks played. Reset pool?');
 *   if (shouldReset) {
 *     await resetPoolForTag(button.tagId);
 *     // Reload button state
 *   }
 * }
 * ```
 */
export async function resetPoolForTag(tagId: string): Promise<void> {
  await trackTagQueries.resetPlayedFlagsForTag(tagId);
}

/**
 * Resets played flags for all tracks in the library.
 * Use for a global "start fresh" option.
 *
 * @remarks For UI (Seraphelle): This could be a button in Settings
 * or a global action in the button board menu.
 * Warn the user that this resets ALL tracks, not just one tag.
 */
export async function resetAllPools(): Promise<void> {
  await trackQueries.resetAllPlayedFlags();
}

/**
 * Checks if a tag has any tracks (played or unplayed).
 * Useful for distinguishing "empty tag" from "exhausted pool".
 *
 * @param tagId - The tag ID to check
 * @returns True if the tag has at least one associated track
 *
 * @remarks For UI: Use to distinguish button states:
 * - No tracks at all: Show "No tracks" and maybe gray out
 * - Has tracks but all played: Show "0 remaining" with reset option
 */
export async function tagHasTracks(tagId: string): Promise<boolean> {
  const tracks = await trackTagQueries.getTracksForTag(tagId);
  return tracks.length > 0;
}

/**
 * Gets both total and unplayed counts for efficient UI display.
 *
 * @param tagId - The tag ID to query
 * @returns Object with total and unplayed counts
 *
 * @remarks For UI (Seraphelle): Use for button badges like "3/10"
 * showing unplayed/total. More efficient than two separate calls.
 *
 * @example
 * ```typescript
 * const counts = await getTagCounts(button.tagId);
 * // Display: "3/10 remaining" or "3 of 10"
 * ```
 */
export async function getTagCounts(
  tagId: string
): Promise<{ total: number; unplayed: number }> {
  const [allTracks, unplayedTracks] = await Promise.all([
    trackTagQueries.getTracksForTag(tagId),
    trackTagQueries.getUnplayedTracksForTag(tagId),
  ]);

  return {
    total: allTracks.length,
    unplayed: unplayedTracks.length,
  };
}
