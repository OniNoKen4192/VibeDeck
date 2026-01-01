import { View, StyleSheet } from 'react-native';
import { ButtonBoard } from '../../src/components/ButtonBoard';
import { ControlBar } from '../../src/components/ControlBar';
import { colors } from '../../src/constants/colors';

export default function DeckScreen() {
  return (
    <View style={styles.container}>
      <ButtonBoard />
      <ControlBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
