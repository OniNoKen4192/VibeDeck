import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useSongStore } from '../../src/stores/songStore';
import { colors } from '../../src/constants/colors';

export default function SettingsScreen() {
  const settings = usePlayerStore((s) => s.settings);
  const setGoalHornUri = usePlayerStore((s) => s.setGoalHornUri);
  const setFadeOutDuration = usePlayerStore((s) => s.setFadeOutDuration);
  const songs = useSongStore((s) => s.songs);

  const handleSelectGoalHorn = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      await setGoalHornUri(file.uri);
      Alert.alert('Success', 'Goal horn sound updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to select audio file');
    }
  };

  return (
    <View style={styles.container}>
      {/* Goal horn section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goal Horn</Text>
        <Text style={styles.sectionDescription}>
          Select an audio file to play when you hit the GOAL button
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSelectGoalHorn}
        >
          <Text style={styles.buttonText}>
            {settings.goalHornUri ? '🔊 Change Sound' : '📁 Select Sound'}
          </Text>
        </TouchableOpacity>
        {settings.goalHornUri && (
          <Text style={styles.currentValue}>✓ Goal horn configured</Text>
        )}
      </View>

      {/* Fade duration section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fade Out Duration</Text>
        <Text style={styles.sectionDescription}>
          How long the fade out takes: {settings.fadeOutDuration}s
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={settings.fadeOutDuration}
          onValueChange={(value) => {
            setFadeOutDuration(value);
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      {/* Stats section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Library Stats</Text>
        <Text style={styles.statText}>Total songs: {songs.length}</Text>
        <Text style={styles.statText}>
          Total tags:{' '}
          {new Set(songs.flatMap((s) => s.tags)).size}
        </Text>
      </View>

      {/* About section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          VibeDeck v0.1.0{'\n'}
          Built for hockey parents who just want to hit play.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  currentValue: {
    fontSize: 14,
    color: colors.playing,
    marginTop: 8,
  },
  slider: {
    height: 40,
  },
  statText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
