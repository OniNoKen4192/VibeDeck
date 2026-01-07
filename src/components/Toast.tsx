/**
 * @file components/Toast.tsx
 * @description Toast notification component for displaying feedback messages.
 * @see docs/UI_DESIGN.md
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ToastProps {
  /** Message to display */
  message: string;
  /** Type of toast (affects color) */
  type?: ToastType;
  /** Whether the toast is visible */
  visible: boolean;
  /** Called when toast should be dismissed */
  onDismiss: () => void;
  /** Auto-dismiss duration in ms (default: 3000) */
  duration?: number;
  /** Position on screen */
  position?: 'top' | 'bottom';
}

const TOAST_COLORS: Record<ToastType, string> = {
  error: Colors.error,
  warning: Colors.warning,
  success: Colors.success,
  info: Colors.primary,
};

const TOAST_ICONS: Record<ToastType, string> = {
  error: 'exclamation-circle',
  warning: 'exclamation-triangle',
  success: 'check-circle',
  info: 'info-circle',
};

export function Toast({
  message,
  type = 'error',
  visible,
  onDismiss,
  duration = 3000,
  position = 'top',
}: ToastProps) {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    // Slide out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const positionStyle: ViewStyle = position === 'top'
    ? { top: Layout.spacing.xl + 44 } // Below status bar
    : { bottom: Layout.spacing.xl + Layout.tabBarHeight };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: TOAST_COLORS[type],
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={handleDismiss}
        accessibilityRole="alert"
        accessibilityLabel={`${type}: ${message}. Tap to dismiss.`}
      >
        <FontAwesome
          name={TOAST_ICONS[type] as keyof typeof FontAwesome.glyphMap}
          size={20}
          color={Colors.text}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <FontAwesome
          name="times"
          size={16}
          color={Colors.text}
          style={styles.closeIcon}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    borderRadius: Layout.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    minHeight: Layout.minTouchTarget,
  },
  icon: {
    marginRight: Layout.spacing.sm,
  },
  message: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  closeIcon: {
    marginLeft: Layout.spacing.sm,
    opacity: 0.7,
  },
});
