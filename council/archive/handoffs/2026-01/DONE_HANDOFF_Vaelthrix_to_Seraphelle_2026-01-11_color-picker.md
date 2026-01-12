# Handoff: Color Picker for Buttons

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Color picker for buttons

---

## Context

Users want to customize button colors on the board. The data model already supports per-button color overrides (`button.color`), and the resolution chain is in place: `button.color ?? tag.color ?? DEFAULT_BUTTON_COLOR`. We just need UI to set the color.

## Current State

**ButtonContextMenu** (`src/components/ButtonContextMenu.tsx`):
- Two options: Pin/Unpin, Remove
- Bottom sheet modal on long-press

**Color palette** (`src/constants/colors.ts` lines 30-39):
- 8 tag colors already defined in `Colors.tagColors[]`
- Accessibility helper `getButtonTextColor()` exists

**Database**:
- `buttons.color` column exists (nullable TEXT)
- `useButtonStore.updateButton(id, updates)` exists

## Design

### Add "Change Color" option to context menu

Insert between Pin/Unpin and Remove:

```
[Button Name]
─────────────────
📌 Pin to Board
🎨 Change Color    ← NEW
🗑️ Remove Button
```

### Color picker UI

**Option A: Inline color swatches in menu**

Expand the "Change Color" row to show color swatches directly:

```
🎨 Change Color
   [🔴][🟠][🟡][🟢][🔵][🟣][💗][⚫]  ← 8 swatches + reset
```

Tap a swatch to apply immediately. Include a "Reset" option (⚫ or ✕) to clear `button.color` and revert to tag/default color.

**Option B: Separate color picker modal**

Tap "Change Color" opens a new modal with larger color swatches.

**Recommendation:** Option A (inline swatches) is more efficient — fewer taps, stays in context.

## What's Next

### 1. Add onChangeColor prop to ButtonContextMenu

```typescript
interface ButtonContextMenuProps {
  // ... existing
  onChangeColor: (button: ButtonResolved, color: string | null) => void;
}
```

### 2. Add color swatches section

After the Pin/Unpin row, add:

```tsx
{/* Change Color section */}
<View style={styles.colorSection}>
  <View style={styles.colorHeader}>
    <FontAwesome name="paint-brush" size={20} color={Colors.text} />
    <Text style={styles.menuText}>Change Color</Text>
  </View>
  <View style={styles.colorSwatches}>
    {Colors.tagColors.map((color) => (
      <Pressable
        key={color}
        style={[
          styles.swatch,
          { backgroundColor: color },
          button.displayColor === color && styles.swatchSelected,
        ]}
        onPress={() => handleColorSelect(color)}
        accessibilityLabel={`Select ${color}`}
      />
    ))}
    {/* Reset to default */}
    <Pressable
      style={[styles.swatch, styles.resetSwatch]}
      onPress={() => handleColorSelect(null)}
      accessibilityLabel="Reset to default color"
    >
      <FontAwesome name="times" size={14} color={Colors.textSecondary} />
    </Pressable>
  </View>
</View>
```

### 3. Add handler

```typescript
const handleColorSelect = (color: string | null) => {
  if (button) {
    onChangeColor(button, color);
  }
  handleOverlayPress(); // Close menu
};
```

### 4. Add styles

```typescript
colorSection: {
  marginBottom: Layout.spacing.md,
},
colorHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  height: 44,
  paddingHorizontal: Layout.spacing.lg,
  gap: 12,
},
colorSwatches: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: Layout.spacing.lg,
  gap: 8,
},
swatch: {
  width: 36,
  height: 36,
  borderRadius: 18,
},
swatchSelected: {
  borderWidth: 3,
  borderColor: Colors.text,
},
resetSwatch: {
  backgroundColor: Colors.surfaceLight,
  alignItems: 'center',
  justifyContent: 'center',
},
```

### 5. Wire up in BoardScreen

**File:** `app/(tabs)/index.tsx`

Add handler:
```typescript
const handleChangeButtonColor = useCallback(async (
  button: ButtonResolved,
  color: string | null
) => {
  await useButtonStore.getState().updateButton(button.id, { color });
  showToast(color ? 'Color updated' : 'Color reset', 'success');
}, [showToast]);
```

Pass to context menu:
```tsx
<ButtonContextMenu
  // ... existing
  onChangeColor={handleChangeButtonColor}
/>
```

### 6. Check updateButton exists in store

**File:** `src/stores/useButtonStore.ts`

Verify `updateButton` action exists. If not, add:
```typescript
updateButton: async (id: string, updates: Partial<Button>) => {
  const now = new Date().toISOString();
  await buttonQueries.updateButton(id, { ...updates, updatedAt: now });
  // Reload to refresh resolved buttons
  await get().loadButtons();
},
```

## Key Files

| File | Change |
|------|--------|
| `src/components/ButtonContextMenu.tsx` | Add color swatches section, `onChangeColor` prop |
| `app/(tabs)/index.tsx` | Add `handleChangeButtonColor`, pass to menu |
| `src/stores/useButtonStore.ts` | Verify/add `updateButton` action |

## Gotchas / Notes

1. **Persistent buttons only?** — The 1.1.0 goal says "Persisted buttons only". Consider whether to hide the color option for non-persistent buttons, or allow it for all. I'd allow for all — if a user customizes a color, they probably want to keep that button anyway.

2. **Reset option** — The "×" swatch sets `color: null`, which reverts to tag color (for tag buttons) or default indigo (for direct buttons).

3. **Selected indicator** — Show a white border around the currently active color swatch.

4. **Tag color inheritance** — For tag buttons, the default color comes from the tag. If user sets button.color, it overrides. Reset clears the override.

5. **Immediate feedback** — Color change should be instant. The button re-renders with new `displayColor` as soon as store updates.

6. **Accessibility** — Each swatch needs an `accessibilityLabel` describing the color (e.g., "Select red", "Select blue").

---

*Handed off by Vaelthrix the Astral*
