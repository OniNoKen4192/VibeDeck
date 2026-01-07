/**
 * @file components/ButtonBoard.tsx
 * @description Responsive grid layout for board buttons with scrolling support.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Layout } from '../constants/layout';
import { BoardButton, ButtonState } from './BoardButton';
import type { ButtonResolved } from '../types';

interface ButtonBoardProps {
  /** Resolved buttons from useButtonStore.resolveAllButtons() */
  buttons: ButtonResolved[];
  /** ID of the button currently playing audio, if any */
  playingButtonId?: string | null;
  /** ID of the button currently shaking (pool exhausted feedback) */
  shakingButtonId?: string | null;
  /** Animated value for shake transform */
  shakeAnim?: Animated.Value;
  /** Called when a button is pressed */
  onButtonPress?: (button: ButtonResolved) => void;
  /** Called when a button is long-pressed */
  onButtonLongPress?: (button: ButtonResolved) => void;
  /** Optional: children to render below the grid (e.g., PlaybackControls) */
  children?: React.ReactNode;
}

/**
 * Calculate number of columns based on screen width
 */
function getColumnCount(width: number): number {
  if (width < Layout.breakpoints.small) {
    return 2;
  }
  if (width <= Layout.breakpoints.medium) {
    return 3;
  }
  return 4;
}

export function ButtonBoard({
  buttons,
  playingButtonId,
  shakingButtonId,
  shakeAnim,
  onButtonPress,
  onButtonLongPress,
  children,
}: ButtonBoardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const columns = useMemo(() => getColumnCount(containerWidth), [containerWidth]);

  // Group buttons into rows
  const rows = useMemo(() => {
    const result: ButtonResolved[][] = [];
    for (let i = 0; i < buttons.length; i += columns) {
      result.push(buttons.slice(i, i + columns));
    }
    return result;
  }, [buttons, columns]);

  const getButtonState = useCallback(
    (button: ButtonResolved): ButtonState => {
      if (button.isDisabled) return 'disabled';
      if (playingButtonId === button.id) return 'playing';
      if (button.type === 'tag' && button.availableTracks === 0) return 'exhausted';
      return 'default';
    },
    [playingButtonId]
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((button) => {
                const isShaking = shakingButtonId === button.id && shakeAnim;
                const buttonContent = (
                  <BoardButton
                    button={button}
                    state={getButtonState(button)}
                    onPress={onButtonPress}
                    onLongPress={onButtonLongPress}
                    testID={`board-button-${button.id}`}
                  />
                );

                return (
                  <View key={button.id} style={styles.buttonWrapper}>
                    {isShaking ? (
                      <Animated.View
                        style={{ transform: [{ translateX: shakeAnim }] }}
                      >
                        {buttonContent}
                      </Animated.View>
                    ) : (
                      buttonContent
                    )}
                  </View>
                );
              })}
              {/* Fill empty slots in last row to maintain grid alignment */}
              {row.length < columns &&
                Array.from({ length: columns - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.buttonWrapper} />
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {children && <View style={styles.footer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.spacing.xl,
  },
  grid: {
    gap: Layout.buttonGap,
  },
  row: {
    flexDirection: 'row',
    gap: Layout.buttonGap,
  },
  buttonWrapper: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
    backgroundColor: Colors.background,
  },
});
