/**
 * @file components/tags/ColorPicker.tsx
 * @description Color picker for selecting tag colors from predefined palette.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface ColorPickerProps {
  /** Currently selected color */
  selectedColor: string;
  /** Called when a color is selected */
  onSelectColor: (color: string) => void;
  /** Optional test ID */
  testID?: string;
}

export function ColorPicker({
  selectedColor,
  onSelectColor,
  testID,
}: ColorPickerProps) {
  return (
    <View style={styles.container} testID={testID}>
      {Colors.tagColors.map((color) => {
        const isSelected = color.toLowerCase() === selectedColor.toLowerCase();
        return (
          <Pressable
            key={color}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              isSelected && styles.selected,
            ]}
            onPress={() => onSelectColor(color)}
            accessibilityRole="radio"
            accessibilityLabel={`Color ${color}`}
            accessibilityState={{ selected: isSelected }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.md,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selected: {
    borderWidth: 3,
    borderColor: Colors.text,
    transform: [{ scale: 1.1 }],
  },
});
