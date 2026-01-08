/**
 * @file components/library/LibraryHeader.tsx
 * @description Header for Library screen with title and import button.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface LibraryHeaderProps {
  /** Called when import button is pressed */
  onImport: () => void;
  /** Whether import is in progress */
  isImporting?: boolean;
  /** Optional test ID */
  testID?: string;
}

export function LibraryHeader({
  onImport,
  isImporting = false,
  testID,
}: LibraryHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Library</Text>
      <Pressable
        style={({ pressed }) => [
          styles.importButton,
          pressed && !isImporting && styles.importPressed,
          isImporting && styles.importDisabled,
        ]}
        onPress={onImport}
        disabled={isImporting}
        accessibilityRole="button"
        accessibilityLabel={isImporting ? 'Importing...' : 'Import tracks'}
        accessibilityState={{ disabled: isImporting }}
      >
        <FontAwesome
          name={isImporting ? 'spinner' : 'plus'}
          size={14}
          color={Colors.text}
        />
        <Text style={styles.importText}>
          {isImporting ? 'Importing...' : 'Import'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 20,
    gap: Layout.spacing.xs,
  },
  importPressed: {
    backgroundColor: Colors.primaryDark,
  },
  importDisabled: {
    opacity: 0.7,
  },
  importText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
