# Handoff: HT-007 & HT-006 Bug Fixes

**Status:** ✅ COMPLETE
**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Crimson
**Date:** 2026-01-08
**Completed:** 2026-01-08
**Commit:** 249f459
**Related Quest:** Human Testing Round 2 fixes

---

## Context

Human Testing Round 2 discovered that track import is completely broken due to a deprecated expo-file-system API (HT-007), and the Board screen doesn't refresh when buttons are added/removed (HT-006). HT-007 is CRITICAL and blocks all import testing.

## What Was Done

- Analyzed all `getInfoAsync` usage in codebase (2 call sites found)
- Researched Expo SDK 54 new File/Directory API
- Designed migration architecture (migrate to new API, no legacy imports)
- Documented the migration pattern below

## What's Next

### HT-007: expo-file-system Migration (CRITICAL)

Migrate from deprecated `getInfoAsync` to new `File` class API.

**File 1:** `src/services/import/validation.ts`

Replace lines 6 and 66-78:

```typescript
// OLD (line 6):
import * as FileSystem from 'expo-file-system';

// NEW:
import { File } from 'expo-file-system';
```

```typescript
// OLD (lines 66-78):
try {
  const info = await FileSystem.getInfoAsync(filePath);
  if (!info.exists) {
    return { isValid: false, error: 'File not found' };
  }
  if (info.isDirectory) {
    return { isValid: false, error: 'Path is a directory, not a file' };
  }
} catch {
  return { isValid: false, error: 'Unable to access file' };
}

// NEW:
try {
  const file = new File(filePath);
  if (!file.exists) {
    return { isValid: false, error: 'File not found' };
  }
  // File class .exists returns false for directories, so no separate check needed
  // But verify with info() if paranoid:
  // const info = file.info();
  // if (info?.type === 'directory') { ... }
} catch {
  return { isValid: false, error: 'Unable to access file' };
}
```

**File 2:** `src/services/player/index.ts`

Replace lines 13 and 194-201:

```typescript
// OLD (line 13):
import * as FileSystem from 'expo-file-system';

// NEW:
import { File } from 'expo-file-system';
```

```typescript
// OLD (lines 194-201):
async function validateTrackFile(track: Track): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(track.filePath);
    return info.exists && !info.isDirectory;
  } catch {
    return false;
  }
}

// NEW:
async function validateTrackFile(track: Track): Promise<boolean> {
  try {
    const file = new File(track.filePath);
    return file.exists;
  } catch {
    return false;
  }
}
```

**Note:** The new `file.exists` is a synchronous property, but we keep the function async for API consistency.

### HT-006: Board Screen Subscription

**File:** `app/(tabs)/index.tsx`

The Board screen loads buttons once on mount but doesn't react to button store changes. When a new tag is created (which auto-creates a button), the board doesn't update.

**Fix:** Subscribe to `useButtonStore.buttons` and trigger reload when it changes.

Look at lines 102-116 — the `useEffect` with `[resolveAllButtons]` dependency needs to also depend on the raw buttons array from the store.

```typescript
// Add this near other store subscriptions:
const buttons = useButtonStore((state) => state.buttons);

// Update the useEffect dependency array:
useEffect(() => {
  loadResolvedButtons();
}, [resolveAllButtons, buttons]); // Add buttons dependency
```

This ensures the board re-resolves whenever the underlying button collection changes.

## Key Files

- `src/services/import/validation.ts` — File validation for track import (HT-007)
- `src/services/player/index.ts` — Pre-playback file validation (HT-007)
- `app/(tabs)/index.tsx` — Board screen button loading (HT-006)

## Gotchas / Notes

1. **Content URIs**: The new `File` class handles Android `content://` URIs transparently. No special handling needed.

2. **Synchronous exists**: Unlike `getInfoAsync` which was async, `file.exists` is synchronous. This is actually simpler.

3. **Directory detection**: The old API returned `isDirectory: true`. The new File class's `.exists` returns `false` for directories when instantiated as a File. If you need explicit directory checking, use `file.info()?.type === 'directory'`.

4. **Testing HT-007**: After fix, verify:
   - Import files via document picker (content:// URIs work)
   - Playback validates files exist before playing
   - Missing file shows proper error toast

5. **Testing HT-006**: After fix, verify:
   - Create new tag on Tags screen
   - Switch to Board screen — new button should appear immediately
   - Delete tag — button should disappear from Board

---

*Handed off by Vaelthrix the Astral*
