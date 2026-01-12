/**
 * @file app/(tabs)/_layout.tsx
 * @description Tab navigator with swipe gesture support via Material Top Tabs.
 * Uses a custom bottom tab bar to maintain VibeDeck's existing UI.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { withLayoutContext } from 'expo-router';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
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
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
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
          tabBarItemStyle: { display: 'none' },
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
