# Handoff: HT-013 expo-file-system Import Path Regression

**From:** Kazzrath the Blue → Vaelthrix the Astral → **Pyrrhaxis the Crimson**
**Date:** 2026-01-08
**Related Quest:** [QuestBoard - Priority #10](../QuestBoard.md)
**Status:** Routed for implementation

---

## Context

During Human Testing Round 4, track import began failing silently. Investigation revealed a regression introduced in the HT-007 fix: the `File` class is being imported from the wrong module path.

## What Was Done

- HT-011 verified: TrackPlayer service + initialization guard working correctly
- Discovered import regression during HT-008/009 verification attempt
- Root cause identified and documented
- QuestBoard updated with blocker status

## What's Next

- Route this fix to Pyrrhaxis
- Fix requires changing 2 import statements
- After fix, Human Testing Round 4 can resume (HT-008, HT-009, HT-013 verification)

## Key Files

- `src/services/import/validation.ts:6` — File existence check for import validation
- `src/services/player/index.ts:13` — File existence check before playback

## The Problem

**Current (broken):**
```typescript
import { File } from 'expo-file-system';
```

**Required (working):**
```typescript
import { File } from 'expo-file-system/next';
```

The new `File` class API in expo-file-system v19+ lives in the `/next` submodule, not the main export. The main export doesn't have a `File` class, causing silent failures when trying to use `new File(path).exists`.

## Evidence

- Import works but `File` is likely undefined or a different class
- No error thrown, validation silently fails
- No logs produced (try-catch swallows the error at line 74 in validation.ts)
- User sees no feedback when import fails

## Reference

- [Expo FileSystem docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo File System SDK 54 blog post](https://expo.dev/blog/expo-file-system)

## Gotchas / Notes

- This is a regression from commit 249f459 (HT-007 fix)
- The original HT-007 migration was necessary because `getInfoAsync` was deprecated
- TypeScript didn't catch this because the import doesn't fail, it just imports nothing useful
- Consider adding a runtime check or explicit type guard to catch this class of error in the future

---

## Implementation Instructions (Pyrrhaxis)

This is a two-line fix. Both changes are identical — correcting the import path.

### Step 1: Fix validation.ts

**File:** `src/services/import/validation.ts`
**Line:** 6

```diff
- import { File } from 'expo-file-system';
+ import { File } from 'expo-file-system/next';
```

### Step 2: Fix player/index.ts

**File:** `src/services/player/index.ts`
**Line:** 13

```diff
- import { File } from 'expo-file-system';
+ import { File } from 'expo-file-system/next';
```

### Step 3: Verify

1. Run `npx expo start` — ensure no import/compile errors
2. Test on device: navigate to Library, tap Import
3. Select an audio file — should succeed without silent failure
4. Verify track appears in library with proper metadata

### Commit Message

```
fix: HT-013 correct expo-file-system/next import path

The File class API lives in expo-file-system/next, not the main
module. Regression from HT-007 migration (249f459).
```

### After Fix

- Mark HT-013 complete in QuestBoard
- Human Testing Round 4 can proceed (HT-008, HT-009 verification)
- Archive this handoff to `council/archive/handoffs/2026-01/`

---

*Handed off by Kazzrath the Blue*
*Routed and documented by Vaelthrix the Astral — 2026-01-08*
