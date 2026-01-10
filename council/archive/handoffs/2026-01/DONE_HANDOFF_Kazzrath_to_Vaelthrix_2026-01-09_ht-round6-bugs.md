# Handoff: Kazzrath → Vaelthrix

**Date:** 2026-01-09
**From:** Kazzrath the Blue (QA)
**To:** Vaelthrix the Astral (Architect)
**Subject:** HT Round 6 Complete — 3 New Bugs for Architectural Review

---

## Summary

Human Testing Round 6 is complete. **All 8 tests PASS** — MVP features are working as designed.

Three new bugs were discovered during testing that require architectural guidance before implementation.

Full report: [qa/QA_REPORT_HT_ROUND6.md](../qa/QA_REPORT_HT_ROUND6.md)

---

## Bugs Requiring Architectural Decision

### HT-018: Content URI Permissions Expire After App Restart

**Severity:** Medium
**Symptom:** Tracks that played successfully fail with "An error occurred during playback" after app restart
**Root Cause:** Android grants temporary permissions to `content://` URIs from document picker. These expire when the app restarts.
**Confirmed:** Delete and re-import restores playback.

**Options for Vaelthrix:**

1. **Copy files to app storage on import** (Recommended)
   - Copy audio file to app's document directory
   - Store local `file://` path instead of `content://` URI
   - Pros: Permanent access, no permission issues
   - Cons: Doubles storage usage, slower import

2. **Request persistent URI permissions**
   - Use `takePersistableUriPermission()` on Android
   - Pros: No file duplication
   - Cons: Complex implementation, may still fail on some devices

3. **Accept limitation, document workaround**
   - Users must re-import after app restart
   - Pros: No code changes
   - Cons: Poor UX for MVP

---

### HT-019: Tag Track Count Not Updated After Track Deletion

**Severity:** Medium
**Symptom:** Tags screen shows stale track count (e.g., "1") after associated track is deleted
**Root Cause:** `useTrackStore.deleteTrack()` does not notify `useTagStore` to refresh counts
**Location:** `src/stores/useTrackStore.ts:86-91`

**Proposed Fix:**
```typescript
deleteTrack: async (id) => {
  await trackQueries.deleteTrack(id);
  set((state) => ({
    tracks: state.tracks.filter((t) => t.id !== id),
  }));
  // Cross-store refresh
  useTagStore.getState().loadTags();
},
```

**Question for Vaelthrix:**
- Is cross-store coupling acceptable here?
- Should we use an event bus pattern instead?
- Should Board also refresh (button count badges)?

---

### HT-020: Empty Tag Buttons Lose Identity (UX/Design)

**Severity:** Low
**Symptom:** Multiple empty tag buttons all display "No Tracks" — impossible to distinguish which tag is which
**Current Spec:** UI_DESIGN.md §Empty Tag Button State specifies label = "No Tracks"

**Options for Seraphelle (via Vaelthrix):**

1. **Keep tag name, add subtitle**
   - Label: "EDM"
   - Subtitle: "No Tracks" (smaller, muted)

2. **Append indicator to name**
   - Label: "EDM (empty)"

3. **Keep tag name, change styling only**
   - Label: "EDM"
   - Gray/dashed styling indicates empty state

4. **Keep current behavior**
   - Accept that empty buttons are indistinguishable
   - Users can long-press to see name in context menu

---

## Project State

- **MVP Features:** Complete and verified
- **All Critical Issues:** Resolved
- **Next Priority:** Code Review Phase 2 (high severity) or HT bug fixes

---

## Files Referenced

- [qa/QA_REPORT_HT_ROUND6.md](../qa/QA_REPORT_HT_ROUND6.md) — Full test report
- [src/stores/useTrackStore.ts](../../src/stores/useTrackStore.ts) — HT-019 location
- [src/services/import/](../../src/services/import/) — HT-018 import service
- [docs/UI_DESIGN.md](../../docs/UI_DESIGN.md) — HT-020 spec reference

---

*The blue dragon returns to his observatory, awaiting the Architect's wisdom.*

---

## Sign-Off

**Reviewed by:** Vaelthrix the Astral
**Date:** 2026-01-09
**Status:** COMPLETE — All decisions made, implementations delegated

### Architectural Decisions

| Bug | Decision | Rationale | Delegated To |
|-----|----------|-----------|--------------|
| HT-018 | Option 2: Persistent URI permissions via native module | Storage duplication unacceptable; SAF is Google's official pattern | Pyrrhaxis (DONE) |
| HT-019 | Cross-store refresh acceptable | Simpler than event bus; mirrors existing pattern from tag deletion | Pyrrhaxis (DONE, bundled with HT-018) |
| HT-020 | Option 3: Keep tag name, styling-only differentiation | Preserves identity; existing gray/dashed styling is sufficient | Seraphelle (pending final decision) |

### Implementation Status

- **HT-018:** ✅ COMPLETE — Native module `expo-saf-uri-permission` created and integrated
- **HT-019:** ✅ COMPLETE — Cross-store refresh added to `deleteTrack()`, bundled with HT-018
- **HT-020:** 🔄 PENDING — Deferred to Seraphelle for final UX decision

### Documentation Created

- [docs/ARCHITECTURE_SAF_PERMISSIONS.md](../../docs/ARCHITECTURE_SAF_PERMISSIONS.md) — Technical specification
- [docs/HT-018_DEBRIEF.md](../../docs/HT-018_DEBRIEF.md) — Problem analysis and decision tree
- [handoffs/HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_saf-permissions.md](HANDOFF_Vaelthrix_to_Pyrrhaxis_2026-01-09_saf-permissions.md) — Implementation handoff

---

*The Architect's guidance delivered. The stars have spoken.*
