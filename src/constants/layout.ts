/**
 * @file constants/layout.ts
 * @description Layout constants for VibeDeck UI including grid, spacing, and touch targets.
 * @see docs/UI_DESIGN.md
 */

export const Layout = {
  // Button board grid
  boardColumns: 3,
  buttonMinSize: 100,
  buttonGap: 12,
  buttonBorderRadius: 16,

  // Responsive breakpoints
  breakpoints: {
    small: 360, // 2 columns below this
    medium: 480, // 3 columns, 4 columns above this
  },

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
  },

  // Screen-level spacing
  screenPadding: 16,
  sectionGap: 24,

  // Touch targets (accessibility minimum)
  minTouchTarget: 44,

  // Playback controls
  stopButtonWidth: 60,
  stopButtonHeight: 44,
  volumeSliderHeight: 44,
  volumeTrackHeight: 4,
  volumeThumbSize: 20,
  nowPlayingHeight: 48,

  // Tab bar
  tabBarHeight: 56,
  tabIconSize: 24,
  tabLabelSize: 12,

  // Button elements
  countBadgeSize: 20,
  countBadgeFontSize: 12,
  typeIndicatorHeight: 4,
  persistentIconSize: 12,
  directIconSize: 16,

  // Animation
  pressScale: 0.97,
  pressDuration: 100,
  glowDuration: 1500,
  badgeBounceDuration: 200,
};
