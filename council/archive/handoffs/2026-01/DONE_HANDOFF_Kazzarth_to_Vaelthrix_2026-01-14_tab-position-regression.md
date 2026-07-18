# Handoff: Tab Position Regression (HT-026)

**From:** Kazzarth the Blue
**To:** Vaelthrix the Astral
**Date:** 2026-01-14
**Related Quest:** 1.1.0 QA Testing

---

## Context

During 1.1.0 QA testing, discovered that the tab bar has moved from the bottom of the screen to the top. This is a regression introduced by the swipe gestures feature. Playback controls at the bottom are now partially obscured by the Android system navigation bar.

## What Was Done

- Identified the regression during QA testing
- Traced root cause to commit `e3f9b07` (swipe gestures implementation)
- Documented as HT-026 in [TEST_PLAN_1.1.0.md](../qa/TEST_PLAN_1.1.0.md)

## What's Next

- Add `tabBarPosition: 'bottom'` to the `MaterialTopTabs` screenOptions
- Verify playback controls are no longer obscured after fix
- Continue 1.1.0 QA testing

## Key Files

- [app/(tabs)/_layout.tsx:79](../../app/(tabs)/_layout.tsx#L79) — the navigator configuration missing `tabBarPosition`

## Root Cause Analysis

The swipe gestures implementation replaced Expo Router's `<Tabs>` (bottom by default) with `MaterialTopTabNavigator` (top by default). A `CustomTabBar` component was created with bottom-bar styling, but the navigator's `tabBarPosition` was never set to `'bottom'`.

**Previous (working):**
```tsx
<Tabs screenOptions={{...}}>  // Expo Router Tabs — bottom by default
```

**Current (broken):**
```tsx
<MaterialTopTabs tabBar={(props) => <CustomTabBar {...props} />}>
  // Missing: tabBarPosition="bottom"
```

**Fix:**
```tsx
<MaterialTopTabs
  tabBar={(props) => <CustomTabBar {...props} />}
  screenOptions={{
    tabBarPosition: 'bottom',  // <-- ADD THIS
    swipeEnabled: true,
    animationEnabled: true,
    lazy: true,
  }}
>
```

## Gotchas / Notes

- This is a **blocking** issue — playback controls being obscured makes B1 (Pause/Play) and B2 (Volume Slider) testing difficult
- The swipe gesture functionality itself works correctly (B9.1, B9.2 passed)
- Existing 1.0 data survived the upgrade (persistence regression tests passed)

---

*Handed off by Kazzarth the Blue*
