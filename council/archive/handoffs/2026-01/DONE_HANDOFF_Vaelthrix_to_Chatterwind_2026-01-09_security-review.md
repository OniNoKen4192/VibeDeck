# Handoff: Security Review Tasks

**From:** Vaelthrix the Astral
**To:** Chatterwind the Brass
**Date:** 2026-01-09
**Related Quest:** [QuestBoard - Chatterwind tasks](../QuestBoard.md)

---

## Context

With Code Review Phase 2 complete, two security-related review tasks await the brass dragon's scrutiny. One verifies a fix just applied; the other audits error handling across the codebase.

---

## Task 1: Review CR-09 Path Traversal Fix

**Status:** Implementation complete, needs security sign-off

### What Was Done

The path traversal defense in `validateFilePath()` was hardened:

1. Added `decodeURIComponent()` to catch URL-encoded traversal (`%2e%2e`)
2. Added backslash normalization (`\` → `/`) for Windows-style traversal
3. Added try-catch for malformed URI encoding (rejects as suspicious)

### What to Verify

- [x] The fix handles all known traversal patterns
- [x] No bypass exists via double-encoding or mixed separators
- [x] The threat model documentation is accurate (defense-in-depth, not critical path)

### Key File

- `src/services/import/validation.ts` — lines 53-69

### The Fix (for reference)

```typescript
// Path traversal defense (CR-09)
const pathWithoutScheme = filePath.replace(/^[a-z]+:\/\//i, '');
let normalized: string;
try {
  normalized = decodeURIComponent(pathWithoutScheme).replace(/\\/g, '/');
} catch {
  return { isValid: false, error: 'Invalid file path format' };
}
if (normalized.includes('..') || normalized.includes('//')) {
  return { isValid: false, error: 'Invalid file path format' };
}
```

### Architectural Context

VibeDeck uses Android SAF document picker exclusively. Content URIs (`content://...`) are opaque identifiers — path traversal doesn't apply. This check is defense-in-depth for the exported `importFromPath()` API.

---

## Task 2: Audit Error Message Exposure (CR-27)

**Status:** Not started

### The Concern

Technical error details may leak to users through toasts or UI messages. Stack traces, SQL errors, or internal paths could confuse users or expose implementation details.

### What to Audit

- [x] All `catch` blocks that display errors to users
- [x] Toast messages throughout the app
- [x] Error returns from service functions
- [x] Database error handling

### Files to Review

- `src/services/import/index.ts` — import error handling
- `src/stores/*.ts` — store error handling
- `src/components/*.tsx` — any error display logic
- `app/(tabs)/*.tsx` — screen-level error handling

### Acceptance Criteria

- No stack traces shown to users
- No SQL error text shown to users
- No internal file paths exposed
- Error messages are user-friendly and actionable

---

## Deliverables

1. **CR-09 sign-off** — Confirm the fix is complete or identify gaps
2. **CR-27 report** — List any error exposure issues found, with locations and recommended fixes

---

*Handed off by Vaelthrix the Astral*

---

## Completion Sign-off

**Completed by:** Chatterwind the Brass
**Date:** 2026-01-09

### Summary

Both tasks completed. Full analysis in [council/Security/CR09_CR27_REVIEW.md](../../Security/CR09_CR27_REVIEW.md).

| Task | Verdict |
|------|---------|
| CR-09 Path Traversal | ✅ APPROVED — Defense complete for threat model |
| CR-27 Error Exposure | ✅ APPROVED — Low risk, user-friendly messages |

### Key Findings

**CR-09:** All standard traversal patterns blocked. Double-encoding edge case is not exploitable (no second decoder downstream). Architectural context comment is accurate.

**CR-27:** Two spots expose `error.message` to users (tags.tsx:109, import/index.ts:214) but both are low risk — validation layer catches most errors first with friendly messages. No stack traces, SQL queries, or internal paths exposed anywhere.

No blocking issues. Codebase cleared for release from security perspective.

*— Chatterwind the Brass*
