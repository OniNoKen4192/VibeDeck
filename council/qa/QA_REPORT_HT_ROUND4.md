# Human Testing Round 4 - QA Report

**Date:** 2026-01-09
**Tester:** Project Lead (on-device)
**QA Dragon:** Kazzrath the Blue
**Device:** Android

---

## Summary

**Status:** COMPLETE

| Test | Bug | Result | Notes |
|------|-----|--------|-------|
| 1 | HT-011: TrackPlayer crash | PASS | No crashes on volume slider |
| 2 | HT-014: content:// URI import | PASS | Fixed with fileName param |
| 3 | HT-008/009: URL-encoded titles | PASS | Fixed with displayFileName param |
| 4 | HT-012: Tag button playback | PASS* | *Caveat: HT-015 discovered |
| 5 | Direct button playback | PARTIAL | HT-016, HT-017 discovered |

**New Bugs Filed:** 3 (HT-015, HT-016, HT-017)

**Fixes Applied This Session:**
- HT-014: Pass `fileName` from picker to `validateFilePath()` for content:// URI extension checking
- HT-008/009: Pass `displayFileName` to `extractMetadata()` for content:// URI title extraction

**Cleanup Required:** Remove DEBUG logging from validation.ts and index.ts before commit (marked with attribution comments)

---

## Verified Fixes

### HT-011: TrackPlayer Initialization
**Status:** PASS
**Previous Issue:** App crashed on volume slider interaction with "No task registered for key TrackPlayer"
**Fix:**
- Created `src/services/player/playbackService.ts` for background service
- Created `index.js` custom entry point with service registration before React
- Added initialization guard for "already initialized" case
**Evidence:** Volume slider interactions stable, no crashes on repeated use

---

### HT-014: content:// URI Import
**Status:** PASS
**Previous Issue:** Import failed because expo-file-system File class doesn't support content:// URIs
**Root Cause:** `getFileExtension()` looked for last `.` in path, but content:// URIs have opaque document IDs (e.g., `msf%3A33`) instead of filenames. Function extracted garbage like `.documents/document/msf%3a33`.
**Fix:**
1. `validateFilePath()` now accepts optional `fileName` parameter
2. For content:// URIs, uses `fileName` instead of `filePath` for extension checking
3. `importFromPath()` updated to accept and pass `fileName`
4. `pickAndImportTracks()` now passes `file.name` from picker result
**Evidence:** Track imports successfully, appears in Library with correct filename

**Debug Logging Added (TEMPORARY):**
Files `validation.ts` and `index.ts` contain console.log statements marked with:
```
// DEBUG: Kazzrath HT-014 debugging - REMOVE BEFORE COMMIT
```
Pyrrhaxis to remove during code review.

---

### HT-008/009: Track Title Display
**Status:** PASS
**Previous Issue:** Titles showed `msf:33` instead of actual filename (originally reported as URL-encoded strings)
**Root Cause:** `extractMetadata()` was parsing the content:// URI path instead of using the picker's `file.name`
**Fix:**
1. `extractMetadata()` now accepts optional `displayFileName` parameter
2. `importFromPath()` passes `fileName` to `extractMetadata()`
3. For content:// URIs, uses the picker's filename for metadata extraction
**Evidence:** Track displays as "Sandstorm - Darude" with artist "Darude" correctly

---

### HT-012: Tag Button Playback
**Status:** PASS (with caveat)
**Previous Issue:** Couldn't test - blocked by HT-011 crash
**Result:** Tag button plays tracks correctly once the Board knows about the tag assignment.
**Evidence:** EDM tag button played track after Board refresh

**New Bug Discovered: HT-015 — Board doesn't refresh on tag-track association changes**
- **Severity:** Medium (UX issue, workaround exists)
- **Observed:** Assigned tag "EDM" to track in Library. Board's EDM button showed empty (no tracks). Adding the track as a direct button caused the Board to refresh, and then EDM button correctly showed 1 track and played.
- **Root Cause:** Board screen subscribes to `useButtonStore.buttons` changes (line 36, 117 in index.tsx). When a tag-track association is created/modified in Library, the `track_tags` table updates but `buttons` array doesn't change, so Board doesn't re-resolve.
- **Workaround:** Navigate away from Board and back, or any action that triggers button store change.
- **Recommendation:** Flagged for Vaelthrix architectural review. Options:
  1. Board re-resolves on tab focus (simple)
  2. Tag store emits event on association change that Board subscribes to (reactive)
  3. Button store tracks a "lastTagAssociationChange" timestamp as dependency

---

### Direct Button Playback
**Status:** PARTIAL PASS
**Result:** First direct button plays correctly. Second direct button (duplicate of same track) errors.
**Evidence:** First "Sandstorm - Darude" button played; second showed error toast

---

## New Bugs Discovered

### HT-016: Duplicate direct buttons allowed for same track
**Severity:** Low (UX issue)
**Observed:** Can add same track to button board multiple times via "Add to Board" in Track Detail
**Expected:** Either prevent duplicates, or allow them intentionally (user choice)
**Recommendation:** Pyrrhaxis to add check in `addDirectButton()` or UI to warn/prevent

### HT-017: Second direct button playback fails
**Severity:** High (blocks playback)
**Observed:** Clicking second "Sandstorm - Darude" button shows error toast: "An error occurred during playback"
**Error log:**
```
ERROR  [BoardScreen] Playback error: An error occurred during playback.
```
**Call stack points to:** `registerPlaybackErrorCallback` in `index.tsx` receiving error from `TrackPlayer.addEventListener` in `src/services/player/index.ts`
**Root Cause Theory:** May be related to TrackPlayer queue management — trying to play same track that's already playing/queued, or content:// URI access issue on second play attempt.
**Recommendation:** Pyrrhaxis to investigate TrackPlayer state when switching between buttons playing same track

---

## Test Protocol

### Test 1: HT-011 - TrackPlayer Initialization
1. Launch app
2. Interact with volume slider multiple times
3. Navigate between tabs
4. Return to Board, interact with volume slider again
**Pass if:** No crash, no "No task registered" warning

### Test 2: HT-014 - content:// URI Import
1. Go to Library tab
2. Tap Import button
3. Select audio file(s) from device storage
4. Confirm import
**Pass if:** Tracks appear in library list

### Test 3: HT-008/009 - Track Title Display
1. After importing, check track titles in Library
2. Open Track Detail modal
3. Check "Now Playing" bar when playing
**Pass if:** Human-readable titles, no %20/%2F/raw%3A visible

### Test 4: HT-012 - Tag Button Playback
1. Create a new tag
2. Assign imported track(s) to the tag
3. Go to Board tab
4. Tap the tag button
**Pass if:** Random track plays, button shows playing state

### Test 5: Direct Button Playback
1. Open Track Detail for any track
2. Tap "Add to Board"
3. Go to Board tab
4. Tap the direct button
**Pass if:** Correct track plays

---

*Report maintained by Kazzrath the Blue*
