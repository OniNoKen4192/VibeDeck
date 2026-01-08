# Handoff: HT-011 & HT-008/009 Bug Fixes

**Status:** ✅ COMPLETE
**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Crimson
**Date:** 2026-01-08
**Related Quest:** Human Testing Round 3 fixes

---

## Context

Human Testing Round 3 verified all three targeted fixes (HT-005, HT-006, HT-007), but discovered 4 new bugs. HT-011 is CRITICAL and causes app crashes when using the volume slider. HT-008/009 are High/Medium severity affecting track display.

Full report: [qa/QA_REPORT_HT_ROUND3.md](../qa/QA_REPORT_HT_ROUND3.md)

---

## HT-011: TrackPlayer Service + Initialization Guard (CRITICAL)

### Problem

App crashes after adjusting volume slider with these errors:
```
WARN  No task registered for key TrackPlayer
ERROR Failed to initialize player: [Error: The player has already been initialized via setupPlayer.]
```

### Root Cause (Two Issues)

1. **Missing Playback Service Registration**
   `react-native-track-player` requires `TrackPlayer.registerPlaybackService()` to be called at app entry, *before* React renders. This is currently missing entirely.

2. **No Guard for Double Initialization**
   When `RootLayout` re-mounts (error recovery, hot reload, navigation), `initializePlayer()` is called again. The `isPlayerInitialized` flag is module-level state that resets on JS reload, but the native TrackPlayer instance persists, causing the "already been initialized" crash.

### Fix Required

#### Step A: Create Playback Service File

Create new file `src/services/player/playbackService.ts`:

```typescript
/**
 * @file services/player/playbackService.ts
 * @description Background playback service for react-native-track-player.
 * Must be registered at app entry before React renders.
 */

import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Playback service that handles remote events (notification controls, etc.)
 * Required by react-native-track-player for proper initialization.
 */
module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
};
```

#### Step B: Create Custom Entry Point

Create new file `index.js` in project root (alongside `app/`):

```javascript
/**
 * @file index.js
 * @description Custom entry point for Expo Router with TrackPlayer service registration.
 */

import TrackPlayer from 'react-native-track-player';

// Register playback service BEFORE React renders
// This is required by react-native-track-player
TrackPlayer.registerPlaybackService(() => require('./src/services/player/playbackService'));

// Import Expo Router entry point
import 'expo-router/entry';
```

#### Step C: Update package.json

Add the `main` field to point to custom entry:

```json
{
  "main": "index.js",
  ...
}
```

**Location:** Add `"main": "index.js"` at the top level of `package.json`, before or after `"name"`.

#### Step D: Add Initialization Guard

Update `src/services/player/index.ts` — modify `initializePlayer()` to handle the "already initialized" case:

**Current code (lines 109-145):**
```typescript
export async function initializePlayer(): Promise<boolean> {
  if (isPlayerInitialized) {
    return true;
  }

  try {
    await TrackPlayer.setupPlayer({
      // Reasonable buffer for mobile
      minBuffer: 15,
      maxBuffer: 50,
      playBuffer: 2.5,
      backBuffer: 0,
    });
    // ... rest of setup
  } catch (error) {
    console.error('Failed to initialize player:', error);
    return false;
  }
}
```

**Replace with:**
```typescript
export async function initializePlayer(): Promise<boolean> {
  if (isPlayerInitialized) {
    return true;
  }

  try {
    await TrackPlayer.setupPlayer({
      // Reasonable buffer for mobile
      minBuffer: 15,
      maxBuffer: 50,
      playBuffer: 2.5,
      backBuffer: 0,
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
    });

    // Register event listeners
    registerEventListeners();

    isPlayerInitialized = true;
    return true;
  } catch (error) {
    // Handle case where native player already exists (app restart, hot reload)
    if (error instanceof Error && error.message?.includes('already been initialized')) {
      console.log('[Player] Native player already initialized, reusing');
      isPlayerInitialized = true;
      // Re-register event listeners since JS context is fresh
      registerEventListeners();
      return true;
    }
    console.error('Failed to initialize player:', error);
    return false;
  }
}
```

### Testing HT-011

After fix, verify:
1. App launches without TrackPlayer warnings
2. Volume slider works repeatedly without crash
3. Play a track, stop, play another track
4. Hot reload the app — playback should still work
5. Force close and reopen — no initialization errors

---

## HT-008: Track Title Shows URL-Encoded Content URI (High)

### Problem

Track title displays as:
```
raw%3A%2Fstorage%2Femulated%2F0%2FDownload%2FDarude%20-%20San...
```

Instead of:
```
Darude - Sandstorm
```

### Root Cause

`extractFileName()` in `src/services/import/validation.ts` receives raw content URIs from the Android document picker without decoding them first. The `%2F` (slash) and `%20` (space) sequences need to be decoded.

### Fix

**File:** `src/services/import/validation.ts`

Update `extractFileName()` function (lines 114-126):

