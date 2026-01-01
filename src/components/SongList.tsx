import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSongStore } from '../stores/songStore';
import { colors } from '../constants/colors';
import type { Song } from '../types';

interface SongListProps {
  onEditSong: (song: Song) => void;
  searchQuery: string;
}

export function SongList({ onEditSong, searchQuery }: SongListProps) {
  const songs = useSongStore((s) => s.songs);
  const removeSong = useSongStore((s) => s.removeSong);

  const filteredSongs = songs.filter((song) => {
    const term = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(term) ||
      song.artist.toLowerCase().includes(term) ||
      song.tags.some((t) => t.includes(term))
    );
  });

  const renderSong = ({ item: song }: { item: Song }) => (
    <View style={styles.songItem}>
      <TouchableOpacity
        style={styles.songInfo}
        onPress={() => onEditSong(song)}
      >
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.songArtist}>{song.artist}</Text>
        <View style={styles.tagContainer}>
          {song.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => removeSong(song.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (filteredSongs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {songs.length === 0 ? (
          <>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>No songs yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Song" to import audio files
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>No songs match your search</Text>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={filteredSongs}
      renderItem={renderSong}
      keyExtractor={(song) => song.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  songInfo: {
    flex: 1,
    padding: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  songArtist: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonText: {
    fontSize: 18,
    color: colors.stop,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.exhausted,
  },
});
