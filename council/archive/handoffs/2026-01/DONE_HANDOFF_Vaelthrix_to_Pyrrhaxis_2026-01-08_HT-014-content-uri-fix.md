# Handoff: HT-014 content:// URI Fix Implementation

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Crimson
**Date:** 2026-01-08
**Priority:** CRITICAL — Blocks human testing

---

## Architectural Decision

After reviewing Kazzrath's analysis, I've selected **Option C: Skip validation for content:// URIs**.

### Rationale

1. **Trust the picker**: If the user just selected a file from the document picker, it exists. Validating immediately after selection is redundant.

2. **Playback-time validation is sufficient**: If a file is later moved/deleted, we already have graceful error handling at playback time (`file_not_found` error path).

3. **No deprecated APIs**: Option B uses `getInfoAsync` which Expo has marked for removal.

4. **No storage bloat**: Option A doubles storage for every imported track.

---

## Implementation Specification

### Change 1: validation.ts

**File:** `src/services/import/validation.ts`
**Location:** Lines 66-76 (the file existence check block)

**Current code:**
```typescript
// Check file existence
// Note: For content URIs, expo-file-system File class handles them transparently
try {
  const file = new File(filePath);
  if (!file.exists) {
    return { isValid: false, error: 'File not found' };
  }
  // File class .exists returns false for directories, so no separate check needed
} catch {
  return { isValid: false, error: 'Unable to access file' };
}
```

**New code:**
```typescript
// Check file existence
// Note: content:// URIs from Android document picker are trusted - user just selected them
// The expo-file-system/next File class doesn't support content:// URIs
// For file:// URIs, validate existence with File class
if (!filePath.startsWith('content://')) {
  try {
    const file = new File(filePath);
    if (!file.exists) {
      return { isValid: false, error: 'File not found' };
    }
    // File class .exists returns false for directories, so no separate check needed
  } catch {
    return { isValid: false, error: 'Unable to access file' };
  }
}
// content:// URIs: trust the picker, validate at playback time if file is moved/deleted
```

---

### Change 2: player/index.ts

**File:** `src/services/player/index.ts`
**Location:** Lines 202-209 (`validateTrackFile` function)

**Current code:**
```typescript
async function validateTrackFile(track: Track): Promise<boolean> {
  try {
    const file = new File(track.filePath);
    return file.exists;
  } catch {
    return false;
  }
}
```

**New code:**
```typescript
async function validateTrackFile(track: Track): Promise<boolean> {
  // content:// URIs from Android document picker are trusted
  // The expo-file-system/next File class doesn't support content:// URIs
  if (track.filePath.startsWith('content://')) {
    return true;
  }

  // For file:// URIs, validate existence
  try {
    const file = new File(track.filePath);
    return file.exists;
  } catch {
    return false;
  }
}
```

---

## Testing Verification

After implementing, verify on device:

1. **Import flow**: Select audio files via document picker → should succeed
2. **Playback**: Tap a tag button or direct button → track should play
3. **Graceful failure**: If a previously imported track's file is deleted, playback should show "Track file not found" toast

---

## Files to Modify

| File | Change |
|------|--------|
| `src/services/import/validation.ts:66-76` | Skip File.exists for content:// |
| `src/services/player/index.ts:202-209` | Skip validateTrackFile for content:// |

---

## Commit Message Suggestion

```
fix: HT-014 skip File class validation for content:// URIs

expo-file-system/next File class doesn't support content:// URIs.
Trust document picker selections, validate file:// URIs only.
Graceful error handling at playback time catches moved/deleted files.
```

---

*Handed off by Vaelthrix the Astral*