**Current code:**
```typescript
export function extractFileName(filePath: string): string {
  // Handle both forward and back slashes
  const segments = filePath.split(/[/\\]/);
  const fileName = segments[segments.length - 1] || 'Unknown';

  // Remove query params if present (content URIs)
  const queryIndex = fileName.indexOf('?');
  if (queryIndex !== -1) {
    return fileName.slice(0, queryIndex);
  }

  return fileName;
}
```

**Replace with:**
```typescript
export function extractFileName(filePath: string): string {
  // Decode URI-encoded characters first (content:// URIs from Android picker)
  let decoded: string;
  try {
    decoded = decodeURIComponent(filePath);
  } catch {
    // If decoding fails (malformed URI), use as-is
    decoded = filePath;
  }

  // Handle both forward and back slashes
  const segments = decoded.split(/[/\\]/);
  const fileName = segments[segments.length - 1] || 'Unknown';

  // Remove query params if present (content URIs)
  const queryIndex = fileName.indexOf('?');
  if (queryIndex !== -1) {
    return fileName.slice(0, queryIndex);
  }

  return fileName;
}
```

### Testing HT-008

After fix, verify:
1. Import a file named "Darude - Sandstorm.mp3"
2. Track title should show "Sandstorm" (not URL-encoded gibberish)
3. Track should appear correctly in Library list
4. NowPlaying bar should show decoded title during playback

---

## HT-009: Artist Not Extracted from Filename (Medium)

### Problem

Artist shows "Unknown Artist" for file named "Darude - Sandstorm.mp3".
Expected: Artist = "Darude", Title = "Sandstorm"

### Root Cause

This is dependent on HT-008. The "Artist - Title" pattern matching in `parseMetadataFromFileName()` fails because it's operating on the URL-encoded string where ` - ` becomes `%20-%20`.

### Fix

**No code change needed** — HT-008 fix resolves this.

`extractFileName()` is called by `extractMetadata()` in `metadata.ts:47`, and the decoded filename is passed to `parseMetadataFromFileName()`. Once HT-008 is fixed, the pattern matching will work correctly.

### Testing HT-009

After HT-008 fix, verify:
1. Import "Darude - Sandstorm.mp3"
2. Title should be "Sandstorm"
3. Artist should be "Darude"
4. Verify in Library list and Track Detail modal

---

## HT-010: Duration Not Populated (Deferred)

This is a known limitation documented in `metadata.ts:35-41`. No audio metadata extraction (ID3 tags) is implemented. Duration could be extracted via `expo-av` or deferred to first playback.

**Recommendation:** Defer to post-MVP. Current behavior is acceptable ("Unknown duration").

---

## Key Files

| File | Changes |
|------|---------|
| `src/services/player/playbackService.ts` | **NEW** — Playback service for TrackPlayer |
| `index.js` | **NEW** — Custom entry point with service registration |
| `package.json` | Add `"main": "index.js"` |
| `src/services/player/index.ts` | Add try-catch guard for double initialization |
| `src/services/import/validation.ts` | Add `decodeURIComponent()` in `extractFileName()` |

---

## Gotchas / Notes

1. **Entry Point Order**: The `TrackPlayer.registerPlaybackService()` call MUST happen before `import 'expo-router/entry'`. Order matters.

2. **Module.exports vs Export Default**: The playback service file MUST use `module.exports = async function()` — this is a react-native-track-player requirement, not ES6 export syntax.

3. **Event Listener Re-registration**: When we catch "already initialized", we still need to call `registerEventListeners()` because the JS context is fresh (listeners were lost), even though the native player persists.

4. **decodeURIComponent Safety**: Wrap in try-catch because malformed URIs can throw. Fall back to original string if decoding fails.

5. **Metro Cache**: After adding `index.js`, you may need to clear Metro cache: `npx expo start --clear`

---

## Priority Order

1. **HT-011** first — Critical, blocks all playback testing
2. **HT-008** second — High impact on UX
3. **HT-009** — Auto-fixed by HT-008, just verify

After fixes, Human Testing Round 4 will verify all issues plus re-test HT-012 (tag button playback) which was blocked by HT-011 crash.

---

*Handed off by Vaelthrix the Astral*

---

## Completion Notes (Pyrrhaxis)

**All fixes implemented:**

### HT-011
- Created `src/services/player/playbackService.ts` — Background service with remote event handlers
- Created `index.js` — Custom entry point that registers playback service before React renders
- Updated `package.json` — Changed `main` to point to `index.js`
- Updated `src/services/player/index.ts` — Added try-catch guard for "already initialized" case to handle hot reload/app restart gracefully

### HT-008/009
- Updated `src/services/import/validation.ts` — Added `decodeURIComponent()` call in `extractFileName()` to decode URL-encoded content URIs from Android document picker
- HT-009 (artist not extracted) is automatically fixed since `parseMetadataFromFileName()` now receives properly decoded filenames

**TypeScript compilation:** ✅ Clean
**ESLint:** ✅ No new warnings/errors

*Ready for Human Testing Round 4*

*Completed by Pyrrhaxis the Crimson — 2026-01-08*
