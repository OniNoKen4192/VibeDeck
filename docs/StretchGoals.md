# Stretch Goals

> **Idea capture / pressure valve.** Future possibilities that don't interrupt active development.
> Items here are not scheduled or committed. See [Council Vocabulary](../council/COUNCIL.md#council-vocabulary).

---

## Scheduled for 1.1.0

See [1.1.0_Goals.md](../council/1.1.0_Goals.md)

---

## Future Candidates (1.2+)

### Search & Navigation
1. Song/Tag → button search
2. Tag Filtering (only play songs with x tag(s))

### Platform Expansion
1. iOS version

### File Integrity & Utilities
1. Initialization file check
2. Missing file handling
3. Utilities screen
   - Manual "Scan for broken links" trigger
   - Broken tracks list with per-track actions: Re-link, Remove, Ignore
   - Reset play counters ("Start fresh for new season")
   - Bulk operations (select multiple, remove all broken)
4. Graceful degradation during playback
   - Tag buttons: skip broken tracks silently, try next in pool
   - Direct buttons: visual dimming + warning badge, toast on tap
   - No modals or interruptions during game day
5. Track `fileStatus` field (`valid` | `missing` | `unchecked`) for persistent validation state
6. Device scan for audio files — discover playable files on the device without manual picking (graduated from whiteboard 2026-08-23)

### Hardware
1. External button awareness — USB/Bluetooth hardware buttons mapped to board actions, e.g. a dedicated goal-horn button (graduated from whiteboard 2026-08-23)

### Technical Debt & Architecture
1. React Native New Architecture (TurboModules) — Re-enable when `react-native-track-player` adds compatibility
2. Player state sync (CR-10) — Sync notification/Bluetooth controls with UI; required for background play

### UX Enhancements
1. Import Summary feedback — Basic toast/modal showing "N imported / M skipped" after batch import
2. Pause button
3. Larger stop button
4. Duration discovery on import — Use `expo-av` to extract duration during import so cue points work immediately (currently discovered on first playback)
