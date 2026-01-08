# [VibeDeck] Remediation Plan — Phase 1 Critical Issues

**Created:** 2026-01-07
**Author:** Vaelthrix the Astral (Architect)
**Scope:** CR-01, CR-02, CR-04, CR-05 (Critical blocking issues)
**Executor:** Pyrrhaxis the Crimson (Implementation)

---

## Overview

This plan addresses the four critical issues that will cause the most visible problems during testing. Each section includes the problem analysis, solution design, implementation steps, and verification criteria.

---

## CR-01: Database Transaction Wrapping

### Problem

Multi-step database operations lack atomicity. If the app crashes mid-operation, data is left in an inconsistent state.

**Affected locations:**
- `src/db/queries/trackTags.ts` — `setTagsForTrack()` (lines 123-137)
- `src/db/queries/buttons.ts` — `reorderButtons()` (lines 152-162)

### Solution Design

expo-sqlite provides `withTransactionAsync()` for atomic operations. Wrap all multi-statement operations.

### Implementation Steps

#### Step 1: Create transaction helper (optional but recommended)

Add to `src/db/init.ts`:

```typescript
/**
 * Execute a callback within a database transaction.
 * Automatically rolls back on error.
 */
export async function withTransaction<T>(
  callback: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const database = getDatabase();
  return database.withTransactionAsync(async () => {
    return callback(database);
  });
}
```

#### Step 2: Fix setTagsForTrack()

In `src/db/queries/trackTags.ts`, replace lines 123-137:

```typescript
export async function setTagsForTrack(trackId: string, tagIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    // Remove all existing associations
    await db.runAsync('DELETE FROM track_tags WHERE track_id = ?', [trackId]);

    // Add new associations
    for (const tagId of tagIds) {
      await db.runAsync(
        `INSERT INTO track_tags (track_id, tag_id, created_at) VALUES (?, ?, ?)`,
        [trackId, tagId, now]
      );
    }
  });
}
```

#### Step 3: Fix reorderButtons()

In `src/db/queries/buttons.ts`, replace lines 152-162:

```typescript
export async function reorderButtons(orderedIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync(
        'UPDATE buttons SET position = ?, updated_at = ? WHERE id = ?',
        [i, now, orderedIds[i]]
      );
    }
  });
}
```

### Verification

1. Add a breakpoint or `throw` between DELETE and INSERT in `setTagsForTrack`
2. Trigger the operation, confirm rollback occurs
3. Verify track-tag associations remain intact after simulated crash

---

## CR-02: N+1 Query Optimization in resolveAllButtons

### Problem

`resolveAllButtons()` calls `resolveButton()` for each button, triggering 1-2 queries per button. This causes UI freezes with moderate button counts.

**Affected location:**
- `src/stores/useButtonStore.ts` — `resolveAllButtons()` (lines 198-200)
- `src/stores/useButtonStore.ts` — `resolveButton()` (lines 161-196)

### Solution Design

Create a single batch query that JOINs buttons with their related tags/tracks and computes available track counts. Replace N+1 pattern with single query + in-memory mapping.

### Implementation Steps

#### Step 1: Add batch query function

Create new function in `src/db/queries/buttons.ts`:

```typescript
interface ButtonResolvedRow {
  // Button fields
  id: string;
  name: string;
  type: string;
  tag_id: string | null;
  track_id: string | null;
  position: number;
  persistent: number;
  color: string | null;
  created_at: string;
  updated_at: string;
  // Tag fields (nullable)
  tag_name: string | null;
  tag_color: string | null;
  tag_created_at: string | null;
  tag_updated_at: string | null;
  // Track fields (nullable)
  track_file_path: string | null;
  track_file_name: string | null;
  track_title: string | null;
  track_artist: string | null;
  track_album: string | null;
  track_genre: string | null;
  track_duration_ms: number | null;
  track_played: number | null;
  track_created_at: string | null;
  track_updated_at: string | null;
  // Computed
  available_tracks: number | null;
}

export async function getAllButtonsResolved(): Promise<ButtonResolvedRow[]> {
  const db = getDatabase();
  return db.getAllAsync<ButtonResolvedRow>(`
    SELECT
      b.id,
      b.name,
      b.type,
      b.tag_id,
      b.track_id,
      b.position,
      b.persistent,
      b.color,
      b.created_at,
      b.updated_at,
      -- Tag fields
      t.name as tag_name,
      t.color as tag_color,
      t.created_at as tag_created_at,
      t.updated_at as tag_updated_at,
      -- Track fields (for direct buttons)
      tr.file_path as track_file_path,
      tr.file_name as track_file_name,
      tr.title as track_title,
      tr.artist as track_artist,
      tr.album as track_album,
      tr.genre as track_genre,
      tr.duration_ms as track_duration_ms,
      tr.played as track_played,
      tr.created_at as track_created_at,
      tr.updated_at as track_updated_at,
      -- Available tracks count (for tag buttons)
      (
        SELECT COUNT(*)
        FROM track_tags tt2
        JOIN tracks tr2 ON tt2.track_id = tr2.id
        WHERE tt2.tag_id = b.tag_id AND tr2.played = 0
      ) as available_tracks
    FROM buttons b
    LEFT JOIN tags t ON b.tag_id = t.id
    LEFT JOIN tracks tr ON b.track_id = tr.id
    ORDER BY b.position ASC
  `);
}
```

