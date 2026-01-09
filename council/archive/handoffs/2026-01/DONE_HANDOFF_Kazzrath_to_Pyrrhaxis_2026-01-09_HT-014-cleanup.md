# Handoff: Kazzrath → Pyrrhaxis

**Date:** 2026-01-09
**From:** Kazzrath the Blue (QA)
**To:** Pyrrhaxis the Crimson (Code)
**Subject:** HT Round 4 fixes — code review and cleanup

---

## Summary

Human Testing Round 4 is complete. I applied quick fixes during QA to unblock testing. These fixes work but need your review before commit.

**Action Required:**
1. Review the fixes for correctness
2. Remove all DEBUG logging statements
3. Commit the changes

---

## Fixes Applied

### HT-014: content:// URI Import Fix

**Problem:** `getFileExtension()` extracted garbage from content:// URIs (e.g., `.documents/document/msf%3a33` instead of `.mp3`) because Android content URIs use opaque document IDs, not filenames.

**Solution:** Pass the picker's `file.name` through to validation, use it instead of URI for extension checking.

**Files Changed:**
- `src/services/import/validation.ts` — Added `fileName` parameter, content:// URI handling
- `src/services/import/index.ts` — Pass `file.name` from picker through to `importFromPath()`

### HT-008/009: Track Title Display Fix

**Problem:** Tracks showed `msf:33` as title because `extractMetadata()` parsed the content:// URI path instead of using the actual filename.

**Solution:** Pass the picker's `file.name` to `extractMetadata()` for content:// URIs.

**Files Changed:**
- `src/services/import/metadata.ts` — Added `displayFileName` parameter
- `src/services/import/index.ts` — Pass `fileName` to `extractMetadata()`

---

## DEBUG Logging to Remove

All debug statements are marked with clear attribution comments:

```
// DEBUG: Kazzrath HT-014 debugging - REMOVE BEFORE COMMIT
console.log(...)
// END DEBUG
```

**Files with DEBUG logging:**
1. `src/services/import/validation.ts` — Multiple checkpoints throughout `validateFilePath()`
2. `src/services/import/index.ts` — Throughout `pickAndImportTracks()` loop

**Removal strategy:** Search for `// DEBUG: Kazzrath` and delete the block including the `// END DEBUG` line.

---

## New Bugs for Your Queue

From HT Round 4 testing, two new bugs were discovered that need your attention:

### HT-016: Duplicate direct buttons allowed (Low)
- Can add same track to button board multiple times
- Recommendation: Add check in `addDirectButton()` or UI warning

### HT-017: Second direct button playback fails (High)
- Clicking second duplicate button shows error toast
- Error: `[BoardScreen] Playback error: An error occurred during playback.`
- Theory: TrackPlayer queue issue when playing same track from different button
- See full details in `council/qa/QA_REPORT_HT_ROUND4.md`

---

## QA Report Reference

Full test results and evidence: [qa/QA_REPORT_HT_ROUND4.md](../qa/QA_REPORT_HT_ROUND4.md)

---

## Suggested Commit Message

After review and cleanup:

```
fix(import): handle content:// URIs from Android document picker

HT-014: Pass fileName from picker for extension validation on content:// URIs
HT-008/009: Pass displayFileName to extractMetadata for proper title extraction

Content URIs use opaque document IDs (e.g., msf%3A33) instead of filenames,
so extension and metadata extraction must use the picker's name field.

Co-Authored-By: Kazzrath the Blue <qa@council.local>
```

---

*Prepared by Kazzrath the Blue*
