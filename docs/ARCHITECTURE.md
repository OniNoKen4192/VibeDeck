# VibeDeck Architecture

> Codified by Vaelthrix the Astral — 2026-01-02

---

## Folder Structure

```
VibeDeck/
├── app/                        # Expo Router app directory
│   ├── (tabs)/                 # Tab navigation group
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Button Board (default tab)
│   │   ├── library.tsx         # Library screen
│   │   └── tags.tsx            # Tags management screen
│   ├── _layout.tsx             # Root layout
│   ├── track/
│   │   └── [id].tsx            # Track detail/edit screen
│   ├── button/
│   │   ├── new.tsx             # Create button screen
│   │   └── [id].tsx            # Edit button screen
│   └── settings.tsx            # Settings screen
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Generic UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Slider.tsx
│   │   ├── board/              # Button board components
│   │   │   ├── BoardGrid.tsx
│   │   │   ├── BoardButton.tsx
│   │   │   └── PlaybackControls.tsx
│   │   ├── library/            # Library components
│   │   │   ├── TrackList.tsx
│   │   │   ├── TrackRow.tsx
│   │   │   └── ImportButton.tsx
│   │   └── tags/               # Tag components
│   │       ├── TagList.tsx
│   │       ├── TagChip.tsx
│   │       └── TagPicker.tsx
│   │
│   ├── stores/                 # Zustand state management
│   │   ├── index.ts            # Store exports
│   │   ├── useTrackStore.ts    # Track/library state
│   │   ├── useTagStore.ts      # Tag state
│   │   ├── useButtonStore.ts   # Button board state
│   │   ├── usePlayerStore.ts   # Playback state (current track, volume)
│   │   └── useSettingsStore.ts # App settings
│   │
│   ├── db/                     # Database layer
│   │   ├── index.ts            # DB initialization and exports
│   │   ├── schema.ts           # Table creation SQL
│   │   ├── migrations.ts       # Version migrations
│   │   └── queries/            # Query functions by entity
│   │       ├── tracks.ts
│   │       ├── tags.ts
│   │       ├── trackTags.ts
│   │       ├── buttons.ts
│   │       └── settings.ts
│   │
│   ├── services/               # Business logic / external integrations
│   │   ├── audio/
│   │   │   ├── player.ts       # Track player wrapper
│   │   │   └── devices.ts      # Audio output device handling
│   │   ├── import/
│   │   │   ├── filePicker.ts   # Single file import
│   │   │   ├── folderScan.ts   # Folder import
│   │   │   └── metadata.ts     # Extract audio metadata
│   │   └── playback/
│   │       └── tagPool.ts      # Tag button track selection logic
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDatabase.ts      # DB access hook
│   │   ├── useAudioPlayer.ts   # Player control hook
│   │   └── useImport.ts        # Import flow hook
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Entity types (Track, Tag, Button, etc.)
│   │   └── navigation.ts       # Navigation param types
│   │
│   ├── utils/                  # Pure utility functions
│   │   ├── uuid.ts             # UUID generation
│   │   ├── time.ts             # Duration formatting
│   │   └── colors.ts           # Color utilities
│   │
│   └── constants/              # App constants
│       ├── colors.ts           # Color palette
│       ├── layout.ts           # Grid dimensions, spacing
│       └── audio.ts            # Supported formats, defaults
│
├── assets/                     # Static assets
│   ├── fonts/
│   └── images/
│
├── docs/                       # Project documentation
│   ├── MVP_SPEC.md
│   ├── DATAMODEL.md
│   └── ARCHITECTURE.md         # This file
│
├── council/                    # Dragon council files
│   ├── COUNCIL.md
│   ├── QuestBoard.md
│   ├── QuestLog.md
│   └── GIT_WORKFLOW.md
│
├── CLAUDE.md                   # Project instructions for Claude
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```

---

## Layer Responsibilities

### `app/` — Screens (Expo Router)

- Route definitions and screen components
- Minimal logic — delegates to hooks and stores
- Handles navigation params and screen lifecycle

