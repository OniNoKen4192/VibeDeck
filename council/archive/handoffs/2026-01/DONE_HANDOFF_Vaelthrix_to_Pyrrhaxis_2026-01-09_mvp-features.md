# Handoff: Vaelthrix → Pyrrhaxis

**Date:** 2026-01-09
**Task:** MVP Feature Completion
**Priority:** High — Blocking MVP release

---

## Summary

Seraphelle has completed UI designs for the remaining MVP features. Vaelthrix has reviewed and approved. Pyrrhaxis to implement:

1. Board Header (new component)
2. Reset All feature
3. Long-press context menu with pin/remove
4. Board sorting (persistent buttons at top)
5. About/Settings screen
6. Empty tag button styling

---

## Design Spec Reference

**Document:** [docs/UI_DESIGN.md](../../docs/UI_DESIGN.md)
**Sections:** §Board Screen Header through §Empty Tag Button State (lines 780-1113)

---

## Implementation Tasks

### 1. BoardHeader Component

**Location:** `src/components/BoardHeader.tsx`

**Spec:** UI_DESIGN.md §Board Screen Header (lines 780-817)

**Requirements:**
- 56px height, `background` color (not `surface`)
- "VibeDeck" title — 20px bold, left-aligned, 16px padding
- Two icon buttons, right-aligned:
  - Reset (⟳) — `refresh` icon from FontAwesome
  - Settings (⚙) — `cog` icon
- Icons: 24px, 44×44px touch targets, `textSecondary` color
- 8px between icons, 12px from edge

**Props:**
```typescript
interface BoardHeaderProps {
  onResetPress: () => void;
  onSettingsPress: () => void;
}
```

**Integration:** Add to `app/(tabs)/index.tsx` above ButtonBoard

---

### 2. Reset All Feature

**Spec:** UI_DESIGN.md §Reset All Feature (lines 820-874)

**Components needed:**
- Reuse `DeleteConfirmation` pattern or create `ResetConfirmation`

