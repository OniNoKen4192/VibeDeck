# [VibeDeck] Quest Log


> Completed quests, archived by the Council of Dragons.

---

## 2026-01-02

- [x] **Define MVP scope and specification** (Vaelthrix)
  - Created comprehensive MVP_SPEC.md
  - Defined core features: Library, Tags, Button Board, Playback

- [x] **Define data model** (Vaelthrix)
  - Created DATAMODEL.md with entity definitions
  - SQLite schema with proper constraints and indexes

- [x] **Design folder structure** (Vaelthrix)
  - Created ARCHITECTURE.md
  - Defined layer responsibilities and data flow

- [x] **Design navigation structure** (Vaelthrix)
  - Tab navigator with Board, Library, Tags
  - Stack modals for detail/edit screens

- [x] **Design state management architecture** (Vaelthrix)
  - Zustand store interfaces for Track, Tag, Button, Player
  - Data flow patterns documented

- [x] **Initialize React Native project** (Tarnoth)
  - Used create-expo-app with tabs template
  - Expo SDK 54, React 19, TypeScript enabled
  - Commit: 7a99b03

- [x] **Initialize Git repository** (Tarnoth)
  - .gitignore for Expo/RN/Node
  - Configured safe.directory for Windows

- [x] **Configure ESLint and Prettier** (Tarnoth)
  - ESLint with TypeScript, React, React Hooks plugins
  - Prettier with project conventions
  - Added lint/format npm scripts

- [x] **Install core dependencies** (Tarnoth)
  - expo-sqlite (^16.0.10) — Database layer
  - expo-file-system (^19.0.21) — File access
  - react-native-track-player (^4.1.2) — Audio playback
  - zustand (^5.0.9) — State management

- [x] **Create initial folder structure** (Tarnoth)
  - src/types — Entity interfaces from DATAMODEL.md
  - src/db — Schema definitions
  - src/stores — Store index (implementations pending)
  - src/constants — Colors, layout, audio constants
  - src/utils — UUID, time formatting utilities
  - Commit: a17eb07

---

## 2026-01-03

- [x] **Implement database initialization** (Pyrrhaxis)
  - Created `src/db/init.ts` with initDatabase(), getDatabase(), closeDatabase()
  - Handles schema versioning via PRAGMA user_version
  - Enables foreign keys on connection

- [x] **Implement database query functions** (Pyrrhaxis)
  - `src/db/queries/tracks.ts` — CRUD for tracks, played flag management
  - `src/db/queries/tags.ts` — CRUD for tags with track counts
  - `src/db/queries/trackTags.ts` — Track-tag associations, tag pool queries
  - `src/db/queries/buttons.ts` — CRUD for buttons, position management
  - `src/db/queries/settings.ts` — Key-value settings persistence

- [x] **Implement useTrackStore** (Pyrrhaxis)
  - Track CRUD operations with Zustand
  - Played flag management (markPlayed, resetAllPlayed)
  - Syncs state with SQLite persistence

- [x] **Implement useTagStore** (Pyrrhaxis)
  - Tag CRUD with automatic count updates
  - Track-tag association management
  - Tag pool queries for button playback

- [x] **Implement useButtonStore** (Pyrrhaxis)
  - Separate addTagButton/addDirectButton for type safety
  - Button reordering with position management
  - resolveButton() for UI-ready button data with color inheritance

- [x] **Implement usePlayerStore** (Pyrrhaxis)
  - Playback state (currentTrack, isPlaying)
  - Volume persistence across sessions
  - Output device tracking

---

## 2026-01-04

- [x] **Review file system access patterns** (Chatterwind)
  - Created Chatterwind_recommendations.md
  - Validated no network code, SQL injection protection
  - Documented validation requirements for import service
  - Architectural decisions: Content URIs, reference-in-place

---

## 2026-01-05

