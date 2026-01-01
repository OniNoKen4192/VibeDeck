import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSongStore } from '../stores/songStore';
import { colors } from '../constants/colors';
import type { Song } from '../types';

interface SongEditorProps {
  visible: boolean;
  song: Song | null; // null for new song
  fileUri?: string; // for new songs from file picker
  fileName?: string;
  onClose: () => void;
}

export function SongEditor({
  visible,
  song,
  fileUri,
  fileName,
  onClose,
}: SongEditorProps) {
  const addSong = useSongStore((s) => s.addSong);
  const updateSong = useSongStore((s) => s.updateSong);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setTagsInput(song.tags.join(', '));
    } else if (fileName) {
      // Parse filename: "Artist - Title.mp3"
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      const parts = nameWithoutExt.split(' - ');
      if (parts.length > 1) {
        setArtist(parts[0]);
        setTitle(parts[1]);
      } else {
        setTitle(nameWithoutExt);
        setArtist('');
      }
      setTagsInput('');
    } else {
      setTitle('');
      setArtist('');
      setTagsInput('');
    }
  }, [song, fileName, visible]);

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (song) {
      updateSong(song.id, { title, artist, tags });
    } else if (fileUri) {
      addSong({ title, artist, tags, fileUri });
    }

    onClose();
  };

  const canSave = title.trim().length > 0 && (song || fileUri);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.title}>
              {song ? 'Edit Song' : 'Add Song'}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Song title"
                placeholderTextColor={colors.exhausted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Artist</Text>
              <TextInput
                style={styles.input}
                value={artist}
                onChangeText={setArtist}
                placeholder="Artist name"
                placeholderTextColor={colors.exhausted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Tags (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="entrance, fire, heavy-metal"
                placeholderTextColor={colors.exhausted}
                autoCapitalize="none"
              />
              <Text style={styles.hint}>
                Example: entrance, 3rd-period, timeout, goal
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.button,
                styles.saveButton,
                !canSave && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.exhausted,
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
