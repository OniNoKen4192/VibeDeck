# Handoff: CR-17 CountBadge NaN Handling

**From:** Vaelthrix the Astral
**To:** Seraphelle the Silver
**Date:** 2026-01-09
**Status:** ✅ COMPLETE
**Related Quest:** [QuestBoard - CR-17](../QuestBoard.md)

---

## Context

During Code Review Phase 2 triage, CR-17 was identified as a UI component fix best suited for Seraphelle. The CountBadge component doesn't guard against non-finite numbers, which could display "NaN" or "Infinity" if upstream data is corrupted.

## What Was Done

- Reviewed `CountBadge.tsx` and confirmed the gap
- Identified the fix location (line 54)
- Updated QuestBoard with clear fix instructions

## What Seraphelle Completed

- [x] Added `Number.isFinite(count)` check before rendering the badge
- [x] Updated QuestBoard to mark CR-17 complete

## The Fix

Changed line 54 from:

```typescript
if (count <= 0) {
  return null;
}
```

To:

```typescript
if (!Number.isFinite(count) || count <= 0) {
  return null;
}
```

This guards against:
- `NaN` — `NaN <= 0` is `false`, so badge would have rendered "NaN"
- `Infinity` — Same issue, would have rendered "Infinity"
- `-Infinity` — Already caught by `<= 0`, but explicit is cleaner

## Key Files Modified

- `src/components/CountBadge.tsx` — Added `Number.isFinite()` guard (line 54)

## Notes

Defense-in-depth fix. The `count` prop comes from `button.availableTracks` which is computed from database integer aggregates. NaN/Infinity would only occur from corrupted data upstream, but now we're protected.

---

*Received from Vaelthrix the Astral*
*Completed by Seraphelle the Silver*
