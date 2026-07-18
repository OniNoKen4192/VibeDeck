# Changelog

All notable changes to VibeDeck are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.2] - 2026-01-11

### Fixed
- **HT-024:** Exhausted tag pools now auto-reset when tapped ("the music must flow")
  - Root cause: UI was blocking presses on exhausted buttons before the auto-reset service could trigger
  - Exhausted buttons are now interactive; the service layer handles pool reset

---

## [1.0.1] - 2026-01-10

### Fixed
- **HT-022:** Board screen header no longer renders behind Android status bar on edge-to-edge displays
  - Wrapped all Board screen containers in SafeAreaView
- **HT-023:** Tab bar no longer collides with Android navigation bar
  - Removed hardcoded height; framework now handles safe area padding automatically

---

## [1.0.0] - 2026-01-09

### Added
- **Button Board** — Tag-based audio player with grid layout
  - Tag buttons play random unplayed tracks from associated tag pool
  - Direct buttons play specific tracks
  - Visual states: default, playing, exhausted, empty, disabled
  - Long-press context menu with pin/unpin and remove actions

- **Library Screen** — Track management
  - Import tracks via Android document picker
  - Track preview playback
  - Tag assignment via chip picker
  - Bulk selection mode with tag/delete actions
  - Search with 150ms debounce

- **Tags Screen** — Tag management
  - Create/edit/delete tags
  - 8-color palette picker
  - Automatic button creation on tag create

- **Audio Playback** — react-native-track-player integration
  - Play, stop, volume control
  - Tap-to-toggle (tap playing button to stop)
  - Now Playing bar with track info

- **Persistence** — SQLite database (expo-sqlite)
  - Tracks, tags, buttons, track-tag associations
  - Volume and settings persistence
  - Cross-store refresh on mutations

- **SAF Permissions** — Native Expo module
  - `expo-saf-uri-permission` for Android Storage Access Framework
  - Tracks survive app restart and device reboot

- **UX Polish**
  - Haptic feedback on interactions
  - Toast notifications for errors and confirmations
  - Fade-in animations
  - Reset All function with confirmation dialog
  - About screen with usage guide

### Architecture
- **Privacy constraint:** Fully offline, no network calls, no telemetry
- **State management:** Zustand stores with SQLite persistence
- **File handling:** Reference-in-place (no file copying)
- **Played flag system:** Tracks marked as played; auto-reset on pool exhaustion

---

## Development Notes

- **Duration:** 2026-01-02 to 2026-01-11 (10 days)
- **Human Testing Rounds:** 9
- **Bugs Fixed:** 24 (HT-001 through HT-024)
- **Code Review Issues:** 65 (8 Critical, all resolved)

See [docs/1.0_LessonsLearned.md](docs/1.0_LessonsLearned.md) for retrospective.
