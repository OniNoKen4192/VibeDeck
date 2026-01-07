/**
 * @file components/TypeIndicator.tsx
 * @description Visual indicator bar distinguishing tag buttons from direct buttons.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

export function TypeIndicator() {
  return <View style={styles.indicator} />;
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    bottom: Layout.spacing.sm,
    left: Layout.spacing.sm,
    right: Layout.spacing.sm,
    height: Layout.typeIndicatorHeight,
    backgroundColor: Colors.text,
    opacity: 0.5,
    borderRadius: Layout.typeIndicatorHeight / 2,
  },
});
