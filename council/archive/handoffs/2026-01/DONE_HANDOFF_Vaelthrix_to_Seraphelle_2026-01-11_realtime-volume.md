# Handoff: Real-time Volume Slider

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Live Fire Learning — Real-time volume slider

---

## Context

Live fire deployment (Lady Kraken vs Winter Club, 2026-01-11) revealed that the volume slider only affects audio on release, not during drag. For fade-out effects and real-time mixing during a game, the audio should change as you drag.

## What Was Done

- Analyzed `VolumeSlider.tsx` — already has throttled `onValueChange` (16ms)
- Analyzed `BoardScreen` handlers — `handleVolumeChange` only updates local UI state
- Identified the gap: `applyVolume()` is only called in `handleVolumeChangeComplete`

## The Problem

```typescript
// Current: only updates UI during drag
const handleVolumeChange = useCallback((value: number) => {
  setLocalVolume(value);  // UI only!
}, []);

// Volume only applied on release
const handleVolumeChangeComplete = useCallback(async (value: number) => {
  await usePlayerStore.getState().setVolume(value);
  await applyVolume(value);  // This is when audio actually changes
}, []);
```

## The Fix

Call `applyVolume()` during drag, throttled to avoid overwhelming the native player.

**Option A: Simple (use existing throttle)**

The `VolumeSlider` already throttles `onValueChange` to 16ms. Just add `applyVolume()` to the handler:

```typescript
const handleVolumeChange = useCallback((value: number) => {
  setLocalVolume(value);
  applyVolume(value);  // Real-time audio change
}, []);
```

This is ~60 calls/second during drag. The native player should handle this fine.

**Option B: Additional throttle (if Option A is too aggressive)**

If testing reveals performance issues, add a separate throttle for the native call:

```typescript
const lastVolumeApplyRef = useRef(0);
const VOLUME_APPLY_THROTTLE_MS = 50;  // 20 calls/second max

const handleVolumeChange = useCallback((value: number) => {
  setLocalVolume(value);

  const now = Date.now();
  if (now - lastVolumeApplyRef.current >= VOLUME_APPLY_THROTTLE_MS) {
    lastVolumeApplyRef.current = now;
    applyVolume(value);
  }
}, []);
```

**Recommendation:** Start with Option A. The slider already throttles, and `TrackPlayer.setVolume()` is a lightweight native call. Only add Option B if testing shows jank.

## What's Next

### 1. Update handleVolumeChange in BoardScreen

**File:** `app/(tabs)/index.tsx` (lines 354-356)

Change from:
```typescript
const handleVolumeChange = useCallback((value: number) => {
  setLocalVolume(value);
}, []);
```

To:
```typescript
const handleVolumeChange = useCallback((value: number) => {
  setLocalVolume(value);
  applyVolume(value);
}, []);
```

### 2. Test on device

Verify:
- [ ] Volume changes audibly during slider drag
- [ ] No audio glitches or stuttering during fast drags
- [ ] UI remains responsive (no jank in slider movement)
- [ ] Final volume on release matches slider position

### 3. (Optional) Keep persistence on release only

The current `handleVolumeChangeComplete` persists to SQLite on release. This is correct — we don't want to write to DB 60 times/second. Keep that unchanged:

```typescript
const handleVolumeChangeComplete = useCallback(async (value: number) => {
  await usePlayerStore.getState().setVolume(value);  // Persist only on release
  await applyVolume(value);  // Redundant but harmless, ensures final value
}, []);
```

## Key Files

| File | Change |
|------|--------|
| `app/(tabs)/index.tsx` | Add `applyVolume(value)` to `handleVolumeChange` |

That's it. One line change.

## Gotchas / Notes

1. **Slider already throttles** — `VolumeSlider.tsx` has a 16ms throttle on `onValueChange`. Don't add another throttle unless testing shows problems.

2. **applyVolume is async** — We're not awaiting it in the handler, which is fine. Fire-and-forget for real-time responsiveness.

3. **Don't persist during drag** — The SQLite write should only happen on release (`handleVolumeChangeComplete`). 60 DB writes/second would be bad.

4. **TrackPlayer.setVolume() is cheap** — It's just a native call to update the audio session volume. Should handle rapid calls gracefully.

---

*Handed off by Vaelthrix the Astral*
