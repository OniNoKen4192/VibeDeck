# Chatterwind's Safety Recommendations

> Reviewed by Chatterwind the Brass — 2026-01-04

---

## Overview

This document contains safety recommendations for VibeDeck's file system access patterns, reviewed before implementation of the track import service.

**Files Reviewed:**
- `src/db/queries/tracks.ts`
- `src/stores/useTrackStore.ts`
- `src/db/init.ts`
- `src/db/schema.ts`
- `src/types/index.ts`
- `src/constants/audio.ts`

---

## Findings: What's Already Safe

### No Network Code
The privacy constraint holds. No `fetch`, `XMLHttpRequest`, WebSocket, or external service calls present in the codebase.

### SQL Injection Protection
All database queries use parameterized statements with `?` placeholders. Example from `tracks.ts:47-48`:
```typescript
const row = await db.getFirstAsync<TrackRow>('SELECT * FROM tracks WHERE id = ?', [id]);
```

### UUID Generation
Primary keys use generated UUIDs rather than user-controlled input, preventing ID collision attacks.

### Foreign Key Cascades
Schema properly cascades deletes (`ON DELETE CASCADE`) so orphaned references don't accumulate when tracks or tags are removed.

---

## Concerns to Address

### MEDIUM: File Path Validation at Import

**Location:** `src/db/queries/tracks.ts` lines 63-82, `src/stores/useTrackStore.ts` lines 42-55

**Issue:** The `Track.filePath` field stores whatever string is passed to `insertTrack()` or `addTrack()`. No validation exists at the persistence layer.

**Risk:** Without validation, the import service could store:
- Non-existent paths
- Paths outside allowed directories
- Files with unsupported extensions
- Paths with directory traversal attempts (`../`)

**Recommendation:** The import service (`src/services/import/`) must:

1. **Verify file existence** before storing:
   ```typescript
   import * as FileSystem from 'expo-file-system';

   const info = await FileSystem.getInfoAsync(filePath);
   if (!info.exists || info.isDirectory) {
     throw new Error('Invalid file path');
   }
   ```

2. **Validate file extension** against allowed formats:
   ```typescript
   import { Audio } from '../constants/audio';

   const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'));
   if (!Audio.supportedFormats.includes(ext)) {
     throw new Error(`Unsupported format: ${ext}`);
   }
   ```

3. **Normalize paths** to prevent traversal:
   ```typescript
   // Reject paths containing suspicious patterns
   if (filePath.includes('..') || filePath.includes('//')) {
     throw new Error('Invalid path format');
   }
   ```

4. **Handle content URIs** appropriately if using Android SAF (see architectural questions below).

---

### MEDIUM: File Existence Check at Playback

**Location:** Future `src/services/audio/player.ts`

**Issue:** When the player attempts to play a track, the file may no longer exist (user deleted it externally, SD card removed, etc.).

**Risk:** Unhandled `ENOENT` errors could crash the app or leave it in a broken state.

**Recommendation:** The player service must:

1. **Check file existence** before attempting playback
2. **Handle missing files gracefully:**
   - Show user-friendly error ("Track not found")
   - Optionally mark track as unavailable in UI
   - Don't crash or hang
3. **Consider periodic library health checks** (optional stretch goal)

---

### LOW: filePath Updates Require Same Validation

**Location:** `src/db/queries/tracks.ts` lines 89-92

**Issue:** The `updateTrack()` function allows modifying `filePath`. If used for reimport or file relocation features, the same validation rules must apply.

**Recommendation:** Any code path that calls `updateTrack({ filePath: newPath })` must validate `newPath` using the same checks as initial import.

---

### LOW: Maximum Path Length

**Location:** Schema definition in `src/db/schema.ts`

**Issue:** SQLite `TEXT` fields have no length limit. Extremely long paths could cause UI rendering issues or memory problems.

**Recommendation:** Enforce a maximum path length at import time:
```typescript
const MAX_PATH_LENGTH = 1024;

if (filePath.length > MAX_PATH_LENGTH) {
  throw new Error('File path too long');
}
```

---

