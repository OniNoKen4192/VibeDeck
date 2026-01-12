/**
 * @file components/modals/CuePointEditor.tsx
 * @description Editor for setting track start/end cue points.
 * Allows users to define the playable segment of a track.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { formatDuration } from '../../utils/time';

interface CuePointEditorProps {
  durationMs: number | null;
  startTimeMs: number | null;
  endTimeMs: number | null;
  onChange: (startMs: number | null, endMs: number | null) => void;
}

type EditingField = 'start' | 'end' | null;

/**
 * Parse a time string in M:SS or MM:SS format to milliseconds.
 * Returns null if invalid.
 */
function parseTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match formats: "1:30", "01:30", "90" (seconds only)
  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10);
    const seconds = parseInt(colonMatch[2], 10);
    if (seconds >= 60) return null;
    return (minutes * 60 + seconds) * 1000;
  }

  // Seconds only: "90" -> 1:30
  const secondsOnly = trimmed.match(/^(\d+)$/);
  if (secondsOnly) {
    const seconds = parseInt(secondsOnly[1], 10);
    return seconds * 1000;
  }

  return null;
}

/**
 * Format milliseconds as M:SS for editing (no leading zero on minutes).
 */
function formatForEdit(ms: number | null): string {
  if (ms === null || ms < 0) return '';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function CuePointEditor({
  durationMs,
  startTimeMs,
  endTimeMs,
  onChange,
}: CuePointEditorProps) {
  const [editing, setEditing] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = useCallback(() => {
    setEditValue(formatForEdit(startTimeMs));
    setEditing('start');
  }, [startTimeMs]);

  const handleEndEdit = useCallback(() => {
    setEditValue(formatForEdit(endTimeMs));
    setEditing('end');
  }, [endTimeMs]);

  const handleSave = useCallback(() => {
    const parsedMs = parseTimeInput(editValue);

    if (editing === 'start') {
      // Validate start time
      if (parsedMs !== null && durationMs) {
        const maxStart = (endTimeMs ?? durationMs) - 1000; // At least 1s before end
        const clampedStart = Math.max(0, Math.min(parsedMs, maxStart));
        onChange(clampedStart, endTimeMs);
      } else if (editValue.trim() === '') {
        // Empty means clear start
        onChange(null, endTimeMs);
      }
    } else if (editing === 'end') {
      // Validate end time
      if (parsedMs !== null && durationMs) {
        const minEnd = (startTimeMs ?? 0) + 1000; // At least 1s after start
        const clampedEnd = Math.max(minEnd, Math.min(parsedMs, durationMs));
        onChange(startTimeMs, clampedEnd);
      } else if (editValue.trim() === '') {
        // Empty means clear end
        onChange(startTimeMs, null);
      }
    }

    setEditing(null);
    setEditValue('');
  }, [editing, editValue, startTimeMs, endTimeMs, durationMs, onChange]);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setEditValue('');
  }, []);

  const handleClear = useCallback(() => {
    onChange(null, null);
  }, [onChange]);

  // Handle unknown duration case
  if (!durationMs) {
    return (
      <Text style={styles.unavailable}>
        Duration unknown - cue points unavailable
      </Text>
    );
  }

  const hasCustomCues = startTimeMs !== null || endTimeMs !== null;
  const displayStart = startTimeMs ?? 0;
  const displayEnd = endTimeMs ?? durationMs;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          style={styles.timeBlock}
          onPress={handleStartEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit start time"
        >
          <Text style={styles.label}>Start</Text>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatDuration(displayStart)}</Text>
            <FontAwesome name="pencil" size={10} color={Colors.textMuted} />
          </View>
        </Pressable>

        <FontAwesome name="arrow-right" size={16} color={Colors.textMuted} />

        <Pressable
          style={styles.timeBlock}
          onPress={handleEndEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit end time"
        >
          <Text style={styles.label}>End</Text>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatDuration(displayEnd)}</Text>
            <FontAwesome name="pencil" size={10} color={Colors.textMuted} />
          </View>
        </Pressable>
      </View>

      {/* Segment duration indicator */}
      <Text style={styles.segmentDuration}>
        Plays {formatDuration(displayEnd - displayStart)} of {formatDuration(durationMs)}
      </Text>

      {hasCustomCues && (
        <Pressable
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear cue points"
        >
          <FontAwesome name="times" size={14} color={Colors.textSecondary} />
          <Text style={styles.clearText}>Clear Cues</Text>
        </Pressable>
      )}

      {/* Time input modal */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={styles.inputTitle}>
              {editing === 'start' ? 'Set Start Time' : 'Set End Time'}
            </Text>
            <Text style={styles.inputHint}>
              Enter time as M:SS (e.g., 1:30) or seconds (e.g., 90)
            </Text>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              placeholder="0:00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numbers-and-punctuation"
              autoFocus
              selectTextOnFocus
              onSubmitEditing={handleSave}
            />
            <View style={styles.inputButtons}>
              <Pressable
                style={[styles.inputButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.inputButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.md,
  },
  unavailable: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.xl,
  },
  timeBlock: {
    alignItems: 'center',
    padding: Layout.spacing.sm,
  },
  label: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  segmentDuration: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Layout.spacing.sm,
  },
  clearText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  inputModal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Layout.spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: Layout.spacing.lg,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  inputButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  inputButton: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
});
