/**
 * @file components/tags/EmptyTags.tsx
 * @description Empty state for Tags screen when no tags exist.
 * @see docs/UI_DESIGN.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface EmptyTagsProps {
  /** Called when create button is pressed */
  onCreate: () => void;
  /** Optional test ID */
  testID?: string;
}

export function EmptyTags({ onCreate, testID }: EmptyTagsProps) {
  return (
    <View style={styles.container} testID={testID}>
      <FontAwesome
        name="tag"
        size={64}
        color={Colors.textMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>No tags yet</Text>
      <Text style={styles.subtitle}>
        Create tags to organize your{'\n'}sounds by category
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onCreate}
        accessibilityRole="button"
        accessibilityLabel="Create First Tag"
      >
        <FontAwesome name="plus" size={16} color={Colors.text} />
        <Text style={styles.buttonText}>Create First Tag</Text>
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
