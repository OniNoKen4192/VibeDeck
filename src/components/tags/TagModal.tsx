/**
 * @file components/tags/TagModal.tsx
 * @description Modal for creating and editing tags with name input and color picker.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { ColorPicker } from './ColorPicker';
import { DeleteConfirmation } from '../modals/DeleteConfirmation';
import type { TagWithCount } from '../../types';

interface TagModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Tag to edit (null for create mode) */
  tag: TagWithCount | null;
  /** Called when modal is closed */
  onClose: () => void;
  /** Called when tag is saved (create or update) */
  onSave: (name: string, color: string) => void;
  /** Called when tag is deleted (edit mode only) */
  onDelete?: (tag: TagWithCount) => void;
  /** Optional test ID */
  testID?: string;
}

export function TagModal({
  visible,
  tag,
  onClose,
  onSave,
  onDelete,
  testID,
}: TagModalProps) {
  const isEditMode = tag !== null;
  const [name, setName] = useState('');
  const [color, setColor] = useState(Colors.tagColors[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset form when modal opens/closes or tag changes
  useEffect(() => {
    if (visible) {
      if (tag) {
        setName(tag.name);
        setColor(tag.color || Colors.tagColors[0]);
      } else {
        setName('');
        setColor(Colors.tagColors[0]);
      }
      setNameError(null);
    }
  }, [visible, tag]);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();

    // Validate name
    if (!trimmedName) {
      setNameError('Tag name is required');
      return;
    }
    if (trimmedName.length > 50) {
      setNameError('Tag name must be 50 characters or less');
      return;
    }

    onSave(trimmedName, color);
  }, [name, color, onSave]);

  const handleDelete = useCallback(() => {
    if (tag && onDelete) {
      setShowDeleteConfirm(false);
      onClose();
      onDelete(tag);
    }
  }, [tag, onDelete, onClose]);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (nameError) {
      setNameError(null);
    }
  }, [nameError]);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        testID={testID}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditMode ? 'Edit Tag' : 'Create Tag'}
              </Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <FontAwesome name="times" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.content}>
              {/* Name input */}
              <View style={styles.field}>
                <Text style={styles.label}>Tag Name</Text>
                <TextInput
                  style={[styles.input, nameError && styles.inputError]}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="e.g., Timeout, Score, Walk-up"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoFocus
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                {nameError && <Text style={styles.errorText}>{nameError}</Text>}
              </View>

              {/* Color picker */}
              <View style={styles.field}>
                <Text style={styles.label}>Color</Text>
                <ColorPicker
                  selectedColor={color}
                  onSelectColor={setColor}
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && styles.savePressed,
                  ]}
                  onPress={handleSave}
                  accessibilityRole="button"
                  accessibilityLabel={isEditMode ? 'Save Tag' : 'Create Tag'}
                >
                  <Text style={styles.saveText}>
                    {isEditMode ? 'Save Tag' : 'Create Tag'}
                  </Text>
                </Pressable>

                {isEditMode && onDelete && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.deletePressed,
                    ]}
                    onPress={() => setShowDeleteConfirm(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete Tag"
                  >
                    <Text style={styles.deleteText}>Delete Tag</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete confirmation */}
      {tag && (
        <DeleteConfirmation
          visible={showDeleteConfirm}
          title="Delete Tag?"
          message={`This will remove "${tag.name}" from ${tag.trackCount} track${tag.trackCount !== 1 ? 's' : ''}. This cannot be undone.`}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  content: {
    padding: Layout.spacing.xl,
  },
  field: {
    marginBottom: Layout.spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Layout.spacing.lg,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Layout.spacing.xs,
  },
  actions: {
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: Layout.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  savePressed: {
    backgroundColor: Colors.primaryDark,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
    padding: Layout.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  deletePressed: {
    backgroundColor: Colors.surfaceLight,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
});
