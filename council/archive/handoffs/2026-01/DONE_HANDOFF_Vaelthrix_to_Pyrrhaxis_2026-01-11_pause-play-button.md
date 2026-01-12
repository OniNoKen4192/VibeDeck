# Handoff: Pause/Play Button

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Ember
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Live Fire Learning — Pause/Play button

---

## Context

First field deployment (Lady Kraken vs Winter Club, 2026-01-11) revealed a critical UX gap: no way to pause and resume playback. Currently you can only STOP, which clears the track entirely. For rapid stop-start scenarios (offsides calls, quick whistles, goalie covers puck), a pause/resume toggle is essential.

The player service already has `pause()` and `resume()` functions — they just aren't wired to the UI.

## What Was Done

- Analyzed current playback control layout
- Confirmed `pause()` and `resume()` exist in `src/services/player/index.ts` (lines 298-321)
- Confirmed `isPlaying` state is already tracked in the store and passed to components
- Designed button placement and behavior

## Design

### Layout Change

**Current:**
```
[STOP] [volume-icon] [====slider====]
```

**New:**
```
[STOP] [PAUSE/PLAY] [volume-icon] [====slider====]
```

### Button Behavior

| State | Icon | Color | Action |
|-------|------|-------|--------|
| Playing | `pause` (Ionicons) | Primary (#6366f1) | Call `pause()` |
| Paused | `play` (Ionicons) | Primary (#6366f1) | Call `resume()` |
| No track | `play` (Ionicons) | Disabled gray | No action |

The button toggles between pause/play icons based on `isPlaying`. It's disabled when `currentTrack` is null.

### Button Sizing

Match the existing STOP button dimensions:
- Width: 44px (icon button, not text)
- Height: 44px (Layout.stopButtonHeight)
- Icon size: 24px (Layout.tabIconSize)

Use the same press animation pattern as StopButton (scale to 0.97 on press).

## What's Next

### 1. Create PlayPauseButton component

**New file:** `src/components/PlayPauseButton.tsx`

```typescript
interface PlayPauseButtonProps {
  isPlaying: boolean;
  isPaused: boolean;      // True when paused (track loaded but not playing)
  onPause: () => void;
  onResume: () => void;
  disabled?: boolean;     // True when no track loaded
}
```

**Note on state:** We need to distinguish three states:
1. **No track** — disabled, show play icon
2. **Playing** — enabled, show pause icon
3. **Paused** — enabled, show play icon

The tricky part: `isPlaying` is false for both "no track" and "paused". You'll need to check `currentTrack !== null && !isPlaying` to detect paused state.

Alternatively, add an `isPaused` boolean to the props derived from: `currentTrack !== null && !isPlaying`.

### 2. Update PlaybackControls

**File:** `src/components/PlaybackControls.tsx`

Add new props:
```typescript
interface PlaybackControlsProps {
  // ... existing props ...
  isPaused: boolean;        // New: is playback paused
  onPause: () => void;      // New: pause handler
  onResume: () => void;     // New: resume handler
}
```

Add PlayPauseButton between StopButton and volume icon:
```tsx
<StopButton onPress={onStop} disabled={!isPlaying && !isPaused} />
<PlayPauseButton
  isPlaying={isPlaying}
  isPaused={isPaused}
  onPause={onPause}
  onResume={onResume}
  disabled={!isPlaying && !isPaused}
/>
<Ionicons name={getVolumeIconName(volume)} ... />
```

**Note:** StopButton should also be enabled when paused (user should be able to stop a paused track).

### 3. Wire up in BoardScreen

**File:** `app/(tabs)/index.tsx`

Import pause/resume:
```typescript
import {
  // ... existing imports ...
  pause as playerPause,
  resume as playerResume,
} from '../../src/services/player';
```

Add handlers:
```typescript
const handlePause = useCallback(async () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playerPause();
}, []);

const handleResume = useCallback(async () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playerResume();
}, []);
```

Derive isPaused:
```typescript
const isPaused = currentTrack !== null && !isPlaying;
```

Pass to PlaybackControls:
```tsx
<PlaybackControls
  volume={localVolume}
  onVolumeChange={handleVolumeChange}
  onVolumeChangeComplete={handleVolumeChangeComplete}
  onStop={handleStop}
  onPause={handlePause}
  onResume={handleResume}
  isPlaying={isPlaying}
  isPaused={isPaused}
/>
```

### 4. Verify stop clears paused state

Per the 1.1.0_Goals.md confirmed behaviors: "Stop should clear paused state."

Check that when you:
1. Play a track
2. Pause it
3. Press STOP

The track is cleared and UI returns to "no track" state. The current `playerStop()` calls `TrackPlayer.reset()` which should handle this, but verify.

## Key Files

| File | Change |
|------|--------|
| `src/components/PlayPauseButton.tsx` | **New file** — icon toggle button |
| `src/components/PlaybackControls.tsx` | Add PlayPauseButton, new props |
| `app/(tabs)/index.tsx` | Wire pause/resume handlers, derive isPaused |
| `src/constants/layout.ts` | Optional: add `playPauseButtonSize: 44` if needed |

## Gotchas / Notes

1. **Three-state logic** — The button needs to handle: no track (disabled), playing (show pause), paused (show play). Don't conflate "paused" with "stopped".

2. **Haptic feedback** — Use Light impact for pause/resume (matches button presses), Medium is reserved for Stop.

3. **Remote controls already work** — The playbackService.ts already handles `Event.RemotePlay` and `Event.RemotePause` from notification/Bluetooth controls. Those will automatically sync state through the existing callback system.

4. **Icon names** — Ionicons: `pause` for pause icon, `play` for play icon. Simple.

5. **Accessibility** — Remember to set `accessibilityLabel` dynamically: "Pause playback" when showing pause icon, "Resume playback" when showing play icon.

## Optional Polish: Error Handling for pause/resume

Code review noted that `pause()` and `resume()` in `player/index.ts` swallow errors (console.log only), unlike `playTrack()` which uses the full error callback infrastructure. This is a minor inconsistency — failures are rare, and the playback state callback will eventually resync the UI.

If you want to fix it while you're in there:

```typescript
export async function pause(): Promise<void> {
  if (!isPlayerInitialized) return;

  try {
    await TrackPlayer.pause();
  } catch (error) {
    console.error('Error pausing:', error);
    onPlaybackError?.({
      code: 'playback_error',
      userMessage: 'Failed to pause playback. Please try again.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
```

Same pattern for `resume()`. This surfaces errors via the existing toast system. Not blocking, but nice to have for consistency.

---

*Handed off by Vaelthrix the Astral*

---

## Completion Sign-off

**Completed by:** Pyrrhaxis the Red
**Date:** 2026-01-11

### What Was Done

1. **Created PlayPauseButton component** (`src/components/PlayPauseButton.tsx`)
   - Toggle button with play/pause icons based on state
   - Same press animation pattern as StopButton (scale to 0.97)
   - Primary purple color (#6366f1) when enabled, disabled gray when no track
   - Dynamic accessibility labels ("Pause playback" / "Resume playback")

2. **Updated PlaybackControls** (`src/components/PlaybackControls.tsx`)
   - Added `onPause`, `onResume`, and `isPaused` props
   - Inserted PlayPauseButton between STOP and volume icon
   - Both STOP and PlayPause now use `hasTrack` (isPlaying || isPaused) for enabled state

3. **Wired handlers in BoardScreen** (`app/(tabs)/index.tsx`)
   - Imported `pause` and `resume` from player service
   - Added `handlePause` and `handleResume` with Light haptic feedback
   - Derived `isPaused = currentTrack !== null && !isPlaying`
   - Passed all new props to PlaybackControls

4. **Applied optional polish** (`src/services/player/index.ts`)
   - Added error callback infrastructure to `pause()` and `resume()`
   - Errors now surface via toast system, consistent with `playTrack()`

5. **Exported component** (`src/components/index.ts`)
   - Added PlayPauseButton to barrel exports

### Verified

- Stop clears paused state (TrackPlayer.reset() → currentTrack = null → isPaused = false)
- TypeScript compiles clean
- Three-state logic works: disabled (no track), pause icon (playing), play icon (paused)

### Ready for Testing

- Play a track → pause icon appears, tap to pause
- When paused → play icon appears, tap to resume
- Stop while paused → returns to disabled state
- Remote/Bluetooth controls should sync automatically via existing callbacks

*Forged by Pyrrhaxis the Red* 🔥
