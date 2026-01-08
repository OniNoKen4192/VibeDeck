# [VibeDeck] Quest Board



> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Project State

**Human Test Ready:** ✅ READY — HT-013 fixed, Human Testing Round 4 can proceed

**Build History:**
- 2026-01-07: Failed — Expo Go incompatible with native modules
- 2026-01-08: Failed — `react-native-worklets` required New Architecture, but `react-native-track-player` incompatible with it
- 2026-01-08: ✅ **SUCCESS** — Removed unused `react-native-reanimated` + `react-native-worklets`, set `newArchEnabled=false`

**Resolution:** The template included `react-native-reanimated` (unused) which pulled in `react-native-worklets` (requires New Arch). Removing both allowed track-player to work with Old Architecture.

---

## Priority Order

1. ~~**🚨 Configure development build** (Tarnoth) — BLOCKING all testing~~ ✅ RESOLVED (Vaelthrix)
2. ~~**Full flow QA pass** (Kazzrath) — Import → Tag → Button → Play~~ ✅ COMPLETE
3. ~~**🚨 Human Testing Bug Fixes** (Pyrrhaxis) — HT-001 through HT-004~~ ✅ COMPLETE
4. ~~**Human Testing Round 2** — Verify HT fixes on device~~ ✅ COMPLETE (2/4 pass, 2 blocked)
5. ~~**🚨 HT-007: expo-file-system migration** (Pyrrhaxis) — CRITICAL, blocks import~~ ✅ COMPLETE
6. ~~**HT-006: Board screen reactivity** (Pyrrhaxis) — High, board doesn't refresh on button changes~~ ✅ COMPLETE
7. ~~**HT-005: Volume slider identity** (Seraphelle) — Low, add speaker icon~~ ✅ COMPLETE
8. ~~**Human Testing Round 3** — Verify HT-005 through HT-007 fixes~~ ✅ COMPLETE (3/3 pass, 4 new bugs)
9. ~~**🚨 HT-011: TrackPlayer service + initialization** (Pyrrhaxis) — CRITICAL, app crashes~~ ✅ VERIFIED
10. ~~**🚨 HT-013: expo-file-system import path regression** (Pyrrhaxis) — CRITICAL, blocks import~~ ✅ COMPLETE
11. ~~**HT-008/009: URI decoding in metadata** (Pyrrhaxis) — High, tracks unidentifiable~~ ✅ COMPLETE (commit 3ab6c99)
12. **Human Testing Round 4** — Verify HT-008, HT-009, HT-013 fixes
13. **Code Review Phase 2** (Pyrrhaxis) — High severity fixes

---

## In Progress

### 🔴 Pyrrhaxis the Crimson — Code

- [x] **🚨 HT-011: TrackPlayer service + initialization** — ✅ Fixed (playbackService.ts, index.js, init guard)
- [x] **HT-008/009: URI decoding in metadata** — ✅ Fixed (decodeURIComponent in extractFileName)

---

## Pending

### ✨ Vaelthrix the Astral — Architecture

*No pending tasks*

### 🔴 Pyrrhaxis the Crimson — Code

#### Human Testing Fixes

- [x] **🚨 HT-007: expo-file-system migration** — ✅ Migrated to `File` class API (commit 249f459)
- [x] **HT-006: Board screen reactivity** — ✅ Subscribed to button store changes (commit 249f459)
- [x] **🚨 HT-013: expo-file-system import path regression** — ✅ Corrected import path to `/next` (commit b467c28)

#### Phase 2: High Severity (Before Beta)

- [ ] **CR-09: Complete path traversal defense** — Handle Windows paths, sandbox validation
- [ ] **CR-10: Fix player state desync** — Push all state changes via callbacks
- [ ] **CR-12: Disable exhausted button presses** — Return early from onPress (partially addressed by Auto-Reset)
- [ ] **CR-16: Fix VolumeSlider division by zero** — Guard against sliderWidth === 0
- [ ] **CR-18: Debounce VolumeSlider** — 16ms throttle on value changes

### 🪽 Seraphelle the Silver — UI/UX

- [x] **Build Library screen** — ✅ Complete (track list, import, search, selection mode, track detail modal)
- [x] **Build Tags screen** — ✅ Complete (tag list, create/edit modal, color picker, delete confirmation)
- [x] **HT-005: Volume slider identity** — ✅ Added speaker icon (muted/low/medium/high) to PlaybackControls
- [ ] **Empty tag button UI** — Gray out buttons with no tracks (part of Auto-Reset feature)
- [ ] **CR-17: Fix CountBadge NaN handling** — Add Number.isFinite check
- [ ] **CR-26: Add picker cancellation feedback** — User notification on cancel

### 🔵 Kazzrath the Blue — QA

> ✅ HT Round 3 Complete — See [qa/QA_REPORT_HT_ROUND3.md](qa/QA_REPORT_HT_ROUND3.md)

- [x] **Full flow QA pass** — Import → Tag → Button → Play ✅
- [x] **BoardScreen edge cases** — Test interactions, played-flag logic, auto-reset ✅
- [x] **Verify Phase 1 fixes** — Regression testing for critical fixes ✅
- [x] **Human Testing Round 2** — HT-002 ✅, HT-003 ✅, HT-004 blocked, HT-001 blocked
- [x] **Human Testing Round 3** — HT-005 ✅, HT-006 ✅, HT-007 ✅ (4 new bugs: HT-008 to HT-011)
- [ ] **Human Testing Round 4** — Verify HT-008 through HT-011 fixes

### 🟡 Chatterwind the Brass — Safety

- [ ] **Review path traversal fix** — Verify CR-09 implementation is complete
- [ ] **Audit error message exposure** — Ensure no technical errors leak to users (CR-27)

### 🟤 Wrixle the Copper — Documentation

- [ ] **Document transaction patterns** — After Vaelthrix designs approach
- [ ] **Update store JSDoc** — Reflect new validation requirements

### 🟠 Tarnoth the Bronze — DevOps & Tooling

- [x] **🚨 Configure development build** — ✅ Resolved by Vaelthrix (removed reanimated/worklets, disabled New Arch)
- [ ] **Configure automated test framework** — Jest + React Native Testing Library

---

## Code Review Reference

All issues tracked in [CODE_REVIEW.md](qa/CODE_REVIEW.md).

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
- Reference: [CODE_REVIEW.md](qa/CODE_REVIEW.md), [REMEDIATION_PLAN.md](qa/REMEDIATION_PLAN.md)
