/**
 * @file components/NowPlaying.tsx
 * @description Track info display bar with animated speaker icon.
 * @see docs/UI_DESIGN.md
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';
import type { Track } from '../types';

interface NowPlayingProps {
  /** Currently playing track */
  track: Track | null;
  /** True if audio is playing (not paused) */
  isPlaying: boolean;
}

/**
 * Get display title for a track
 */
function getDisplayTitle(track: Track): string {
  if (track.title && track.artist) {
    return `${track.title} - ${track.artist}`;
  }
  if (track.title) {
    return track.title;
  }
  // Fall back to filename without extension
  const name = track.fileName;
  const lastDot = name.lastIndexOf('.');
  return lastDot > 0 ? name.substring(0, lastDot) : name;
}

export function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-Layout.nowPlayingHeight)).current;

  // Slide in/out animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: track ? 0 : -Layout.nowPlayingHeight,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [track, slideAnim]);

  // Speaker pulse animation when playing
  useEffect(() => {
    if (isPlaying && track) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: Layout.glowDuration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: Layout.glowDuration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, track, pulseAnim]);

  if (!track) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <FontAwesome
          name={isPlaying ? 'volume-up' : 'pause'}
          size={20}
          color={Colors.primary}
        />
      </Animated.View>
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        {getDisplayTitle(track)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Layout.nowPlayingHeight,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  text: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
});
