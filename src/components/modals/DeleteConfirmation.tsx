/**
 * @file components/modals/DeleteConfirmation.tsx
 * @description Confirmation dialog for destructive actions.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors, darkenColor } from '../../constants/colors';
import { Layout } from '../../constants/layout';

/**
 * Darken a hex color by a percentage.
 */
function darkenHex(hex: string, percent: number): string {
  return darkenColor(hex, percent);
}

interface DeleteConfirmationProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Title of the confirmation dialog */
  title: string;
  /** Descriptive message explaining what will be deleted */
  message: string;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Background color for the confirm button (default: error red) */
  confirmColor?: string;
  /** Called when cancel button is pressed */
  onCancel: () => void;
  /** Called when delete button is pressed */
  onConfirm: () => void;
  /** Optional test ID */
  testID?: string;
}

export function DeleteConfirmation({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  confirmColor = Colors.error,
  onCancel,
  onConfirm,
  testID,
}: DeleteConfirmationProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.cancelPressed,
              ]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? darkenHex(confirmColor, 10) : confirmColor },
              ]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.screenPadding,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Layout.spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Layout.spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  cancelPressed: {
    backgroundColor: Colors.surface,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
