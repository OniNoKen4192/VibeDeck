# VibeDeck QA Report — Human Testing Round 2

**Date:** 2026-01-08 (Session 2)
**Tester:** Project Lead (Human)
**Observer:** Tarnoth the Bronze
**Scope:** Verification of HT-001 through HT-004 fixes

---

## Test Environment

- **Device:** Android Emulator (Medium_Phone_API_36.1:5554)
- **Build:** Fresh development build post-HT fixes

---

## HT Fix Verification

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| HT-001 | Orphaned buttons on tag deletion | | |
| HT-002 | VolumeSlider crash on rapid drag | ✅ PASS | Stress tested, no crash |
| HT-003 | Tag modal keyboard flicker | ✅ PASS | Stable and useable |
| HT-004 | Content URI rejection on import | ❌ FAIL | Deprecated API — see HT-007 |

---

## New Issues Discovered

### HT-007: expo-file-system getInfoAsync deprecated, import fails

**Severity:** CRITICAL (Functional blocker)
**Reporter:** Kazzrath the Blue
**Assignee:** @Pyrrhaxis (with @Tarnoth for dependency review)

**Description:**
Track import fails with deprecation warning. The `getInfoAsync` method from `expo-file-system` is deprecated in Expo SDK 54.

**Log Output:**
```
WARN  Method getInfoAsync imported from "expo-file-system" is deprecated.
You can migrate to the new filesystem API using "File" and "Directory" classes
or import the legacy API from "expo-file-system/legacy".
```

**Impact:**
- **CRITICAL:** Track import completely broken — no tracks added to library
- HT-004 fix cannot be verified
- Blocks entire core user flow (Import → Tag → Button → Play)

**Recommended Fix:**
Either:
1. Migrate to new `File`/`Directory` API (preferred, future-proof)
2. Import from `expo-file-system/legacy` (quick fix, technical debt)

**Reference:** https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/

---

### HT-006: Board screen does not refresh on button store changes

**Severity:** High (Functional)
**Reporter:** Tarnoth the Bronze
**Assignee:** @Pyrrhaxis

**Description:**
When a new tag is created (which auto-creates a button), the Board screen does not display the new button until the app is restarted or the screen is manually refreshed.

**Root Cause:**
[index.tsx:102-116](../app/(tabs)/index.tsx#L102-L116) — The Board screen loads buttons once on mount via `useEffect` with `[resolveAllButtons]` dependency. It does not subscribe to `useButtonStore.buttons` changes, so additions/deletions from other screens are not reflected.

**Impact:**
- New tag buttons don't appear on Board until restart
- Orphaned buttons (EDM, Goal Horan) persist visually even if deleted from store
- Breaks the Tag → Button → Play flow for new users

**Recommended Fix:**
Subscribe to `useButtonStore.buttons` and trigger `loadResolvedButtons()` when it changes.

---

### HT-005: Volume slider lacks visual identity

**Severity:** Low (UX)
**Reporter:** Project Lead
**Assignee:** @Seraphelle

**Description:**
The volume slider's position adjacent to the STOP button causes it to be mistaken for a track progress bar. Users expect a progress indicator in that location, not volume control.

**Current State:**
- Slider sits to the right of STOP button
- No visual indicator of its purpose
- Easily confused with playback progress

**Recommended Solutions (pick one):**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Add speaker icon (muted/low/high) to left of slider | Universal recognition, no localization needed | Takes horizontal space |
| B | Add "Vol" text label | Explicit, simple | Less elegant |
| C | Speaker icon + percentage display | Precise feedback, clear purpose | Most complex |
| D | Vertical slider in corner | Common mobile pattern | Layout rework |

**Tarnoth's Recommendation:** Option A or C. A speaker icon is universally understood and immediately clarifies the control's purpose. Adding percentage gives users precise feedback on their setting.

---

## Session Log

- [x] HT-002 verified — VolumeSlider stable under stress
- [x] HT-003 verified — Keyboard behavior smooth
- [x] HT-004 attempted — Import broken (HT-007)
- [ ] HT-001 blocked — Cannot verify until HT-006 resolved

---

## Summary

**Passed:** 2/4
**Failed:** 1/4 (blocked by new issue)
**Blocked:** 1/4

**Next Steps:**
1. **HT-007 (CRITICAL)** — Pyrrhaxis + Tarnoth: Fix expo-file-system deprecation
2. **HT-006 (High)** — Pyrrhaxis: Board screen subscription to button store
3. **HT-005 (Low)** — Seraphelle: Volume slider visual identity

Testing blocked until HT-007 resolved. Escalating to Vaelthrix for architectural review.

---

## Sign-Off

*— Kazzrath the Blue, QA Dragon*
