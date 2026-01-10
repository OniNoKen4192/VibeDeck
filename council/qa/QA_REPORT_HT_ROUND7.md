# Human Testing Round 7 - QA Report

**Date:** 2026-01-09
**Tester:** Project Lead (on-device)
**QA Dragon:** Kazzrath the Blue
**Device:** Android
**Focus:** HT-018 (SAF Permissions), HT-019 (Cross-store refresh), HT-020 (Empty button UX)

---

## Summary

**Status:** COMPLETE — ALL PASS (7/7), 1 new bug filed

| Test | Feature | Result | Notes |
|------|---------|--------|-------|
| 1 | Playback survives app restart (HT-018) | PASS | Force-stop + relaunch worked |
| 2 | Playback survives device reboot (HT-018) | PASS | Cold boot + relaunch worked |
| 3 | Tag count updates after track deletion (HT-019) | PASS | Count correct after deletion |
| 4 | Button count updates after track deletion (HT-019) | PASS | Badge correct after deletion |
| 5 | Permission released on track deletion | PASS | Implicit (no errors during test flow) |
| 6 | Regression: Import flow | PASS | Exercised during Tests 1-4 |
| 7 | Regression: Playback | PASS | Exercised during Tests 1-4 |

**New Bugs Filed:** 1 (HT-021)

---

## Pre-Test Requirements

**IMPORTANT:** This round requires a fresh development build to include the native module.

### Build Steps

```bash
# From project root
npx expo run:android
```

If you encounter build errors, ensure:
- Android SDK is properly configured
- Java 17+ is installed
- `modules/expo-saf-uri-permission/` directory exists with all files

---

## Test Protocol

### Test 1: Playback Survives App Restart (HT-018 - Critical)

**Objective:** Verify that content:// URIs from document picker remain playable after app restart.

**Precondition:** Fresh install or cleared app data (ensures no stale permissions).

**Steps:**

