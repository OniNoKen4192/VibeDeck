# [VibeDeck] Quest Log

> Completed quests for the current release cycle. Archived logs: [archive/questlogs/](archive/questlogs/)

---

## 1.1.0 Development

### Swipe to Change Tab — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_swipe-tabs.md)

Replaced Expo Router's `Tabs` with `MaterialTopTabs` for swipe gesture support. Users can now swipe horizontally between Board, Library, and Tags screens. Custom bottom tab bar preserves existing UI.

**Changes:**
- Installed `@react-navigation/material-top-tabs` and `react-native-pager-view`
- Replaced `Tabs` with `MaterialTopTabs` in `_layout.tsx` using `withLayoutContext`
- Added custom `CustomTabBar` component positioned at bottom
- Swipe gestures work between all three screens
- Lazy loading enabled for performance

---

### Color Picker for Buttons — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_color-picker.md)

Added inline color swatches to the ButtonContextMenu. Long-press any button to access the context menu, then tap a color swatch to apply. Includes reset option (×) to revert to tag/default color.

**Changes:**
- Added `onChangeColor` prop to ButtonContextMenu
- Added 8 color swatches from `Colors.tagColors` plus reset swatch
- Added `handleChangeButtonColor` handler in BoardScreen using `updateButton` store action
- Selected color shows white border indicator
- Accessible color names for screen readers

---

### Rename Track — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_rename-track.md)

Added inline editing for track title and artist in the TrackDetailModal. Tap the pencil icon to edit, blur or submit to save.

**Changes:**
- Added edit state and TextInput for title/artist in TrackDetailModal
- Added `onRename` prop to pass updates to parent
- Added `handleRenameTrack` handler in library.tsx using `updateTrack` store action
- Pencil icon hints at editability, empty title reverts to fileName

---

### Hamburger Icon — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_hamburger-icon.md)

Changed gear/cog icon to hamburger menu icon. Renamed "Settings" references to "About" for semantic clarity.

**Changes:**
- Changed icon from `cog` to `bars` in BoardHeader
- Renamed `onSettingsPress` prop to `onAboutPress`
- Updated accessibility label to "Open about screen"
- Renamed handler in BoardScreen accordingly

---

### Volume Mute Toggle — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_volume-mute.md)

Tap volume icon to toggle mute. Remembers previous volume for unmute restore.

**Changes:**
- Wrapped volume icon in Pressable with hitSlop for better touch target
- Added `onMuteToggle` prop to PlaybackControls
- Added `previousVolume` state and `handleMuteToggle` handler in BoardScreen
- Haptic feedback on tap, dynamic accessibility label (Mute/Unmute)

---

### Track List Sorting — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_track-sorting.md)

Added sort button to Library screen header. Users can cycle through three modes: Most Recent (default), A→Z, and Z→A. Uses `localeCompare()` for proper alphabetical sorting.

**Changes:**
- Added `SortMode` type and `sortMode` state to library.tsx
- Created `sortedTracks` memo that applies sorting after filtering
- Added sort button to `LibraryHeader` with cycling behavior
- Icon changes to indicate current mode (clock, arrow-down, arrow-up)

---

### Button Board Padding — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_board-padding.md)

Live fire learning from Lady Kraken game — bottom row of buttons felt cramped when NowPlaying bar appeared. Increased scroll content padding to give breathing room.

**Changes:**
- Increased `paddingBottom` in ButtonBoard's `scrollContent` from 24px to 72px (accounts for NowPlaying height)

---

### Real-time Volume Slider — 2026-01-11
**Dragon:** Seraphelle the Silver
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Seraphelle_2026-01-11_realtime-volume.md)

Live fire learning from Lady Kraken game — volume slider only affected audio on release, not during drag. Added `applyVolume()` call to the drag handler for real-time volume control during fades.

**Changes:**
- Updated `handleVolumeChange` in BoardScreen to call `applyVolume()` during slider drag
- VolumeSlider already throttles to 16ms, so no additional throttling needed

---

### Pause/Play Button — 2026-01-11
**Dragon:** Pyrrhaxis the Red
**Handoff:** [DONE_HANDOFF](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-11_pause-play-button.md)

Added pause/resume toggle button to playback controls. Live fire learning from Lady Kraken game — critical for rapid stop-start during whistles and offsides.

**Changes:**
- New `PlayPauseButton` component with three-state logic (disabled/pause/play)
- Updated `PlaybackControls` with new button between STOP and volume
- Wired handlers in BoardScreen with proper haptic feedback
- Added error callback infrastructure to `pause()` and `resume()` for consistency

---

## Archive Reference

| Version | File | Summary |
|---------|------|---------|
| 1.0.x | [QuestLog_1.0.md](archive/questlogs/QuestLog_1.0.md) | MVP development through 1.0.2 release (2026-01-02 to 2026-01-11) |
