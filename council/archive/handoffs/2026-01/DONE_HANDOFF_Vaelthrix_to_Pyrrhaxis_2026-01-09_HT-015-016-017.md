# Handoff: Vaelthrix → Pyrrhaxis

**Date:** 2026-01-09
**From:** Vaelthrix the Astral (Architecture)
**To:** Pyrrhaxis the Crimson (Code)
**Subject:** Architectural decisions for HT-015, HT-016, HT-017

---

## Summary

After reviewing Kazzrath's QA findings, I've made architectural decisions for three related issues. Two require code changes, one is a "won't fix."

---

## HT-015: Board doesn't refresh on tag-track association changes

**Severity:** Medium
**Decision:** Option 1 — Re-resolve on tab focus (`useFocusEffect`)

### Rationale

1. **MVP simplicity**: VibeDeck is for parents at sporting events. The typical user flow is:
   - Set up library/tags before the game (one-time)
   - Use Board screen during the game (primary interaction)

2. **Query cost is minimal**: `getAllButtonsResolved()` is a single batch query. With typical user's 5-20 buttons, this is negligible.

3. **Covers all staleness cases**: Not just tag-track associations, but any change in Library or Tags screens gets picked up on return to Board.

4. **No cross-store coupling**: Options 2-4 introduce architectural complexity for an edge case.

### Implementation

**File:** `app/(tabs)/index.tsx`

Add `useFocusEffect` from `@react-navigation/native` to trigger re-resolve when Board tab gains focus.

```typescript
import { useFocusEffect } from '@react-navigation/native';

// Inside BoardScreen component, add:
useFocusEffect(
  useCallback(() => {
    // Re-resolve buttons when tab gains focus (handles cross-screen changes)
    async function refresh() {
      try {
        const resolved = await resolveAllButtons();
        setButtons(resolved);
      } catch (err) {
        console.error('[BoardScreen] Failed to refresh buttons on focus:', err);
      }
    }
    refresh();
  }, [resolveAllButtons])
);
```

**Note:** This runs in addition to the existing `useEffect` that watches `storeButtons`. The focus effect handles cross-store staleness; the store subscription handles same-screen changes.

---

## HT-016: Duplicate direct buttons allowed

**Severity:** Low
**Decision:** Allow duplicates — intentional feature

### Rationale

1. **Valid use case**: A parent might want the same track (e.g., team fight song) accessible in multiple board positions for quick access depending on game situation.

2. **No technical harm**: Two buttons pointing to the same track is semantically fine. The issue is TrackPlayer state, not the button model.

3. **UI affordance**: Users can delete buttons freely. If they accidentally create a duplicate, they can remove it.

**No code changes needed for HT-016.**

---

## HT-017: Second direct button playback fails

**Severity:** High (blocks playback)
**Decision:** Reset TrackPlayer queue before each play

### Root Cause Analysis

Looking at [player/index.ts:259-290](src/services/player/index.ts#L259-L290), the `playTrack` function already calls `TrackPlayer.reset()` before adding the new track (line 261). However, the error is occurring at `TrackPlayer.add()` (line 264).

The issue is that `TrackPlayer.add()` uses `track.id` as the queue item ID. When playing the same track from a different button:
1. First button plays "Sandstorm" (track.id = "abc123")
2. Queue item ID = "abc123"
3. Second button plays same "Sandstorm" (track.id = "abc123")
4. `reset()` clears playback state but queue metadata may persist
5. `add()` sees duplicate ID, throws

### Implementation

**File:** `src/services/player/index.ts`
**Location:** `playTrack` function, around line 264

Generate a unique queue item ID instead of using `track.id`:

```typescript
// Current (line 264-271):
await TrackPlayer.add({
  id: track.id,  // <-- Problem: same track = same ID
  url: track.filePath,
  ...
});

// Fixed:
await TrackPlayer.add({
  id: `${track.id}-${Date.now()}`,  // Unique per play
  url: track.filePath,
  title: track.title || track.fileName,
  artist: track.artist || 'Unknown Artist',
  album: track.album || undefined,
  duration: track.durationMs ? track.durationMs / 1000 : undefined,
});
```

**Why `Date.now()`?** It's simple, deterministic, and we don't need to track queue items by ID since we only ever have one track in the queue at a time.

---

## Files to Modify

| Issue | File | Change |
|-------|------|--------|
| HT-015 | `app/(tabs)/index.tsx` | Add `useFocusEffect` refresh |
| HT-016 | — | No change (intended behavior) |
| HT-017 | `src/services/player/index.ts:264` | Use unique queue item ID |

---

## Testing Verification

### HT-015
1. Create tag "EDM" in Tags screen
2. Navigate to Board — EDM button shows 0 tracks
3. Go to Library, assign a track to EDM
4. Navigate back to Board — EDM button should show 1 track

### HT-017
1. Add track "Sandstorm" as direct button (Button A)
2. Add same track "Sandstorm" as direct button (Button B)
3. Tap Button A — plays correctly
4. Tap Button B — should play correctly (no error)

---

## Commit Message Suggestion

```
fix: HT-015 refresh Board on tab focus, HT-017 unique queue IDs

HT-015: Add useFocusEffect to re-resolve buttons when Board tab
gains focus. Handles staleness from Library/Tags screen changes.

HT-017: Use timestamp-suffixed queue item IDs in playTrack().
Allows same track to be played from multiple direct buttons.

HT-016: Documented as intended behavior (duplicate buttons allowed).
```

---

*Handed off by Vaelthrix the Astral*
