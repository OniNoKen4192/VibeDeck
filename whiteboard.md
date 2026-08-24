# Whiteboard

Parking lot for feature ideas and open decisions. Anything here is uncommitted thinking —
no promises, no priority order. Graduate items to [docs/StretchGoals.md](docs/StretchGoals.md)
(long-term ideas) or a release goals doc (e.g. `council/1.1.0_Goals.md`) when they get real.

## Feature Ideas

- Shared `ScreenContainer` + bottom-sheet wrapper components that bake in safe-area
  insets, so new screens/modals can't regress HT-022/030/035/037 (from the 2026-08-23
  safe-area sweep) — 1.2 engineering item

- wave form with slider for adjusting start time/end time

- filter/search for library screen.

- attach kofi link?

## Noticed from usage

- duration unknown → how do we fix? — Answered: duration is discovered on first playback today;
  the fix (extract via expo-av at import time) is already catalogued as StretchGoals
  "UX Enhancements #4". Candidate for 1.2.

- Volume adjustment doesn't seem to do anything

## Open Decisions

- **Redwolf Media LLC / Play Console org account** — deferred 2026-08-23 in favor of a
  personal account + 12-tester closed test (plan: docs/superpowers/plans/2026-08-23-play-store-closed-test.md).
  Revisit if: developer name should read "Redwolf Media" instead of Ken's legal name,
  Ko-fi/monetization gets real, or a second app would face its own 12-tester gate.
  Needs: registered LLC, D-U-N-S number (free, up to 30 days), physical-address proof.
  Apps can be transferred to an org account later.

- ~~**Dev environment: N: drive is slow for Metro**~~ — **RESOLVED 2026-08-24: project moved to
  `S:\VibeDeck`.** N: racked up four build failures in one day (stale Kotlin snapshots, locked
  build dirs, CMake access-denied). S: verified: clean bundleRelease, tests 2× faster (22s vs 49s).
  The move also exposed and fixed an unparseable hand-written track-player patch (now automated
  via postinstall). `N:\VibeDeck` is now a stale copy — delete after a comfort period; all work
  happens on S:.

## Parked From This Cycle

- Full directory import (stretch, punted from 1.1.0)
- Utilities screen (stretch, punted from 1.1.0; now also owns HT-039 ghost-track cleanup)
- React Native New Architecture migration (blocked on react-native-track-player support)

## Triaged 2026-08-23

- ~~Duplicate import message~~ — fixed (HT-036)
- ~~Package id~~ — resolved: com.redwolfmedia.vibedeck
- ~~Splash screen rebrand~~ — done
- Scan device for song files, USB button awareness — graduated to docs/StretchGoals.md
