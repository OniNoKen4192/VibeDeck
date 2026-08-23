/**
 * @file components/tags/__tests__/TagModal.test.tsx
 * @description Tests for TagModal safe-area handling (HT-035).
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TagModal } from '../TagModal';

const INSET_METRICS = {
  insets: { top: 24, left: 0, right: 0, bottom: 48 },
  frame: { x: 0, y: 0, width: 360, height: 800 },
};

function renderModal() {
  return render(
    <SafeAreaProvider initialMetrics={INSET_METRICS}>
      <TagModal
        visible
        tag={null}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    </SafeAreaProvider>
  );
}

describe('TagModal (HT-035)', () => {
  test('bottom sheet applies the bottom safe-area inset as padding', () => {
    const { getByTestId } = renderModal();
    const sheet = getByTestId('tag-modal-sheet');
    const style = StyleSheet.flatten(sheet.props.style);
    expect(style.paddingBottom).toBeGreaterThanOrEqual(48);
  });
});
