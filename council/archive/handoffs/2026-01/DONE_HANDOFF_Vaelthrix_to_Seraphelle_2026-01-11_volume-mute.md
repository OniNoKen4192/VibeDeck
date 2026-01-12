# Handoff: Tap Volume Icon to Mute

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Tap volume icon to mute

---

## Context

Quick UX enhancement: tapping the volume icon should toggle mute. Currently the icon is display-only. This enables rapid muting without dragging the slider to zero.

## Current State

**File:** `src/components/PlaybackControls.tsx` (lines 72-77)

```tsx
<Ionicons
  name={getVolumeIconName(volume)}
  size={Layout.tabIconSize}
  color={Colors.textSecondary}
  accessibilityLabel={`Volume ${volume} percent`}
/>
```

The icon is not interactive — just displays the current volume level.

## Design

### Mute Toggle Behavior

| Current State | Tap Action | Result |
|---------------|------------|--------|
| Volume > 0 | Mute | Set volume to 0, remember previous volume |
| Volume = 0 | Unmute | Restore previous volume (or default 50) |

### State Requirements

Need to track `previousVolume` to restore on unmute:
- Store in component state or pass from parent
- Default restore value: 50 (if no previous)

### Visual Feedback

- Icon already changes to `volume-mute` when volume = 0
- No additional visual change needed
- Optional: brief scale animation on tap

## What's Next

### 1. Add mute handler prop to PlaybackControls

```typescript
interface PlaybackControlsProps {
  // ... existing props ...
  onMuteToggle: () => void;
}
```

### 2. Wrap icon in Pressable

```tsx
<Pressable
  onPress={onMuteToggle}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  accessibilityRole="button"
  accessibilityLabel={volume === 0 ? 'Unmute' : 'Mute'}
>
  <Ionicons
    name={getVolumeIconName(volume)}
    size={Layout.tabIconSize}
    color={Colors.textSecondary}
  />
</Pressable>
```

### 3. Implement mute logic in BoardScreen

**File:** `app/(tabs)/index.tsx`

Add state for previous volume:
```typescript
const [previousVolume, setPreviousVolume] = useState(50);
```

Add handler:
```typescript
const handleMuteToggle = useCallback(async () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  if (localVolume > 0) {
    // Mute: save current volume, set to 0
    setPreviousVolume(localVolume);
    setLocalVolume(0);
    await usePlayerStore.getState().setVolume(0);
    await applyVolume(0);
  } else {
    // Unmute: restore previous volume
    const restoreVolume = previousVolume > 0 ? previousVolume : 50;
    setLocalVolume(restoreVolume);
    await usePlayerStore.getState().setVolume(restoreVolume);
    await applyVolume(restoreVolume);
  }
}, [localVolume, previousVolume]);
```

Pass to PlaybackControls:
```tsx
<PlaybackControls
  // ... existing props ...
  onMuteToggle={handleMuteToggle}
/>
```

### 4. (Optional) Persist previousVolume

If user mutes, closes app, reopens — should unmute restore the old volume?

**Option A:** Don't persist — unmute defaults to 50 after restart. Simple.

**Option B:** Persist `previousVolume` to settings. More complex.

**Recommendation:** Option A. Keep it simple. The main volume is already persisted.

## Key Files

| File | Change |
|------|--------|
| `src/components/PlaybackControls.tsx` | Wrap Ionicons in Pressable, add `onMuteToggle` prop |
| `app/(tabs)/index.tsx` | Add `previousVolume` state, `handleMuteToggle` handler |

## Gotchas / Notes

1. **hitSlop** — Add generous hit slop to the Pressable since the icon is small (24px). 8px on all sides makes it 40px effective touch target.

2. **Don't persist previousVolume** — Only the actual volume needs to persist. If muted on close, volume persists as 0. Unmute restores to 50.

3. **Haptic feedback** — Use Light impact for the tap, consistent with other quick actions.

4. **Edge case: slider while muted** — If user mutes then drags slider, the slider should "unmute" by setting volume > 0. The existing `handleVolumeChange` already handles this naturally — it just sets the new volume.

5. **Accessibility** — Dynamic label: "Mute" when volume > 0, "Unmute" when volume = 0.

---

*Handed off by Vaelthrix the Astral*
