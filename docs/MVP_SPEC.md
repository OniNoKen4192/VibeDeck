# VibeDeck MVP Specification

> Codified by Vaelthrix the Astral — 2026-01-02

---

## Vision Statement

VibeDeck is a **game-day audio tool** for sports parents. The button board is the heart — everything else exists to serve fast, stress-free audio playback during live events.

---

## MVP Scope

### In Scope (Must Have)

| Feature | Description |
|---------|-------------|
| **Track Import** | Import audio files via file picker OR folder scan |
| **Tag System** | Create tags, assign multiple tags to tracks |
| **Tag Buttons** | Tap to play random unplayed track matching that tag |
| **Direct Buttons** | Tap to play a specific track (no randomization) |
| **Persistent Buttons** | Pin any button to always appear on the board |
| **Played Flags** | Track which tracks have been played this session |
| **Manual Reset** | Explicit "Reset All" to clear played flags |
| **Auto-Reset Per Tag** | When tag pool exhausted, silently reset that tag's played flags |
| **Button Board** | 3-4 column grid, 12-16 visible buttons |
| **Drag Reorder** | Rearrange button positions by dragging |
| **Playback Controls** | Stop button + Volume slider |
| **Interrupt Behavior** | New button tap immediately stops current audio |
| **Device Picker** | Select audio output device (Bluetooth, speaker, etc.) |
| **Track Metadata** | View and edit title, artist, and other fields |

### Out of Scope (Post-MVP)

| Feature | Reason |
|---------|--------|
| Background audio | Complexity; foreground-only for MVP |
| Playlists / queuing | MVP is single-track-at-a-time |
| Cloud sync | Local-only for MVP |
| Multiple boards / profiles | Single board sufficient for MVP |
| Audio effects (fade, crossfade) | Polish feature, not core |
| Waveform visualization | Nice-to-have, not essential |
| Import from streaming services | Licensing complexity |
| Search within library | Tag filtering sufficient for MVP |
| React Native New Architecture | `react-native-track-player` not yet compatible; re-enable when library is updated |

---

## Core User Stories

### US-1: Import Tracks
> As a user, I want to import audio files from my device so I can build my library.

**Acceptance Criteria:**
- Can select individual files via file picker
- Can point to a folder and import all audio files within
- Supported formats: MP3, WAV, M4A, OGG (platform-supported formats)
- Imported tracks appear in library
- Duplicate detection (same file path = skip or update)

### US-2: Organize with Tags
> As a user, I want to create tags and assign them to tracks so I can group related audio.

**Acceptance Criteria:**
- Can create a new tag with a name and optional color
- Can assign multiple tags to a single track
- Can view all tracks with a given tag
- Can remove tags from tracks
- Can delete tags (tracks remain, just untagged)

### US-3: Create Buttons
> As a user, I want to create buttons on my board so I can trigger audio during events.

**Acceptance Criteria:**
- Can create a **Tag Button** (linked to a tag)
- Can create a **Direct Button** (linked to a specific track)
- Can mark any button as **Persistent** (always visible)
- Button displays: name, type indicator, visual state

### US-4: Game Session
> As a user, I want to use my button board during a live event to play audio quickly.

**Acceptance Criteria:**
- Button board displays 12-16 buttons in a 3-4 column grid
- Tapping a Tag Button plays a random unplayed track from that tag
- Tapping a Direct Button plays its assigned track
- If tag pool is exhausted, auto-reset that tag's played flags and pick again
- New tap interrupts current audio immediately
- Stop button silences playback
- Volume slider adjusts output level
- Can select audio output device

### US-5: Manage Button Layout
> As a user, I want to arrange my buttons so the most-used ones are easy to reach.

**Acceptance Criteria:**
- Can drag buttons to reorder positions
- Order persists across app sessions
- Persistent buttons always appear (cannot be removed from board, only unpinned)

### US-6: Reset Session
> As a user, I want to reset played flags so I can reuse my library for another event.

**Acceptance Criteria:**
- "Reset All" button clears all played flags
- All tag pools become full again
- Confirmation prompt before reset

### US-7: Edit Track Metadata
> As a user, I want to edit track information so my library is organized how I want.

**Acceptance Criteria:**
- Can edit: Title, Artist, Album, Genre
- Changes persist to app database (not to original file)
- Display name uses edited title if set, else filename

---

## Screen Inventory

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| **Button Board** | Main game-day screen | Button grid, playback controls, device picker, reset button |
| **Library** | View all imported tracks | Track list, tag filter, add/edit buttons |
| **Track Detail** | View/edit single track | Metadata fields, tag assignment, delete option |
| **Tags** | Manage tags | Tag list, create/edit/delete |
| **Button Editor** | Create/edit a button | Type selector, tag/track picker, name, persistent toggle |
| **Settings** | App configuration | (Minimal for MVP — maybe just "About") |

**Navigation:** Bottom tab bar with Board, Library, Tags. Settings accessible from header.

---

## Technical Constraints

| Constraint | Decision | Rationale |
|------------|----------|-----------|
| Platform | Android only | Target audience, MVP focus |
| Offline | Fully offline | No network dependency during events |
| Audio playback | Foreground only | Simplifies MVP, revisit post-MVP |
| Storage | SQLite + file system | Tracks stored as files, metadata in SQLite |
| State | Zustand | Lightweight, sufficient for MVP complexity |

---

## Data Model Summary

See [DATAMODEL.md](DATAMODEL.md) for full entity definitions.

**Core Entities:**
- `Track` — Audio file with metadata and played flag
- `Tag` — Named label with optional color
- `TrackTag` — Join table (many-to-many)
- `Button` — Board element (tag or direct type, position, persistent flag)

---

## Design Decisions

> Resolved during specification phase.

| Question | Decision |
|----------|----------|
| Button color | Independent color per button, falls back to tag color, then default |
| Volume persistence | Remember between sessions |
| Delete behavior | Deleting a track auto-deletes any Direct Buttons pointing to it |
| Maximum tracks | No hard limit for MVP |

---

## Success Criteria

MVP is complete when a user can:

1. Import a folder of audio files
2. Create tags and assign them to tracks
3. Build a button board with tag and direct buttons
4. Use the board during a simulated game session
5. Reset and do it again

**The acid test:** Can a stressed parent, mid-game, tap a button and get appropriate audio within 1 second?

---

*Approved by: [Pending Project Lead approval]*
