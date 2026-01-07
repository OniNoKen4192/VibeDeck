# [VibeDeck] Quest Board



> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Project State

**Human Test Ready:** ✅ Yes — Phase 1.5 complete!

---

## Priority Order

1. ~~**Phase 1.5: Quick Fixes** (Pyrrhaxis)~~ ✅ Complete
2. **BoardScreen QA pass** (Kazzrath) — Ready now!
3. **Build Library screen** (Seraphelle) — Unblocked, can proceed
4. **Build Tags screen** (Seraphelle) — Depends on Library screen
5. **Code Review Remediation Phase 2** (Pyrrhaxis) — High severity fixes for beta

---

## Blocking Issues

> From [CODE_REVIEW.md](CODE_REVIEW.md) — Bahamut's audit dated 2026-01-07

**Remaining blockers for human testing (Phase 1.5):**
- ~~CR-45: insertButtonAtomic silent failure~~ ✅
- ~~CR-46: seekTo Infinity fallback~~ ✅
- ~~Auto-Reset Tag Pools~~ ✅

**Phase 1.5 complete — ready for human testing!**

---

## In Progress

<!-- Move tasks here when actively working on them -->

*None — Phase 1.5 complete!*

### Remediation Plan

**Reference:** [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md)

Plan updated with new fixes (CR-45, CR-46) and Auto-Reset Tag Pools feature.

---

## Pending

### ✨ Vaelthrix the Astral — Architecture

- [ ] **Design pagination strategy** — For Library screen scalability

### 🔴 Pyrrhaxis the Crimson — Code

#### Phase 1.5: Follow-up Fixes (From Bahamut's Re-review) ✅ COMPLETE

- [x] **CR-45: insertButtonAtomic silent failure** — Throw error instead of returning 0
- [x] **CR-46: seekTo Infinity fallback** — Return early when duration unknown
- [x] **Auto-Reset Tag Pools** — "Music must flow" feature

#### Phase 2: High Severity (Before Beta)

- [ ] **CR-09: Complete path traversal defense** — Handle Windows paths, sandbox validation
- [ ] **CR-10: Fix player state desync** — Push all state changes via callbacks
- [ ] **CR-12: Disable exhausted button presses** — Return early from onPress (partially addressed by Auto-Reset)
- [ ] **CR-16: Fix VolumeSlider division by zero** — Guard against sliderWidth === 0
- [ ] **CR-18: Debounce VolumeSlider** — 16ms throttle on value changes

### 🪽 Seraphelle the Silver — UI/UX

> ✅ Unblocked — Phase 1 complete, Board infrastructure stable

- [ ] **Build Library screen** — Track list, import button, track details
- [ ] **Build Tags screen** — Tag CRUD, tag-track association UI
- [ ] **Empty tag button UI** — Gray out buttons with no tracks (part of Auto-Reset feature)
- [ ] **CR-17: Fix CountBadge NaN handling** — Add Number.isFinite check
- [ ] **CR-26: Add picker cancellation feedback** — User notification on cancel

### 🔵 Kazzrath the Blue — QA

> Ready after Phase 1.5 completes

- [ ] **BoardScreen QA pass** — Test interactions, edge cases, played-flag logic
- [ ] **Verify Phase 1 fixes** — Regression testing for critical fixes
- [ ] **Test Auto-Reset behavior** — Verify "music must flow" works correctly

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

- Phase 1.5 (3 quick fixes) in progress — last blockers before human testing.
- QA can begin preliminary testing once Phase 1.5 is done.
- Seraphelle can proceed with UI work — Board infrastructure is stable.
- Auto-Reset Tag Pools is a new feature, not a bug fix — "music must flow" principle.