### `src/components/` — UI Components

- Presentational components
- Receive data via props, emit events via callbacks
- No direct store access (passed from parent screens)
- Exception: deeply nested components may use hooks for performance

### `src/stores/` — State Management (Zustand)

- Application state and derived data
- Actions that modify state
- Persistence sync with database layer
- Each store is independent; cross-store coordination in hooks

### `src/db/` — Database Layer

- SQLite schema and migrations
- CRUD operations per entity
- Returns plain objects (no ORM)
- All async, promise-based

### `src/services/` — Business Logic

- Complex operations spanning multiple concerns
- External integrations (file system, audio player)
- Stateless — operates on data passed in

### `src/hooks/` — React Hooks

- Bridge between stores, services, and components
- Encapsulate common patterns (loading states, error handling)
- Coordinate multi-store operations

### `src/types/` — Type Definitions

- Entity interfaces matching database schema
- Component prop types (co-located or here if shared)
- Navigation types for type-safe routing

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Screen    │────▶│    Hook     │────▶│    Store    │
│  (app/)     │◀────│  (hooks/)   │◀────│  (stores/)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Service   │     │   Database  │
                    │ (services/) │     │    (db/)    │
                    └─────────────┘     └─────────────┘
```

1. **Screen** renders UI, calls hooks for data/actions
2. **Hook** reads from store, invokes services or store actions
3. **Store** holds state, persists to database
4. **Service** performs complex operations (import, playback)
5. **Database** provides persistence

---

## Navigation Structure

```
Root (_layout.tsx)
├── (tabs) — Bottom tab navigator
│   ├── index (Board) — Default, game-day screen
│   ├── library — Track management
│   └── tags — Tag management
│
├── track/[id] — Stack: Track detail (modal presentation)
├── button/new — Stack: Create button (modal)
├── button/[id] — Stack: Edit button (modal)
└── settings — Stack: App settings
```

**Navigation patterns:**
- Tabs for primary sections (Board, Library, Tags)
- Stack modals for detail/edit screens
- Settings accessible via header icon on any tab

---

## Store Architecture

### `useTrackStore`
```typescript
interface TrackStore {
  tracks: Track[];
  isLoading: boolean;

  // Actions
  loadTracks: () => Promise<void>;
  addTrack: (track: Track) => Promise<void>;
  updateTrack: (id: string, updates: Partial<Track>) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  markPlayed: (id: string) => Promise<void>;
  resetAllPlayed: () => Promise<void>;
}
```

### `useTagStore`
```typescript
interface TagStore {
  tags: Tag[];

  loadTags: () => Promise<void>;
  addTag: (tag: Tag) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // Track-tag associations
  addTagToTrack: (trackId: string, tagId: string) => Promise<void>;
  removeTagFromTrack: (trackId: string, tagId: string) => Promise<void>;
  getTracksForTag: (tagId: string) => Track[];
}
```

### `useButtonStore`
```typescript
interface ButtonStore {
  buttons: Button[];

  loadButtons: () => Promise<void>;
  addButton: (button: Button) => Promise<void>;
  updateButton: (id: string, updates: Partial<Button>) => Promise<void>;
  deleteButton: (id: string) => Promise<void>;
  reorderButtons: (orderedIds: string[]) => Promise<void>;
}
```

### `usePlayerStore`
```typescript
interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  outputDevice: string | null;

  play: (track: Track) => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setOutputDevice: (deviceId: string) => Promise<void>;
}
```

---

## Key Algorithms

### Tag Button Track Selection

When a tag button is tapped:

```
1. Get all tracks with this tag
2. Filter to unplayed tracks (played = false)
3. If empty:
   a. Reset played flag for all tracks with this tag
   b. Get all tracks again (now all unplayed)
4. Select random track from pool
5. Mark selected track as played
6. Play track
```

See `src/services/playback/tagPool.ts` for implementation.

---

*Approved by: [Pending Project Lead approval]*
