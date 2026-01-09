/**
 * @file app/(tabs)/index.tsx
 * @description Board screen - the main button board for playing audio.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { FontAwesome } from '@expo/vector-icons';
import {
  ButtonBoard,
  PlaybackControls,
  NowPlaying,
  Toast,
} from '../../src/components';
import { Colors } from '../../src/constants/colors';
import { Layout } from '../../src/constants/layout';
import type { ButtonResolved } from '../../src/types';
import { useButtonStore } from '../../src/stores/useButtonStore';
import { usePlayerStore } from '../../src/stores/usePlayerStore';
import { useTrackStore } from '../../src/stores/useTrackStore';
import {
  playTrack,
  stop as playerStop,
  applyVolume,
  registerPlaybackStateCallback,
  registerPlaybackErrorCallback,
} from '../../src/services/player';
import { selectTrackForTag } from '../../src/services/tagPool';

export default function BoardScreen() {
  // Store connections
  const resolveAllButtons = useButtonStore((state) => state.resolveAllButtons);
  const storeButtons = useButtonStore((state) => state.buttons); // Subscribe to button changes
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const markPlayed = useTrackStore((state) => state.markPlayed);

  // Local state
  const [buttons, setButtons] = useState<ButtonResolved[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingButtonId, setPlayingButtonId] = useState<string | null>(null);
  const [localVolume, setLocalVolume] = useState(volume);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'warning' | 'info'>('error');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [shakingButtonId, setShakingButtonId] = useState<string | null>(null);

  // Track if callbacks are registered
  const callbacksRegistered = useRef(false);

  // Sync local volume with store volume on mount
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  /**
   * Show a toast notification.
   */
  const showToast = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  /**
   * Trigger shake animation for a button (pool exhausted feedback).
   */
  const triggerShake = useCallback((buttonId: string) => {
    setShakingButtonId(buttonId);
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      setShakingButtonId(null);
    });
  }, [shakeAnim]);

  // Fade in when loading completes
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeAnim]);

  // Load and resolve buttons (re-run when store buttons change)
  useEffect(() => {
    async function loadResolvedButtons() {
      setIsLoading(true);
      try {
        const resolved = await resolveAllButtons();
        setButtons(resolved);
      } catch (err) {
        console.error('[BoardScreen] Failed to resolve buttons:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadResolvedButtons();
  }, [resolveAllButtons, storeButtons]);

  // HT-015: Re-resolve buttons when Board tab gains focus
  // Handles staleness from Library/Tags screen changes (tag-track associations, etc.)
  useFocusEffect(
    useCallback(() => {
      async function refreshOnFocus() {
        try {
          const resolved = await resolveAllButtons();
          setButtons(resolved);
        } catch (err) {
          console.error('[BoardScreen] Failed to refresh buttons on focus:', err);
        }
      }
      refreshOnFocus();
    }, [resolveAllButtons])
  );

  // Register playback callbacks
  useEffect(() => {
    if (callbacksRegistered.current) return;

    registerPlaybackStateCallback((playing, track) => {
      usePlayerStore.getState().setIsPlaying(playing);
      if (track) {
        usePlayerStore.getState().play(track);
      }
      if (!playing && !track) {
        // Track ended or stopped
        setPlayingButtonId(null);
        usePlayerStore.getState().stop();
      }
    });

    registerPlaybackErrorCallback((error) => {
      console.error('[BoardScreen] Playback error:', error.userMessage);
      showToast(error.userMessage, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    });

    callbacksRegistered.current = true;
  }, []);

  /**
   * Refresh button display after played flag changes.
   */
  const refreshButtons = useCallback(async () => {
    try {
      const resolved = await resolveAllButtons();
      setButtons(resolved);
    } catch (err) {
      console.error('[BoardScreen] Failed to refresh buttons:', err);
    }
  }, [resolveAllButtons]);

  /**
   * Handle button press.
   * For tag buttons: select random unplayed track and play
   * For direct buttons: play the linked track
   */
  const handleButtonPress = useCallback(async (button: ButtonResolved) => {
    if (button.isDisabled) return;

    // Haptic feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If same button is playing, stop it
    if (playingButtonId === button.id) {
      await playerStop();
      setPlayingButtonId(null);
      return;
    }

    if (button.type === 'tag' && button.tagId) {
      // Tag button: select random unplayed track
      const result = await selectTrackForTag(button.tagId, markPlayed);

      if (!result.track) {
        // Pool exhausted - shake the button and show feedback
        console.log('[BoardScreen] Pool exhausted for tag:', button.tagId);
        triggerShake(button.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast('All tracks played. Long-press to reset pool.', 'warning');
        return;
      }

      const playResult = await playTrack(result.track);
      if (playResult.success) {
        setPlayingButtonId(button.id);
        usePlayerStore.getState().play(result.track);
        // Refresh buttons to update availableTracks count
        await refreshButtons();
      } else {
        console.error('[BoardScreen] Playback failed:', playResult.error?.userMessage);
        showToast(playResult.error?.userMessage || 'Playback failed', 'error');
      }
    } else if (button.type === 'direct' && button.track) {
      // Direct button: play specific track
      const playResult = await playTrack(button.track);
      if (playResult.success) {
        setPlayingButtonId(button.id);
        usePlayerStore.getState().play(button.track);
      } else {
        console.error('[BoardScreen] Playback failed:', playResult.error?.userMessage);
        showToast(playResult.error?.userMessage || 'Playback failed', 'error');
      }
    }
  }, [playingButtonId, markPlayed, refreshButtons, triggerShake, showToast]);

  /**
   * Handle button long press - placeholder for edit mode
   */
  const handleButtonLongPress = useCallback((button: ButtonResolved) => {
    console.log('[BoardScreen] Button long-pressed:', button.name);
    // TODO: Navigate to button edit modal (deferred)
  }, []);

  /**
   * Handle stop button press
   */
  const handleStop = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playerStop();
    setPlayingButtonId(null);
  }, []);

  /**
   * Handle volume change during sliding (local state only for responsiveness)
   */
  const handleVolumeChange = useCallback((value: number) => {
    setLocalVolume(value);
  }, []);

  /**
   * Handle volume change complete - persist to storage and apply to player
   */
  const handleVolumeChangeComplete = useCallback(async (value: number) => {
    await usePlayerStore.getState().setVolume(value);
    await applyVolume(value);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading board...</Text>
      </View>
    );
  }

  // Empty state
  if (buttons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="light" />
        <View style={styles.emptyIconContainer}>
          <FontAwesome name="th-large" size={64} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No buttons yet</Text>
        <Text style={styles.emptySubtitle}>
          Add tracks to your library, create tags, then add buttons to your board.
        </Text>
        <View style={styles.emptyHint}>
          <FontAwesome name="arrow-down" size={16} color={Colors.primary} />
          <Text style={styles.emptyHintText}>Start with Library or Tags below</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" />
      <ButtonBoard
        buttons={buttons}
        playingButtonId={playingButtonId}
        shakingButtonId={shakingButtonId}
        shakeAnim={shakeAnim}
        onButtonPress={handleButtonPress}
        onButtonLongPress={handleButtonLongPress}
      >
        <PlaybackControls
          volume={localVolume}
          onVolumeChange={handleVolumeChange}
          onVolumeChangeComplete={handleVolumeChangeComplete}
          onStop={handleStop}
          isPlaying={isPlaying}
        />
        <NowPlaying track={currentTrack} isPlaying={isPlaying} />
      </ButtonBoard>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        position="top"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyIconContainer: {
    marginBottom: Layout.spacing.xl,
    opacity: 0.5,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.xl,
    gap: Layout.spacing.sm,
  },
  emptyHintText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
