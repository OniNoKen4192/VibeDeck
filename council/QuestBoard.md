# VibeDeck Quest Board

> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Priority Order

1. **Goal horn persistence** (Pyrrhaxis) — Critical for real-world use
2. **Settings persistence strategy** (Vaelthrix) — Informs how we fix remaining persistence issues
3. **Accessibility labels** (Seraphelle) — Low effort, high impact
4. **Jest setup** (Kazzrath) — Foundation for all future testing
5. **Claude Code skills research** (Tarnoth) — Workflow automation opportunities

---

## In Progress

_Nothing currently in progress._

---

## Pending

### 🔴 Pyrrhaxis the Red — Code

- [ ] **Persist goal horn URI** — Currently stored in playerStore but lost on app restart. Move to persisted storage or add to songStore settings.
- [ ] **Implement audio preloading** — Keep frequently-used tag groups' audio ready for instant playback (<100ms target).
- [ ] **Add audio ducking for goal horn** — Lower music volume when goal horn plays, restore after.
- [ ] **Song preview in library** — Tap-and-hold or preview button to hear song before adding to deck.

### ✨ Vaelthrix the Astral — Architecture

- [ ] **Evaluate settings persistence strategy** — Decide if AppSettings should live in songStore, playerStore, or a dedicated settingsStore with its own persistence.
- [ ] **Design crossfade system** — Spec out how track-to-track crossfading would work with current audio architecture.

### 🪽 Seraphelle the Silver — UI/UX

- [ ] **Add accessibility labels** — All buttons need accessibilityLabel and accessibilityHint props for VoiceOver support.
- [ ] **Improve empty states** — Better onboarding UX when library is empty (guide users to add songs).
- [ ] **Add button press animations** — Haptic feedback and scale animations for more satisfying interactions.
- [ ] **Review iPad landscape layout** — Ensure button board maximizes screen real estate in booth scenarios.

### 🔵 Kazzrath the Blue — QA

- [ ] **Set up Jest + React Native Testing Library** — No test infrastructure currently exists.
- [ ] **Write store unit tests** — Test songStore play tracking logic, tag group management.
- [ ] **Write playerStore tests** — Mock expo-av and test play/stop/fade state transitions.
- [ ] **Test exhaustion edge cases** — What happens when last song in group is deleted mid-play?

### 🟡 Chatterwind the Brass — Safety

- [ ] **🔒 Privacy audit (PERSISTENT)** — Verify NO user-identifiable data ever leaves the device. Audit all network calls, analytics, crash reporting, and third-party dependencies. This task is never "done" — re-audit on every release and whenever new dependencies are added.
  - Vectors to check: Expo telemetry, expo-av analytics, expo-document-picker, any analytics packages (Sentry/Firebase/Amplitude), error boundaries leaking file paths, Expo Updates OTA requests, device IDs in any form.
- [ ] **Audit file picker permissions** — Ensure document picker handles permission denials gracefully.
- [ ] **Review audio file validation** — What happens if user picks a non-audio file?
- [ ] **Check AsyncStorage limits** — Large libraries could hit storage limits; need graceful handling.

### 🟤 Wrixle the Copper — Documentation

- [ ] **Remove duplicate CLAUDE-vibedeck.md** — Consolidate into single CLAUDE.md.
- [ ] **Document store architecture** — Add JSDoc comments to songStore and playerStore exports.
- [ ] **Create user guide** — Simple "Getting Started" for end users (not devs).

### 🟠 Tarnoth the Bronze — DevOps & Tooling

- [ ] **Research Claude Code skills** — Investigate available skills and custom skill authoring that could benefit VibeDeck development workflow.
- [ ] **Evaluate CI/CD options** — Research lightweight CI options for future (GitHub Actions, EAS Build, etc.). Low priority until git is established.
