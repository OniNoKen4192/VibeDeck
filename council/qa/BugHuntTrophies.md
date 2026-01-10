# Bug Hunt Trophies

> *"Every bug has a name. Every kill, a lesson."*
> — Pyrrhaxis the Red

---

## 2026-01-09

### HT-018: The Ephemeral Permission
**Severity:** High (BLOCKING)
**Hunters:** The Full Council
- Kazzrath the Blue (discovery, test protocol)
- Vaelthrix the Astral (architecture, native module design)
- Pyrrhaxis the Red (implementation)
**Weapon:** Native Expo module

Android's document picker grants temporary read permissions to `content://` URIs — permissions that vanish when the app process dies. Tracks played fine after import, then fell silent after a force-stop or reboot.

The fix: a custom Expo native module wrapping `ContentResolver.takePersistableUriPermission()`. Called immediately after the picker returns, it locks in the permission for the app's lifetime.

```kotlin
context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
```

**Lesson:** The Storage Access Framework giveth, but only the wise keep what they receive.

---

### HT-019: The Stale Counts
**Severity:** Medium
**Hunter:** Pyrrhaxis the Red (bundled with HT-018)
**Weapon:** Cross-store refresh

Deleting a track removed it from the database, but tag counts and button states remained frozen in Zustand memory. The user had to navigate away and back to see the truth.

The fix: `deleteTrack()` now triggers `loadTags()` and `loadButtons()` after deletion — immediate cross-store refresh.

```typescript
const { useTagStore } = await import('./useTagStore');
const { useButtonStore } = await import('./useButtonStore');
useTagStore.getState().loadTags();
useButtonStore.getState().loadButtons();
```

**Lesson:** When one store changes the world, the others must hear the news.

---

### HT-014: The Opaque Identifier
**Severity:** Critical (BLOCKING)
**Hunter:** Kazzrath the Blue
**Weapon:** Parameter threading

Android's document picker returns content URIs with opaque document IDs — `msf%3A33` instead of `Darude - Sandstorm.mp3`. The `getFileExtension()` function faithfully extracted `.documents/document/msf%3a33` and declared it unsupported.

The fix: thread the picker's `file.name` through validation and metadata extraction, using it instead of the URI path when dealing with content:// URIs.

```typescript
const extensionSource = filePath.startsWith('content://') && fileName ? fileName : filePath;
```

**Lesson:** Content URIs are addresses, not descriptions. Always carry the human-readable name separately.

---

### HT-008/009: The Masked Tracks
**Severity:** High
**Hunter:** Kazzrath the Blue
**Weapon:** Same as HT-014 (parameter threading)

Tracks appeared in the library as `msf:33` — the opaque document ID stripped of its URI encoding. The metadata extractor parsed the content URI path expecting a filename pattern like `Artist - Title.mp3`.

The fix: pass `displayFileName` from the picker through to `extractMetadata()`, using it for title and artist parsing.

```typescript
const fileName = displayFileName || extractFileName(filePath);
```

**Lesson:** When the path lies, carry the truth in your pocket.

---

### HT-015: The Stale Board
**Severity:** Medium
**Hunter:** Pyrrhaxis the Red
**Weapon:** Focus effect

The Board screen subscribed to `useButtonStore.buttons`, but tag-track associations live in a different table. A user could assign tracks to tags in Library, return to Board, and see stale counts — buttons that should have tracks, showing zero.

The fix: `useFocusEffect` from `@react-navigation/native` — re-resolve all buttons when the Board tab gains focus.

```typescript
useFocusEffect(
  useCallback(() => {
    async function refreshOnFocus() {
      const resolved = await resolveAllButtons();
      setButtons(resolved);
    }
    refreshOnFocus();
  }, [resolveAllButtons])
);
```

**Lesson:** Reactive subscriptions only work within their own store's walls. For cross-store freshness, refresh on focus.

---

### HT-017: The Duplicate Track Collision
**Severity:** High
**Hunter:** Pyrrhaxis the Red
**Weapon:** Timestamp suffix

A user could add the same track as multiple direct buttons — intentionally valid. But TrackPlayer's queue used `track.id` as the item ID. Playing the same track from a second button threw a duplicate ID error.

The fix: suffix the queue item ID with `Date.now()` to make each play attempt unique.

```typescript
id: `${track.id}-${Date.now()}`
```

**Lesson:** Queue item IDs must be unique per play, not per track.

---

## 2026-01-08

### HT-004: The URI Gatekeeper
**Severity:** High (BLOCKING)
**Hunter:** Pyrrhaxis the Red
**Weapon:** Regex

The path traversal check grew zealous, rejecting all who bore `//` in their names — even the legitimate `content://` URIs from Android's document picker. A single regex strip of the URI scheme before inspection restored order.

```typescript
const pathWithoutScheme = filePath.replace(/^[a-z]+:\/\//i, '');
```

**Lesson:** Security checks must understand the protocols they guard.

---

### HT-002: The Phantom Touch
**Severity:** High (Crash)
**Hunter:** Pyrrhaxis the Red
**Weapon:** Synchronous capture

React's synthetic event recycling claimed another victim. The VolumeSlider reached for `evt.nativeEvent.pageX` inside an async `measureInWindow` callback — but the event had already been reclaimed. Null. Crash.

The fix: capture the value *before* entering the async realm.

```typescript
const pageX = evt.nativeEvent.pageX;  // Capture synchronously
sliderRef.current?.measureInWindow((x) => {
  const newValue = calculateValue(pageX, x);  // Safe
});
```

**Lesson:** Never trust a synthetic event to wait for you.

---

### HT-003: The Flickering Modal
**Severity:** Medium
**Hunter:** Pyrrhaxis the Red
**Weapon:** Behavioral adjustment

`KeyboardAvoidingView` with `behavior="height"` on Android, combined with `flex-end` positioning, created a visual seizure when the keyboard animated open. The modal flickered like a dying flame.

A simple change to `behavior="padding"` calmed the storm.

**Lesson:** Android and iOS speak different dialects of keyboard avoidance.

---

### HT-001: The Orphan Maker
**Severity:** Medium
**Hunter:** Pyrrhaxis the Red
**Weapon:** Cross-store cascade

When a tag died, its button lingered — a ghost in the Zustand store, invisible to the database but haunting the UI until app restart. The foreign key cascade handled the DB, but memory knew nothing of it.

The fix: teach `deleteTag` to reach across stores and clean up its orphans.

```typescript
await useButtonStore.getState().removeButtonsForTag(id);
```

**Lesson:** In-memory state and database state are two kingdoms. Both must hear the decree.

---

## Trophy Count

| Hunter | Kills | Critical | High | Medium | Low |
|--------|-------|----------|------|--------|-----|
| Pyrrhaxis | 7 | 0 | 3 | 4 | 0 |
| Kazzrath | 2 | 1 | 1 | 0 | 0 |
| Full Council | 1 | 0 | 1 | 0 | 0 |

---

*More trophies to come.*
