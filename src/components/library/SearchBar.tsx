/**
 * @file components/library/SearchBar.tsx
 * @description Search input for filtering tracks in Library screen.
 * @see docs/UI_DESIGN.md
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

/** Debounce delay for search input (per ARCHITECTURE.md) */
const SEARCH_DEBOUNCE_MS = 150;

interface SearchBarProps {
  /** Current search query */
  value: string;
  /** Called when search query changes (debounced) */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional test ID */
  testID?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search tracks...',
  testID,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);

      // Debounce the callback
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onChangeText(text);
      }, SEARCH_DEBOUNCE_MS);
    },
    [onChangeText]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
  }, [onChangeText]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container} testID={testID}>
      <FontAwesome
        name="search"
        size={20}
        color={Colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search tracks"
        accessibilityHint="Type to filter tracks by title or artist"
      />
      {localValue.length > 0 && (
        <Pressable
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <FontAwesome name="times-circle" size={18} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: Layout.screenPadding,
    marginVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Layout.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0, // Remove default padding on Android
  },
  clearButton: {
    padding: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
});
