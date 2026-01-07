/**
 * @file constants/colors.ts
 * @description VibeDeck color palette and color utility functions.
 * Includes theme colors, tag colors, button states, and accessibility helpers.
 * @see docs/UI_DESIGN.md
 */

export const Colors = {
  // Primary palette
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',

  // Background
  background: '#1a1a2e',
  surface: '#25253d',
  surfaceLight: '#2d2d4a',

  // Text
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  // Default tag colors (all provide ≥4.5:1 contrast with white, except yellow)
  tagColors: [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow (requires dark text)
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
  ],

  // Button states
  playingBorder: '#ffffff',
  playingBorderWidth: 3,
  exhaustedOpacity: 0.5,
  disabledBackground: '#25253d',
};

export const DEFAULT_BUTTON_COLOR = Colors.primary;

/**
 * Yellow is the only tag color that requires dark text for accessibility.
 * Use this to determine text color for a given button background.
 */
export const YELLOW_TAG_COLOR = '#eab308';

/**
 * Returns the appropriate text color for a button background.
 * Yellow backgrounds get dark text; all others get white.
 */
export function getButtonTextColor(backgroundColor: string): string {
  return backgroundColor.toLowerCase() === YELLOW_TAG_COLOR.toLowerCase()
    ? Colors.background
    : Colors.text;
}

/**
 * Darkens a hex color by a percentage (for pressed states).
 * @param hex - Hex color string (e.g., '#6366f1')
 * @param percent - Percentage to darken (0-100)
 */
export function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const factor = 1 - percent / 100;

  const r = Math.max(0, Math.floor((num >> 16) * factor));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * factor));
  const b = Math.max(0, Math.floor((num & 0x0000ff) * factor));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
