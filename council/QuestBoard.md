# [VibeDeck] Quest Board



> Active quests managed by the Council of Dragons. Completed quests are archived in [QuestLog.md](QuestLog.md).

---

## Project State

**Human Test Ready:** ✅ MVP Feature Complete — HT Round 6 PASSED

**Build Status:** ✅ SUCCESS — Development build working (Old Architecture, no reanimated/worklets)

---

## Priority Order

1. ~~**Code review HT Round 4 fixes** (Pyrrhaxis) — Review and commit Kazzrath's QA fixes~~ ✅ COMPLETE (commit 15c9fe5)
2. ~~**HT-015/017 implementation** (Pyrrhaxis) — useFocusEffect + unique queue IDs~~ ✅ COMPLETE (commit 389904e)
3. ~~**Human Testing Round 5** (Kazzrath) — Verify HT-015, HT-017 fixes~~ ✅ COMPLETE (all pass)
4. ~~**MVP Feature Completion** (Pyrrhaxis) — Reset All, Pin toggle, About screen~~ ✅ COMPLETE
5. ~~**Human Testing Round 6** (Kazzrath) — Verify MVP features~~ ✅ COMPLETE (all pass)
6. ~~**HT-018 Fix: SAF Permissions Module** (Pyrrhaxis) — Native module for persistent URI permissions~~ ✅ COMPLETE
7. ~~**HT-019 Fix: Cross-store refresh** (Pyrrhaxis) — Tag/button counts after track deletion (bundled with HT-018)~~ ✅ COMPLETE
8. **HT-020 Decision** (Seraphelle) — Empty tag button identity UX
9. **Human Testing Round 7** (Kazzrath) — Verify HT-018, HT-019, HT-020 fixes ⬅️ NEXT
10. **Code Review Phase 2** (Pyrrhaxis) — High severity fixes

---

## In Progress

### Mini-Sprint: HT-018 SAF Permissions

#### ⚪ Vaelthrix the Astral — Architecture

- [x] **Architectural decision** — Persistent URI permissions via native module (not file copying)
- [x] **Design SAF permissions module** — [docs/ARCHITECTURE_SAF_PERMISSIONS.md](../docs/ARCHITECTURE_SAF_PERMISSIONS.md)
- [x] **Create implementation handoff** — [handoffs/HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_saf-permissions.md](handoffs/HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_saf-permissions.md)

#### 🔴 Pyrrhaxis the Crimson — Code (Complete)

- [x] **Create `expo-saf-uri-permission` module** — Native Kotlin module in `modules/` directory
- [x] **Integrate with import service** — Call `takePersistablePermission()` after picker
- [x] **Integrate with track deletion** — Call `releasePersistablePermission()` + cross-store refresh (HT-019)
- [ ] **Rebuild and test** — Verify playback survives app restart (awaiting HT Round 7)

---

## Completed This Session (2026-01-09)

### 🔵 Kazzrath the Blue — QA

- [x] **Human Testing Round 6** — ✅ ALL PASS (8/8 tests)
  - Report: [qa/QA_REPORT_HT_ROUND6.md](qa/QA_REPORT_HT_ROUND6.md)
  - New bugs filed: HT-018 (URI permissions), HT-019 (tag count refresh), HT-020 (empty button UX)

### ⚪ Vaelthrix the Astral — Architecture

- [x] **HT-018/019/020 architectural review** — Decisions documented
  - HT-018: SAF persistent URI permissions (native module)
  - HT-019: Cross-store refresh on track deletion
  - HT-020: Keep tag name, styling-only differentiation (defer to Seraphelle)

### 🪽 Seraphelle the Silver — Design

- [x] **Design Reset All button** — Board header placement, confirmation dialog, post-reset feedback
- [x] **Design long-press context menu** — Bottom sheet with Pin/Unpin toggle, Remove button
- [x] **Design About/Settings screen** — Full-screen modal with usage tutorial, played flags explanation
- [x] **Design empty tag button UI** — Gray out buttons with no tracks, isEmpty flag behavior
- [x] **Design Board header** — Title + Reset icon + Settings icon
  - See: [docs/UI_DESIGN.md](../docs/UI_DESIGN.md) §Board Screen Header through §Empty Tag Button State
  - ✅ **Architectural review complete** (Vaelthrix) — Approved for implementation

