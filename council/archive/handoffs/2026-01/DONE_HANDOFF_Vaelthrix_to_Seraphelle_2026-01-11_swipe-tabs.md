# Handoff: Swipe to Change Tab

**From:** Vaelthrix the Astral
**To:** Seraphelle the Gilded
**Date:** 2026-01-11
**Related Quest:** 1.1.0 Feature — Swipe to change tab

---

## Context

Users want to swipe horizontally to switch between Board, Library, and Tags tabs instead of only tapping the tab bar. This is a common mobile UX pattern that feels natural.

## Current State

**Tab Layout** (`app/(tabs)/_layout.tsx`):
- Uses Expo Router's `Tabs` component (bottom tabs)
- Three tabs: Board (index), Library, Tags
- Bottom tabs don't support swipe gestures natively

## Solution: Material Top Tabs

React Navigation's Material Top Tab Navigator supports swipe gestures out of the box. We'll use a hybrid approach:
- **Material Top Tabs** for swipe gesture handling
- **Custom bottom tab bar** to maintain our existing UI

### Why This Approach?

1. Material Top Tabs have built-in swipe support via `react-native-pager-view`
2. We keep the bottom tab bar (just reposition the tab indicator)
3. Swipe gestures work between all screens automatically

---

## Installation

**Step 1:** Install required packages:

```bash
npx expo install @react-navigation/material-top-tabs react-native-pager-view
```

---

## Implementation

### 1. Update `app/(tabs)/_layout.tsx`

Replace the current implementation with Material Top Tabs + custom bottom bar:

```tsx
/**
 * @file app/(tabs)/_layout.tsx
 * @description Tab navigator with swipe gesture support via Material Top Tabs.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Layout } from '../../src/constants/layout';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  React.ComponentProps<typeof Navigator>['children'],
  typeof Navigator
>(Navigator);

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} {...props} />;
}

interface TabBarProps {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  navigation: { navigate: (name: string) => void };
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'index', label: 'Board', icon: 'th-large' as const },
    { name: 'library', label: 'Library', icon: 'music' as const },
    { name: 'tags', label: 'Tags', icon: 'tag' as const },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab, index) => {
        const isActive = state.index === index;
        const color = isActive ? Colors.primary : Colors.textSecondary;

        return (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.name)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <TabBarIcon name={tab.icon} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarPosition: 'bottom', // Keeps swipe but positions bar at bottom
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true, // Don't render screens until they're visited
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Board',
        }}
      />
      <MaterialTopTabs.Screen
        name="library"
        options={{
          title: 'Library',
        }}
      />
      <MaterialTopTabs.Screen
        name="tags"
        options={{
          title: 'Tags',
        }}
      />
      {/* Hide the old two.tsx screen */}
      <MaterialTopTabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </MaterialTopTabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  tabLabel: {
    fontSize: 12,
  },
});
```

---

## Alternative: Simpler Approach

If the full Material Top Tabs integration proves complex, there's a simpler approach using `tabBarPosition: 'bottom'` in the screenOptions. However, this may require testing.

The key is that `react-native-pager-view` provides the swipe gesture handling under the hood.

---

## Testing Checklist

1. **Swipe left** from Board → goes to Library
2. **Swipe left** from Library → goes to Tags
3. **Swipe right** from Tags → goes to Library
4. **Swipe right** from Library → goes to Board
5. Tab bar taps still work
6. Active tab indicator updates correctly
7. Swipe animation is smooth
8. Screen state preserved when switching tabs
9. Safe area insets respected on bottom bar

---

## Gotchas / Notes

1. **Screen headers** — Board has `headerShown: false` (uses BoardHeader). Library and Tags show default headers. This should continue working.

2. **Lazy loading** — `lazy: true` prevents all screens from mounting immediately. Good for performance.

3. **Keyboard dismissal** — Consider adding `keyboardDismissMode: 'on-drag'` if keyboard stays open during swipe.

4. **Two.tsx** — Hidden screen. Keep `href: null` to prevent it from showing.

5. **Tab bar height** — Match the existing height (approx 49-56px) for visual consistency.

---

## Key Files

| File | Change |
|------|--------|
| `package.json` | Add material-top-tabs, pager-view |
| `app/(tabs)/_layout.tsx` | Replace Tabs with MaterialTopTabs |

---

*Handed off by Vaelthrix the Astral*

Sources consulted:
- [Material Top Tab Navigator | React Navigation](https://reactnavigation.org/docs/material-top-tab-navigator/)
- [Expo Router Advanced Tabs](https://docs.expo.dev/router/advanced/tabs/)
