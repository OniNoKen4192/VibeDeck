/**
 * @file components/CountBadge.tsx
 * @description Animated badge displaying unplayed track count for tag buttons.
 * @see docs/UI_DESIGN.md
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

interface CountBadgeProps {
  /** Number of unplayed tracks in the tag pool */
  count: number;
  /** Optional: animate on mount (default: false) */
  animateOnMount?: boolean;
}

export function CountBadge({ count, animateOnMount = false }: CountBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const prevCountRef = useRef(count);

  useEffect(() => {
    // Animate when count changes
    if (prevCountRef.current !== count) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: Layout.badgeBounceDuration / 2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
      prevCountRef.current = count;
    }
  }, [count, scaleAnim]);

  useEffect(() => {
    // Initial mount animation
    if (animateOnMount) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [animateOnMount, scaleAnim]);

  // Don't render badge if count is 0 or negative
  if (count <= 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.text}>
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    width: Layout.countBadgeSize,
    height: Layout.countBadgeSize,
    borderRadius: Layout.countBadgeSize / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.text,
    fontSize: Layout.countBadgeFontSize,
    fontWeight: 'bold',
  },
});
