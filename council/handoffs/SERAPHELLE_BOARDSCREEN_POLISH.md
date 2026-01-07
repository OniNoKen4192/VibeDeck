# Seraphelle Handoff: BoardScreen Visual Polish

**From:** Pyrrhaxis the Red
**To:** Seraphelle the Silver
**Date:** 2026-01-05

---

## Task Summary

Add visual polish to the BoardScreen now that all functionality is wired. This includes error/feedback UI, animations, and final styling touches.

---

## What Pyrrhaxis Left for You

The BoardScreen at `app/(tabs)/index.tsx` is now fully functional:

- ✅ Connected to all stores (button, player, track)
- ✅ App initialization in `app/_layout.tsx` with `AppReadyContext`
- ✅ Tag button press → random unplayed track selection + playback
- ✅ Direct button press → specific track playback
- ✅ Stop and volume handlers wired to player service
- ✅ Playback callbacks syncing state (play/pause/end events)
- ✅ Button grid refreshes after played flag changes
- ✅ Basic loading and empty states

### Current Placeholders (Your Domain)

| Location | Current State | Needed |
|----------|---------------|--------|
| Line 85-88 | `console.error` for playback errors | Toast UI |
| Line 124-127 | `console.log` for pool exhaustion | User feedback |
| Line 137, 146 | `console.error` for playback failure | Toast UI |
| Lines 182-203 | Basic loading/empty states | Polished animations |

---

## Your Polish Tasks

### 1. Error Toast UI

When playback fails, show a toast notification. The error object is available:

```typescript
// In registerPlaybackErrorCallback (line 85-88):
registerPlaybackErrorCallback((error) => {
  // error.userMessage — Human-readable message
  // error.code — 'file_not_found' | 'playback_error' | 'not_initialized'
  // error.track — The track that failed (if applicable)

  // Show toast with error.userMessage
});
```

Suggested toast behavior:
- Appears at top or bottom of screen
- Auto-dismisses after 3 seconds
- Red/error color for failures
- Tappable to dismiss early

### 2. Pool Exhausted Feedback

When a tag button's pool is empty (line 124-127):

```typescript
if (!result.track) {
  // Pool exhausted — show user feedback
  console.log('[BoardScreen] Pool exhausted for tag:', button.tagId);
  return;
}
```

Options per UI_DESIGN.md:
- Button already shows "Exhausted" state (50% opacity, dashed border)
- Consider adding brief shake animation on tap
- Optional: Prompt to reset pool ("All tracks played. Reset?")

### 3. Loading State Polish

Current loading (lines 182-191) is a simple spinner. Consider:
- Skeleton placeholders matching button grid
- Fade-in transition when loaded
- Progress indication if available

### 4. Empty State Polish

Current empty state (lines 193-204) is basic text. Consider:
- Illustration or icon
- Animated entrance
- Clear CTA directing to Library/Tags tabs

### 5. Haptic Feedback

Add haptic feedback for button interactions (per UI_DESIGN.md accessibility checklist):

```typescript
import * as Haptics from 'expo-haptics';

// On button press:
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// On stop:
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

### 6. Screen Reader Labels

Per accessibility checklist in UI_DESIGN.md, add accessibility labels:

```typescript
<BoardButton
  accessibilityLabel={`${button.name}, ${button.availableTracks} tracks remaining`}
  accessibilityRole="button"
  accessibilityState={{ selected: playingButtonId === button.id }}
  // ...
/>
```

---

## Available Context

### AppReadyContext

You can use this to check if initialization is complete:

```typescript
import { useAppReady } from '../_layout';

const isAppReady = useAppReady();
```

### PlaybackError Type

```typescript
interface PlaybackError {
  code: 'file_not_found' | 'playback_error' | 'not_initialized';
  userMessage: string;
  details?: string;
  track?: Track;
}
```

### Button States Reference

From UI_DESIGN.md, all states are implemented in your components:

| State | Trigger |
|-------|---------|
| Default | Button is ready |
| Pressed | Touch active |
| Playing | `playingButtonId === button.id` |
| Exhausted | `button.type === 'tag' && button.availableTracks === 0` |
| Disabled | `button.isDisabled === true` |

---

## Files You'll Likely Touch

| File | Purpose |
|------|---------|
| `app/(tabs)/index.tsx` | Add toast, haptics, accessibility |
| `src/components/BoardButton.tsx` | Add shake animation for exhausted tap |
| `src/components/index.ts` | Export any new toast component |
| New: `src/components/Toast.tsx` | Create toast notification component |

---

## What You're NOT Doing

- ❌ Changing playback logic (Pyrrhaxis's domain)
- ❌ Modifying store interactions (working as wired)
- ❌ Writing tests (Kazzrath's domain)
- ❌ Long-press edit navigation (deferred)

---

## Design Reference

All visual specs are in `docs/UI_DESIGN.md`:
- Animation timing (lines 294-320)
- Color tokens (lines 18-63)
- Accessibility checklist (lines 324-333)

---

## Invocation

```
Read CLAUDE.md and council/COUNCIL.md. You are Seraphelle the Silver.
Read council/handoffs/SERAPHELLE_BOARDSCREEN_POLISH.md and implement the visual polish.
```