#### Step 2: Add row mapper function

Add to `src/db/queries/buttons.ts`:

```typescript
import type { ButtonResolved, Tag, Track, ButtonType } from '../../types';
import { DEFAULT_BUTTON_COLOR } from '../../constants/colors';

export function rowToButtonResolved(row: ButtonResolvedRow): ButtonResolved {
  const button: Button = {
    id: row.id,
    name: row.name,
    type: row.type as ButtonType,
    tagId: row.tag_id,
    trackId: row.track_id,
    position: row.position,
    persistent: row.persistent === 1,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  let tag: Tag | undefined;
  let track: Track | undefined;
  let isDisabled = false;

  if (button.type === 'tag' && button.tagId) {
    if (row.tag_name !== null) {
      tag = {
        id: button.tagId,
        name: row.tag_name,
        color: row.tag_color,
        createdAt: row.tag_created_at!,
        updatedAt: row.tag_updated_at!,
      };
    } else {
      isDisabled = true; // Tag was deleted
    }
  } else if (button.type === 'direct' && button.trackId) {
    if (row.track_file_path !== null) {
      track = {
        id: button.trackId,
        filePath: row.track_file_path,
        fileName: row.track_file_name!,
        title: row.track_title,
        artist: row.track_artist,
        album: row.track_album,
        genre: row.track_genre,
        durationMs: row.track_duration_ms,
        played: row.track_played === 1,
        createdAt: row.track_created_at!,
        updatedAt: row.track_updated_at!,
      };
    } else {
      isDisabled = true; // Track was deleted
    }
  }

  const displayColor = button.color ?? tag?.color ?? DEFAULT_BUTTON_COLOR;

  return {
    ...button,
    tag,
    track,
    availableTracks: row.available_tracks ?? undefined,
    displayColor,
    isDisabled,
  };
}
```

#### Step 3: Update useButtonStore

Replace `resolveAllButtons` in `src/stores/useButtonStore.ts`:

```typescript
resolveAllButtons: async () => {
  const rows = await buttonQueries.getAllButtonsResolved();
  return rows.map(buttonQueries.rowToButtonResolved);
},
```

Keep `resolveButton()` for single-button resolution (used in other contexts), but the critical path now uses the batch query.

#### Step 4: Export new functions

Update `src/db/queries/buttons.ts` exports and `src/db/queries/index.ts` if needed.

### Verification

1. Create 50+ buttons
2. Profile `resolveAllButtons()` — should complete in <100ms
3. Verify button board renders correctly with all data populated
4. Check SQL logs — should see single query instead of 50+

---

## CR-04: Player Event Listener Cleanup

### Problem

Event listeners registered in `registerEventListeners()` are never removed in `destroyPlayer()`, causing memory leaks on hot reload and potential duplicate event handling.

**Affected location:**
- `src/services/player/index.ts` — lines 420-443 (register) and 146-158 (destroy)

### Solution Design

Store listener subscription references at module scope. Remove them in `destroyPlayer()`.

### Implementation Steps

#### Step 1: Add subscription storage

At the top of `src/services/player/index.ts`, after the existing module variables (around line 20):

```typescript
import type { EmitterSubscription } from 'react-native';

// ... existing code ...

/** Stored event subscriptions for cleanup */
let eventSubscriptions: EmitterSubscription[] = [];
```

#### Step 2: Update registerEventListeners()

Replace the function (lines 420-443):

```typescript
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
```

#### Step 3: Add removeEventListeners helper

Add new function:

```typescript
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
```

#### Step 4: Update destroyPlayer()

