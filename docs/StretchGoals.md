# StretchGoals

> **Idea capture / pressure valve.** Future possibilities that don't interrupt active development.
> Items here are not scheduled or committed. See [Council Vocabulary](../council/COUNCIL.md#council-vocabulary).


1. Set and Save volume levels per track
2. Set start time per track
3. Set Duration per track
4. Song/Tag -> button search 
5. IOS version
6. Initialization file check
7. Missing file handling
8. Utilities screen
   - Manual "Scan for broken links" trigger
   - Broken tracks list with per-track actions: Re-link, Remove, Ignore
   - Reset play counters ("Start fresh for new season")
   - Bulk operations (select multiple, remove all broken)
9. Graceful degradation during playback
   - Tag buttons: skip broken tracks silently, try next in pool
   - Direct buttons: visual dimming + warning badge, toast on tap
   - No modals or interruptions during game day
10. Track `fileStatus` field (`valid` | `missing` | `unchecked`) for persistent validation state
11. React Native New Architecture (TurboModules) — Re-enable when `react-native-track-player` adds compatibility
12. Import Summary feedback — Basic toast/modal showing "N imported / M skipped" after batch import
13. Background playback — Continue audio when app minimized/screen off (prevents accidental song chop)
14. Player state sync (CR-10) — Sync notification/Bluetooth controls with UI; required for background play




UI/UX

1. Pause button
2. Volume icon as mute button
3. larger stop button
4. Reset Tracks played
5. Start New Game ( Same as Reset Tracks played. Dialog displayed if app has been closed for more than x minutes?)
6. Persisted buttons (i.e. Goal Horn)


