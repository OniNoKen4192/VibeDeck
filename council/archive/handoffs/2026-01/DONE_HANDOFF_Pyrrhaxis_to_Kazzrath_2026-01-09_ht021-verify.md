# Handoff: Pyrrhaxis → Kazzrath

**Date:** 2026-01-09
**From:** Pyrrhaxis the Crimson (Code)
**To:** Kazzrath the Blue (QA)
**Subject:** HT-021 Fix Verification — Exhausted button tap-to-stop

---

## Summary

HT-021 is fixed. Tapping an exhausted tag button now correctly stops playback when the button is currently playing.

---

## What Changed

**File:** `src/components/BoardButton.tsx`

**Change:** Modified `isInteractive` calculation (line 67)

Before:
```typescript
const isInteractive = !isDisabled && !isExhausted && !isEmpty;
```

After:
```typescript
const isInteractive = !isDisabled && !isEmpty && (!isExhausted || isPlaying);
```

**Explanation:**

The root cause was that `BoardButton` blocked ALL presses when exhausted, before the parent's `handleButtonPress` could check if stop action was needed.

The fix: Allow press through when `isPlaying` is true, even if exhausted. This lets the tap-to-stop toggle work while still blocking new play attempts on exhausted buttons.

---

## Verification Tests

### Test 1: Exhausted Button Stop (Primary Fix)

1. Create a tag with 2-3 tracks
2. Play through all tracks until pool exhausts (badge shows 0)
3. While final track is playing, tap the exhausted button
4. **Expected:** Playback stops ✓

### Test 2: Exhausted Non-Playing Button (No Regression)

1. Same setup, exhaust the pool
2. Wait for track to finish (or stop manually via STOP button)
3. Tap the exhausted button
4. **Expected:** Nothing happens (shake animation, no playback)

### Test 3: Empty Button (No Regression)

1. Create a tag with zero tracks (or delete all tracks from a tag)
2. Tap the empty button
3. **Expected:** Nothing happens (button is non-interactive)

### Test 4: Normal Toggle (No Regression)

1. Create a tag with multiple tracks
2. Tap to play → playback starts
3. Tap again → playback stops
4. Repeat
5. **Expected:** Normal play/stop toggle works

---

## Build Status

- TypeScript: ✅ No errors
- ESLint: ✅ Clean

---

*The Crimson dragon returns the flame to the Blue. One-line fix, four acceptance criteria. Test well.*