1. Launch app
2. Go to Library tab
3. Tap Import button
4. Select 2-3 audio files from device storage (NOT from cloud/network locations)
5. Confirm tracks appear in Library
6. Go to Board tab (if buttons don't exist, create tag buttons for testing)
7. Tap a tag button to play a track
8. Verify audio plays successfully
9. **Force-stop the app:**
   - Android Settings > Apps > VibeDeck > Force Stop
   - OR: Swipe away from recents (varies by device)
10. Relaunch VibeDeck
11. Go to Board tab
12. Tap the same button to play
13. **Observe:** Does the track play successfully?

**Pass if:** Track plays without error after app restart.

**Fail if:** "An error occurred during playback" message appears.

---

### Test 2: Playback Survives Device Reboot (HT-018 - Extended)

**Objective:** Verify permissions persist across device reboot.

**Precondition:** Test 1 passed.

**Steps:**

1. With tracks successfully playing from Test 1
2. Reboot the device (full power cycle)
3. Launch VibeDeck after reboot
4. Navigate to Board tab
5. Tap a button to play a track

**Pass if:** Track plays successfully after device reboot.

**Fail if:** Playback error appears.

**Note:** If Test 1 fails, skip this test.

---

### Test 3: Tag Count Updates After Track Deletion (HT-019)

**Objective:** Verify Tags screen shows correct count after track deletion.

**Precondition:** Have at least one tag with 2+ tracks.

**Steps:**

1. Go to Tags tab
2. Note the track count for a tag (e.g., "EDM" shows "3 tracks")
3. Go to Library tab
4. Find a track that has the observed tag
5. Tap the track to open detail modal
6. Delete the track (via delete button)
7. **Stay on Library tab** - do NOT navigate away
8. Navigate to Tags tab
9. **Observe:** Does the tag count reflect the deletion?

**Pass if:** Tag count decreased by 1 (e.g., "EDM" now shows "2 tracks").

**Fail if:** Count still shows old value (stale).

---

### Test 4: Button Count Updates After Track Deletion (HT-019)

**Objective:** Verify Board button badges update after track deletion.

**Precondition:** Have a tag button with 2+ tracks, all marked as unplayed.

**Steps:**

1. Go to Board tab
2. Note the count badge on a tag button (e.g., shows "3")
3. Go to Library tab
4. Delete a track that has the tag associated with that button
5. Navigate back to Board tab
6. **Observe:** Does the count badge reflect the deletion?

**Pass if:** Count badge decreased by 1 (e.g., now shows "2").

**Fail if:** Count still shows old value OR button state is inconsistent.

---

### Test 5: Permission Released on Track Deletion

**Objective:** Verify the app releases URI permissions when tracks are deleted.

**Note:** This is a silent/internal behavior. We verify indirectly by ensuring no errors accumulate.

**Steps:**

1. Import 5+ tracks
2. Play each track once to verify they all work
3. Delete all 5 tracks one by one
4. Import 5 new tracks
5. Verify all new tracks play successfully
6. (Optional) If you have 512+ tracks, verify no "too many permissions" errors

**Pass if:** All operations complete without permission-related errors.

**Fail if:** Permission errors appear after deleting and re-importing tracks.

---

### Test 6: Regression - Import Flow

**Objective:** Ensure import still works correctly.

**Steps:**

1. Go to Library tab
2. Tap Import
3. Select a new audio file
4. Confirm import succeeds
5. Verify metadata (title, artist) displays correctly

**Pass if:** Track imports and displays with proper metadata.

---

### Test 7: Regression - Playback

**Objective:** Ensure basic playback flow still works.

**Steps:**

1. Tap a tag button
2. Audio plays
3. Now Playing bar shows track info
4. Tap Stop button
5. Playback stops

**Pass if:** Complete playback cycle works.

---

## Optional: Diagnostic Tests

### Diagnostic A: List Persisted Permissions (Debug Only)

If you need to verify permissions programmatically:

1. Open React Native debugger (shake device > Debug)
2. In console, run:
   ```javascript
   import { listPersistedPermissions } from './modules/expo-saf-uri-permission/src';
   const perms = await listPersistedPermissions();
   console.log('Persisted URIs:', perms);
   ```
3. Verify imported track URIs appear in the list

---

## Results

### Test 1: Playback Survives App Restart
**Status:** PASS
**Evidence:** Cleared all data, re-imported track, associated tag, played successfully. Force-stopped app via Android settings. Relaunched — played flag persisted (expected). Used Reset All to clear played bit. Track played successfully after app restart.

---

### Test 2: Playback Survives Device Reboot
**Status:** PASS
**Evidence:** Full device shutdown, cold boot. Launched app, reset played bit, track played successfully. SAF persistent permissions confirmed working across device reboot.

---

### Test 3: Tag Count Updates After Track Deletion
**Status:** PASS
**Evidence:** Deleted track, navigated to Tags tab — count reflected deletion correctly. Cross-store refresh working.

---

### Test 4: Button Count Updates After Track Deletion
**Status:** PASS
**Evidence:** Deleted track, Board button badge updated correctly. Cross-store refresh working for buttons.

---

### Test 5: Permission Released on Track Deletion
**Status:** PASS (Implicit)
**Evidence:** No permission-related errors during testing. Import/delete/re-import cycles completed without issues.

---

### Test 6: Regression - Import Flow
**Status:** PASS
**Evidence:** Import flow exercised multiple times during Tests 1-4. Tracks imported successfully with correct metadata.

---

### Test 7: Regression - Playback
**Status:** PASS
**Evidence:** Playback flow exercised throughout testing. Play, stop, toggle all working. HT-021 filed for exhausted state edge case.

---

## New Bugs Discovered

### HT-021: Exhausted button tap doesn't stop playback

**Severity:** Medium (UX inconsistency, workaround exists)

**Symptom:** When a tag button exhausts its pool while playing, tapping the button again does nothing. User expects tap-to-stop behavior to continue working.

**Reproduction:**
1. Have a tag with 3 tracks
2. Tap button → plays track 1, badge shows "2"
3. Tap button → stops playback (toggle behavior, good)
4. Tap button → plays track 2, badge shows "1"
5. Tap button → stops playback (toggle behavior, good)
6. Tap button → plays track 3, badge shows "0", button enters exhausted state
7. Tap button → **nothing happens** (expected: stop playback)

**Expected:** Tapping a playing button should always stop playback, even if exhausted.

**Workaround:** Use the STOP button in playback controls.

**Root Cause (suspected):** `onPress` handler returns early when `poolExhausted` is true, but should still allow stop action if button is currently playing.

**Location:** `app/(tabs)/index.tsx` — `handleButtonPress()` function

---

## Notes

- HT-020 (empty tag button identity) is a UX/design decision pending Seraphelle review. No code changes were made for HT-020 in this sprint.
- The SAF permissions module (`modules/expo-saf-uri-permission/`) is a native Kotlin module that requires a development build (not Expo Go).

---

*Report maintained by Kazzrath the Blue*