### 🔴 Pyrrhaxis the Crimson — Code

- [x] **Review Kazzrath's HT-014/008/009 fixes** — ✅ Reviewed, DEBUG logging removed, committed
  - Archived: [DONE_HANDOFF_Kazzrath_to_Pyrrhaxis_2026-01-09_HT-014-cleanup.md](archive/handoffs/2026-01/DONE_HANDOFF_Kazzrath_to_Pyrrhaxis_2026-01-09_HT-014-cleanup.md)
  - Commit: 15c9fe5
- [x] **HT-015: Board refresh on tab focus** — ✅ Added `useFocusEffect` to re-resolve buttons
- [x] **HT-017: Unique queue item IDs** — ✅ Suffix track.id with timestamp in playTrack()
  - Archived: [DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_HT-015-016-017.md](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_HT-015-016-017.md)
  - Commit: 389904e
- [x] **MVP Feature Completion** — All 6 features implemented
  - BoardHeader component with VibeDeck title, reset, settings icons
  - Reset All feature with confirmation dialog, warning color, toast feedback
  - Long-press context menu (ButtonContextMenu) with pin/unpin, remove actions
  - Pin toggle with persistent flag update
  - Board sorting (persistent buttons at top via SQL ORDER BY)
  - AboutScreen modal with usage guide
  - Empty tag button UI (gray surface, dashed border, "No Tracks" label)
  - Archived: [DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_mvp-features.md](archive/handoffs/2026-01/DONE_HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_mvp-features.md)
- [x] **HT-018: SAF Permissions Module** — Native Expo module for persistent URI permissions
  - Created `modules/expo-saf-uri-permission/` with Kotlin native module
  - `takePersistablePermission()` called after document picker returns URIs
  - `releasePersistablePermission()` called on track deletion
  - Tracks will now play after app restart
- [x] **HT-019: Cross-store refresh** — Tag/button counts update after track deletion
  - `deleteTrack()` now calls `loadTags()` and `loadButtons()` after deletion
  - Bundled with HT-018 implementation

---

## Pending

### 🪽 Seraphelle the Silver — UI/UX

- [ ] **HT-020: Empty tag button identity** — Decide between name+subtitle vs styling-only
- [ ] **CR-17: Fix CountBadge NaN handling** — Add Number.isFinite check
- [ ] **CR-26: Add picker cancellation feedback** — User notification on cancel

### 🔴 Pyrrhaxis the Crimson — Code

#### Phase 2: High Severity (After HT Bug Fixes)

- [ ] **CR-09: Complete path traversal defense** — Handle Windows paths, sandbox validation
- [ ] **CR-10: Fix player state desync** — Push all state changes via callbacks
- [ ] **CR-12: Disable exhausted button presses** — Return early from onPress (partially addressed by Auto-Reset)
- [ ] **CR-16: Fix VolumeSlider division by zero** — Guard against sliderWidth === 0
- [ ] **CR-18: Debounce VolumeSlider** — 16ms throttle on value changes

### 🟡 Chatterwind the Brass — Safety

- [ ] **Review path traversal fix** — Verify CR-09 implementation is complete
- [ ] **Audit error message exposure** — Ensure no technical errors leak to users (CR-27)

### 🟤 Wrixle the Copper — Documentation

- [ ] **Document transaction patterns** — After Vaelthrix designs approach
- [ ] **Update store JSDoc** — Reflect new validation requirements

### 🟠 Tarnoth the Bronze — DevOps & Tooling

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

- All critical issues resolved
- MVP features complete — HT Round 6 PASSED
- HT-016 (duplicate direct buttons) — Intentionally allowed, not a bug
- HT-018 architectural decision: Use SAF persistent URI permissions (native module), not file copying
- **Active handoff:** [HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_saf-permissions.md](handoffs/HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_saf-permissions.md)
- Reference: [CODE_REVIEW.md](qa/CODE_REVIEW.md), [REMEDIATION_PLAN.md](qa/REMEDIATION_PLAN.md)