Replace the function (lines 146-158):

```typescript
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
```

### Verification

1. In development, trigger hot reload multiple times
2. Play a track, verify only one state change callback fires
3. Call `destroyPlayer()`, verify listeners are cleaned up
4. Re-initialize, verify listeners work again

---

## CR-05: Optimistic Tag Count Updates

### Problem

Every `addTagToTrack()` or `removeTagFromTrack()` call triggers a full `loadTags()` reload, which runs an expensive JOIN + aggregation query.

**Affected location:**
- `src/stores/useTagStore.ts` — lines 126-141

### Solution Design

Update counts in memory optimistically. Only reload on error or when counts could be stale (track deleted, played flag changed).

### Implementation Steps

#### Step 1: Add helper for count adjustment

Add to `src/stores/useTagStore.ts`:

```typescript
// Internal helper to adjust tag counts in memory
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
```

#### Step 2: Update addTagToTrack

Replace the implementation:

```typescript
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
```

#### Step 3: Update removeTagFromTrack

Replace the implementation:

```typescript
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
```

#### Step 4: Update setTagsForTrack

This is more complex — we need to know which tags were added/removed:

```typescript
setTagsForTrack: async (trackId, tagIds) => {
  const previousTags = await trackTagQueries.getTagsForTrack(trackId);
  const previousTagIds = new Set(previousTags.map((t) => t.id));
  const newTagIds = new Set(tagIds);

  // Calculate deltas
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
```

#### Step 5: Keep full reload for resetPlayedForTag

This changes unplayed counts for multiple tracks, so a full reload is appropriate:

```typescript
resetPlayedForTag: async (tagId) => {
  await trackTagQueries.resetPlayedFlagsForTag(tagId);
  // Full reload needed — multiple track states changed
  await get().loadTags();
},
```

### Note on Accuracy

The optimistic updates assume the track being tagged/untagged is unplayed. This may slightly miscount if the track is already played, but:

1. The error is bounded (off by 1 at most)
2. It self-corrects on next full load (app restart, tag reset, etc.)
3. The performance gain is significant

For perfect accuracy, we could query the track's played status first, but this adds latency. The tradeoff favors responsiveness.

### Verification

1. Tag 20 tracks rapidly — UI should remain responsive
2. Verify counts update immediately in UI
3. Restart app — counts should match database
4. Force an error (e.g., invalid tagId) — verify rollback occurs

---

## Implementation Order

1. **CR-04** (Player listeners) — Isolated change, lowest risk
2. **CR-01** (Transactions) — Isolated change, medium complexity
3. **CR-05** (Optimistic updates) — Store changes, medium complexity
4. **CR-02** (N+1 queries) — Largest change, highest impact

---

## Testing Checklist

After all fixes are applied:

- [ ] App starts without errors
- [ ] Buttons load quickly (even with 50+ buttons)
- [ ] Tagging tracks feels responsive
- [ ] Player events fire correctly (play, pause, stop)
- [ ] Hot reload doesn't duplicate player events
- [ ] Simulated crash during tag assignment doesn't orphan data
- [ ] Simulated crash during button reorder doesn't corrupt positions

---

## NEW: Auto-Reset Tag Pools (Feature Enhancement)

### Design Principle

**"The music must flow."** — At a sporting event, the worst outcome is pressing a button and hearing silence. Tag pools should auto-reset when exhausted.

### Current Behavior

1. Tag button pressed
2. Query unplayed tracks
3. If empty → return `poolExhausted: true` → **silence**

### New Behavior

1. Tag button pressed
2. Query unplayed tracks
3. If empty AND tag has tracks → **auto-reset** → pick random → play
4. If empty AND tag has NO tracks → show error (button should be disabled)

### Implementation

#### Step 1: Update selectTrackForTag()

In `src/services/tagPool/index.ts`, replace the function:

```typescript
/**
 * Selects a random unplayed track for a tag button.
 * Automatically resets the pool if exhausted (music must flow).
 * Marks the selected track as played.
 *
 * @param tagId - The tag ID to select from
 * @param markPlayed - Function to mark track as played (from useTrackStore)
 * @returns Selection result with track and remaining count
 *
 * @remarks
 * - If pool is exhausted but tag has tracks, auto-resets and continues
 * - If tag has NO tracks at all, returns null with poolEmpty: true
 * - Auto-reset is silent — user just hears music without interruption
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
        poolEmpty: true,  // New flag: tag has no tracks
      };
    }

    // Tag has tracks but all played — auto-reset and continue
    await trackTagQueries.resetPlayedFlagsForTag(tagId);
    unplayedTracks = await trackTagQueries.getUnplayedTracksForTag(tagId);
  }

  // Select random track from pool
  const randomIndex = Math.floor(Math.random() * unplayedTracks.length);
  const selectedTrack = unplayedTracks[randomIndex];

  // Mark as played
  await markPlayed(selectedTrack.id);

  // Remaining count is current pool size minus 1
  const remainingCount = unplayedTracks.length - 1;

  return {
    track: selectedTrack,
    remainingCount,
    poolExhausted: false,
    poolEmpty: false,
  };
}
```

