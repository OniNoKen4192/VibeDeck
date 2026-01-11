# Bug Hunt Trophies

> *"Every bug has a name. Every kill, a lesson."*
> — Pyrrhaxis the Red

---

## 2026-01-10

### HT-022: The Invisible Header
**Severity:** High (Usability blocker)
**Hunter:** Seraphelle the Silver
**Weapon:** SafeAreaView

The Board screen had no concept of device boundaries. On a Samsung Galaxy S23 Ultra — an edge-to-edge canvas — the "VibeDeck" header rendered at pixel zero, directly behind the clock, battery icon, and notification badges. The reset and settings buttons? Buried under system UI, untouchable.

The screen used `headerShown: false` with a custom `BoardHeader` component, but forgot to ask the device where its actual content area began. Three render paths — loading, empty, populated — all made the same mistake.

The fix: wrap each container in `SafeAreaView` from `react-native-safe-area-context`, respecting only the top edge (the tab bar handles the bottom).

```typescript
// Before: blissfully ignorant of the status bar
<Animated.View style={styles.container}>

// After: asks permission before entering
<SafeAreaView edges={['top']} style={styles.safeArea}>
  <Animated.View style={styles.container}>
```

**Lesson:** Custom headers must earn their space. The status bar was there first.

---

### HT-023: The Crushed Tab Bar
**Severity:** High (Usability blocker)
**Hunter:** Seraphelle the Silver
**Weapon:** Deletion

The tab bar had a secret: `height: 56`. A hardcoded constraint that seemed reasonable on paper, but ignored the realities of physical devices. On phones with button navigation, the system navigation bar sat directly on top of the Board/Library/Tags tabs — a pixel-perfect collision.

React Navigation's bottom tab bar knows about safe areas. It adds padding automatically... unless you override its height. Then you're on your own.

The fix: delete the constraint. Let the framework do its job.

```typescript
// Before: micromanaging
tabBarStyle: {
  backgroundColor: Colors.surface,
  borderTopColor: Colors.surfaceLight,
  height: 56,  // The troublemaker
},

// After: trusting the framework
tabBarStyle: {
  backgroundColor: Colors.surface,
  borderTopColor: Colors.surfaceLight,
},
```

**Lesson:** Sometimes the best fix is removing the code that thinks it's helping.

---

## 2026-01-09

### CR-09: The Blind Gatekeeper
**Severity:** High (Security)
**Hunter:** Vaelthrix the Astral
**Weapon:** Normalization

The path traversal defense guarded the gate with simple string matching — `..` shall not pass. But the gatekeeper was blind to disguise. A backslash-wielding `\..` slipped through. A URL-encoded `%2e%2e` walked right in.

The original code review flagged it. The fix: decode the encoding, normalize the separators, *then* check for traversal patterns.

```typescript
// Before: easily fooled
if (pathWithoutScheme.includes('..') || pathWithoutScheme.includes('//')) {

// After: sees through disguises
const normalized = decodeURIComponent(pathWithoutScheme).replace(/\\/g, '/');
if (normalized.includes('..') || normalized.includes('//')) {
```

In truth, VibeDeck's SAF-based architecture means content URIs are opaque identifiers — path traversal is not a real attack vector here. But defense-in-depth demands the guard be competent, even when enemies are unlikely.

**Lesson:** Security checks must normalize before they compare. Every encoding is a costume.

---

### HT-020: The Faceless Buttons
**Severity:** Low (UX)
**Hunter:** Seraphelle the Silver
**Weapon:** Design restraint

When a tag button had no tracks, the spec said to replace its label with "No Tracks." Sensible for one button. But a user who creates "EDM," "Hip Hop," and "Walk-up" tags before importing any music saw three identical gray buttons — all labeled "No Tracks." Which one needed tracks? Impossible to tell.

The original design tried too hard to communicate emptiness. The visual styling — gray surface, 50% opacity, dashed border, hidden count badge — already screamed "I have nothing." The label didn't need to join the chorus.

The fix: keep the tag name. Let the styling do its job.

```typescript
// Before: sacrificed identity for clarity
const displayLabel = isEmpty ? 'No Tracks' : button.name;

// After: trust the styling
const displayLabel = button.name;
```

**Lesson:** Good UX communicates through the right channel. When visuals already tell the story, words should add information — not repeat it.

---

### CR-17: The Phantom Number
**Severity:** Low (Defensive)
**Hunter:** Seraphelle the Silver
**Weapon:** Finite guard

The CountBadge trusted its input. If `count` was `0` or negative, it hid itself. Simple enough. But JavaScript's `NaN` is neither less than nor greater than zero — `NaN <= 0` returns `false`. An upstream data corruption could have the badge proudly displaying "NaN" to confused users.

The fix: check for sanity before checking for value.

```typescript
// Before: trusted the number was a number
if (count <= 0) {
  return null;
}

// After: trust, but verify
if (!Number.isFinite(count) || count <= 0) {
  return null;
}
```

In practice, `count` comes from database integer aggregates — NaN would require corruption. But defense-in-depth means guarding even the unlikely doors.

**Lesson:** `NaN` isn't less than zero. Always verify finitude before comparing magnitude.

---

### HT-021: The Unresponsive Toggle
**Severity:** Medium
**Hunter:** Pyrrhaxis the Red
**Weapon:** Conditional short-circuit

An exhausted tag button — pool drained, badge at zero — refused to stop playback when tapped. The user could start the final track, but couldn't tap the button to stop it. The toggle was broken.

The `BoardButton` component calculated `isInteractive` from three conditions: not disabled, not empty, not exhausted. But "exhausted" and "playing" aren't mutually exclusive. The final track plays while the pool shows zero.

The fix: a single boolean adjustment.

```typescript
// Before: blocked ALL presses when exhausted
const isInteractive = !isDisabled && !isExhausted && !isEmpty;

// After: allows stop action when playing
const isInteractive = !isDisabled && !isEmpty && (!isExhausted || isPlaying);
```

**Lesson:** Stop and play have different preconditions. Never let a restriction on starting block the ability to stop.

---

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
| Pyrrhaxis | 9 | 0 | 4 | 5 | 0 |
| Seraphelle | 5 | 0 | 3 | 0 | 2 |
| Kazzrath | 3 | 1 | 2 | 0 | 0 |
| Vaelthrix | 2 | 0 | 2 | 0 | 0 |
| Chatterwind | 1 | 0 | 1 | 0 | 0 |
| Wrixle | 1 | 0 | 1 | 0 | 0 |
| Tarnoth | 1 | 0 | 1 | 0 | 0 |
| Full Council | 1 | 0 | 1 | 0 | 0 |

---

*More trophies to come.*
