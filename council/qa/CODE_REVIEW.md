# [VibeDeck] Code Review — Bahamut the Platinum

**Review Date:** 2026-01-07
**Reviewer:** Bahamut the Platinum (Arbiter)
**Scope:** All TypeScript/TSX code in `src/`
**Verdict:** **NOT PRODUCTION READY** — Critical issues must be resolved before human testing

---

## Executive Summary

The Council has built elegant architecture with comprehensive documentation. However, the implementation lacks hardening for edge cases, database safety, and performance at scale. This review identified **65 distinct issues** requiring attention before release.

**Recommendation:** Pyrrhaxis must complete remediation before Kazzrath's QA pass or Seraphelle's UI work continues.

---

## Critical Severity (8 Issues)

> These issues can cause data corruption, crashes, or security vulnerabilities.

### CR-01: No Database Transactions in Multi-Step Operations

**Location:** [src/db/queries/trackTags.ts:123-137](../src/db/queries/trackTags.ts#L123-L137)

**Issue:** `setTagsForTrack()` DELETEs all associations, then INSERTs new ones in a loop without a transaction wrapper.

```typescript
// DANGEROUS: No transaction
await db.runAsync('DELETE FROM track_tags WHERE track_id = ?', [trackId]);
for (const tagId of tagIds) {
  await db.runAsync('INSERT INTO track_tags ...', [...]);
}
```

**Impact:** If app crashes between DELETE and INSERT, track-tag associations are permanently orphaned.

**Also affects:**
- [src/db/queries/buttons.ts:152-162](../src/db/queries/buttons.ts#L152-L162) — `reorderButtons()`

**Fix:** Wrap in `db.withTransactionAsync()` or equivalent.

---

### CR-02: N+1 Query Problem in resolveAllButtons

**Location:** [src/stores/useButtonStore.ts:198-200](../src/stores/useButtonStore.ts#L198-L200)

**Issue:** Each button triggers separate database queries via `resolveButton()`.

```typescript
resolveAllButtons: async () => {
  const { buttons, resolveButton } = get();
  return Promise.all(buttons.map(resolveButton)); // N queries!
}
```

**Impact:** 100 buttons = 100+ database queries. App freezes on button board load.

**Fix:** Create a single JOIN query that fetches all button data with related track/tag info.

---

### CR-03: UUID Generation Uses Math.random()

**Location:** [src/utils/uuid.ts:8-10](../src/utils/uuid.ts#L8-L10)

**Issue:** Non-cryptographic RNG for UUID generation.

```typescript
const r = (Math.random() * 16) | 0; // Not secure
```

**Impact:** Increased collision probability with large libraries (hundreds of tracks).

**Fix:** Use `expo-crypto` or `crypto.getRandomValues()`.

---

### CR-04: Memory Leak in Player Event Listeners

**Location:** [src/services/player/index.ts:420-443](../src/services/player/index.ts#L420-L443)

**Issue:** Event listeners registered but never removed.

```typescript
// Registered in registerEventListeners()
TrackPlayer.addEventListener(Event.PlaybackState, ...);
TrackPlayer.addEventListener(Event.PlaybackQueueEnded, ...);
TrackPlayer.addEventListener(Event.PlaybackError, ...);

// destroyPlayer() does NOT remove these listeners
```

**Impact:** Memory leak on app restart/hot reload. Potential duplicate event handling.

**Fix:** Store listener subscriptions and call `remove()` in `destroyPlayer()`.

---

### CR-05: Tag Store Full Reload on Every Association Change

**Location:** [src/stores/useTagStore.ts:126-141](../src/stores/useTagStore.ts#L126-L141)

**Issue:** Every `addTagToTrack()` or `removeTagFromTrack()` triggers full `loadTags()`.

```typescript
addTagToTrack: async (trackId, tagId) => {
  await trackTagQueries.addTagToTrack(trackId, tagId);
  await get().loadTags(); // FULL DATABASE RELOAD
}
```

**Impact:** Tagging 50 tracks = 50 full database reloads with JOIN aggregation.

**Fix:** Increment/decrement counts in memory; only reload on error.

---

### CR-06: Volume Persistence Fails Silently

**Location:** [src/stores/usePlayerStore.ts:85-88](../src/stores/usePlayerStore.ts#L85-L88)

**Issue:** `setVolume` updates state then persists, but persistence errors are unhandled.

```typescript
set({ volume: clamped });
await settingsQueries.setSetting(VOLUME_KEY, clamped.toString());
// No try-catch, no error handling
```

**Impact:** User adjusts volume, thinks it saved, but next launch reverts to default.

**Fix:** Wrap in try-catch; consider optimistic update with rollback.

---

### CR-07: SQL Field Interpolation Pattern

**Location:** [src/db/queries/tracks.ts:129](../src/db/queries/tracks.ts#L129)

**Issue:** Dynamic field names joined directly into SQL.

```typescript
await db.runAsync(`UPDATE tracks SET ${fields.join(', ')} WHERE id = ?`, values);
```

**Impact:** While currently safe (fields are hardcoded), pattern invites injection if ever user-controlled.

**Fix:** Use allowlist validation for field names.

---

### CR-08: Button Position Race Condition

**Location:** [src/stores/useButtonStore.ts:83](../src/stores/useButtonStore.ts#L83)

**Issue:** `getNextPosition()` and `insertButton()` are not atomic.

```typescript
const position = await buttonQueries.getNextPosition();
// Race window: another button could get same position
await buttonQueries.insertTagButton({ ...button, position });
```

**Impact:** Two simultaneous button additions get same position.

**Fix:** Use `INSERT ... SELECT MAX(position)+1` or mutex lock.

---

## High Severity (15 Issues)

> These issues cause incorrect behavior, poor UX, or potential security concerns.

### CR-09: Path Traversal Defense Incomplete

**Location:** [src/services/import/validation.ts:50](../src/services/import/validation.ts#L50)

**Issue:** Checks for `..` but not Windows-style `\..` or proper sandbox boundary validation.

```typescript
if (filePath.includes('..') || filePath.includes('//')) {
  return { isValid: false, error: 'Invalid file path format' };
}
```

**Fix:** Normalize path, resolve absolute, verify within allowed directories.

---

### CR-10: Player State Desync with System Controls

**Location:** [src/stores/usePlayerStore.ts](../src/stores/usePlayerStore.ts) + [src/services/player/index.ts](../src/services/player/index.ts)

**Issue:** Multiple sources of truth for playback state. If user stops via Android notification, store doesn't update.

**Impact:** UI shows "playing" but audio has stopped.

**Fix:** Player service must push ALL state changes to store via callbacks.

---

### CR-11: No Seek Position Bounds Checking

**Location:** [src/services/player/index.ts:312-320](../src/services/player/index.ts#L312-L320)

**Issue:** `seekTo()` accepts any position without validating against track duration.

**Fix:** Clamp to `[0, currentTrack.durationMs]`.

---

### CR-12: Exhausted Buttons Still Accept Press

**Location:** [src/components/BoardButton.tsx:47-49](../src/components/BoardButton.tsx#L47-L49)

**Issue:** Exhausted state is visual only. Press handler still fires.

**Fix:** Add `isExhausted` to disabled check; return early from `onPress`.

---

### CR-13: Track Duration Zero Treated as Null

**Location:** Multiple files

**Issue:** Inconsistent handling of `durationMs === 0` vs `durationMs === null`.

```typescript
// services/player/index.ts:236
duration: track.durationMs ? track.durationMs / 1000 : undefined,
// 0 is falsy, so treated as "no duration"
```

**Fix:** Use `track.durationMs ?? 0` or explicit null checks.

---

### CR-14: No Input Validation on Tag Names

**Location:** [src/stores/useTagStore.ts:84](../src/stores/useTagStore.ts#L84)

**Issue:** Empty strings, whitespace-only, or extremely long tag names accepted.

**Fix:** Validate `name.trim().length > 0 && name.length <= 100`.

---

### CR-15: Toast Timer Race Condition

**Location:** [src/components/Toast.tsx:77-82](../src/components/Toast.tsx#L77-L82)

**Issue:** Rapid visibility toggles can leave orphaned timers.

**Fix:** Use `useRef` to track active timer ID; clear before setting new.

---

### CR-16: VolumeSlider Division by Zero

**Location:** [src/components/VolumeSlider.tsx:44-50](../src/components/VolumeSlider.tsx#L44-L50)

**Issue:** `sliderWidth` may be 0 on first render.

```typescript
const percentage = Math.max(0, Math.min(1, position / sliderWidth));
// If sliderWidth is 0, this is NaN
```

**Fix:** Guard with `if (sliderWidth === 0) return`.

---

### CR-17: CountBadge Doesn't Handle NaN/Infinity

**Location:** [src/components/CountBadge.tsx:54-56](../src/components/CountBadge.tsx#L54-L56)

**Fix:** Add `Number.isFinite(count)` check.

---

### CR-18: VolumeSlider No Debouncing

**Location:** [src/components/VolumeSlider.tsx:44-69](../src/components/VolumeSlider.tsx#L44-L69)

**Issue:** Every touch pixel triggers `onValueChange`. Fast drag = 60+ updates/second.

**Fix:** Debounce to 16ms intervals.

---

### CR-19: Unicode Filename Parsing

**Location:** [src/services/import/metadata.ts:86](../src/services/import/metadata.ts#L86)

**Issue:** Regex assumes ASCII. Filename "首曲 - Artist.mp3" won't parse correctly.

**Fix:** Use Unicode-aware regex or alternative parsing strategy.

---

### CR-20: getDatabase() Throws Without Boundary

**Location:** All files in [src/db/queries/](../src/db/queries/)

**Issue:** Every query calls `getDatabase()` which throws if not initialized. No try-catch.

**Fix:** Add error boundary or initialization check in query functions.

---

### CR-44: Optimistic Count Updates Assume Tracks Are Unplayed

**Location:** [src/stores/useTagStore.ts:165-191](../src/stores/useTagStore.ts#L165-L191)

**Issue:** The `addTagToTrack` and `removeTagFromTrack` methods increment/decrement both `trackCount` and `unplayedCount` by the same delta:

```typescript
set((state) => ({
  tags: adjustTagCount(state.tags, tagId, 1, 1),  // Both deltas are 1
}));
```

**Impact:** If a tag is added to an already-played track, `unplayedCount` should not increase. The current code causes badge counts to be incorrect until a full reload. Tag buttons may show wrong "available tracks" counts, confusing users about which buttons are exhausted.

**Fix:** Query the track's played status before optimistic update:

```typescript
const track = await trackQueries.getTrackById(trackId);
const unplayedDelta = track && !track.played ? 1 : 0;
set((state) => ({
  tags: adjustTagCount(state.tags, tagId, 1, unplayedDelta),
}));
```

---

### CR-45: insertButtonAtomic Returns 0 on Failure (Silent Error)

**Location:** [src/db/queries/buttons.ts:138](../src/db/queries/buttons.ts#L138)

**Issue:** The function returns `result?.position ?? 0` when the SELECT query fails to find the inserted button:

```typescript
return result?.position ?? 0;
```

**Impact:** Position 0 is a valid value, so callers cannot distinguish between success and failure. Multiple buttons could be assigned position 0, causing overlap or broken UI state.

**Fix:** Throw an error instead of returning a fallback:

```typescript
if (!result || result.position === null) {
  throw new Error('Failed to retrieve assigned position for button');
}
return result.position;
```

---

### CR-46: Seek Position Clamping Uses Infinity When Duration Unknown

**Location:** [src/services/player/index.ts:338](../src/services/player/index.ts#L338)

**Issue:** When `durationMs` is null, the max position becomes `Infinity`:

```typescript
const maxPos = currentTrackRef?.durationMs ?? Infinity;
const clampedMs = Math.max(minPos, Math.min(maxPos, positionMs));
```

**Impact:** Since `durationMs` is set to `null` during import (per metadata.ts:56), tracks may have unknown duration during playback transitions. This allows seeks to arbitrarily large positions, causing undefined TrackPlayer behavior.

**Fix:** Return early or use 0 as fallback when duration is unknown:

```typescript
if (!currentTrackRef || !currentTrackRef.durationMs) {
  console.warn('Cannot seek: no track loaded or duration unknown');
  return;
}
```

---

## Medium Severity (15 Issues)

| ID | Location | Issue | Fix |
|----|----------|-------|-----|
| CR-21 | colors.ts:60-64 | Only yellow gets contrast check | Validate all tag colors for WCAG AA |
| CR-22 | player + store | Volume clamping duplicated | Single source of truth |
| CR-23 | ButtonBoard.tsx:96 | Using array index as React key | Use button.id |
| CR-24 | BoardButton.tsx:125 | Typecast for accessibilityRole | Remove unnecessary cast |
| CR-25 | NowPlaying.tsx:60-77 | Animation cleanup edge case | Verify stop() always called |
| CR-26 | import/index.ts:124-126 | Silent picker cancellation | Provide user feedback |
| CR-27 | import/index.ts:197-202 | Technical errors shown to user | Map to friendly messages |
| CR-28 | import/validation.ts:66-76 | FS info not cached | Cache per import session |
| CR-29 | tagPool/index.ts:67-98 | No auto-reset option | Consider UX for exhausted pools |
| CR-30 | All stores | No request deduplication | Track in-flight requests |
| CR-31 | player/index.ts:20 | Global module state | Refactor to class or factory |
| CR-32 | init.ts:48 | PRAGMA version interpolated | Use parameterized query |
| CR-33 | Track queries | No pagination | Add limit/offset for large libraries |
| CR-34 | Schema | No migration path | Add version upgrade logic |
| CR-35 | All stores | No optimistic updates | Update state before DB, rollback on error |

---

## Low Severity (8 Issues)

| ID | Location | Issue |
|----|----------|-------|
| CR-36 | time.ts:10 | Duration 0 returns "0:00" (may be intentional) |
| CR-37 | useTrackStore | Immer mutation patterns mixed with spreads |
| CR-38 | player/index.ts:174-180 | No retry logic for missing files |
| CR-39 | Toast.tsx:84 | useEffect deps incomplete |
| CR-40 | All stores | No loading states exposed |
| CR-41 | useButtonStore | resolveButton caches nothing |
| CR-42 | Circular imports | Stores → Services clean, but fragile |
| CR-43 | Error messages | No i18n preparation |

---

## Missing Edge Cases

| Scenario | Current Behavior | Expected |
|----------|------------------|----------|
| Import 1000 tracks at once | UI freezes, possible OOM | Progress indicator, chunked processing |
| Track file deleted after import | `file_not_found` error, no recovery | Offer re-import or removal |
| Volume slider rapid drag | 60+ state updates/second | Debounced to 16ms |
| Two buttons added simultaneously | Position collision | Atomic position increment |
| Tag name is empty string | Saved to database | Validation error |
| Unicode filename "首曲 - Artist.mp3" | Metadata parsing fails | Proper Unicode handling |
| User has 10,000 tracks | `getAllTracks()` loads all into memory | Pagination/virtualization |
| App crashes during tag assignment | Orphaned data | Transaction rollback |
| Player stopped via Android notification | Store still shows "playing" | Event sync |
| Duration is exactly 0ms | Treated as "no duration" | Valid edge case |
| Database not initialized when query runs | Unhandled throw | Graceful error |
| Player destroyed while track playing | Undefined behavior | Clean shutdown |

---

## Architectural Concerns

### No Automated Tests
Zero test files in codebase. Critical paths (playback, tag pools, import) completely untested.

### No Schema Migrations
`SCHEMA_VERSION = 1` with no upgrade path. Future schema changes will brick existing databases.

### Global State in Player Service
Module-level variables (`isPlayerInitialized`, `currentTrackRef`) make testing impossible and create singleton coupling.

### No Pagination Strategy
`getAllTracks()` loads entire library into memory. Will crash on large collections.

---

## Remediation Priority

### Phase 1: Critical (Before Any Testing)
1. CR-01: Add database transactions
2. CR-02: Fix N+1 queries in resolveAllButtons
3. CR-04: Fix player memory leak
4. CR-05: Optimize tag store updates
5. CR-08: Fix button position race condition

### Phase 2: High (Before Beta)
6. CR-09: Complete path traversal defense
7. CR-10: Fix player state desync
8. CR-12: Disable exhausted button presses
9. CR-14: Add input validation

### Phase 3: Medium (Before Release)
10. Remaining CR-21 through CR-35

### Phase 4: Polish
11. Low severity items
12. Edge case handling
13. Test coverage

---

## Sign-Off

This document shall be reviewed by **Vaelthrix the Astral** for architectural guidance on remediation approach.

Once Phase 1 is complete, **Kazzrath the Blue** may proceed with QA pass.

*— Bahamut the Platinum, Arbiter of the Council*
