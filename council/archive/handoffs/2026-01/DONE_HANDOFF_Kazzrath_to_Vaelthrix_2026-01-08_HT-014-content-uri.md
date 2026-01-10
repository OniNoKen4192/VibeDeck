# Handoff: HT-014 expo-file-system/next doesn't support content:// URIs

**From:** Kazzrath the Blue
**To:** Vaelthrix the Astral
**Date:** 2026-01-08
**Related Quest:** [QuestBoard - Human Testing Round 4](../QuestBoard.md)

---

## Context

After HT-013 was fixed (correct import path to `/next`), import is still failing silently. Investigation revealed that the `expo-file-system/next` File class does not support `content://` URIs, which is what Android's document picker returns when `copyToCacheDirectory: false`.

This is a fundamental API limitation, not a code bug.

## What Was Done

- Verified HT-013 fix is in place (import path corrected)
- Traced import flow to identify failure point
- Researched expo-file-system/next File class limitations
- Confirmed `content://` URI incompatibility via Expo GitHub issues

## The Problem

**Current flow:**
1. Document picker with `copyToCacheDirectory: false` returns `content://...` URI
2. `validateFilePath()` creates `new File(contentUri)`
3. `file.exists` check fails silently (File class doesn't understand content:// scheme)
4. Validation returns `{ isValid: false, error: 'File not found' }` or catches error silently
5. Import fails with no user feedback

**Evidence:**
- [GitHub Issue #9354: content:// URIs not usable](https://github.com/expo/expo/issues/9354)
- [Expo FileSystem docs](https://docs.expo.dev/versions/latest/sdk/filesystem/) state the API "primarily takes `file://` URIs"

## What's Next — Architectural Decision Required

Three options for Vaelthrix to evaluate:

### Option A: Copy files to cache (Simplest)
```typescript
// In src/services/import/index.ts
const result = await DocumentPicker.getDocumentAsync({
  type: mimeTypes,
  multiple: true,
  copyToCacheDirectory: true, // Changed from false
});
```
**Pros:** Works immediately, no API changes needed
**Cons:** Duplicates storage (files exist in both original location and cache)

### Option B: Use legacy getInfoAsync for validation
```typescript
// In src/services/import/validation.ts
import * as FileSystem from 'expo-file-system';

// Replace File class check with:
const info = await FileSystem.getInfoAsync(filePath);
if (!info.exists) {
  return { isValid: false, error: 'File not found' };
}
```
**Pros:** Keeps reference-in-place architecture, legacy API supports content://
**Cons:** Uses deprecated API (may be removed in future Expo versions)

### Option C: Skip file existence validation for content:// URIs
```typescript
// Trust the picker - if user selected it, it exists
if (filePath.startsWith('content://')) {
  // Skip existence check, proceed to import
  return { isValid: true };
}
// Only validate file:// URIs with File class
```
**Pros:** No storage duplication, no deprecated APIs
**Cons:** Less defensive, could fail at playback time if file is moved/deleted

## Key Files

- `src/services/import/index.ts:121` — `copyToCacheDirectory: false` setting
- `src/services/import/validation.ts:68-76` — File existence check that fails
- `src/services/player/index.ts:194-201` — Also uses File class for playback validation

## Gotchas / Notes

- The player service also uses `File` class for pre-playback validation
- If Option A is chosen, player validation may still fail on old tracks imported with content:// URIs
- If Option B is chosen, both validation.ts AND player/index.ts need the legacy API
- HT-007 was "fixing" a deprecation warning, but the new API has less functionality
- This is the third import-related critical bug (HT-007 → HT-013 → HT-014)

## Recommendation

Option B (legacy getInfoAsync) seems most appropriate:
- Maintains reference-in-place architecture (no storage bloat)
- The deprecation is a warning, not removal — we have time
- Can revisit when Expo provides content:// support in the new API

However, this is an architectural decision that should come from Vaelthrix.

---

*Handed off by Kazzrath the Blue*
