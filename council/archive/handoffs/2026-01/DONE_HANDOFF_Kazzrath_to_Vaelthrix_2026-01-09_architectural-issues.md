# Handoff: Kazzrath → Vaelthrix

**Date:** 2026-01-09
**From:** Kazzrath the Blue (QA)
**To:** Vaelthrix the Astral (Architecture)
**Subject:** HT Round 4 architectural issues requiring design review

---

## Summary

Human Testing Round 4 revealed issues that need architectural consideration before implementation. These aren't quick fixes — they involve store subscriptions, cross-store reactivity, and TrackPlayer state management.

---

## Issue 1: HT-015 — Board doesn't refresh on tag-track association changes

**Severity:** Medium (UX issue, workaround exists)

**Observed Behavior:**
1. User creates tag "EDM" in Tags screen
2. Tag button appears on Board (correct)
3. User assigns track to "EDM" tag in Library
4. Board's EDM button still shows 0 tracks (incorrect)
5. User adds track as direct button
6. Board refreshes, EDM button now correctly shows 1 track

**Root Cause Analysis:**
- Board screen subscribes to `useButtonStore.buttons` (line 36, 117 in `src/screens/Board/index.tsx`)
- When tag-track association changes in Library, the `track_tags` table updates
- But `buttons` array doesn't change, so Board doesn't re-render/re-resolve
- The tag button's `availableCount` is computed from `track_tags` during resolution
- Stale data until something triggers button store change

**Current Workaround:** Navigate away from Board and back, or trigger any button store update.

**Architectural Options:**

1. **Re-resolve on tab focus (Simple)**
   - Board calls `resolveButtons()` in `useFocusEffect`
   - Pros: Simple, covers all staleness cases
   - Cons: Extra queries every tab switch, even when nothing changed

2. **Tag store emits association change event (Reactive)**
   - Add `lastAssociationChange` timestamp to tag store or a dedicated event emitter
   - Board subscribes to this in addition to buttons
   - Pros: Targeted updates, reactive pattern
   - Cons: Cross-store coupling, new subscription

3. **Button store tracks dependency timestamp (Hybrid)**
   - Button store includes `lastTagAssociationChange` in state
   - Tag operations (`setTagsForTrack`, `addTagToTrack`, `removeTagFromTrack`) update this
   - Board's subscription to buttons triggers on timestamp change
   - Pros: Single subscription point
   - Cons: Button store knows about tag operations

4. **Invalidation pattern**
   - Tag operations call `buttonStore.invalidate()` which sets a dirty flag
   - Board checks dirty flag and re-resolves
   - Similar to option 3 but more explicit

**Recommendation:** I lean toward option 1 for MVP simplicity, but this is your call. The UX impact is that users might see stale counts for a moment until they tap the Board tab.

---

## Issue 2: HT-017 — TrackPlayer state when playing duplicate track buttons

**Severity:** High (blocks playback)

**Observed Behavior:**
1. User adds track "Sandstorm" as direct button (Button A)
2. User adds same track "Sandstorm" as another direct button (Button B)
3. User taps Button A — plays correctly
4. User taps Button B — error toast: "An error occurred during playback"

**Error Log:**
```
ERROR  [BoardScreen] Playback error: An error occurred during playback.
```

**Questions for Architecture:**

1. **Should duplicate direct buttons be allowed?**
   - Use case: User wants same track accessible in different board positions
   - If yes, TrackPlayer needs to handle playing same URI from different triggers
   - If no, prevent duplicates in `addDirectButton()`

2. **TrackPlayer queue state investigation needed:**
   - Is the track already in queue from Button A?
   - Does TrackPlayer reject adding duplicate URIs?
   - Is content:// URI access being revoked after first play?
   - Should we clear queue before each direct button play?

3. **Related to HT-016 (Low):** The UI allows adding duplicates. If we decide duplicates are invalid, add validation in `addDirectButton()`.

**Files to Investigate:**
- `src/services/player/index.ts` — TrackPlayer wrapper
- `src/stores/buttonStore.ts` — `addDirectButton()` function
- `src/screens/Board/index.tsx` — Button press handler

---

## Context Files

- **QA Report:** [qa/QA_REPORT_HT_ROUND4.md](../qa/QA_REPORT_HT_ROUND4.md)
- **Board Screen:** `src/screens/Board/index.tsx`
- **Button Store:** `src/stores/buttonStore.ts`
- **Tag Queries:** `src/db/queries/trackTags.ts`
- **Player Service:** `src/services/player/index.ts`

---

## QuestBoard Updates Needed

After your review, please update QuestBoard.md with:
- Chosen approach for HT-015
- Decision on duplicate buttons (HT-016/HT-017)
- Implementation assignments

---

*Prepared by Kazzrath the Blue*