#### Step 2: Update SelectionResult interface

```typescript
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
```

#### Step 3: Update ButtonResolved for empty state

The batch query already fetches `available_tracks`. We need to also track `total_tracks` to distinguish empty from exhausted.

Update `getAllButtonsResolved()` query to include total count:

```sql
-- Add to SELECT clause:
(
  SELECT COUNT(*)
  FROM track_tags tt3
  WHERE tt3.tag_id = b.tag_id
) as total_tracks
```

Update `ButtonResolvedRow` interface:

```typescript
total_tracks: number | null;
```

Update `rowToButtonResolved()` to set `isDisabled` when tag has no tracks:

```typescript
// For tag buttons: disable if tag has NO tracks (not just exhausted)
if (button.type === 'tag' && button.tagId) {
  if (row.tag_name !== null) {
    tag = { ... };
    // Disable if tag exists but has zero tracks
    if (row.total_tracks === 0) {
      isDisabled = true;
      isEmpty = true;  // New field for UI differentiation
    }
  } else {
    isDisabled = true; // Tag was deleted
  }
}
```

#### Step 4: UI Indication for Empty Tags

Add to `ButtonResolved` type:

```typescript
/** True if this is a tag button with no tracks assigned */
isEmpty?: boolean;
```

For Seraphelle's UI work:
- Empty tag buttons should be **grayed out**
- Show indicator (e.g., "∅" or "No tracks") instead of count badge
- Press handler should return early (no toast needed — visual state is clear)

### Verification

1. Create tag with 2 tracks
2. Press button twice — both play
3. Press button third time — pool auto-resets, first track plays again
4. Create tag with 0 tracks — button is grayed, press does nothing
5. Badge shows "0" or empty indicator for zero-track tags

---

## CR-45: insertButtonAtomic Silent Failure Fix

### Problem

`insertButtonAtomic()` returns `0` when the SELECT query fails, but `0` is a valid position.

### Fix

In `src/db/queries/buttons.ts`, replace line 137:

```typescript
// Before:
return result?.position ?? 0;

// After:
if (result === null || result.position === undefined) {
  throw new Error(`Failed to retrieve position for button ${button.id}`);
}
return result.position;
```

---

## CR-46: Seek Position Infinity Fallback Fix

### Problem

`seekTo()` uses `Infinity` as max when duration is unknown, allowing seeks to invalid positions.

### Fix

In `src/services/player/index.ts`, replace the `seekTo` function:

```typescript
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
```

---

## Updated Implementation Order

1. **CR-04** (Player listeners) — ✅ Done
2. **CR-01** (Transactions) — ✅ Done (reorderButtons)
3. **CR-05** (Optimistic updates) — ✅ Done
4. **CR-02** (N+1 queries) — ✅ Done
5. **CR-45** (insertButtonAtomic fix) — Quick fix
6. **CR-46** (seekTo fix) — Quick fix
7. **Auto-Reset Tag Pools** — New feature, medium complexity

---

## Updated Testing Checklist

After all fixes are applied:

- [ ] App starts without errors
- [ ] Buttons load quickly (even with 50+ buttons)
- [ ] Tagging tracks feels responsive
- [ ] Player events fire correctly (play, pause, stop)
- [ ] Hot reload doesn't duplicate player events
- [ ] Simulated crash during tag assignment doesn't orphan data
- [ ] Simulated crash during button reorder doesn't corrupt positions
- [ ] **Tag button with tracks: always plays (auto-reset works)**
- [ ] **Tag button with NO tracks: grayed out, no action on press**
- [ ] **Seek disabled when duration unknown**

---

## Sign-Off

This plan is ready for **Pyrrhaxis the Crimson** to execute.

Upon completion, **Kazzrath the Blue** should perform QA verification using the testing checklist above.

*— Vaelthrix the Astral, Architect of the Council*