- [x] **Implement track import service** (Pyrrhaxis)
  - Created `src/services/import/` with validation, metadata, and picker logic
  - File existence validation via expo-file-system
  - Extension whitelist check against Audio.supportedFormats
  - Path sanitization (no traversal, max length 1024)
  - Metadata extraction from filename patterns ("Artist - Title.mp3")
  - Document picker integration with MIME type filtering
  - Batch import with progress callback support

- [x] **Implement tag pool selection** (Pyrrhaxis)
  - Created `src/services/tagPool/` for random track selection
  - `selectTrackForTag()` — Random unplayed track with auto-mark-played
  - Pool exhaustion detection with `poolExhausted` flag
  - `getTagCounts()` for efficient total/unplayed count queries
  - `resetPoolForTag()` and `resetAllPools()` for pool refill

- [x] **Add UI documentation to stores** (Pyrrhaxis)
  - Enhanced JSDoc comments on all four stores
  - Added usage examples for Seraphelle's UI implementation
  - Documented data flow patterns and component integration

- [x] **Review import service implementation** (Chatterwind)
  - Verified all safety checklist items from Chatterwind_recommendations.md
  - File existence, extension whitelist, path sanitization, max length: COMPLIANT
  - Privacy constraint verified: no network calls present
  - Architectural decisions documented: content URIs supported, reference-in-place
  - One deferred item: player service must handle missing files at playback

- [x] **Design button board layout** (Seraphelle)
  - Created comprehensive UI_DESIGN.md specification
  - 3-column responsive grid (2-4 columns based on screen width)
  - Button anatomy: Tag buttons with count badge, Direct buttons with music icon
  - Touch targets: 100px min height, 44px accessibility minimum
  - Grid spacing: 12px gaps, 16px screen padding

- [x] **Design color system** (Seraphelle)
  - Finalized dark theme palette with indigo primary
  - Defined 5 button states: Default, Pressed, Playing, Exhausted, Disabled
  - Tag color palette with accessibility contrast ratios
  - Yellow exception: requires dark text for 4.5:1 contrast
  - Added utility functions: `getButtonTextColor()`, `darkenColor()`

- [x] **Update Layout constants** (Seraphelle)
  - Added responsive breakpoints (360px, 480px)
  - Added spacing scale (xs through 2xl)
  - Added playback control dimensions
  - Added animation timing constants

