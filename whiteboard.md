# Whiteboard

Parking lot for feature ideas and open decisions. Anything here is uncommitted thinking —
no promises, no priority order. Graduate items to [docs/StretchGoals.md](docs/StretchGoals.md)
(long-term ideas) or a release goals doc (e.g. `council/1.1.0_Goals.md`) when they get real.

## Feature Ideas

- scan device for valid song files

external button awareness - usb button for things like goal horns?

- Shared `ScreenContainer` + bottom-sheet wrapper components that bake in safe-area
  insets, so new screens/modals can't regress HT-022/030/035/037 (from the 2026-08-23
  safe-area sweep)

## Noticed from usage

- duplicate import fails imprecisely - just says 'failed to import' we can do better.
- duration unknown -> how do we fix?

## Open Decisions

- **Dev environment: N: drive is slow for Metro** — Metro's Windows file-watcher must walk the
  whole project in under 4 minutes; with N:\ under load (2026-08-23: 13k-file mp3 sweep + AV scan)
  it times out ("Failed to start watch mode"). Options: move the project to S:\ (Ken open to this),
  install Watchman, or just avoid hammering N:\ during dev sessions.

- **Package id** — still `com.anonymous.VibeDeck` (Expo default). Decide on a real application id
  before the first store upload; changing it after anyone installs means users lose data on upgrade.
- **Splash screen** — new app icon landed 2026-08-23; splash still uses the old `splash-icon.png`
  on a white background. Rebrand to match the neon-cards look?

## Parked From This Cycle

- Full directory import (stretch, punted from 1.1.0)
- Utilities screen (stretch, punted from 1.1.0)
- React Native New Architecture migration (blocked on react-native-track-player support)
-
