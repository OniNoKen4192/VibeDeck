# Bug Hunt Trophies

> *"Every bug has a name. Every kill, a lesson."*
> — Pyrrhaxis the Red

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
| Pyrrhaxis | 4 | 0 | 2 | 2 | 0 |

---

*More trophies to come.*
