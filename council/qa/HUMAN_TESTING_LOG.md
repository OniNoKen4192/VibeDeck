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

## Session 2 — 2026-01-12 (1.1.0 QA)

### HT-025: Tag Button Does Not Update When Tag Renamed

**Severity:** Medium
**Category:** Data Integrity / UI Staleness
**Version Found:** 1.0.2
**Scribe:** Kazzarth the Blue

**Steps to Reproduce:**
1. Create a tag (e.g., "TestTag") with a color
2. Button auto-creates on Board with tag's name and color
3. Navigate to Tags screen
4. Tap the tag to edit, rename it (e.g., "RenamedTag") and/or change color
5. Save changes
6. Navigate back to Board screen

**Observed:**
- Button still displays old tag name and old color
- Behavior persists after app restart (data survives kill/relaunch)
- Creating new tags/buttons does NOT force refresh of stale button
- Button functionality is correct (plays tracks from renamed tag)

**Expected:** Button should display the current tag name and color.

**Root Cause (Confirmed):**
When a tag button is created ([tags.tsx:100](app/(tabs)/tags.tsx#L100)), the tag's name and color are **copied** into the button record:

```typescript
await addTagButton(name, newTag.id, false, color);
```

The button stores its own `name` and `color` fields in the database. When the tag is renamed via `updateTag()`, only the `tags` table is updated—the button's stored copy remains unchanged.

Display resolution ([BoardButton.tsx:136](src/components/BoardButton.tsx#L136)) always uses `button.name`:
```typescript
const displayLabel = button.name;
```

Color resolution ([buttons.ts:373](src/db/queries/buttons.ts#L373)) uses `button.color` first:
```typescript
const displayColor = button.color ?? tag?.color ?? DEFAULT_BUTTON_COLOR;
```

Since both are populated at creation time, the tag's current values are never consulted.

**Affected Files:**
- `app/(tabs)/tags.tsx:100` — copies name/color at button creation
- `src/stores/useTagStore.ts:updateTag` — does not cascade to buttons
- `src/db/queries/buttons.ts:373` — resolution logic
- `src/components/BoardButton.tsx:136` — display logic

**Fix Options (for Vaelthrix):**
1. **Cascade on tag update:** When `updateTag()` is called, also update all buttons referencing that tag
2. **Derive from tag:** For tag buttons, prefer `tag.name` over `button.name` and `tag.color` over `button.color` in resolution logic
3. **Hybrid:** Store button.name/color as null for tag buttons, let resolution derive from linked tag

Option 2 is architecturally cleaner—tag buttons should derive display from their linked tag. Button-level name/color overrides could still be supported for user customization.

**Fix Applied (2026-08-19):** Option 2/3 hybrid, by Vaelthrix the Astral.
- `ButtonResolved` gains computed `displayName`: tag buttons derive from `tag.name`, falling back to stored `button.name`; `BoardButton` and `ButtonContextMenu` render it
- `displayColor` chain unchanged (`button.color ?? tag.color ?? default`), but tag-button creation no longer copies the tag color into `button.color`, so tag color changes flow through; an explicit color set via the context menu still overrides, and the reset swatch (null) reverts to tag color
- Schema v4 migration clears creation-copied colors on existing tag buttons (only where the color still equals the tag's color, preserving deliberate overrides)
- Regression tests added in `src/db/queries/__tests__/buttons.test.ts`

**Status:** Fixed — pending human verification (test plan A2.2, A2.3)

---

### HT-034: Fresh Installs Crash During Database Initialization

**Severity:** Critical (release blocker — every new user hits it)
**Category:** Data Layer / Startup
**Version Found:** 1.1.0 (latent since migrations were introduced)
**Found By:** Code review during HT-025 fix, 2026-08-19

**Steps to Reproduce:**
1. Install the app on a device with no existing VibeDeck database
2. Launch the app

**Observed (by code inspection):** `initDatabase()` at `user_version = 0` ran `CREATE_TABLES_SQL` (which includes all current columns) and then ALSO ran `MIGRATION_V2`/`MIGRATION_V3`. The `ALTER TABLE ... ADD COLUMN` statements hit existing columns, SQLite throws "duplicate column name", and initialization fails on first launch.

**Why it was never seen:** every test device to date upgraded from an existing v1 database, so the fresh-install path never executed. 1.0.x shipped at schema v1 (no migrations existed yet).

**Root Cause:** `src/db/init.ts` gated table creation on `currentVersion === 0` but ran the migration blocks unconditionally for any `currentVersion < N`, including 0.

**Fix Applied (2026-08-19):** Fresh installs (`currentVersion === 0`) now run only `CREATE_TABLES_SQL`; migrations run only for existing databases (`currentVersion >= 1`). Migration sequencing is covered by tests in `src/db/__tests__/init.test.ts` (fresh install, v1 upgrade, v3 upgrade, current version no-op).

**Status:** Fixed — pending human verification (fresh install on clean emulator; add to pre-flight for 1.1.0 QA pass)

---

## Session 3 — 2026-08-23 (1.1.0 QA pass, fresh install)

**Tester:** Project Lead
**Build:** 1.1.0 (versionCode 2), fresh install on Medium_Phone_API_36.1 emulator
**Scribe:** Vaelthrix the Astral

*Pre-flight confirmed: HT-034 fresh-install boot clean, version 1.1.0, new app icon live.*

### HT-035: Edit Tag Modal — Delete Tag Button Obscured by System Nav Bar

**Severity:** Medium
**Category:** UI / Safe Area
**Found During:** Test plan A2 (tag editing)

**Steps to Reproduce:**
1. Open Tags screen, tap an existing tag to edit
2. Observe bottom of the Edit Tag modal

**Observed:** The "Delete Tag" option at the bottom of the modal is partially covered by the Android system navigation bar (3-button nav). Screenshot provided by tester.

**Expected:** Modal content should respect the bottom safe-area inset.

**Root Cause (Confirmed):** `src/components/tags/TagModal.tsx` — the bottom-anchored modal (`styles.modal`, flex-end overlay) applies no bottom safe-area padding; the component uses neither `SafeAreaView` nor `useSafeAreaInsets`. Same family as HT-022/HT-026/HT-030.

**Fix Direction:** Add `useSafeAreaInsets()` and apply `paddingBottom: insets.bottom` (plus existing padding) to the modal container. Check other bottom-anchored modals (TrackDetailModal, ButtonContextMenu, DeleteConfirmation) for the same omission while at it.

**Status:** Fixed 2026-08-23 — `useSafeAreaInsets().bottom` applied as paddingBottom on TagModal, TrackDetailModal, and BulkTagModal sheets (ButtonContextMenu already had it; DeleteConfirmation is center-anchored, unaffected). Regression test: `src/components/tags/__tests__/TagModal.test.tsx`.

---

### HT-036: Duplicate Import Failure Message Is Imprecise

**Severity:** Low
**Category:** UX / Messaging
**Found During:** Test plan A1.3

**Observed:** Re-importing an already-imported file is correctly rejected (no duplicate data), but the failure message doesn't say *why* the import failed. Tester: "technically fine, will confuse apes."

**Expected:** Message should distinguish "already in your library" from an actual import error.

**Status:** Fixed 2026-08-23 — import service classifies UNIQUE file_path violations as `reason: 'duplicate'` with message "Already in your library"; Library toast now says "N skipped — already in your library" separately from real failures. Tests: `src/services/import/__tests__/import.test.ts`.

---

### HT-037: Tags Screen Header Under Status Bar — Safe-Area Whack-a-Mole

**Severity:** Medium
**Category:** UI / Safe Area
**Found During:** Test plan A2 (tag creation)

**Observed:** On the Tags screen, the "+ New" button and header render up under the status bar icons (battery/wifi) — mis-taps likely. Screenshot provided by tester, who also noted "general UI over/underlaps" beyond this one spot. The same screenshot shows the Create Tag modal's submit button clipped by the nav bar (HT-035's bottom-inset issue, so that one affects both Create and Edit modes).

**Root Cause (Confirmed):** `app/(tabs)/tags.tsx` contains no `SafeAreaView` at all. Board (HT-022) and Library (HT-030) were each fixed individually when their bugs were reported; Tags was never touched.

**Systemic Note (for the fix round):** Stop fixing these one screen at a time. Audit in one sweep:
- **Top insets:** every screen — Board ✓, Library ✓, Tags ✗, About/Settings ?
- **Bottom insets:** every bottom-anchored overlay — TagModal ✗ (HT-035), TrackDetailModal ?, ButtonContextMenu ?, DeleteConfirmation ?, sort menu ?

A shared `ScreenContainer` / modal wrapper component would prevent recurrence.

**Status:** Fixed 2026-08-23 — SafeAreaView (top) added to all three tags.tsx branches; sweep executed: Board ✓, Library ✓, Tags ✓ (this fix); bottom sheets TagModal/TrackDetailModal/BulkTagModal fixed under HT-035, ButtonContextMenu already handled insets. Shared wrapper deferred to whiteboard.

---

### HT-038: Library Preview Button Doesn't Reflect Playing State

**Severity:** Low
**Category:** UX / Affordance
**Found During:** Free exploration (not a plan row)

**Observed:** Tapping the play button on a Library track row starts playback, and re-tapping stops it — but the icon stays a static ▶ the whole time. Nothing in the UI signals that a track is playing from this screen or that re-tap stops it.

**Expected:** The row's icon should switch to a stop (or pause) glyph while that track is playing, matching the toggle behavior it already has.

**Root Cause (Confirmed):** `src/components/library/TrackRow.tsx:121` hardcodes `<FontAwesome name="play" />`. The component receives no playing-state input; it would need to know whether it is the currently playing track (e.g., from `usePlayerStore` `currentTrack`/`isPlaying`) and swap the glyph.

**Status:** Fixed 2026-08-23 — TrackRow takes `isPlaying`; Library derives it from `usePlayerStore` (`isPlaying` + `currentTrack.id`), so the glyph tracks real playback state including stops from the Board bar. Tests: `src/components/library/__tests__/TrackRow.test.tsx`.

---

### HT-039: Device Migration Restores Ghost Library (Metadata Without Files)

**Severity:** Medium
**Category:** Data Integrity / Device Migration
**Found During:** Physical-device smoke test (Samsung restore from S23 to S948U)

**Observed:** Installing on a new phone restored the old phone's app data via Android/Samsung backup — tags, library entries, and buttons all present — but the audio files and their SAF permissions do not migrate. Every restored track is unplayable ("ghost library"). Restored older-schema DB migrated cleanly on first launch (bonus real-world migration test: PASS).

**Root Cause:** Android app-data backup includes VibeDeck's SQLite DB, but tracks reference `content://` URIs on the old device; neither files nor persisted URI permissions transfer.

**Ruling (Project Lead):** Ship 1.1.0 as-is with improved failure messaging (see HT-040). Missing-file detection + cleanup promoted to 1.2 as part of the Utilities screen. `allowBackup=false` rejected — same-device restore is the only backup an offline-only app has.

**Status:** Documented — deferred to 1.2 (Utilities screen)

---

### HT-040: Failure Messages Are Not Ape-Friendly

**Severity:** Low
**Category:** UX / Messaging
**Found During:** Physical-device smoke test (surfaced by HT-039's unhelpful playback toast)

**Observed:** Failure toasts across the app state what failed in developer terms ("Invalid file path format", "Failed to play track. Please try again.") without telling a non-technical user mid-game what to do next.

**Fix Applied (2026-08-23):** Full copy pass over all ~25 user-facing failure messages (player service userMessages, Board/Library/Tags toasts, name validation, import validation, TagModal inline errors). Convention: plain words, what happened + what to do ("Can't find this track's audio file. Delete the track, or import it again."). Copy-only change; no logic touched.

**Status:** Fixed — pending human verification

---

### HT-041: Ghost Tracks Bypass the Missing-File Check; Library Fails Silently

**Severity:** Medium
**Category:** Error Handling / Playback
**Found During:** HT-040 verification on physical device (ghost tracks showed the generic playback message on Board and nothing at all in Library)

**Observed:** Tapping a ghost track showed "Playback stopped unexpectedly…" on the Board instead of the missing-file message, and produced no toast at all from the Library.

**Root Cause (Confirmed via logcat):** `validateTrackFile` returned `true` unconditionally for `content://` URIs, so `playTrack` reported success and the failure surfaced later as an async ExoPlayer source error (`SecurityException: Permission Denial … requires ACTION_OPEN_DOCUMENT`) — routed to the generic error message, whose toast callback is registered only by the Board screen (hence Library silence). Since every SAF-imported track is a `content://` URI, the friendly `file_not_found` path was effectively unreachable.

**Fix Applied (2026-08-23):** `validateTrackFile` now checks the persisted SAF grant via the existing `expo-saf-uri-permission` `hasPermission()` (built in 1.0, never wired in). Missing grant → synchronous `file_not_found` with the ape-friendly message on both Board and Library. Fails open if the native check itself errors. Tests: `src/services/player/__tests__/player.test.ts` (+ fuller track-player mock in jest.setup).

**Status:** Fixed — pending human verification

---

