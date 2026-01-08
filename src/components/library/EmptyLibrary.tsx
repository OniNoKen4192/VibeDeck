/**
 * @file components/library/EmptyLibrary.tsx
 * @description Empty state for Library screen when no tracks are imported.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface EmptyLibraryProps {
  /** Called when import button is pressed */
  onImport: () => void;
  /** Optional test ID */
  testID?: string;
}

export function EmptyLibrary({ onImport, testID }: EmptyLibraryProps) {
  return (
    <View style={styles.container} testID={testID}>
      <FontAwesome
        name="music"
        size={64}
        color={Colors.textMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>No tracks yet</Text>
      <Text style={styles.subtitle}>
        Tap "Import" to add audio files{'\n'}from your device
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onImport}
        accessibilityRole="button"
        accessibilityLabel="Import Tracks"
      >
        <FontAwesome name="plus" size={16} color={Colors.text} />
        <Text style={styles.buttonText}>Import Tracks</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding * 2,
  },
  icon: {
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
    borderRadius: 24,
    gap: Layout.spacing.sm,
  },
  buttonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
