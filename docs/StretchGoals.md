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