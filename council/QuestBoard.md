# [VibeDeck] Quest Board



> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Project State

**Human Test Ready:** ✅ Library & Tags screens complete — Ready for QA

---

## Priority Order

1. **Full flow QA pass** (Kazzrath) — Ready to begin
2. **Code Review Phase 2** (Pyrrhaxis) — High severity fixes (parallel work)
3. **Human test environment setup** (Tarnoth) — BlueStacks/emulator config

---

## In Progress

### 🔴 Pyrrhaxis the Crimson — Code

*No tasks in progress*

---

## Pending

### ✨ Vaelthrix the Astral — Architecture

*No pending tasks*

### 🔴 Pyrrhaxis the Crimson — Code

#### Phase 2: High Severity (Before Beta)

- [ ] **CR-09: Complete path traversal defense** — Handle Windows paths, sandbox validation
- [ ] **CR-10: Fix player state desync** — Push all state changes via callbacks
- [ ] **CR-12: Disable exhausted button presses** — Return early from onPress (partially addressed by Auto-Reset)
- [ ] **CR-16: Fix VolumeSlider division by zero** — Guard against sliderWidth === 0
- [ ] **CR-18: Debounce VolumeSlider** — 16ms throttle on value changes

### 🪽 Seraphelle the Silver — UI/UX

- [x] **Build Library screen** — ✅ Complete (track list, import, search, selection mode, track detail modal)
- [x] **Build Tags screen** — ✅ Complete (tag list, create/edit modal, color picker, delete confirmation)
- [ ] **Empty tag button UI** — Gray out buttons with no tracks (part of Auto-Reset feature)
- [ ] **CR-17: Fix CountBadge NaN handling** — Add Number.isFinite check
- [ ] **CR-26: Add picker cancellation feedback** — User notification on cancel

### 🔵 Kazzrath the Blue — QA

> ✅ Unblocked — Library & Tags screens complete

- [ ] **Full flow QA pass** — Import → Tag → Button → Play
- [ ] **BoardScreen edge cases** — Test interactions, played-flag logic, auto-reset
- [ ] **Verify Phase 1 fixes** — Regression testing for critical fixes

### 🟡 Chatterwind the Brass — Safety

- [ ] **Review path traversal fix** — Verify CR-09 implementation is complete
- [ ] **Audit error message exposure** — Ensure no technical errors leak to users (CR-27)

### 🟤 Wrixle the Copper — Documentation

- [ ] **Document transaction patterns** — After Vaelthrix designs approach
- [ ] **Update store JSDoc** — Reflect new validation requirements

### 🟠 Tarnoth the Bronze — DevOps & Tooling

- [ ] **Set up human test environment** — Configure BlueStacks, physical device, or emulator
- [ ] **Configure automated test framework** — Jest + React Native Testing Library

---

## Code Review Reference

All issues tracked in [CODE_REVIEW.md](CODE_REVIEW.md).

| Severity | Count | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 8 | 8 | 0 |
| High | 15 | 2 | 13 |
| Medium | 15 | 0 | 15 |
| Low | 8 | 0 | 8 |

**Note:** 3 new issues (CR-44, CR-45, CR-46) added from re-review. CR-44 deferred (cosmetic count issue).

---

## Notes

- Board infrastructure complete (Phase 1 + 1.5 fixes done)
- ✅ Library & Tags screens complete — human testing can begin
- Code Review Phase 2 (high severity) should proceed in parallel with QA
- Reference: [CODE_REVIEW.md](CODE_REVIEW.md), [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md)
