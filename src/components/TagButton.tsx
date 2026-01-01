import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSongStore } from '../stores/songStore';
import { usePlayerStore } from '../stores/playerStore';
import { colors } from '../constants/colors';

interface TagButtonProps {
  tag: string;
}

export function TagButton({ tag }: TagButtonProps) {
  const songs = useSongStore((s) => s.getSongsForTag(tag));
  const unplayedSongs = useSongStore((s) => s.getUnplayedSongsForTag(tag));
  const markSongPlayed = useSongStore((s) => s.markSongPlayed);
  const resetTagGroup = useSongStore((s) => s.resetTagGroup);

  const currentlyPlaying = usePlayerStore((s) => s.currentlyPlaying);
  const play = usePlayerStore((s) => s.play);
  const stop = usePlayerStore((s) => s.stop);

  const isPlaying = currentlyPlaying?.tagGroup === tag;
  const isExhausted = unplayedSongs.length === 0 && songs.length > 0;
  const isEmpty = songs.length === 0;

  const handlePress = async () => {
    if (isPlaying) {
      await stop();
      return;
    }

    let availableSongs = unplayedSongs;
    if (isExhausted) {
      resetTagGroup(tag);
      availableSongs = songs;
    }

    if (availableSongs.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    const song = availableSongs[randomIndex];

    await play(song.id, tag, song.fileUri);
    markSongPlayed(tag, song.id);
  };

  const displayName = useMemo(() => {
    return tag
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [tag]);

  const buttonStyle = [
    styles.button,
    isPlaying && styles.buttonPlaying,
    isExhausted && !isPlaying && styles.buttonExhausted,
    isEmpty && styles.buttonEmpty,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isEmpty}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{isPlaying ? '♪' : '▶'}</Text>
      <Text style={[styles.label, isEmpty && styles.labelEmpty]}>
        {displayName}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {isExhausted && !isPlaying
            ? '↻'
            : `${unplayedSongs.length}/${songs.length}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonPlaying: {
    backgroundColor: colors.playing,
    borderColor: colors.playing,
    shadowColor: colors.playing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonExhausted: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderColor: colors.exhausted,
    borderStyle: 'dashed',
  },
  buttonEmpty: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  icon: {
    fontSize: 28,
    color: colors.text,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  labelEmpty: {
    color: colors.exhausted,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text,
  },
});
