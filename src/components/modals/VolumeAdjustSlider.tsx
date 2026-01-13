/**
 * @file components/modals/VolumeAdjustSlider.tsx
 * @description Slider for per-track volume adjustment (-50 to +50).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface VolumeAdjustSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function VolumeAdjustSlider({ value, onChange }: VolumeAdjustSliderProps) {
  const displayValue = value ?? 0;
  const label = displayValue === 0
    ? 'Normal'
    : displayValue > 0
      ? `+${displayValue}%`
      : `${displayValue}%`;

  const handleChange = (newValue: number) => {
    // Round to nearest 5 for easier adjustment
    const rounded = Math.round(newValue / 5) * 5;
    // Treat 0 as null (no adjustment)
    onChange(rounded === 0 ? null : rounded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Quieter</Text>
        <Text style={styles.value}>{label}</Text>
        <Text style={styles.label}>Louder</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={-50}
        maximumValue={50}
        step={5}
        value={displayValue}
        onValueChange={handleChange}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.surfaceLight}
        thumbTintColor={Colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.sm,
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
  slider: {
    width: '100%',
    height: 40,
  },
});