- [x] **Implement player service** (Pyrrhaxis)
  - Created `src/services/player/` with react-native-track-player integration
  - `initializePlayer()` / `destroyPlayer()` for lifecycle management
  - `playTrack()` with file existence validation (Chatterwind's requirement)
  - `pause()`, `resume()`, `stop()`, `seekTo()`, `setVolume()` for playback control
  - Graceful error handling: `file_not_found`, `playback_error`, `not_initialized` codes
  - Event callbacks: `registerPlaybackStateCallback()`, `registerPlaybackErrorCallback()`
  - State sync pattern documented for usePlayerStore integration
  - Comprehensive JSDoc with UI integration examples for Seraphelle

- [x] **Build UI components** (Seraphelle)
  - Created `src/components/` with 8 components per UI_DESIGN.md
  - `BoardButton` — Core button with all 5 states (default, pressed, playing, exhausted, disabled)
  - `CountBadge` — Animated unplayed count badge with bounce on change
  - `TypeIndicator` — Visual bar distinguishing tag buttons
  - `ButtonBoard` — Responsive grid (2-4 columns) with proper spacing
  - `PlaybackControls` — Stop button + volume slider combination
  - `StopButton` — Emergency stop with press animation
  - `VolumeSlider` — Custom pan-gesture slider with 44px touch target
  - `NowPlaying` — Track info bar with pulsing speaker icon
  - All components follow accessibility guidelines (touch targets, labels, contrast)

- [x] **Add file headers to source files** (Wrixle)
  - Added `@file` and `@description` JSDoc headers to all 36 `.ts`/`.tsx` files in `src/`
  - Standardized format: `@file path/filename.ext` + `@description` one-liner
  - Added `@see` references for UI components pointing to docs/UI_DESIGN.md

- [x] **Document project setup instructions** (Wrixle)
  - Created comprehensive README.md for developer onboarding
  - Prerequisites: Node.js, npm, Git, Android Studio / Expo Go
  - Getting started: clone, install, run commands
  - Available scripts table, project structure overview
  - Tech stack summary, code quality tools, troubleshooting section
  - Links to all project documentation

- [x] **BoardScreen layout with placeholder handlers** (Seraphelle)
  - Created `app/(tabs)/index.tsx` as main Board screen
  - Integrated ButtonBoard, PlaybackControls, NowPlaying components
  - Mock data with 6 buttons demonstrating all states (default, playing, exhausted, disabled)
  - Placeholder handlers for button press, long press, stop, volume
  - Loading state with spinner, empty state with guidance text
  - Updated tab navigation: Board, Library, Tags with proper icons and styling
  - Created placeholder Library and Tags screens for future implementation

- [x] **Wire BoardScreen to stores and player** (Pyrrhaxis)
  - Connected `app/_layout.tsx` with app initialization sequence
  - Database, player, and all stores initialized on mount with proper cleanup
  - `AppReadyContext` for downstream components to check readiness
  - Replaced mock data with `useButtonStore.resolveAllButtons()`
  - Wired playback to `react-native-track-player` via player service
  - Tag button press: calls `selectTrackForTag()` for random unplayed track selection
  - Direct button press: plays specific track via `playTrack()`
  - Stop and volume handlers connected to player service and store
  - Playback callbacks registered for state sync (play/pause/end events)
  - Button grid refreshes after played flag changes to update counts

- [x] **BoardScreen visual polish** (Seraphelle)
  - Created `src/components/Toast.tsx` for error/feedback notifications
  - Toast types: error (red), warning (amber), success (green), info (indigo)
  - Slide-in animation with auto-dismiss after 3 seconds
  - Integrated Toast into BoardScreen for playback error display
  - Added haptic feedback via expo-haptics for button interactions
  - Light impact on button press, medium on stop, error notification on failures
  - Pool exhausted feedback: shake animation + warning toast + haptic
  - Polished empty state with grid icon, hint text pointing to Library/Tags tabs
  - Added fade-in animation when board loads
  - All accessibility labels already present from initial BoardButton implementation

---

## 2026-01-07

- [x] **Review CODE_REVIEW.md** (Vaelthrix)
  - Provided architectural guidance on remediation approach
  - Prioritized issues by severity and testing impact

- [x] **Design database transaction patterns** (Vaelthrix)
  - Standard wrapper for multi-step operations
  - Pattern applied to reorderButtons and other atomic operations

- [x] **Code Review Remediation Phase 1** (Pyrrhaxis)
  - CR-01: Added database transactions — `reorderButtons` wrapped in transaction
  - CR-02: Fixed N+1 query in resolveAllButtons — `getAllButtonsResolved()` batch query added
  - CR-03: Used secure UUID generation — Now uses `expo-crypto.randomUUID()`
  - CR-04: Fixed player memory leak — Event listeners cleaned up in `destroyPlayer()`
  - CR-05: Optimized tag store updates — Optimistic updates with rollback
  - CR-06: Handled volume persistence errors — Try-catch with rollback
  - CR-08: Fixed button position race — `insertButtonAtomic()` added
  - CR-11: Added seek bounds checking — Position clamped
  - CR-14: Added input validation — Tag name validation added
  - All 8 critical issues resolved

- [x] **Code Review Remediation Phase 1.5** (Pyrrhaxis)
  - CR-45: Fixed insertButtonAtomic silent failure — Now throws on SELECT failure
  - CR-46: Fixed seekTo Infinity fallback — Returns early when duration unknown
  - Auto-Reset Tag Pools — "Music must flow" feature implemented
    - `selectTrackForTag()` now auto-resets pool when exhausted
    - Added `poolEmpty` flag to distinguish "no tracks" from "all played"
    - Added `total_tracks` to batch query for empty tag detection
    - `ButtonResolved.isEmpty` flag for UI to gray out empty tag buttons
  - Board infrastructure complete, awaiting Library/Tags screens for full testing

- [x] **Design Library & Tags screens** (Seraphelle)
  - Updated UI_DESIGN.md with comprehensive specifications
  - Library screen: header, search bar, track rows, selection mode, bulk actions, empty state
  - Tags screen: header, tag rows, create/edit modal, color picker, empty state
  - Track Detail modal: track info, tag chip picker, preview, add to board, delete
  - Bulk Tag modal: apply single tag to multiple selected tracks
  - Delete confirmation dialogs for destructive actions
  - UX decisions: chip picker for tags, long-press for selection mode, deletable tags

- [x] **Build Library screen** (Seraphelle)
  - Created `src/components/library/` with 6 components per UI_DESIGN.md
  - `TrackRow` — Track display with preview button, tag dots, selection checkbox
  - `SearchBar` — 150ms debounced search with clear button
  - `LibraryHeader` — Title + Import button with loading state
  - `SelectionHeader` — Selection count + Cancel for bulk mode
  - `BulkActionBar` — Add Tag / Delete buttons for bulk operations
  - `EmptyLibrary` — First-run empty state with import CTA
  - Created `src/components/modals/` with 4 modal components
  - `TrackDetailModal` — View/edit track with tag chip picker
  - `TagChipPicker` — Toggle tags on/off with filled/outline chips
  - `BulkTagModal` — Apply single tag to multiple tracks
  - `DeleteConfirmation` — Destructive action confirmation dialog
  - Wired `app/(tabs)/library.tsx` with all stores and player service
  - FlatList virtualization per ARCHITECTURE.md (15 initial, windowSize 5)
  - Selection mode with haptic feedback, bulk tag/delete actions
  - Track import via document picker with progress feedback

- [x] **Design pagination strategy** (Vaelthrix)
  - Decision: FlatList virtualization with full in-memory data
  - Typical user has 20-50 tracks; cursor pagination unnecessary for MVP
  - FlatList config: initialNumToRender=15, windowSize=5, getItemLayout for fixed 72px rows
  - Search: 150ms debounce, client-side filter via useMemo
  - Documented upgrade path if 5000+ tracks ever needed

- [x] **Build Tags screen** (Seraphelle)
  - Created `src/components/tags/` with 5 components per UI_DESIGN.md
  - `TagRow` — Tag display with color dot, name, track count, chevron
  - `TagsHeader` — Title + New button
  - `EmptyTags` — First-run empty state with create CTA
  - `ColorPicker` — 8-color palette picker with selection ring
  - `TagModal` — Create/edit form with name input, color picker, delete option
  - Wired `app/(tabs)/tags.tsx` with tag store and button store
  - Auto-creates board button when new tag is created
  - Haptic feedback on tag row press
  - Validation for tag names (required, max 50 chars)
  - Delete confirmation with track count warning

- [x] **Fix preview state on track deletion** (Pyrrhaxis)
  - Reset `isPreviewPlaying` in `handleDeleteTrack` after `playerStop()`
  - Prevents stale preview state when user deletes a track being previewed
  - Added `isPreviewPlaying` to useCallback dependency array

---

## 2026-01-08

- [x] **Full flow QA pass** (Kazzrath)
  - Verified Import → Tag → Button → Play flow is architecturally complete
  - Document picker, validation, metadata extraction all functional
  - Tag creation, editing, deletion, and association working
  - Button creation (auto on tag, manual from track detail) verified
  - Playback with tag pool selection and direct buttons working
  - Full report: [QA_REPORT_2026-01-08.md](QA_REPORT_2026-01-08.md)

- [x] **BoardScreen edge cases QA** (Kazzrath)
  - Played-flag logic verified (markPlayed callback integration)
  - Auto-reset "music must flow" feature working correctly
  - Exhausted button handling (visual feedback, no-op on press)
  - Empty tag detection (isEmpty flag, button disabled)
  - Same-button toggle, interrupt behavior all correct

- [x] **Verify Phase 1 critical fixes** (Kazzrath)
  - CR-01: Database transactions ✅ (setTagsForTrack wrapped)
  - CR-02: N+1 query fix ✅ (getAllButtonsResolved batch query)
  - CR-03: Secure UUID ✅ (expo-crypto.randomUUID)
  - CR-04: Player memory leak fix ✅ (eventSubscriptions cleanup)
  - CR-05: Tag store optimistic updates ✅ (adjustTagCount helper)
  - CR-06: Volume persistence error handling ✅ (rollback on failure)
  - CR-08: Button position race condition ✅ (insertButtonAtomic)
  - CR-11: Seek bounds checking ✅ (clamped to duration)
  - CR-14: Input validation ✅ (validateTagName, validateButtonName)
  - CR-45: insertButtonAtomic error propagation ✅
  - CR-46: seekTo Infinity fallback ✅ (early return)

- [x] **Human Testing Bug Fixes** (Pyrrhaxis)
  - HT-004: Fixed content:// URI rejection — Strip URI scheme before path traversal check
  - HT-002: Fixed VolumeSlider crash — Capture pageX synchronously before async measureInWindow
  - HT-003: Fixed tag modal keyboard flicker — Use `behavior="padding"` on Android
  - HT-001: Fixed orphaned buttons on tag deletion — Cross-store cascade via removeButtonsForTag

- [x] **HT-007: expo-file-system migration** (Pyrrhaxis)
  - Migrated from deprecated `getInfoAsync` to new `File` class API
  - Updated `src/services/import/validation.ts` — File existence check now uses `new File(path).exists`
  - Updated `src/services/player/index.ts` — Pre-playback validation uses `File` class
  - Content URIs handled transparently by new API
  - Commit: 249f459

- [x] **HT-006: Board screen reactivity** (Pyrrhaxis)
  - Board screen now subscribes to `useButtonStore.buttons` changes
  - Added `storeButtons` dependency to loadResolvedButtons effect in `app/(tabs)/index.tsx`
  - Creating/deleting tags now immediately updates the Board grid
  - Commit: 249f459

- [x] **Human Testing Round 3** (Kazzrath)
  - Verified HT-005: Speaker icon on volume slider — PASS
  - Verified HT-006: Board reactivity on tag changes — PASS
  - Verified HT-007: Track import with new File API — PASS
  - Discovered 4 new bugs during testing:
    - HT-008: Track title shows URL-encoded content URI (High)
    - HT-009: Artist not extracted from filename (Medium)
    - HT-010: Duration not populated on import (Medium)
    - HT-011: App crash on volume slider — missing TrackPlayer service (Critical)
  - Full report: [qa/QA_REPORT_HT_ROUND3.md](qa/QA_REPORT_HT_ROUND3.md)

- [x] **HT-011: TrackPlayer service + initialization** (Pyrrhaxis)
  - Created `src/services/player/playbackService.ts` — Background service for remote events
  - Created `index.js` — Custom entry point with service registration before React
  - Updated `package.json` to use custom entry point
  - Added initialization guard for "already initialized" case (hot reload, app restart)
  - Commit: 3ab6c99

- [x] **HT-008/009: URI decoding in metadata** (Pyrrhaxis)
  - Added `decodeURIComponent()` to `extractFileName()` in validation.ts
  - Content URIs from Android document picker now properly decoded
  - Artist/title pattern matching now works on decoded filenames
  - Commit: 3ab6c99

- [x] **HT-013: expo-file-system import path regression** (Pyrrhaxis)
  - Corrected import path from `'expo-file-system'` to `'expo-file-system/next'`
  - Updated `src/services/import/validation.ts:6`
  - Updated `src/services/player/index.ts:13`
  - Regression from HT-007 migration — `File` class lives in `/next` submodule
  - Commit: b467c28

- [x] **Human Testing Round 4** (Kazzrath)
  - Verified HT-011: TrackPlayer service — PASS
  - Verified HT-014: content:// URI handling — PASS (with QA fix)
  - Verified HT-008/009: URI decoding — PASS
  - HT-012: Skip deferred (pre-existing cosmetic issue)
  - Discovered 3 new bugs: HT-015, HT-016, HT-017
  - Full report: [qa/QA_REPORT_HT_ROUND4.md](qa/QA_REPORT_HT_ROUND4.md)

- [x] **HT-014: content:// URI incompatibility** (Kazzrath QA fix, Vaelthrix decision)
  - Architectural decision: Skip validation for content:// URIs (Option C)
  - Kazzrath applied QA fix during testing — pending Pyrrhaxis review
  - Files: `validation.ts`, `index.ts`, `metadata.ts`

- [x] **HT-015/016/017 architectural review** (Vaelthrix)
  - HT-015: Board refresh — Decision: `useFocusEffect` to re-resolve buttons on tab focus
  - HT-016: Duplicate direct buttons — Decision: Allow (valid use case for multiple positions)
  - HT-017: Second direct button fails — Decision: Use unique queue IDs (timestamp suffix)
  - Handoff created for Pyrrhaxis implementation

---

## 2026-01-09

- [x] **Council Framework Brief feedback** (Wrixle)
  - Added Prerequisites section to README.md per PsychoPez feedback
  - Added Assumptions subsection per Shadow2097 feedback
  - Added Skills and Plugins to recommended tools
  - Cross-referenced README.md from COUNCIL_FRAMEWORK_BRIEF.md Getting Started section

- [x] **MVP Feature Completion** (Pyrrhaxis)
  - BoardHeader component — VibeDeck title, refresh icon, settings icon (56px, 44px touch targets)
  - Reset All feature — Confirmation dialog with warning color, resetAllPools(), success toast, haptic
  - Long-press context menu — ButtonContextMenu bottom sheet with pin/unpin and remove actions
  - Pin toggle — updateButton() for persistent flag, immediate board refresh
  - Board sorting — Persistent buttons sort to top via SQL `ORDER BY persistent DESC, position ASC`
  - AboutScreen modal — Full-screen with usage guide (How to Use, Played Tracks, Pinned Buttons)
  - Empty tag button UI — Gray surface, 50% opacity, dashed border, "No Tracks" label, no-op on tap
  - Enhanced DeleteConfirmation — Added `confirmColor` prop for warning vs error dialogs
  - Files created: BoardHeader.tsx, ButtonContextMenu.tsx, AboutScreen.tsx
  - Files modified: BoardButton.tsx, DeleteConfirmation.tsx, buttons.ts queries, index.tsx (Board screen)
  - Archived handoff: [DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_mvp-features.md](council/archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_mvp-features.md)

- [x] **HT-021: Exhausted button tap-to-stop** (Pyrrhaxis) 🏆
  - Fixed tap-to-stop on exhausted tag buttons when currently playing
  - Root cause: `BoardButton.isInteractive` blocked ALL presses when exhausted
  - Fix: `isInteractive = !isDisabled && !isEmpty && (!isExhausted || isPlaying)`
  - Toggle pattern (tap-to-play, tap-to-stop) now works regardless of pool state
  - File modified: `src/components/BoardButton.tsx` (line 67)
  - Commit: 4360e3c
  - Verified in HT Round 8

- [x] **HT-015: Board refresh on tab focus** (Pyrrhaxis)
  - Added `useFocusEffect` to re-resolve buttons when returning to Board tab
  - Commit: 389904e

- [x] **HT-017: Unique queue item IDs** (Pyrrhaxis)
  - Suffix track.id with timestamp in `playTrack()` to prevent duplicate ID conflicts
  - Commit: 389904e

- [x] **HT-018: SAF Permissions Module** (Pyrrhaxis)
  - Created native Expo module `expo-saf-uri-permission` for Android SAF persistent permissions
  - `takePersistablePermission()` called after document picker returns URIs
  - `releasePersistablePermission()` called on track deletion
  - Tracks now survive app restart and device reboot
  - Commit: ca3bd80

- [x] **HT-019: Cross-store refresh on track deletion** (Pyrrhaxis)
  - `deleteTrack()` now calls `loadTags()` and `loadButtons()` after deletion
  - Tag/button counts update immediately after track removal
  - Bundled with HT-018 implementation

- [x] **Human Testing Round 5** (Kazzrath)
  - Verified HT-015, HT-017 fixes — ALL PASS
  - Report: [qa/QA_REPORT_HT_ROUND5.md](council/qa/QA_REPORT_HT_ROUND5.md)

- [x] **Human Testing Round 6** (Kazzrath)
  - Verified MVP features — ALL PASS (8/8 tests)
  - Report: [qa/QA_REPORT_HT_ROUND6.md](council/qa/QA_REPORT_HT_ROUND6.md)
  - New bugs filed: HT-018, HT-019, HT-020

- [x] **Human Testing Round 7** (Kazzrath)
  - Verified HT-018, HT-019 fixes — ALL PASS (7/7 tests)
  - HT-018: Playback survives app restart AND device reboot
  - Report: [qa/QA_REPORT_HT_ROUND7.md](council/qa/QA_REPORT_HT_ROUND7.md)
  - New bug filed: HT-021

- [x] **HT-014 code review cleanup** (Pyrrhaxis)
  - Reviewed Kazzrath's QA fixes for HT-014/008/009
  - Removed DEBUG logging, committed clean code
  - Commit: 15c9fe5

- [x] **HT-018/019/020 Architectural Review** (Vaelthrix)
  - HT-018: SAF persistent URI permissions via native module
  - HT-019: Cross-store refresh on track deletion
  - HT-020: Keep tag name, styling-only differentiation (defer to Seraphelle)

- [x] **SAF Permissions Architecture** (Vaelthrix)
  - Designed native module approach for persistent URI permissions
  - Created architecture doc: [docs/ARCHITECTURE_SAF_PERMISSIONS.md](docs/ARCHITECTURE_SAF_PERMISSIONS.md)
  - Created implementation handoff for Pyrrhaxis

- [x] **Human Testing Round 8** (Kazzrath) 🏆
  - Verified HT-021: Exhausted button tap-to-stop — PASS
  - Pyrrhaxis fix confirmed working

- [x] **HT-020: Empty tag button identity** (Seraphelle)
  - Decision: Option C — Keep tag name, styling-only differentiation
  - Empty buttons now show tag name instead of "No Tracks"
  - Gray surface, 50% opacity, dashed border still signal empty state
  - Preserves identity when multiple tags are empty
  - File modified: `src/components/BoardButton.tsx`
  - Spec updated: `docs/UI_DESIGN.md` §Empty Tag Button State

- [x] **Configure test framework** (Tarnoth)
  - Installed jest, jest-expo, @testing-library/react-native, @types/jest
  - Created `jest.config.js` with jest-expo preset and path alias mapping
  - Created `jest.setup.js` with mocks for all native modules
  - Added npm scripts: `test`, `test:watch`, `test:coverage`
  - Created example test: `src/components/__tests__/CountBadge.test.tsx` (11 tests, 100% coverage)
  - Native module mocks: react-native-track-player, expo-file-system, expo-sqlite, expo-haptics, expo-crypto, expo-saf-uri-permission