## Architectural Questions for Vaelthrix

These decisions affect how the import service should be built:

### 1. Content URIs vs File Paths

**Question:** On Android, will we use the Storage Access Framework (SAF) which returns `content://` URIs, or direct file system paths?

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| Content URIs (`content://`) | Works with scoped storage, future-proof, respects Android permissions | Requires persistent URI permissions, more complex to work with |
| Direct paths (`/storage/...`) | Simpler to use, works with legacy storage | May break on Android 11+, requires broad storage permissions |

**Recommendation:** Use SAF with content URIs for Android 10+ compatibility. Store the URI and take persistable permissions:
```typescript
// When user selects file via DocumentPicker
contentResolver.takePersistableUriPermission(uri, FLAG_GRANT_READ_URI_PERMISSION);
```

### 2. Copy vs Reference Strategy

**Question:** Should imported audio files be copied into app-controlled storage, or referenced in-place?

**Trade-offs:**

| Approach | Pros | Cons |
|----------|------|------|
| Copy to app storage | User can't break library by moving files, full control | Doubles storage usage, slow import for large libraries |
| Reference in-place | Fast import, no storage duplication | Files can disappear, user confusion if they reorganize music |

**Recommendation:** Reference in-place for MVP (simpler), but design the system to handle missing files gracefully. Consider copy-on-import as a future option in settings.

---

## Summary Checklist

Before the import service is considered complete, verify:

- [x] File existence validated before storing path
- [x] File extension checked against `Audio.supportedFormats`
- [x] Path normalized/sanitized (no `..`, no double slashes)
- [x] Maximum path length enforced
- [ ] Player handles missing files gracefully *(deferred to player service implementation)*
- [x] Architectural decision made: content URIs vs paths
- [x] Architectural decision made: copy vs reference

---

## Review: 2026-01-05

**Reviewed by:** Chatterwind the Brass

**Status:** APPROVED

### Implementation Review

Pyrrhaxis implemented the import service in `src/services/import/` with three modules:

| File | Purpose | Status |
|------|---------|--------|
| `validation.ts` | Path validation, sanitization, existence checks | Compliant |
| `metadata.ts` | Filename parsing, display helpers | Compliant |
| `index.ts` | Document picker integration, batch import | Compliant |

### Checklist Verification

**File existence validation** — Lines 72-82 of `validation.ts`:
- Uses `FileSystem.getInfoAsync()` to verify file exists
- Rejects directories explicitly
- Wraps in try/catch for inaccessible paths

**Extension whitelist** — Lines 60-68 of `validation.ts`:
- Checks against `Audio.supportedFormats`
- Returns user-friendly error listing supported formats

**Path sanitization** — Lines 55-58 of `validation.ts`:
- Rejects paths containing `..` (traversal)
- Rejects paths containing `//` (double slashes)

**Maximum path length** — Lines 51-53 of `validation.ts`:
- Enforces `MAX_PATH_LENGTH = 1024`
- Returns clear error message

**Privacy constraint** — Verified via grep search:
- No `fetch`, `XMLHttpRequest`, `WebSocket` calls
- No analytics, telemetry, or crash reporting
- All file access is local via `expo-file-system` and `expo-document-picker`

**Architectural decisions**:
- **Content URIs**: Supported via `expo-file-system` (see line 71 comment in `validation.ts`)
- **Reference-in-place**: Explicitly set via `copyToCacheDirectory: false` (line 136 of `index.ts`)

### Remaining Work

The **player service** must handle missing files gracefully when attempting playback. This is tracked as a separate task for when Pyrrhaxis implements the audio player.

### Notes for Seraphelle

Pyrrhaxis included excellent JSDoc comments with UI integration examples throughout. Key patterns:

- Call `validateFilePath()` before showing import confirmation
- Use `getDisplayTitle()` / `getDisplaySubtitle()` for track display
- Wire `pickAndImportTracks()` to the Import button with progress callback
- Show `ImportResult.error` in toasts for failures

---

*Reviewed and approved by Chatterwind the Brass. May these warnings save future-you from debugging at midnight.*
