# Handoff: Pause State Fix (HT-027)

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Bronze
**Date:** 2026-01-14
**Related Quest:** 1.1.0 QA — HT-027 Pause Button State Bug

---

## Context

During 1.1.0 QA testing, the pause button was found to be broken. Audio pauses correctly, but the UI immediately flickers back to showing "playing" state, making it impossible to resume playback. This is a **blocking** bug — pause/play was a key feature request from live fire learnings.

## Root Cause

The playback state callback in `index.tsx` unconditionally calls `play(track)` whenever a track exists. The `play()` action sets `isPlaying: true`, which immediately overwrites the `setIsPlaying(false)` that was just called.

**Current code** ([app/(tabs)/index.tsx:158-168](../../app/(tabs)/index.tsx#L158-L168)):
```typescript
registerPlaybackStateCallback((playing, track) => {
  usePlayerStore.getState().setIsPlaying(playing);  // sets to false ✓
  if (track) {
    usePlayerStore.getState().play(track);  // BUG: sets isPlaying = true!
  }
  if (!playing && !track) {
    setPlayingButtonId(null);
    usePlayerStore.getState().stop();
  }
});
```

**Sequence when pausing:**
1. `TrackPlayer.pause()` triggers callback with `playing=false, track=<current track>`
2. `setIsPlaying(false)` correctly sets `isPlaying: false`
3. `play(track)` fires because `track` is not null
4. `play()` does `set({ currentTrack: track, isPlaying: true })` — overwrites `isPlaying` back to `true`

## The Fix

Change line 160-162 from:
```typescript
if (track) {
  usePlayerStore.getState().play(track);
}
```

To:
```typescript
if (playing && track) {
  usePlayerStore.getState().play(track);
}
```

This ensures `play(track)` only fires when actually starting playback, not when pausing or in other states where a track is loaded but not playing.

## Verification

1. Build and run on Android emulator
2. Play a track (playback bar appears)
3. Tap pause — audio should pause, icon should change to play and **stay** as play
4. Tap play — audio should resume from pause point
5. Verify stop still works (tap stop while playing or paused)
6. Report back to QA that HT-027 is resolved

## Key Files

| File | Change |
|------|--------|
| [app/(tabs)/index.tsx:160](../../app/(tabs)/index.tsx#L160) | Add `playing &&` guard to conditional |

## Optional Cleanup (Non-Blocking)

The JSDoc example in [src/services/player/index.ts:487-492](../../src/services/player/index.ts#L487-L492) shows the same buggy pattern. Consider updating it to reflect the correct usage:

```typescript
// From (buggy example):
registerPlaybackStateCallback((isPlaying, track) => {
  if (track) {
    usePlayerStore.getState().play(track);
  }
  usePlayerStore.getState().setIsPlaying(isPlaying);
});

// To (correct example):
registerPlaybackStateCallback((isPlaying, track) => {
  if (isPlaying && track) {
    usePlayerStore.getState().play(track);
  }
  usePlayerStore.getState().setIsPlaying(isPlaying);
});
```

This is documentation-only and won't affect runtime behavior, but prevents future confusion.

## Gotchas / Notes

- The audio layer (TrackPlayer) works correctly — this is purely a UI state sync issue
- The tag button visual indicator shows paused state correctly — only the PlayPauseButton icon is wrong
- Stop button works correctly (different code path — checks `!playing && !track`)
- This callback pattern was written before pause functionality existed in 1.0

---

*Handed off by Vaelthrix the Astral*
