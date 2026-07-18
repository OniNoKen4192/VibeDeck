/**
 * @file components/modals/VolumeAdjustSlider.tsx
 * @description Button-based per-track volume adjustment (-50 to +50).
 * Uses discrete buttons instead of slider to avoid ScrollView gesture conflicts on Android.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface VolumeAdjustSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const STEP = 5;
const MIN_VALUE = -50;
const MAX_VALUE = 50;

export function VolumeAdjustSlider({ value, onChange }: VolumeAdjustSliderProps) {
  const displayValue = value ?? 0;
  const label = displayValue === 0
    ? 'Normal'
    : displayValue > 0
      ? `+${displayValue}%`
      : `${displayValue}%`;

  const handleDecrease = () => {
    const newValue = Math.max(MIN_VALUE, displayValue - STEP);
    onChange(newValue === 0 ? null : newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(MAX_VALUE, displayValue + STEP);
    onChange(newValue === 0 ? null : newValue);
  };

  const handleReset = () => {
    onChange(null);
  };

  const canDecrease = displayValue > MIN_VALUE;
  const canIncrease = displayValue < MAX_VALUE;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Quieter</Text>
        <Text style={styles.value}>{label}</Text>
        <Text style={styles.label}>Louder</Text>
      </View>

      <View style={styles.controlRow}>
        <Pressable
          style={[styles.button, !canDecrease && styles.buttonDisabled]}
          onPress={handleDecrease}
          disabled={!canDecrease}
          accessibilityRole="button"
          accessibilityLabel="Decrease volume"
        >
          <FontAwesome
            name="minus"
            size={16}
            color={canDecrease ? Colors.text : Colors.textMuted}
          />
        </Pressable>

        <Pressable
          style={[styles.resetButton, displayValue === 0 && styles.resetButtonActive]}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset to normal volume"
        >
          <Text style={[
            styles.resetText,
            displayValue === 0 && styles.resetTextActive
          ]}>
            Reset
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, !canIncrease && styles.buttonDisabled]}
          onPress={handleIncrease}
          disabled={!canIncrease}
          accessibilityRole="button"
          accessibilityLabel="Increase volume"
        >
          <FontAwesome
            name="plus"
            size={16}
            color={canIncrease ? Colors.text : Colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Visual indicator bar */}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${((displayValue - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100}%`,
              }
            ]}
          />
          <View style={styles.barCenter} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Layout.spacing.lg,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  resetButton: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
  },
  resetButtonActive: {
    backgroundColor: Colors.primary,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  resetTextActive: {
    color: Colors.text,
  },
  barContainer: {
    paddingHorizontal: Layout.spacing.sm,
  },
  barBackground: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  barCenter: {
    position: 'absolute',
    left: '50%',
    top: -2,
    width: 2,
    height: 8,
    backgroundColor: Colors.textMuted,
    marginLeft: -1,
  },
});
