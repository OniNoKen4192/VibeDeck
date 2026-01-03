# [VibeDeck] Quest Board



> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Priority Order

1. **Implement database initialization** (Pyrrhaxis) — Initialize SQLite on app start
2. **Implement core stores** (Pyrrhaxis) — TrackStore, TagStore, ButtonStore, PlayerStore
3. **Implement track import** (Pyrrhaxis) — File picker and metadata extraction

---

## In Progress

<!-- Move tasks here when actively working on them -->

*No tasks currently in progress.*

---

## Pending

### ✨ Vaelthrix the Astral — Architecture

- [x] **Define MVP scope and specification** — Completed. See [docs/MVP_SPEC.md](../docs/MVP_SPEC.md)
- [x] **Define data model** — Completed. See [docs/DATAMODEL.md](../docs/DATAMODEL.md)
- [x] **Design folder structure** — Completed. See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [x] **Design navigation structure** — Completed. See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [x] **Design state management architecture** — Completed. See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

### 🔴 Pyrrhaxis the Red — Code

- [ ] **Implement database initialization** — Create tables on app start, handle migrations
- [ ] **Implement useTrackStore** — CRUD operations for tracks
- [ ] **Implement useTagStore** — CRUD operations for tags, track-tag associations
- [ ] **Implement useButtonStore** — CRUD operations for buttons
- [ ] **Implement usePlayerStore** — Playback state, volume control
- [ ] **Implement track import service** — File picker, metadata extraction
- [ ] **Implement tag pool selection** — Random unplayed track selection for tag buttons

### 🪽 Seraphelle the Silver — UI/UX

- [ ] **Design button board layout** — Grid spacing, touch targets, visual hierarchy
- [ ] **Design color system** — Finalize palette, button states, accessibility

### 🔵 Kazzrath the Blue — QA

*Blocked until implementation begins.*

### 🟡 Chatterwind the Brass — Safety

- [ ] **Review file system access patterns** — Ensure safe handling of imported audio files

### 🟤 Wrixle the Copper — Documentation

- [ ] **Document project setup instructions** — README for dev environment setup

### 🟠 Tarnoth the Bronze — DevOps & Tooling

- [x] **Initialize React Native project** — Expo with tabs template, TypeScript enabled
- [x] **Initialize Git repository** — .gitignore, initial commit
- [x] **Configure ESLint and Prettier** — Code style enforcement
- [x] **Install and configure expo-sqlite** — Database layer ready
- [x] **Install and configure expo-file-system** — File access ready
- [x] **Install and configure react-native-track-player** — Audio playback ready
- [x] **Install and configure Zustand** — State management ready
- [x] **Create initial folder structure** — src/, types, db, stores, constants, utils
