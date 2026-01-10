# Human Testing Round 3 - QA Report

**Date:** 2026-01-08
**Tester:** Project Lead (on-device)
**QA Dragon:** Kazzrath the Blue
**Device:** Android Emulator - Medium_Phone_API_36.1:5554

---

## Summary

**Verification Results:** 3/3 PASS
**New Bugs Found:** 4 confirmed + 1 unconfirmed

| Test | Result |
|------|--------|
| HT-005: Speaker icon on volume slider | PASS |
| HT-006: Board reactivity on tag changes | PASS |
| HT-007: Track import with new File API | PASS |

All three targeted fixes are verified working. However, testing revealed critical issues with the audio player initialization and metadata extraction.

---

## Verified Fixes

### HT-005: Speaker Icon on Volume Slider
**Status:** PASS
**Evidence:** Screenshot confirms speaker icon visible next to volume slider, showing medium volume state.
**Fix Location:** [src/components/PlaybackControls.tsx](../../src/components/PlaybackControls.tsx)

### HT-006: Board Screen Reactivity
**Status:** PASS
**Evidence:** Creating/deleting tags immediately updates the Board grid without restart.
**Fix Location:** [app/(tabs)/index.tsx:36](../../app/(tabs)/index.tsx#L36) - `storeButtons` subscription

### HT-007: expo-file-system Migration
**Status:** PASS
**Evidence:** Track import completed successfully (was completely broken before).
**Fix Locations:**
- [src/services/import/validation.ts:69](../../src/services/import/validation.ts#L69)
- [src/services/player/index.ts:196](../../src/services/player/index.ts#L196)

---

## New Bugs Discovered

### HT-008: Track Title Shows URL-Encoded Content URI
**Severity:** High
**Observed:** Track title displays as `raw%3A%2Fstorage%2Femulated%2F0%2FDownload%2FDarude%20-%20San...`
**Expected:** `Darude - Sandstorm`
**Root Cause:** Metadata extraction in `src/services/import/metadata.ts` receives the raw content URI instead of decoding it first. The `%2F` and `%20` sequences should be decoded before filename parsing.
**Fix:** Decode URI before extracting filename: `decodeURIComponent(uri)` or extract display name from content resolver.

### HT-009: Artist Not Extracted from Filename
**Severity:** Medium
**Observed:** Artist shows "Unknown Artist" for file named "Darude - Sandstorm.mp3"
**Expected:** Artist should be "Darude", Title should be "Sandstorm"
**Root Cause:** The "Artist - Title" pattern matching fails because it's operating on the URL-encoded string. Dependent on HT-008 fix.
**Fix:** After HT-008, verify pattern matching works on decoded filename.

### HT-010: Duration Not Populated on Import
**Severity:** Medium
**Observed:** Track Details shows "Unknown duration"
**Expected:** Duration should be extracted from audio file metadata
**Root Cause:** No audio metadata extraction implemented. The import service only parses filename patterns, not actual file metadata (ID3 tags, etc.).
**Fix:** Consider using `expo-av` or similar to extract duration, or defer to first playback and update track record.

### HT-011: App Crash on Volume Slider Interaction
**Severity:** CRITICAL
**Observed:** App crashes after adjusting volume slider (worked once, crashed on second adjustment)
**Error Message:**
```
WARN  No task registered for key TrackPlayer
ERROR Failed to initialize player: [Error: The player has already been initialized via setupPlayer.]
```

**Root Cause (Two Issues):**

1. **Missing Playback Service Registration**
   `react-native-track-player` requires `TrackPlayer.registerPlaybackService()` to be called at app entry, before React renders. This is not implemented anywhere in the codebase. The "No task registered for key TrackPlayer" warning indicates this.

2. **No Guard for Double Initialization**
   When `RootLayout` re-mounts (due to error recovery or navigation), `initializePlayer()` is called again. The `isPlayerInitialized` flag is module-level state that can reset, but the native TrackPlayer instance persists, causing "already been initialized" crash.

**Fix Required:**

A. Create playback service file and register it at entry point:
```typescript
// src/services/player/playbackService.ts
import TrackPlayer from 'react-native-track-player';

module.exports = async function() {
  TrackPlayer.addEventListener('remote-play', () => TrackPlayer.play());
  TrackPlayer.addEventListener('remote-pause', () => TrackPlayer.pause());
  TrackPlayer.addEventListener('remote-stop', () => TrackPlayer.destroy());
};
```

B. Register in app entry (requires custom entry point for Expo):
```typescript
import TrackPlayer from 'react-native-track-player';
TrackPlayer.registerPlaybackService(() => require('./src/services/player/playbackService'));
```

C. Add try-catch guard in `initializePlayer()`:
```typescript
try {
  await TrackPlayer.setupPlayer({ ... });
} catch (error) {
  if (error.message?.includes('already been initialized')) {
    isPlayerInitialized = true;
    return true;
  }
  throw error;
}
```

**References:**
- [react-native-track-player docs: Background Mode](https://react-native-track-player.js.org/docs/basics/background-mode)
- [Expo custom entry point](https://docs.expo.dev/router/reference/entry-point/)

### HT-012: Tag Button Playback (Unconfirmed)
**Severity:** Unknown
**Observed:** Tag button on board may not have been working
**Status:** Testing interrupted by HT-011 crash before confirmation
**Action:** Re-test after HT-011 is fixed

---

## Console Warnings Observed

```
WARN  The app is running using the Legacy Architecture. The Legacy Architecture is deprecated...
WARN  No task registered for key TrackPlayer
```

The Legacy Architecture warning is expected (New Architecture disabled for react-native-track-player compatibility). The TrackPlayer warning is addressed by HT-011.

---

## Priority Recommendation

1. **HT-011** (Critical) - Fix first, blocks all playback testing
2. **HT-008** (High) - Poor UX, makes tracks unidentifiable
3. **HT-009** (Medium) - Depends on HT-008
4. **HT-010** (Medium) - Nice to have, can defer

---

## Next Steps

1. Pyrrhaxis to address HT-011 (player service + initialization guard)
2. Pyrrhaxis to address HT-008/HT-009 (URI decoding in metadata extraction)
3. Human Testing Round 4 after fixes
4. Re-verify HT-012 (tag button playback)

---

*Report compiled by Kazzrath the Blue*
