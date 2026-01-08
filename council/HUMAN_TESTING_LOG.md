# VibeDeck Human Testing Log

**Test Date:** 2026-01-08
**Tester:** Project Lead
**Build:** Development build on Android emulator
**Scribe:** Kazzrath the Blue

---

## Session 1 — 2026-01-08

### HT-001: Orphaned Buttons on Tag Deletion

**Severity:** Medium
**Category:** Data Integrity / UX

**Steps to Reproduce:**
1. Create a tag
2. (Button auto-created for tag)
3. Delete the tag from Tags screen
4. Navigate to Board screen

**Observed:** Button remains on the board after tag is deleted.

**Expected:** Button should be removed (or clearly marked as invalid and removable).

**Root Cause (Likely):** `deleteTag` in useTagStore does not cascade to useButtonStore. The database FK may cascade, but the in-memory Zustand store retains the orphaned button until app restart.

**Affected Files:**
- `src/stores/useTagStore.ts` — deleteTag action
- `src/stores/useButtonStore.ts` — needs cleanup subscription or cross-store call

**Status:** Open

---

### HT-002: VolumeSlider Crash — Cannot Read Property 'pageX' of null

**Severity:** High
**Category:** Runtime Crash

**Steps to Reproduce:**
1. Navigate to Board screen
2. Touch/drag the volume slider
3. Error occurs

**Confirmed:** Error occurs on slider interaction, not just render.

**Error Messages:**
```
ERROR: This synthetic event is reused for performance reasons...
       accessing the property nativeEvent. This is set to null

ERROR: [TypeError: Cannot read property 'pageX' of null]
```

**Stack Trace Points To:**
- `src/components/VolumeSlider.tsx` — `sliderRef.current.measureInWindow` callback

**Root Cause (Confirmed):** In `VolumeSlider.tsx` lines 79-84 and 86-91, `evt.nativeEvent.pageX` is accessed inside the async `measureInWindow` callback. By the time the callback fires, React has recycled the synthetic event and set `nativeEvent` to null.

```typescript
// BROKEN - async access to evt
sliderRef.current?.measureInWindow((x) => {
  const newValue = calculateValue(evt.nativeEvent.pageX, x);  // evt is stale!
});
```

**Related Code Review Issue:** CR-16 (VolumeSlider division by zero) — same component, different issue

**Potential Fix:**
Extract `pageX` synchronously BEFORE the async callback:
```typescript
const pageX = evt.nativeEvent.pageX;  // Capture synchronously
sliderRef.current?.measureInWindow((x) => {
  const newValue = calculateValue(pageX, x);  // Use captured value
});
```

**Affected Files:**
- `src/components/VolumeSlider.tsx`

**Status:** Open

**Note:** The "Track failed to import" mentioned by tester may be a separate issue or a cascade from this crash. Need clarification.

---

### HT-003: Tags Screen UI Flickers When Adding Tag

**Severity:** Medium
**Category:** UI / Performance

**Steps to Reproduce:**
1. Navigate to Tags screen
2. Tap "+ New" to create a tag
3. Modal renders correctly at bottom of screen
4. Tap/focus the "Tag Name" text input field
5. Modal rapidly oscillates between top and bottom of screen

**Observed:** When the text input is focused (keyboard appears), the Create Tag modal flickers/bounces rapidly between top and bottom positions at high frequency. Modal renders fine initially — issue only occurs on input focus.

**Expected:** Modal should stay in position (or smoothly adjust for keyboard) when text input is focused.

**Root Cause (Confirmed):** `KeyboardAvoidingView` with `behavior="height"` on Android (line 110) combined with `justifyContent: 'flex-end'` overlay positioning causes layout thrashing.

```typescript
// TagModal.tsx lines 108-111
<KeyboardAvoidingView
  style={styles.overlay}  // has justifyContent: 'flex-end'
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // 'height' on Android
>
```

When keyboard animates open, the height change + flex-end causes continuous repositioning.

**Potential Fixes:**
1. Use `behavior="padding"` on Android instead of `"height"`
2. Or remove `KeyboardAvoidingView` entirely and use `android:windowSoftInputMode="adjustResize"` in AndroidManifest
3. Or use a different modal positioning strategy (not flex-end)

**Affected Files:**
- `src/components/tags/TagModal.tsx:108-111` — KeyboardAvoidingView config

**Status:** Open — root cause confirmed

---

### HT-004: Track Import Fails — No Error Details

**Severity:** High
**Category:** Core Functionality

**Steps to Reproduce:**
1. Navigate to Library screen (empty state shown)
2. Tap "+ Import Tracks"
3. Select an audio file from device
4. Import fails

**Observed:**
- Warning banner appears: "1 file failed to import"
- No track added to library
- No console log with error details
- No indication of WHY the import failed

**Expected:**
- Track imports successfully, OR
- Clear error message explaining the failure (file format? path issue? validation error?)

**Screenshot:** Warning toast shown, library remains empty.

**Root Cause (Confirmed):** Path traversal check in `validation.ts:50` rejects Android content URIs.

```typescript
// validation.ts line 50
if (filePath.includes('..') || filePath.includes('//')) {
  return { isValid: false, error: 'Invalid file path format' };
}
```

Android document picker returns URIs like:
```
content://com.android.providers.downloads.documents/document/12345
```

The `://` in `content://` contains `//`, triggering the path traversal check.

**Fix:** The `//` check should exclude URI schemes:
```typescript
// Check for path traversal, but allow URI schemes
const pathWithoutScheme = filePath.replace(/^[a-z]+:\/\//, '');
if (pathWithoutScheme.includes('..') || pathWithoutScheme.includes('//')) {
  return { isValid: false, error: 'Invalid file path format' };
}
```

**Affected Files:**
- `src/services/import/index.ts` — import flow
- `src/services/import/validation.ts` — file validation

**Status:** Open — BLOCKING full flow testing

---

*Add new findings below this line*

---

