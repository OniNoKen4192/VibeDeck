/**
 * @file components/ButtonContextMenu.tsx
 * @description Bottom sheet context menu for button long-press actions (pin/unpin, remove).
 * @see docs/UI_DESIGN.md §Long-Press Context Menu
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';
import type { ButtonResolved } from '../types';

interface ButtonContextMenuProps {
  /** Whether the menu is visible */
  visible: boolean;
  /** The button this menu is for */
  button: ButtonResolved | null;
  /** Called when menu should close */
  onClose: () => void;
  /** Called when pin/unpin is pressed */
  onTogglePin: (button: ButtonResolved) => void;
  /** Called when remove is pressed */
  onRemove: (button: ButtonResolved) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.4;

export function ButtonContextMenu({
  visible,
  button,
  onClose,
  onTogglePin,
  onRemove,
}: ButtonContextMenuProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(MAX_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(MAX_HEIGHT);
    }
  }, [visible, slideAnim]);

  const handleOverlayPress = () => {
    Animated.timing(slideAnim, {
      toValue: MAX_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handlePinPress = () => {
    if (button) {
      onTogglePin(button);
    }
    handleOverlayPress();
  };

  const handleRemovePress = () => {
    if (button) {
      onRemove(button);
    }
    // Don't auto-close — let the parent show confirmation dialog
  };

  if (!button) return null;

  const isPinned = button.persistent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleOverlayPress}
    >
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + Layout.spacing.lg,
            },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Button name header */}
          <Text style={styles.buttonName} numberOfLines={1}>
            {button.name}
          </Text>

          {/* Pin / Unpin row */}
          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            onPress={handlePinPress}
            accessibilityRole="button"
            accessibilityLabel={isPinned ? 'Unpin from board' : 'Pin to board'}
          >
            <FontAwesome
              name="thumb-tack"
              size={20}
              color={Colors.text}
              style={isPinned ? styles.pinnedIcon : undefined}
            />
            <Text style={styles.menuText}>
              {isPinned ? 'Unpin from Board' : 'Pin to Board'}
            </Text>
          </Pressable>

          {/* Remove row */}
          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            onPress={handleRemovePress}
            accessibilityRole="button"
            accessibilityLabel="Remove button"
          >
            <FontAwesome name="trash-o" size={20} color={Colors.error} />
            <Text style={[styles.menuText, styles.removeText]}>Remove Button</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: MAX_HEIGHT,
    paddingTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Layout.spacing.lg,
  },
  buttonName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: Layout.spacing.lg,
    gap: 12,
    borderRadius: 8,
  },
  menuRowPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  removeText: {
    color: Colors.error,
  },
  pinnedIcon: {
    transform: [{ rotate: '45deg' }],
  },
});
