# Whiteboard

Parking lot for feature ideas and open decisions. Anything here is uncommitted thinking —
no promises, no priority order. Graduate items to [docs/StretchGoals.md](docs/StretchGoals.md)
(long-term ideas) or a release goals doc (e.g. `council/1.1.0_Goals.md`) when they get real.

## Feature Ideas

- Shared `ScreenContainer` + bottom-sheet wrapper components that bake in safe-area
  insets, so new screens/modals can't regress HT-022/030/035/037 (from the 2026-08-23
  safe-area sweep) — 1.2 engineering item

## Noticed from usage

- duration unknown → how do we fix? — Answered: duration is discovered on first playback today;
  the fix (extract via expo-av at import time) is already catalogued as StretchGoals
  "UX Enhancements #4". Candidate for 1.2.

## Open Decisions

- **Dev environment: N: drive is slow for Metro** — Metro's Windows file-watcher must walk the
  whole project in under 4 minutes; with N:\ under load (2026-08-23: 13k-file mp3 sweep + AV scan)
  it times out ("Failed to start watch mode"). Options: move the project to S:\ (Ken open to this),
  install Watchman, or just avoid hammering N:\ during dev sessions.

## Parked From This Cycle

- Full directory import (stretch, punted from 1.1.0)
- Utilities screen (stretch, punted from 1.1.0; now also owns HT-039 ghost-track cleanup)
- React Native New Architecture migration (blocked on react-native-track-player support)

## Triaged 2026-08-23

- ~~Duplicate import message~~ — fixed (HT-036)
- ~~Package id~~ — resolved: com.redwolfmedia.vibedeck
- ~~Splash screen rebrand~~ — done
- Scan device for song files, USB button awareness — graduated to docs/StretchGoals.md
