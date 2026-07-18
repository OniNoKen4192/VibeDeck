# Handoff: Tab Position Fix (HT-026)

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-14
**Related Quest:** 1.1.0 QA — HT-026 Tab Position Regression

---

## Context

During 1.1.0 QA testing, the ape discovered that the tab bar has moved from the bottom of the screen to the top. This is a regression from the swipe gestures feature you implemented. The playback controls at the bottom are now partially obscured by the Android system navigation bar.

## Root Cause

When implementing swipe gestures, `MaterialTopTabNavigator` replaced Expo Router's `<Tabs>`. The original handoff spec included `tabBarPosition: 'bottom'` but this was omitted during implementation. `MaterialTopTabNavigator` defaults to top positioning.

The `CustomTabBar` component styling is correct — it's just being rendered in the wrong position by the navigator.

## The Fix

Add one line to [app/(tabs)/_layout.tsx:79](../../app/(tabs)/_layout.tsx#L79):

```tsx
// Current (line 79-83):
screenOptions={{
  swipeEnabled: true,
  animationEnabled: true,
  lazy: true,
}}

// Fixed:
screenOptions={{
  tabBarPosition: 'bottom',  // <-- ADD THIS LINE
  swipeEnabled: true,
  animationEnabled: true,
  lazy: true,
}}
```

## Verification

1. Build and run on Android emulator
2. Confirm tab bar (Board / Library / Tags) appears at bottom of screen
3. Confirm playback controls are fully visible above the tab bar
4. Confirm swipe gestures still work (swipe left/right to change tabs)
5. Report back to QA that HT-026 is resolved

## Key Files

| File | Change |
|------|--------|
| [app/(tabs)/_layout.tsx](../../app/(tabs)/_layout.tsx) | Add `tabBarPosition: 'bottom'` to screenOptions |

## Gotchas / Notes

- This is a **blocking** QA issue — playback controls being obscured prevents testing B1 (Pause/Play) and B2 (Volume Slider)
- No other files need changes — the fix is fully isolated
- The `CustomTabBar` already has correct safe area handling via `useSafeAreaInsets()`

---

*Handed off by Vaelthrix the Astral*
