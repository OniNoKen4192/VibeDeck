import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useSongStore } from '../stores/songStore';
import { TagButton } from './TagButton';
import { colors } from '../constants/colors';

export function ButtonBoard() {
  const getAllTags = useSongStore((s) => s.getAllTags);
  const tags = getAllTags();
  const { width } = useWindowDimensions();

  // Calculate columns based on screen width
  // iPad landscape ~1024+, iPad portrait ~768, iPhone ~390
  const numColumns = width > 900 ? 5 : width > 600 ? 4 : 3;
  const buttonWidth = (width - 32 - (numColumns - 1) * 12) / numColumns;

  if (tags.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyTitle}>No songs yet</Text>
        <Text style={styles.emptySubtitle}>
          Add songs in the Library tab to get started
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {tags.map((tag) => (
          <View key={tag} style={[styles.buttonWrapper, { width: buttonWidth }]}>
            <TagButton tag={tag} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  buttonWrapper: {
    aspectRatio: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
