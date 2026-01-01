import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../stores/playerStore';
import { useSongStore } from '../stores/songStore';
import { colors } from '../constants/colors';

export function ControlBar() {
  const currentlyPlaying = usePlayerStore((s) => s.currentlyPlaying);
  const stop = usePlayerStore((s) => s.stop);
  const fadeOut = usePlayerStore((s) => s.fadeOut);
  const playGoalHorn = usePlayerStore((s) => s.playGoalHorn);
  const volume = usePlayerStore((s) => s.settings.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const goalHornUri = usePlayerStore((s) => s.settings.goalHornUri);
  const resetAllTagGroups = useSongStore((s) => s.resetAllTagGroups);

  const songs = useSongStore((s) => s.songs);
  const currentSong = currentlyPlaying
    ? songs.find((s) => s.id === currentlyPlaying.songId)
    : null;

  return (
    <View style={styles.container}>
      {/* Now playing display */}
      <View style={styles.nowPlaying}>
        {currentSong ? (
          <>
            <Text style={styles.nowPlayingTitle}>♪ {currentSong.title}</Text>
            <Text style={styles.nowPlayingArtist}>{currentSong.artist}</Text>
          </>
        ) : (
          <Text style={styles.nowPlayingEmpty}>No track playing</Text>
        )}
      </View>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={stop}
          disabled={!currentlyPlaying}
          style={[
            styles.controlButton,
            styles.stopButton,
            !currentlyPlaying && styles.controlButtonDisabled,
          ]}
        >
          <Text style={styles.controlButtonText}>■ Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={fadeOut}
          disabled={!currentlyPlaying}
          style={[
            styles.controlButton,
            !currentlyPlaying && styles.controlButtonDisabled,
          ]}
        >
          <Text style={styles.controlButtonText}>↘ Fade</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playGoalHorn}
          disabled={!goalHornUri}
          style={[
            styles.controlButton,
            styles.goalButton,
            !goalHornUri && styles.controlButtonDisabled,
          ]}
        >
          <Text style={[styles.controlButtonText, styles.goalButtonText]}>
            🚨 GOAL!
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetAllTagGroups}
          style={styles.controlButton}
        >
          <Text style={styles.controlButtonText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Volume slider */}
      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>🔊</Text>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
  },
  nowPlaying: {
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.playing,
  },
  nowPlayingArtist: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  nowPlayingEmpty: {
    fontSize: 16,
    color: colors.exhausted,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  stopButton: {
    backgroundColor: colors.stop,
    borderColor: colors.stop,
  },
  goalButton: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  goalButtonText: {
    color: '#000',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  volumeLabel: {
    fontSize: 18,
    marginRight: 8,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  volumeValue: {
    fontSize: 14,
    color: colors.textMuted,
    width: 45,
    textAlign: 'right',
  },
});
