# VibeDeck

## Project Overview

VibeDeck is an iOS app (React Native/Expo) designed for parents running music at amateur sports events (hockey, basketball, etc.). The core problem is that non-DJ parents get overwhelmed making real-time music decisions during games. VibeDeck offloads that cognitive load through tag-based playlists and randomized, no-repeat playback.

**Target devices:** iPad (primary), iPhone (secondary)

## Core Concepts

### Tags
Songs are assigned one or more tags (e.g., `entrance`, `3rd-period`, `timeout`, `goal`, `heavy-metal`, `clean`, `fire`). Tags are user-defined and flexible.

### Tag Groups (Playlists)
Each unique tag automatically creates a playlist containing all songs with that tag. A song can appear in multiple tag groups.

### Play Tracking
- Songs are marked as "played" when triggered
- Played songs are excluded from random selection until ALL songs in that tag group have been played (or tracking is manually reset)
- Play tracking is per-tag-group, not global (a song can be "played" in the `entrance` group but still available in `timeout`)

### Button Board
The primary UI is a grid of large buttons, one per tag group. Tapping a button:
1. Selects a random unplayed song from that tag group
2. Begins playback immediately
3. Marks the song as played in that group
4. Tapping the same button (or stop) halts playback

### Always-On Controls
Persistent buttons that are always visible:
- **Stop All** - Immediately halt all audio
- **Goal Horn** - Play goal horn sound (interrupts/overlays current music)
- **Fade Out** - Graceful fade of current track (3-5 seconds)

## Technical Architecture

### Stack
- React Native with Expo SDK 53
- TypeScript
- Expo Router for navigation
- Zustand for state management
- AsyncStorage for persistence
- expo-av for audio playback
- expo-document-picker for importing songs

### Data Models

```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  fileUri: string; // local file URI from document picker
  duration?: number;
  addedAt: number;
}

interface TagGroup {
  tag: string;
  playedSongIds: string[];
}

interface AppSettings {
  volume: number;
  goalHornUri: string | null;
  fadeOutDuration: number; // seconds
}
```

### File Structure
```
app/
  _layout.tsx           # Root layout with tab navigation
  (tabs)/
    _layout.tsx         # Tab bar configuration
    index.tsx           # Deck view (button board)
    library.tsx         # Song management
    settings.tsx        # App settings
src/
  components/
    ButtonBoard.tsx     # Grid of tag buttons
    TagButton.tsx       # Individual tag button
    ControlBar.tsx      # Stop, goal horn, fade controls
    SongList.tsx        # Song list for library
    SongEditor.tsx      # Add/edit song modal
    NowPlaying.tsx      # Current track display
  stores/
    songStore.ts        # Zustand store for songs
    playerStore.ts      # Zustand store for playback
  hooks/
    useAudioPlayer.ts   # expo-av wrapper
  utils/
    storage.ts          # AsyncStorage helpers
  types/
    index.ts            # TypeScript interfaces
  constants/
    colors.ts           # Color palette
```

## UI/UX Guidelines

### Button Board
- Buttons must be LARGE and touch-friendly (minimum 80x80 points)
- This is used in a noisy arena, often on a tablet propped up in a booth
- Visual feedback must be immediate and obvious
- Color coding for button states:
  - Default (ready): Dark surface with border
  - Active/Playing: Bright green with glow/pulse
  - Exhausted (all played): Dimmed with reset indicator
  - Empty (no songs): Grayed out, disabled

### iPad Optimization
- Use available screen real estate - more/larger buttons on iPad
- Landscape orientation is likely primary use case in the booth
- Consider split view: button board + now playing info

### Performance
- Audio must start with minimal latency (<100ms perceived)
- Preload strategy: keep audio objects ready for quick start

## Color Palette

```typescript
const colors = {
  primary: '#6366f1',      // Indigo - brand
  playing: '#22c55e',       // Green - active state
  stop: '#ef4444',          // Red - stop/danger
  warning: '#f59e0b',       // Amber - goal horn
  exhausted: '#6b7280',     // Gray - depleted
  background: '#0f172a',    // Slate 900
  surface: '#1e293b',       // Slate 800
  border: '#334155',        // Slate 700
  text: '#f1f5f9',          // Slate 100
  textMuted: '#94a3b8',     // Slate 400
};
```

## Audio Implementation Notes

Using expo-av:
- Create Audio.Sound objects for playback
- Set audio mode for playback (not recording)
- Handle interruptions (phone calls, etc.)
- Implement fade by animating volume over time
- Goal horn should use a separate Sound object so it can overlay

```typescript
import { Audio } from 'expo-av';

// Set up audio mode on app start
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});
```

## Development Commands

```bash
npm start           # Start Expo dev server
npm run ios         # Run on iOS simulator (requires Mac)
npx expo start      # Alternative: start with Expo CLI directly
```

For testing on physical device: Use Expo Go app and scan QR code

## Future Considerations (Not MVP)

- Crossfade between tracks
- Song preview in library
- iCloud sync for library across devices
- Shortcuts/Siri integration ("Hey Siri, play entrance music")
- Event templates with pre-configured tag sets
- Hardware button box integration via BLE
- Audio ducking (lower music volume when goal horn plays)

## Code Style

- Functional components with hooks
- Keep components focused and small
- Use TypeScript strictly (no `any`)
- Descriptive names - this should be readable at 6am in a cold rink

## Development Process

This project uses the Council of Dragons agent framework. See [council/COUNCIL.md](council/COUNCIL.md) for agent definitions and invocation patterns.

**Quick summon:** `Read CLAUDE.md and council/COUNCIL.md. You are [Name] the [Color]. [Task].`

### Council Documents

| Document | Purpose |
|----------|---------|
| [council/COUNCIL.md](council/COUNCIL.md) | Dragon definitions and invocation patterns |
| [council/QuestBoard.md](council/QuestBoard.md) | Active tasks by dragon |
| [council/QuestLog.md](council/QuestLog.md) | Completed task history |
| [council/GIT_WORKFLOW.md](council/GIT_WORKFLOW.md) | Git conventions and handoff protocol |

## Default Agent

When starting a new session, assume the role of **Vaelthrix the Astral** (Architect) unless explicitly told otherwise. Begin by understanding the task at the architectural level before any implementation discussion.
