# [VibeDeck] Quest Board


> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Project State

**Current Version:** 1.0.2 — SHIPPED
**Next Version:** 1.1.0 — In Development
**Status:** 1.1.0 development active

---

## 1.0 Summary

VibeDeck 1.0 is complete. Core features delivered:
- Tag-based button board with random track selection
- Direct buttons for specific tracks
- Auto-reset exhausted pools ("the music must flow")
- SAF persistent permissions for track survival across restarts
- Pin/unpin buttons, Reset All function
- Offline-only architecture (no network calls, ever)

**Final Stats:** 24 HT bugs fixed, 65 code review issues triaged, 9 human testing rounds passed.

See [docs/1.0_LessonsLearned.md](../docs/1.0_LessonsLearned.md) for retrospective.

---

## Priority Order

See [1.1.0_Goals.md](1.1.0_Goals.md) for full feature list.

1. ~~**Background playback**~~ — Already works! Verified 2026-01-11.
2. ~~**Pause/Play button**~~ — Complete. Forged by Pyrrhaxis 2026-01-11.
3. ~~**Real-time volume slider**~~ — Complete. Polished by Seraphelle 2026-01-11.
4. ~~**Button board padding**~~ — Complete. Polished by Seraphelle 2026-01-11.
5. ~~**Track list sorting**~~ — Complete. Polished by Seraphelle 2026-01-11.
6. ~~**Volume mute toggle**~~ — Complete. Polished by Seraphelle 2026-01-11.
7. ~~**Hamburger icon**~~ — Complete. Polished by Seraphelle 2026-01-11.
8. ~~**Rename Track**~~ — Complete. Polished by Seraphelle 2026-01-11.
9. ~~**Color picker for buttons**~~ — Complete. Polished by Seraphelle 2026-01-11.

---

## In Progress

| Quest | Dragon | Handoff |
|-------|--------|---------|
| *None* | — | — |

---

## Pending

### 1.1.0 Features

| Feature | Category | Complexity | Notes |
|---------|----------|------------|-------|
| Swipe to change tab | UX | Medium | |
| Track start/end time | Track Mgmt | Medium | Unified slider UI |
| Per-track volume | Track Mgmt | Medium | |

### Stretch (may punt to 1.2)

| Feature | Category | Complexity |
|---------|----------|------------|
| Full directory import | Import | Medium |
| Utilities screen | Maintenance | Medium |

### Deferred from 1.0

| Item | Reason |
|------|--------|
| CR-26: Picker cancellation feedback | Observe in field use |
| Medium/Low severity code review items | Non-blocking |
| React Native New Architecture | Awaiting track-player support |

---

## Code Review Reference

Phase 2 complete. Remaining items are Medium/Low severity, deferred to future releases.

See [CODE_REVIEW.md](qa/CODE_REVIEW.md) for full issue list.

---

## Notes

- 1.1.0 is the first public release (1.0.x was private MVP)
- Background playback already works (react-native-track-player handles it)
- Live fire learnings from 2026-01-11 Lady Kraken vs Winter Club game
- Native module `expo-saf-uri-permission` handles Android SAF permissions
- Test framework configured (Jest + RNTL) but test coverage is minimal

---

## References

- [StretchGoals.md](../docs/StretchGoals.md) — Future feature ideas
- [1.0_LessonsLearned.md](../docs/1.0_LessonsLearned.md) — 1.0 retrospective
- [BugHuntTrophies.md](qa/BugHuntTrophies.md) — Bug stories and lessons
- [CODE_REVIEW.md](qa/CODE_REVIEW.md) — Code review tracking
