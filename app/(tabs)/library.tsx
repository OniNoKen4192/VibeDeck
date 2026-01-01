import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SongList } from '../../src/components/SongList';
import { SongEditor } from '../../src/components/SongEditor';
import { colors } from '../../src/constants/colors';
import type { Song } from '../../src/types';

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [newFileUri, setNewFileUri] = useState<string | undefined>();
  const [newFileName, setNewFileName] = useState<string | undefined>();

  const handleAddSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setNewFileUri(file.uri);
      setNewFileName(file.name);
      setEditingSong(null);
      setEditorVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setNewFileUri(undefined);
    setNewFileName(undefined);
    setEditorVisible(true);
  };

  const handleCloseEditor = () => {
    setEditorVisible(false);
    setEditingSong(null);
    setNewFileUri(undefined);
    setNewFileName(undefined);
  };

  return (
    <View style={styles.container}>
      {/* Search and add header */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search songs..."
          placeholderTextColor={colors.exhausted}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddSong}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Song list */}
      <SongList onEditSong={handleEditSong} searchQuery={searchQuery} />

      {/* Song editor modal */}
      <SongEditor
        visible={editorVisible}
        song={editingSong}
        fileUri={newFileUri}
        fileName={newFileName}
        onClose={handleCloseEditor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
