Ask Vael about: 

1. file_path uniqueness + SAF reality

Right now:

file_path TEXT NOT NULL UNIQUE


This is conceptually correct, but Android SAF (content://) can bite you here.

Edge case you’ll hit eventually:

User imports the same file twice from two different document providers

The URIs differ, but point to the same underlying media

SQLite sees them as different → duplicates allowed (or the reverse, depending on provider behavior)

Recommendation (post-MVP):
Add a secondary identity column when metadata is available:

audio fingerprint hash

or (file_name + duration_ms) heuristic

or MediaStore ID (Android only)

