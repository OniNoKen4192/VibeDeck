# Security Review: CR-09 and CR-27

**Reviewer:** Chatterwind the Brass
**Date:** 2026-01-09
**Status:** COMPLETE

---

## CR-09: Path Traversal Defense

**Verdict:** ✅ APPROVED

### Implementation Reviewed

File: `src/services/import/validation.ts` (lines 53-69)

```typescript
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

### Attack Vector Coverage

| Vector | Status | Notes |
|--------|--------|-------|
| `../` literal | ✅ | Caught by includes check |
| `..\` Windows | ✅ | Backslash normalized first |
| `%2e%2e%2f` URL-encoded | ✅ | decodeURIComponent handles |
| `..%2f` mixed | ✅ | Decoded then checked |
| `//` double slash | ✅ | Explicit check |
| Malformed encoding | ✅ | Try-catch rejects |
| Double-encoding | ⚠️ | Passes check but not exploitable |

### Double-Encoding Analysis

`%252e%252e` decodes to `%2e%2e` (still encoded), which wouldn't match `..`.

**Why this is safe:** Double-encoding is only exploitable when there's a second decoder downstream. In VibeDeck:
1. Paths go directly to expo-file-system or TrackPlayer
2. Neither performs additional URL decoding
3. A double-encoded path is used literally and fails (file not found)

### Architectural Context

The defense-in-depth comment is accurate. VibeDeck uses Android SAF document picker which returns opaque content:// URIs. Path traversal has no meaning for content URIs — the storage provider resolves them internally.

This check protects the exported `importFromPath()` API against potential future misuse.

---

## CR-27: Error Message Exposure

**Verdict:** ✅ APPROVED (Low Risk)

### Audit Scope

Reviewed all error handling in:
- `src/services/` — Import, player, tag pool services
- `src/stores/` — All four Zustand stores
- `src/components/` — UI components
- `app/(tabs)/` — All screens

### Summary

| Category | Count | Risk |
|----------|-------|------|
| Generic user messages | 12 | ✅ Safe |
| Error.message exposed | 2 | 🟡 Low |
| Console-only logging | ~15 | ✅ Safe |
| Silent failures | 4 | ✅ Safe |

### Flagged Locations

**1. tags.tsx:109**
```typescript
const errorMessage = err instanceof Error ? err.message : 'Failed to save tag';
showToast(errorMessage, 'error');
```

Risk: Could theoretically expose SQLite constraint errors on race conditions.
Assessment: Validation layer catches user errors first. Race conditions virtually impossible in single-user mobile app.

**2. import/index.ts:214**
```typescript
error: err instanceof Error ? err.message : 'Failed to add track to library',
```

Risk: Could expose filesystem or SQLite errors.
Assessment: Robust validation layer catches most issues. Errors here indicate real problems worth surfacing.

### What's Done Well

1. **Playback errors** use the ideal pattern: generic `userMessage` + detailed `details` field
2. **Validation errors** in `utils/validation.ts` and `import/validation.ts` are user-friendly by design
3. **Technical details** go to `console.error()`, not to user
4. **No stack traces** exposed anywhere
5. **No file paths** — content URIs are opaque by design

### Security Assessment

- No sensitive data exposure
- No implementation details leaked
- Privacy constraint respected (all local)
- Error messages are actionable without being technical

### Recommendation

Accept current implementation. For a local-only app with no data transmission, the risk is minimal and the user experience benefits from informative error messages.

---

## Handoff Complete

Both security review tasks from the Vaelthrix handoff are complete.

- [x] CR-09 path traversal fix verified
- [x] CR-27 error exposure audited

No blocking issues. Codebase approved for release from security perspective.

*— Chatterwind the Brass*