**Confirmation dialog:**
- Title: "Reset All Tracks?"
- Body: "This will mark all tracks as unplayed, refilling all tag pools.\n\nCurrent session progress will be lost."
- Cancel: `surface` background
- Reset: `warning` (#f59e0b) background — NOT `error`

**On confirm:**
1. Call `resetAllPools()` from `src/services/tagPool/index.ts`
2. Show toast: "All tracks reset" (type: `success`)
3. Haptic: `Haptics.notificationAsync(NotificationFeedbackType.Success)`
4. Refresh button grid to update count badges

**Existing infrastructure:**
- `resetAllPools()` already exists in tagPool service
- `Toast` component exists
- `useTrackStore.resetAllPlayed()` exists

---

### 3. Long-Press Context Menu

**Location:** `src/components/ButtonContextMenu.tsx`

**Spec:** UI_DESIGN.md §Long-Press Context Menu (lines 877-962)

**Trigger:**
- 500ms long press on any BoardButton
- Haptic: `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` on open

**Bottom sheet styling:**
- Background: `surface`
- Border radius: 16px top corners
- Max height: 40% screen
- Overlay: `#000000` at 40% opacity
- Drag handle: 40×4px, `surfaceLight`, centered, 8px from top
- Animation: slide up, 200ms

**Menu content:**
- Button name as header
- Menu rows (56px height, 16px padding):

| Action | Icon | Text | Color | Condition |
|--------|------|------|-------|-----------|
| Pin | `thumb-tack` | "Pin to Board" | `text` | `!button.persistent` |
| Unpin | `thumb-tack` | "Unpin from Board" | `text` | `button.persistent` |
| Remove | `trash-o` | "Remove Button" | `error` | Always |

**Actions:**
- Pin/Unpin: Call `useButtonStore.updateButton(id, { persistent: !current })`, close menu
- Remove: Show DeleteConfirmation, then `useButtonStore.removeButton(id)`

**Remove confirmation text:**
- Title: "Remove Button?"
- Body: "Remove '{button.name}' from the board? You can add it again later."

**Integration:**
- Add `onLongPress` prop to BoardButton
- Track `selectedButton` state in BoardScreen
- Render ButtonContextMenu as modal

---

### 4. Board Sorting (Persistent at Top)

**Location:** `src/stores/useButtonStore.ts` or `app/(tabs)/index.tsx`

**Requirement:** When resolving buttons for display, persistent buttons should appear first, maintaining their relative order, followed by non-persistent buttons.

**Options:**

**Option A:** Sort in `resolveAllButtons()` (recommended)
```typescript
const sortedButtons = buttons.sort((a, b) => {
  if (a.persistent && !b.persistent) return -1;
  if (!a.persistent && b.persistent) return 1;
  return a.position - b.position;
});
```

**Option B:** Sort in BoardScreen after fetching

**Note:** This is display-order only. The `position` field in DB remains unchanged for drag-reorder (post-MVP).

---

### 5. About/Settings Screen

**Location:** `src/components/AboutScreen.tsx`

**Spec:** UI_DESIGN.md §About / Settings Screen (lines 965-1057)

**Modal behavior:**
- Full-screen modal, slide up from bottom, 300ms
- Background: `background`
- ScrollView for content
- Respect safe area insets

**Header:**
- 56px, `surface` background
- "About VibeDeck" — 18px bold, centered
- Close button (✕) — 44×44px, right edge

**Content sections:**

1. **App identity** (centered)
   - Music icon (♪) — 48px, `primary` color
   - "VibeDeck" — 24px bold
   - "Version 1.0.0" — 14px, `textSecondary`

2. **How to Use** (section header: 16px bold)
   - 4 numbered steps (14px, `textSecondary`, line-height 22px):
     1. Import your audio files from the Library tab.
     2. Create tags (like "Timeout", "Score") in the Tags tab.
     3. Assign tags to your tracks.
     4. Your board fills with buttons. Tap to play!

3. **Understanding Played Tracks** (section header)
   - Explain random selection from unplayed pool
   - Explain count badge
   - Explain auto-reset when pool empties
   - Mention ⟳ button for manual reset

4. **Pinned Buttons** (section header)
   - Explain long-press to pin
   - Explain pinned buttons stay at top

**Styling:**
- Section dividers: 1px `surfaceLight`, 24px vertical margin
- Content padding: 20px horizontal
- Section headers: 24px top margin

**Integration:** Open from BoardHeader settings icon

---

### 6. Empty Tag Button UI

**Location:** `src/components/BoardButton.tsx`

**Spec:** UI_DESIGN.md §Empty Tag Button State (lines 1060-1093)

**Condition:** `button.isEmpty === true` (already exists in ButtonResolved type)

**Visual changes when empty:**

| Property | Normal | Empty |
|----------|--------|-------|
| Background | Tag color | `surface` (Colors.surface) |
| Opacity | 100% | 50% |
| Text color | White | `textMuted` |
| Count badge | Shows number | Hidden |
| Border | None | 2px dashed `surfaceLight` |
| Label | Tag name | "No Tracks" |
| Type indicator | Normal | 30% opacity |

**Behavior when empty:**
- Return early from `onPress` — no action
- No haptic feedback
- Still renders (user should see the button exists but is inactive)

**Implementation hint:**
```typescript
if (button.isEmpty) {
  // Early return or disabled styling
}
```

---

## Testing Checklist

After implementation, verify:

- [ ] Board header displays with Reset and Settings icons
- [ ] Reset confirmation shows with correct text and warning color
- [ ] Reset actually clears played flags (check count badges)
- [ ] Toast appears after reset
- [ ] Long-press on button opens context menu after 500ms
- [ ] Haptic fires on menu open
- [ ] Pin/Unpin toggles persistent flag
- [ ] Pinned buttons show pin icon
- [ ] Pinned buttons sort to top of grid
- [ ] Remove button shows confirmation, then removes
- [ ] Settings icon opens About screen
- [ ] About screen scrolls, shows all sections
- [ ] About screen close button works
- [ ] Empty tag buttons are grayed out with dashed border
- [ ] Empty tag buttons show "No Tracks" label
- [ ] Tapping empty tag button does nothing

---

## Files to Modify/Create

**New files:**
- `src/components/BoardHeader.tsx`
- `src/components/ButtonContextMenu.tsx`
- `src/components/AboutScreen.tsx`

**Modified files:**
- `app/(tabs)/index.tsx` — Add header, long-press handling, context menu, about modal
- `src/components/BoardButton.tsx` — Empty state styling
- `src/stores/useButtonStore.ts` — Sort persistent buttons to top (if Option A)

---

## Existing Infrastructure

**Already exists:**
- `resetAllPools()` in `src/services/tagPool/index.ts`
- `useTrackStore.resetAllPlayed()`
- `useButtonStore.updateButton(id, { persistent })`
- `useButtonStore.removeButton(id)`
- `Toast` component
- `DeleteConfirmation` component (pattern to follow)
- `ButtonResolved.isEmpty` flag
- `button.persistent` flag
- Pin icon already renders in BoardButton when persistent

---

## Questions for Pyrrhaxis

None — designs are complete and approved. Proceed with implementation.

---

*Vaelthrix the Astral — "The architecture supports you. Build with confidence."*
