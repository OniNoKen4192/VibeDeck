# Handoff: Kazzrath → Pyrrhaxis

**Date:** 2026-01-09
**From:** Kazzrath the Blue (QA)
**To:** Pyrrhaxis the Crimson (Code)
**Subject:** HT-021 Fix — Exhausted button tap should stop playback

---

## Summary

During HT Round 7 testing, we discovered that tapping an exhausted tag button does nothing — even when the button is currently playing. The user expects tap-to-stop behavior to remain consistent regardless of pool state.

**QA Report:** [qa/QA_REPORT_HT_ROUND7.md](../qa/QA_REPORT_HT_ROUND7.md)

---

## Bug Description

### Current Behavior

1. Tap tag button → plays track, badge decrements (good)
2. Tap again → stops playback (good, toggle behavior)
3. Repeat until pool exhausts on final track
4. Button enters exhausted state while track is playing
5. Tap button → **nothing happens**
6. User must reach for STOP button instead

### Expected Behavior

Tapping a playing button should **always** stop playback, even if the pool is exhausted.

The toggle pattern (tap-to-play, tap-to-stop) is intuitive and established. Breaking it when exhausted creates cognitive friction.

---

## Root Cause (Suspected)

In `app/(tabs)/index.tsx`, the `handleButtonPress()` function likely has logic that returns early when the button is exhausted or empty, before checking if the button is currently playing.

---

## Fix

In `handleButtonPress()`, check if the button is currently playing **before** checking exhausted/empty state:

```typescript
const handleButtonPress = async (button: ButtonResolved) => {
  // ALWAYS allow stop action if this button is currently playing
  if (playingButtonId === button.id && isPlaying) {
    await playerStop();
    setPlayingButtonId(null);
    return;
  }

  // Now check if button can start playback
  if (button.isEmpty) {
    // No-op for empty buttons
    return;
  }

  if (button.type === 'tag' && button.poolExhausted) {
    // Pool exhausted, can't play new track
    // (But we already handled stop above, so this is safe)
    return;
  }

  // ... rest of play logic
};
```

The key insight: **stop action** and **play action** have different preconditions. Stop should always work if the button is playing. Play requires a non-empty, non-exhausted pool.

---

## Testing

After fix:

1. Create tag with 2-3 tracks
2. Play through all tracks until pool exhausts
3. While final track is playing, tap the exhausted button
4. **Verify:** Playback stops

---

## Files to Modify

| File | Change |
|------|--------|
| `app/(tabs)/index.tsx` | Reorder checks in `handleButtonPress()` — stop check first |

---

## Acceptance Criteria

- [ ] Tapping a playing button stops playback (even if exhausted)
- [ ] Tapping an exhausted button that is NOT playing does nothing (no regression)
- [ ] Tapping an empty button does nothing (no regression)
- [ ] Normal play/stop toggle still works for non-exhausted buttons

---

*The Blue dragon passes the flame to the Crimson. A small fix, but the happy ape neurons demand consistency.*
