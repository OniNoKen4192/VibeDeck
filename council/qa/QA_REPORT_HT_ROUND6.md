# Human Testing Round 6 - QA Report

**Date:** 2026-01-09
**Tester:** Project Lead (on-device)
**QA Dragon:** Kazzrath the Blue
**Device:** Android

---

## Summary

**Status:** COMPLETE — ALL MVP FEATURES PASS

| Test | Feature | Result | Notes |
|------|---------|--------|-------|
| 1 | BoardHeader (Reset + Settings icons) | PASS | Both icons functional |
| 2 | Reset All feature | PASS | Dialog, toast, badge refresh work |
| 3 | Long-press context menu | PASS | Bottom sheet with pin/remove |
| 4 | Pin toggle | PASS | Pin icon, sorting to top |
| 5 | AboutScreen | PASS | Opens, displays, closes |
| 6 | Empty tag button | PASS | Correct styling per spec |
| 7 | Regression: Import flow | PASS | Document picker works |
| 8 | Regression: Playback | PASS | Tag button plays track |

**New Bugs Filed:** 3 (HT-018, HT-019, HT-020)

---

## Test Protocol

### Test 1: BoardHeader

**Spec Reference:** UI_DESIGN.md §Board Screen Header

**Components:**
- Header height: 56px
- "VibeDeck" title: 20px bold, left-aligned
- Reset icon (⟳): Right side, 44×44px touch target
- Settings icon (⚙): Right edge, 44×44px touch target

**Steps:**
1. Launch app, ensure at least one button exists on Board
2. Observe header displays "VibeDeck" title on left
3. Observe refresh icon (⟳) is visible on right side
4. Observe gear/settings icon (⚙) is visible at right edge
5. Tap refresh icon — should open Reset confirmation dialog
6. Tap settings icon — should open About screen

**Pass if:** Both icons present, both functional.

---

### Test 2: Reset All Feature

**Spec Reference:** UI_DESIGN.md §Reset All Feature

**Prerequisite:** Have at least one tag with multiple tracks. Play some to reduce the count.

**Steps:**
1. Note the unplayed count badge on a tag button (e.g., shows "2" of 5)
2. Tap the reset icon (⟳) in header
3. Confirmation dialog should appear with:
   - Title: "Reset All Tracks?"
   - Body text about refilling pools, losing progress
   - Cancel button (gray/surface color)
   - Reset button (warning/amber color, NOT red)
4. Tap "Cancel" — dialog should close, counts unchanged
5. Tap reset icon again, then tap "Reset"
6. Observe:
   - Dialog closes
   - Success toast appears ("All tracks reset")
   - Haptic feedback (success notification)
   - Count badge refreshes to show full pool (e.g., back to "5")

**Pass if:** Confirmation works, warning color used, counts reset, toast + haptic.

---

### Test 3: Long-Press Context Menu

**Spec Reference:** UI_DESIGN.md §Long-Press Context Menu

**Steps:**
1. Long-press any button on the Board (hold for ~500ms)
2. Context menu (bottom sheet) should appear with:
   - Dimmed background overlay
   - Drag handle at top (horizontal bar)
   - Button name displayed
   - "Pin to Board" option with thumb-tack icon (if not pinned)
   - "Remove Button" option with trash icon (red text)
3. Observe haptic feedback on menu open
4. Tap outside the menu — should dismiss
5. Long-press again to re-open
6. Tap "Remove Button" — should show confirmation dialog

**Pass if:** Menu opens on long-press, haptic fires, contains expected options, dismissible.

---

### Test 4: Pin Toggle

**Spec Reference:** UI_DESIGN.md §Long-Press Context Menu, §Persistent Indicator

**Prerequisites:** Have at least 2 unpinned buttons on the Board.

**Steps:**
1. Note which button is at the top of the grid
2. Long-press a button that is NOT at the top
3. Tap "Pin to Board"
4. Menu should close
5. Board should refresh — pinned button should now appear at TOP
6. Observe small pin icon (📌) in top-left corner of the pinned button
7. Long-press the pinned button
8. Menu should show "Unpin from Board" instead of "Pin to Board"
9. Tap "Unpin from Board"
10. Button should move back to its original position (or lower than pinned buttons)
11. Pin icon should disappear

**Pass if:** Pin moves button to top, shows indicator, unpin moves back, text toggles.

---

### Test 5: AboutScreen

**Spec Reference:** UI_DESIGN.md §About / Settings Screen

