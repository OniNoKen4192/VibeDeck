/**
 * @file components/VolumeSlider.tsx
 * @description Custom pan-gesture volume slider with accessible touch targets.
 * @see docs/UI_DESIGN.md
 */

import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
  AccessibilityRole,
  DimensionValue,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

interface VolumeSliderProps {
  /** Current volume 0-100 */
  value: number;
  /** Called when volume changes */
  onValueChange: (value: number) => void;
  /** Called when sliding ends (for persisting) */
  onSlidingComplete?: (value: number) => void;
  /** Disable interaction */
  disabled?: boolean;
}

export function VolumeSlider({
  value,
  onValueChange,
  onSlidingComplete,
  disabled = false,
}: VolumeSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(200);
  const sliderRef = useRef<View>(null);
  const currentValueRef = useRef(value);

  // Update ref when value changes
  currentValueRef.current = value;

  const calculateValue = useCallback(
    (pageX: number, startX: number): number => {
      const position = pageX - startX;
      const percentage = Math.max(0, Math.min(1, position / sliderWidth));
      return Math.round(percentage * 100);
    },
    [sliderWidth]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        if (disabled) return;
        sliderRef.current?.measureInWindow((x) => {
          const newValue = calculateValue(evt.nativeEvent.pageX, x);
          onValueChange(newValue);
        });
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        if (disabled) return;
        sliderRef.current?.measureInWindow((x) => {
          const newValue = calculateValue(evt.nativeEvent.pageX, x);
          onValueChange(newValue);
        });
      },
      onPanResponderRelease: () => {
        if (disabled) return;
        onSlidingComplete?.(currentValueRef.current);
      },
    })
  ).current;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  }, []);

  const fillWidth: DimensionValue = `${value}%`;
  const thumbLeft: DimensionValue = `${value}%`;

  return (
    <View
      ref={sliderRef}
      style={[styles.container, disabled && styles.disabled]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      accessibilityRole={'adjustable' as AccessibilityRole}
      accessibilityLabel={`Volume ${value} percent`}
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      {/* Track background */}
      <View style={styles.track}>
        {/* Fill */}
        <View style={[styles.fill, { width: fillWidth }]} />
      </View>
      {/* Thumb */}
      <View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            marginLeft: -Layout.volumeThumbSize / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Layout.volumeSliderHeight,
    justifyContent: 'center',
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    height: Layout.volumeTrackHeight,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Layout.volumeTrackHeight / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Layout.volumeTrackHeight / 2,
  },
  thumb: {
    position: 'absolute',
    width: Layout.volumeThumbSize,
    height: Layout.volumeThumbSize,
    borderRadius: Layout.volumeThumbSize / 2,
    backgroundColor: Colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
