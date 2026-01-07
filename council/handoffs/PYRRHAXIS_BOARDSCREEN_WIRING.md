# Pyrrhaxis Handoff: Wire BoardScreen to Stores and Player

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Red
**Date:** 2026-01-05

---

## Task Summary

Replace the mock data and placeholder handlers in `app/(tabs)/index.tsx` with real store connections and player service integration.

---

## What Seraphelle Left for You

The BoardScreen at `app/(tabs)/index.tsx:141` has:
- ✅ Complete UI layout with `ButtonBoard`, `PlaybackControls`, `NowPlaying`
- ✅ Loading state and empty state rendering
- ✅ Mock data (`MOCK_BUTTONS`) demonstrating all button states
- ⏳ **Placeholder handlers** with `console.log` and TODO comments (lines 166-233)
- ⏳ **Local `useState`** that needs to become store connections

---

## Your Wiring Tasks

### 1. App Initialization

In `app/_layout.tsx` (or create a provider), initialize on app mount:

```typescript
import { initDatabase } from '../src/db/init';
import { initializePlayer, destroyPlayer } from '../src/services/player';
import { usePlayerStore } from '../src/stores/usePlayerStore';
import { useTrackStore } from '../src/stores/useTrackStore';
import { useButtonStore } from '../src/stores/useButtonStore';
import { useTagStore } from '../src/stores/useTagStore';

// On mount:
await initDatabase();
await initializePlayer();
await usePlayerStore.getState().loadPersistedState();
await useTrackStore.getState().loadTracks();
await useTagStore.getState().loadTags();
await useButtonStore.getState().loadButtons();

// On unmount:
await destroyPlayer();
```

### 2. Replace Local State with Stores

| Current Local State | Replace With |
|---------------------|--------------|
| `buttons` + mock data | `useButtonStore` → `resolveAllButtons()` |
| `isLoading` | `useButtonStore.isLoading` |
| `playingButtonId` | Track locally (or derive from `currentTrack`) |
| `currentTrack` | `usePlayerStore.currentTrack` |
| `isPlaying` | `usePlayerStore.isPlaying` |
| `volume` | `usePlayerStore.volume` |

### 3. Implement Button Press Logic

```typescript
import { playTrack, stop } from '../src/services/player';
import { selectTrackForTag } from '../src/services/tagPool';

const handleButtonPress = async (button: ButtonResolved) => {
  if (button.isDisabled) return;

  if (button.type === 'tag' && button.tagId) {
    // Tag button: select random unplayed track
    const result = await selectTrackForTag(
      button.tagId,
      useTrackStore.getState().markPlayed
    );

    if (!result.track) {
      // Pool exhausted - show feedback (console.log for now)
      console.log('[BoardScreen] Pool exhausted for tag:', button.tagId);
      return;
    }

    const playResult = await playTrack(result.track);
    if (playResult.success) {
      setPlayingButtonId(button.id);
    }

  } else if (button.type === 'direct' && button.track) {
    // Direct button: play specific track
    const playResult = await playTrack(button.track);
    if (playResult.success) {
      setPlayingButtonId(button.id);
    }
  }
};
```

### 4. Wire Stop and Volume

```typescript
import { stop, applyVolume } from '../src/services/player';

const handleStop = async () => {
  await stop();
  setPlayingButtonId(null);
};

const handleVolumeChangeComplete = async (value: number) => {
  await usePlayerStore.getState().setVolume(value);
  await applyVolume(value);
};
```

### 5. Register Playback Callbacks

```typescript
import {
  registerPlaybackStateCallback,
  registerPlaybackErrorCallback
} from '../src/services/player';

// In useEffect during setup:
registerPlaybackStateCallback((isPlaying, track) => {
  usePlayerStore.getState().setIsPlaying(isPlaying);
  if (!isPlaying && !track) {
    setPlayingButtonId(null);
  }
});

registerPlaybackErrorCallback((error) => {
  console.error('[BoardScreen] Playback error:', error.userMessage);
  // Toast UI deferred to Seraphelle
});
```

### 6. Reload Buttons After Playback

After `markPlayed` is called, `availableTracks` counts need refreshing:

```typescript
// After successful tag button play, re-resolve buttons:
const resolved = await useButtonStore.getState().resolveAllButtons();
setButtons(resolved);
```

---

## Available Services & Stores

| Import From | Functions You Need |
|-------------|-------------------|
| `src/db/init` | `initDatabase()` |
| `src/services/player` | `initializePlayer()`, `destroyPlayer()`, `playTrack()`, `stop()`, `applyVolume()`, `registerPlaybackStateCallback()`, `registerPlaybackErrorCallback()` |
| `src/services/tagPool` | `selectTrackForTag()` |
| `src/stores/useButtonStore` | `loadButtons()`, `resolveAllButtons()`, `isLoading` |
| `src/stores/usePlayerStore` | `currentTrack`, `isPlaying`, `volume`, `setVolume()`, `setIsPlaying()`, `loadPersistedState()` |
| `src/stores/useTrackStore` | `loadTracks()`, `markPlayed` |
| `src/stores/useTagStore` | `loadTags()` |

---

## Edge Cases to Handle

1. **Pool exhausted** — `selectTrackForTag` returns `{ track: null, poolExhausted: true }`
2. **File not found** — `playTrack` returns `{ success: false, error: { code: 'file_not_found' } }`
3. **Player not ready** — `playTrack` returns `{ success: false, error: { code: 'not_initialized' } }`
4. **Track ends naturally** — `PlaybackQueueEnded` event fires via callback, clear `playingButtonId`

---

## What You're NOT Doing

- ❌ UI styling changes (Seraphelle's domain)
- ❌ Writing tests (Kazzrath's domain)
- ❌ Long-press edit navigation (deferred)
- ❌ Error toast UI (just `console.log` for now, Seraphelle will style later)

---

## Invocation

```
Read CLAUDE.md and council/COUNCIL.md. You are Pyrrhaxis the Red.
Read council/handoffs/PYRRHAXIS_BOARDSCREEN_WIRING.md and implement the wiring.
```