**Steps:**
1. Tap the settings (⚙) icon in the Board header
2. Full-screen modal should slide up from bottom
3. Header shows "About VibeDeck" with close (✕) button
4. Content includes:
   - Music note icon
   - "VibeDeck" app name
   - "Version 1.0.0"
   - "How to Use" section with 4 numbered steps
   - "Understanding Played Tracks" section
   - "Pinned Buttons" section
5. Scroll down — content should scroll
6. Tap close (✕) button — modal should close
7. Open again, tap Android back button — should also close

**Pass if:** Opens, scrolls, displays all sections, closes via X and back button.

---

### Test 6: Empty Tag Button

**Spec Reference:** UI_DESIGN.md §Empty Tag Button State

**Prerequisites:** Create a new tag with NO tracks assigned.

**Steps:**
1. Go to Tags tab
2. Create a new tag (e.g., "EmptyTag")
3. Do NOT assign any tracks to it
4. Go to Board tab
5. Find the button for "EmptyTag"
6. Observe:
   - Button has gray/surface background (not tag color)
   - Button is at 50% opacity
   - Button has dashed border
   - Label shows "No Tracks" (not tag name)
   - NO count badge visible
   - Type indicator bar visible but dimmed (~30% opacity)
7. Tap the empty button — nothing should happen (no playback, no error)
8. Long-press the empty button — context menu SHOULD still open (to allow removal)

**Pass if:** Correct styling, "No Tracks" label, no-op on tap, long-press works.

---

### Test 7: Regression - Import Flow

**Steps:**
1. Go to Library tab
2. Tap Import button
3. Select audio file from device storage
4. Confirm import

**Pass if:** Track appears in library (HT-014, HT-008/009 fixes intact)

---

### Test 8: Regression - Playback

**Steps:**
1. Tap a tag button with tracks
2. Audio should play
3. "Now Playing" bar should show track info
4. Tap Stop button
5. Playback stops

**Pass if:** Basic playback flow works (HT-011, HT-017 fixes intact)

---

## Results

### Test 1: BoardHeader
**Status:** PASS
**Evidence:** Header displays with VibeDeck title, reset (⟳) and settings (⚙) icons both functional

---

### Test 2: Reset All Feature
**Status:** PASS
**Evidence:** Confirmation dialog appears, success toast shown, count badges reset correctly

---

### Test 3: Long-Press Context Menu
**Status:** PASS
**Evidence:** Long-press opens bottom sheet with pin/remove options

---

### Test 4: Pin Toggle
**Status:** PASS
**Evidence:** Pin/unpin works, pinned button shows pin icon, sorts to top of grid

---

### Test 5: AboutScreen
**Status:** PASS
**Evidence:** Opens from settings icon, displays correctly

---

### Test 6: Empty Tag Button
**Status:** PASS (with UX issue noted)
**Evidence:** Gray surface, dashed border, "No Tracks" label, 50% opacity — all correct per spec. UX issue HT-020 filed for identity loss.

---

### Test 7: Regression - Import Flow
**Status:** PASS
**Evidence:** Track imported successfully via document picker

---

### Test 8: Regression - Playback
**Status:** PASS
**Evidence:** Tag button plays track correctly after re-import

---

## New Bugs Discovered

### HT-018: Playback error after app restart (Suspected)

**Severity:** Medium (workaround exists)
**Symptom:** "An error occurred during playback" on track that previously played
**Suspected Cause:** Android content:// URI permissions expire after app restart
**Workaround:** Delete and re-import the track
**Root Fix:** Copy audio files to app storage on import (deferred — architectural change)

**Confirmed:** Delete and re-import restores playback — URI permission issue verified

---

### HT-019: Tag track count not updated after track deletion

**Severity:** Medium (UI inconsistency)
**Symptom:** Tags screen shows "1" track count for tag after the associated track was deleted
**Expected:** Count should update to "0" when track is deleted
**Root Cause:** `useTrackStore.deleteTrack()` does not notify `useTagStore` to refresh counts
**Location:** `src/stores/useTrackStore.ts:86-91`
**Fix:** Add cross-store call: `useTagStore.getState().loadTags()` after track deletion
**Workaround:** Navigate away from Tags tab and back (forces reload)

---

### HT-020: Empty tag buttons lose identity (UX/Design)

**Severity:** Low (UX confusion)
**Symptom:** Multiple empty tag buttons all show "No Tracks" — impossible to tell which tag is which
**Screenshot:** Two buttons both labeled "No Tracks" with no distinguishing info
**Current Spec:** UI_DESIGN.md §Empty Tag Button State says label = "No Tracks"
**Suggested Fix:** Show tag name with empty indicator, e.g., "EDM (empty)" or keep tag name + show "No Tracks" as subtitle
**Assignee:** Seraphelle (design review)

---

*Report maintained by Kazzrath the Blue*
