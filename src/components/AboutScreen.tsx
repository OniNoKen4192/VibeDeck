/**
 * @file components/AboutScreen.tsx
 * @description About/Settings screen with app info and usage tutorial.
 * @see docs/UI_DESIGN.md §About / Settings Screen
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';

interface AboutScreenProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when the modal should close */
  onClose: () => void;
}

export function AboutScreen({ visible, onClose }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>About VibeDeck</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <FontAwesome name="times" size={20} color={Colors.text} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Layout.spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* App Identity */}
          <View style={styles.identity}>
            <View style={styles.appIcon}>
              <FontAwesome name="music" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>VibeDeck</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          <View style={styles.divider} />

          {/* How to Use */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>How to Use</Text>
            <View style={styles.steps}>
              <Text style={styles.step}>
                <Text style={styles.stepNumber}>1. </Text>
                Import your audio files from the Library tab.
              </Text>
              <Text style={styles.step}>
                <Text style={styles.stepNumber}>2. </Text>
                Create tags (like "Timeout", "Score") in the Tags tab.
              </Text>
              <Text style={styles.step}>
                <Text style={styles.stepNumber}>3. </Text>
                Assign tags to your tracks.
              </Text>
              <Text style={styles.step}>
                <Text style={styles.stepNumber}>4. </Text>
                Your board fills with buttons. Tap to play!
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Understanding Played Tracks */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Understanding Played Tracks</Text>
            <Text style={styles.body}>
              When you tap a tag button, VibeDeck picks a random track from that tag that hasn't been played yet this session.
            </Text>
            <Text style={styles.body}>
              The count badge shows how many tracks are still available. When it reaches zero, the pool automatically resets.
            </Text>
            <Text style={styles.body}>
              Use the <FontAwesome name="refresh" size={14} color={Colors.textSecondary} /> button in the header to manually reset all tracks at once.
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Pinned Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Pinned Buttons</Text>
            <Text style={styles.body}>
              Long-press any button to pin it. Pinned buttons stay at the top of your board and won't move around.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  closeButtonPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Layout.spacing.xl,
  },
  identity: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  appIcon: {
    marginBottom: Layout.spacing.md,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  version: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceLight,
    marginVertical: Layout.spacing.xl,
  },
  section: {
    marginBottom: Layout.spacing.md,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  steps: {
    gap: Layout.spacing.sm,
  },
  step: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  stepNumber: {
    fontWeight: '600',
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Layout.spacing.md,
  },
});
