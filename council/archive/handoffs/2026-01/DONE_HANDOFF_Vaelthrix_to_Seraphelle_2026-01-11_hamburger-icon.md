# Handoff: Gear → Hamburger Icon

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Gear → Hamburger icon, rename to "About"

---

## Context

The gear/cog icon implies "Settings" but the screen is really just an "About" screen with app info. Change the icon to a hamburger menu and rename references from "Settings" to "About" for clarity.

## Current State

**File:** `src/components/BoardHeader.tsx`
- Line 45: `<FontAwesome name="cog" ...>` — gear icon
- Line 43: `accessibilityLabel="Open settings and about"`
- Line 17: `onSettingsPress: () => void;`

## Changes Required

### 1. Change icon from cog to bars (hamburger)

**File:** `src/components/BoardHeader.tsx` (line 45)

```tsx
// Before
<FontAwesome name="cog" size={24} color={Colors.textSecondary} />

// After
<FontAwesome name="bars" size={24} color={Colors.textSecondary} />
```

### 2. Update accessibility label

**File:** `src/components/BoardHeader.tsx` (line 43)

```tsx
// Before
accessibilityLabel="Open settings and about"

// After
accessibilityLabel="Open about screen"
```

### 3. Rename prop (optional but cleaner)

This is optional — purely for code clarity.

**File:** `src/components/BoardHeader.tsx`

```typescript
// Before (lines 16-17)
/** Called when the settings button is pressed */
onSettingsPress: () => void;

// After
/** Called when the about button is pressed */
onAboutPress: () => void;
```

If you rename the prop, also update:
- Line 20: parameter name
- Line 41: onPress handler reference

**File:** `app/(tabs)/index.tsx`

If prop renamed, update these references:
- Line 320: `handleSettingsPress` → `handleAboutPress`
- Line 407: `onSettingsPress={...}` → `onAboutPress={...}`
- Line 433: `onSettingsPress={...}` → `onAboutPress={...}`

### 4. Update file description comment

**File:** `src/components/BoardHeader.tsx` (line 3)

```typescript
// Before
* @description Header component for the Board screen with title, reset, and settings icons.

// After
* @description Header component for the Board screen with title, reset, and about icons.
```

## Key Files

| File | Change |
|------|--------|
| `src/components/BoardHeader.tsx` | Icon change, label update, optional prop rename |
| `app/(tabs)/index.tsx` | Update prop name if renamed |

## Gotchas / Notes

1. **FontAwesome "bars"** — This is the standard hamburger menu icon (three horizontal lines).

2. **Prop rename is optional** — If it feels like too much churn, just change the icon and accessibility label. The function name `onSettingsPress` still works, it's just semantically imprecise.

3. **AboutScreen.tsx is already named correctly** — The modal component is already called `AboutScreen` with title "About VibeDeck". No changes needed there.

4. **Don't change the screen content** — This handoff is just the icon and naming. The About screen content stays the same.

---

*Handed off by Vaelthrix the Astral*
