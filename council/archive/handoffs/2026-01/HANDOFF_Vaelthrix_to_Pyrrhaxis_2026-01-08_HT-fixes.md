# Pyrrhaxis Handoff: Human Testing Bug Fixes

**From:** Vaelthrix the Astral
**To:** Pyrrhaxis the Crimson
**Date:** 2026-01-08

---

## Task Summary

The first human testing session revealed 4 bugs. Two are **blocking** further testing. Fix all four issues documented in [HUMAN_TESTING_LOG.md](../HUMAN_TESTING_LOG.md).

---

## Priority Order

| Priority | ID | Severity | Issue | Blocker? |
|----------|-----|----------|-------|----------|
| 1 | HT-004 | High | Track import fails (content:// URI rejected) | **YES** |
| 2 | HT-002 | High | VolumeSlider crash (pageX null) | YES - crashes on interaction |
| 3 | HT-003 | Medium | Tag modal flickers on keyboard focus | No |
| 4 | HT-001 | Medium | Orphaned buttons on tag deletion | No |

---

## HT-004: Track Import Fails (BLOCKING)

**Root Cause:** Path traversal check in `validation.ts:50` rejects Android content URIs.

```typescript
// BROKEN — validation.ts line 50
if (filePath.includes('..') || filePath.includes('//')) {
  return { isValid: false, error: 'Invalid file path format' };
}
```

Android document picker returns URIs like:
```
content://com.android.providers.downloads.documents/document/12345
```

The `://` in `content://` contains `//`, triggering the path traversal check.

**Fix:** Strip URI scheme before checking for path traversal:

```typescript
// Check for path traversal, but allow URI schemes
const pathWithoutScheme = filePath.replace(/^[a-z]+:\/\//i, '');
if (pathWithoutScheme.includes('..') || pathWithoutScheme.includes('//')) {
  return { isValid: false, error: 'Invalid file path format' };
}
```

**File:** `src/services/import/validation.ts`

---

## HT-002: VolumeSlider Crash

**Root Cause:** In `VolumeSlider.tsx` lines 79-84 and 86-91, `evt.nativeEvent.pageX` is accessed inside the async `measureInWindow` callback. React recycles synthetic events, so by callback time `nativeEvent` is null.

```typescript
// BROKEN — async access to evt
sliderRef.current?.measureInWindow((x) => {
  const newValue = calculateValue(evt.nativeEvent.pageX, x);  // evt is stale!
});
```

**Fix:** Extract `pageX` synchronously BEFORE the async callback:

```typescript
const pageX = evt.nativeEvent.pageX;  // Capture synchronously
sliderRef.current?.measureInWindow((x) => {
  const newValue = calculateValue(pageX, x);  // Use captured value
});
```

Apply this fix to BOTH touch handlers (likely `onTouchStart`/`onTouchMove` or similar).

**File:** `src/components/VolumeSlider.tsx`

**Related:** CR-16 (division by zero) is in the same component — check if `sliderWidth` guard is also needed.

---

## HT-003: Tag Modal Keyboard Flicker

**Root Cause:** `KeyboardAvoidingView` with `behavior="height"` on Android combined with `justifyContent: 'flex-end'` overlay causes layout thrashing when keyboard animates open.

```typescript
// BROKEN — TagModal.tsx lines 108-111
<KeyboardAvoidingView
  style={styles.overlay}  // has justifyContent: 'flex-end'
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // 'height' on Android
>
```

**Fix Options (choose one):**

1. **Recommended:** Use `behavior="padding"` on Android:
   ```typescript
   behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
   // Or simply: behavior="padding"
   ```

2. Alternative: Remove `KeyboardAvoidingView` entirely and rely on Android's `windowSoftInputMode="adjustResize"` (would need AndroidManifest change).

3. Alternative: Change modal positioning strategy away from `flex-end`.

**File:** `src/components/tags/TagModal.tsx`

---

## HT-001: Orphaned Buttons on Tag Deletion

**Root Cause:** `deleteTag` in `useTagStore` does not cascade to `useButtonStore`. The database FK may cascade, but the in-memory Zustand store retains the orphaned button until app restart.

**Fix:** When a tag is deleted, also remove the corresponding button from the button store.

**Option A — Cross-store call in deleteTag:**

```typescript
// In useTagStore.ts deleteTag action:
import { useButtonStore } from './useButtonStore';

// After successful DB deletion:
const buttonStore = useButtonStore.getState();
buttonStore.removeButtonForTag(tagId);  // You may need to add this action
```

**Option B — Add cleanup action to useButtonStore:**

```typescript
// In useButtonStore.ts, add:
removeButtonsForTag: async (tagId: string) => {
  // Remove from DB
  await deleteButtonsByTagId(tagId);  // May need to add this query
  // Remove from state
  set((state) => ({
    buttons: state.buttons.filter(b => b.tagId !== tagId)
  }));
}
```

Then call this from `useTagStore.deleteTag`.

**Files:**
- `src/stores/useTagStore.ts` — deleteTag action
- `src/stores/useButtonStore.ts` — add cleanup action

---

## Files You'll Touch

| File | Changes |
|------|---------|
| `src/services/import/validation.ts` | HT-004: URI scheme handling |
| `src/components/VolumeSlider.tsx` | HT-002: Sync pageX capture |
| `src/components/tags/TagModal.tsx` | HT-003: KeyboardAvoidingView behavior |
| `src/stores/useTagStore.ts` | HT-001: Cross-store cascade |
| `src/stores/useButtonStore.ts` | HT-001: Add removeButtonsForTag action |

---

## What You're NOT Doing

- No new features
- No refactoring beyond the fixes
- No test writing (Kazzrath's domain)
- No UI polish changes (Seraphelle's domain)

---

## Testing Verification

After fixes, verify on Android emulator:

1. **HT-004:** Import an audio file — should succeed
2. **HT-002:** Drag volume slider — should not crash
3. **HT-003:** Open tag modal, tap input — should not flicker
4. **HT-001:** Create tag, delete tag, check board — button should be gone

---

## Invocation

```
Read CLAUDE.md and council/COUNCIL.md. You are Pyrrhaxis the Crimson.
Read council/handoffs/PYRRHAXIS_HT_FIXES.md and fix the four human testing bugs.
```
