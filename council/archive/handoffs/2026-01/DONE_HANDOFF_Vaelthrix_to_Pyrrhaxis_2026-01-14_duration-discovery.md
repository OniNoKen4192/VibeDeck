# Handoff: Duration Discovery on Playback (HT-032)

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Bronze
**Date:** 2026-01-14
**Related Quest:** HT-032 (Cue Points feature broken)

---

## Context

The cue points feature (B10 in TEST_PLAN_1.1.0.md) is non-functional because track duration is never extracted. The `CuePointEditor` shows "Duration unknown - cue points unavailable" for all tracks.

During import, `extractMetadata()` sets `durationMs: null` with a comment saying it will be set on playback — but no code ever does this.

## The Fix

Discover duration on first playback using `TrackPlayer.getProgress()` and persist it.

### Implementation

In [src/services/player/index.ts](../../src/services/player/index.ts), after `TrackPlayer.play()` succeeds in `playTrack()` (around line 308), add duration discovery:

```typescript
// Start playback
await TrackPlayer.play();

// Discover duration if not known (for cue points feature)
if (track.durationMs === null) {
  // Small delay to let TrackPlayer load the track metadata
  setTimeout(async () => {
    try {
      const progress = await TrackPlayer.getProgress();
      if (progress.duration > 0) {
        const durationMs = Math.round(progress.duration * 1000);
        // Import updateTrack from useTrackStore at top of file
        await useTrackStore.getState().updateTrack(track.id, { durationMs });
        // Update our local reference so subsequent plays don't re-discover
        if (currentTrackRef?.id === track.id) {
          currentTrackRef = { ...currentTrackRef, durationMs };
        }
      }
    } catch (error) {
      console.warn('[Player] Failed to discover track duration:', error);
    }
  }, 500); // 500ms delay for metadata to be available
}
```

### Import Required

Add at top of `src/services/player/index.ts`:
```typescript
import { useTrackStore } from '../../stores/useTrackStore';
```

## Verification

1. Import a fresh track (or delete and re-import an existing one)
2. Confirm `durationMs` is null in DB (optional: check SQLite)
3. Play the track
4. Open track detail modal and check cue points section
5. Cue point editor should now be available (not "Duration unknown")
6. Set a start time and end time, save
7. Play track again — should play only the cued segment

## Key Files

| File | Change |
|------|--------|
| [src/services/player/index.ts:308](../../src/services/player/index.ts#L308) | Add duration discovery after `TrackPlayer.play()` |

## Gotchas / Notes

- `TrackPlayer.getProgress()` returns `{ position, duration, buffered }` — duration is in **seconds**
- The 500ms delay is needed because `getProgress().duration` may be 0 immediately after play starts
- This is a one-time discovery — once `durationMs` is persisted, it won't be re-discovered
- The `updateTrack()` call will refresh the track in the store, so UI will update
- Existing tracks with duration already set (from previous testing) won't be affected
- Future enhancement (Option B) in StretchGoals: use expo-av during import for immediate availability

---

*Handed off by Vaelthrix the Astral*
