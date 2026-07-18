# Handoff: Pause Button State Bug (HT-027)

**From:** Kazzarth the Blue
**To:** Vaelthrix the Astral
**Date:** 2026-01-14
**Related Quest:** 1.1.0 QA Testing

---

## Context

During 1.1.0 QA testing, discovered that the pause button doesn't work correctly. Audio pauses, but the UI immediately flickers back to showing "playing" state, making it impossible to resume.

## What Was Done

- Identified the bug during QA testing (B1.1, B1.2 FAIL)
- Traced root cause through PlayPauseButton → PlaybackControls → index.tsx → usePlayerStore
- Documented as HT-027 in [TEST_PLAN_1.1.0.md](../qa/TEST_PLAN_1.1.0.md)

## What's Next

- Fix the callback logic in index.tsx
- Verify pause/resume works correctly
- Continue 1.1.0 QA testing

## Key Files

- [app/(tabs)/index.tsx:158-168](../../app/(tabs)/index.tsx#L158-L168) — the buggy callback
- [src/stores/usePlayerStore.ts:73-75](../../src/stores/usePlayerStore.ts#L73-L75) — `play()` action that overwrites state

## Root Cause Analysis

The playback state callback in `index.tsx` unconditionally calls `play(track)` whenever a track exists:

```typescript
registerPlaybackStateCallback((playing, track) => {
  usePlayerStore.getState().setIsPlaying(playing);  // sets to false ✓
  if (track) {
    usePlayerStore.getState().play(track);  // BUG: sets isPlaying = true!
  }
  // ...
});
```

When pausing:
1. `TrackPlayer.pause()` triggers `Event.PlaybackState` with `State.Paused`
2. Callback receives `playing=false, track=<current track>`
3. `setIsPlaying(false)` correctly sets `isPlaying: false`
4. `play(track)` is called because track is not null
5. `play()` does `set({ currentTrack: track, isPlaying: true })` — overwriting `isPlaying` back to `true`

**Fix:** Change line 160-162 from:
```typescript
if (track) {
  usePlayerStore.getState().play(track);
}
```
to:
```typescript
if (playing && track) {
  usePlayerStore.getState().play(track);
}
```

This ensures `play(track)` only fires when actually starting playback, not when pausing.

## Gotchas / Notes

- This is a **blocking** bug — pause/play is a key 1.1.0 feature from live fire learnings
- The audio layer works correctly (TrackPlayer pauses fine)
- The tag button visual indicator correctly shows paused state — only the PlayPauseButton icon is wrong
- Stop button works correctly (different code path)

---

*Handed off by Kazzarth the Blue*
