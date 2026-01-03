# VibeDeck Data Model

> Codified by Vaelthrix the Astral — 2026-01-02

---

## Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Track     │──────<│  TrackTag   │>──────│    Tag      │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                           │
       │                                           │
       ▼                                           ▼
┌─────────────┐                           ┌─────────────┐
│   Button    │ (direct)                  │   Button    │ (tag)
│ track_id FK │                           │  tag_id FK  │
└─────────────┘                           └─────────────┘
```

**Relationships:**
- Track ↔ Tag: Many-to-many (via TrackTag)
- Button → Track: Many-to-one (Direct buttons only)
- Button → Tag: Many-to-one (Tag buttons only)

---

## Entities

### Track

Represents a single audio file in the library.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PK, UUID | Unique identifier |
| `file_path` | TEXT | NOT NULL, UNIQUE | Absolute path to audio file |
| `file_name` | TEXT | NOT NULL | Original filename (for display fallback) |
| `title` | TEXT | NULL | User-editable display title |
| `artist` | TEXT | NULL | User-editable artist name |
| `album` | TEXT | NULL | User-editable album name |
| `genre` | TEXT | NULL | User-editable genre |
| `duration_ms` | INTEGER | NULL | Track duration in milliseconds |
| `played` | INTEGER | NOT NULL, DEFAULT 0 | 0 = unplayed, 1 = played this session |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Notes:**
- `played` is session state, reset via "Reset All"
- `title` display logic: `title ?? file_name`
- `duration_ms` populated on import if metadata available

---

### Tag

A user-created label for organizing tracks.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PK, UUID | Unique identifier |
| `name` | TEXT | NOT NULL, UNIQUE | Tag display name |
| `color` | TEXT | NULL | Hex color code (e.g., "#6366f1") |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Notes:**
- `color` is optional; UI provides default if null
- Deleting a tag removes TrackTag associations but not tracks

---

### TrackTag

Join table for Track ↔ Tag many-to-many relationship.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `track_id` | TEXT | PK, FK → Track.id | Track reference |
| `tag_id` | TEXT | PK, FK → Tag.id | Tag reference |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Notes:**
- Composite primary key (track_id, tag_id)
- CASCADE delete on both foreign keys

---

### Button

A playable element on the button board.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PK, UUID | Unique identifier |
| `name` | TEXT | NOT NULL | Display name on button |
| `type` | TEXT | NOT NULL | "tag" or "direct" |
| `tag_id` | TEXT | FK → Tag.id, NULL | For tag buttons |
| `track_id` | TEXT | FK → Track.id, NULL | For direct buttons |
| `position` | INTEGER | NOT NULL | Order on board (0-indexed) |
| `persistent` | INTEGER | NOT NULL, DEFAULT 0 | 0 = normal, 1 = pinned |
| `color` | TEXT | NULL | Override color (hex), else inherits |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Constraints:**
- CHECK: `(type = 'tag' AND tag_id IS NOT NULL AND track_id IS NULL) OR (type = 'direct' AND track_id IS NOT NULL AND tag_id IS NULL)`
- `position` should be unique but gaps allowed (for reordering)

**Notes:**
- Color inheritance: `button.color ?? tag.color ?? default`
- When referenced Track is deleted, Direct Button becomes orphaned (handle in app logic)

---

## SQLite Schema

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    album TEXT,
    genre TEXT,
    duration_ms INTEGER,
    played INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS track_tags (
    track_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (track_id, tag_id),
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buttons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('tag', 'direct')),
    tag_id TEXT,
    track_id TEXT,
    position INTEGER NOT NULL,
    persistent INTEGER NOT NULL DEFAULT 0,
    color TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    CHECK (
        (type = 'tag' AND tag_id IS NOT NULL AND track_id IS NULL) OR
        (type = 'direct' AND track_id IS NOT NULL AND tag_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tracks_played ON tracks(played);
CREATE INDEX IF NOT EXISTS idx_track_tags_track ON track_tags(track_id);
CREATE INDEX IF NOT EXISTS idx_track_tags_tag ON track_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_buttons_position ON buttons(position);
CREATE INDEX IF NOT EXISTS idx_buttons_tag ON buttons(tag_id);
CREATE INDEX IF NOT EXISTS idx_buttons_track ON buttons(track_id);
```

---

## TypeScript Interfaces

```typescript
// Core entity types

interface Track {
  id: string;
  filePath: string;
  fileName: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  durationMs: number | null;
  played: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TrackTag {
  trackId: string;
  tagId: string;
  createdAt: string;
}

type ButtonType = 'tag' | 'direct';

interface Button {
  id: string;
  name: string;
  type: ButtonType;
  tagId: string | null;
  trackId: string | null;
  position: number;
  persistent: boolean;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

// Derived types for UI

interface TrackWithTags extends Track {
  tags: Tag[];
}

interface TagWithCount extends Tag {
  trackCount: number;
  unplayedCount: number;
}

interface ButtonResolved extends Button {
  // For tag buttons
  tag?: Tag;
  availableTracks?: number; // unplayed count
  // For direct buttons
  track?: Track;
  // Computed
  displayColor: string; // resolved from button.color ?? tag.color ?? default
  isDisabled: boolean;  // e.g., direct button with deleted track
}
```

---

## State Considerations

### Session State (Zustand, not persisted)

```typescript
interface SessionState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number; // 0-100
  selectedOutputDevice: string | null;
}
```

### Persisted State (SQLite)

All entities above are persisted. The `played` flag on Track is persisted but represents session state — it survives app restart but is cleared by "Reset All".

---

## Migration Strategy

For MVP, use a single schema version. Post-MVP, implement versioned migrations:

```typescript
const SCHEMA_VERSION = 1;

// Future: migrations array
const migrations = [
  { version: 1, up: (db) => { /* initial schema */ } },
  // { version: 2, up: (db) => { /* add new column */ } },
];
```

---

## Design Decisions

Resolved from MVP_SPEC open questions:

| Question | Resolution | Rationale |
|----------|------------|-----------|
| Button color inheritance | Button → Tag → Default | Allows override flexibility |
| Orphaned direct buttons | CASCADE delete | Auto-delete button when track deleted |
| Volume persistence | Remember between sessions | User expectation, avoid surprise loud audio |
| Library size limit | No hard limit for MVP | SQLite handles thousands fine |

---

*Approved by: [Pending Project Lead approval]*
