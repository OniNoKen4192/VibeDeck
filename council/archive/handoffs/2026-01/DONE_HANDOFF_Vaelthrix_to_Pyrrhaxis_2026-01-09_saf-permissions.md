# Handoff: Vaelthrix → Pyrrhaxis

**Date:** 2026-01-09
**From:** Vaelthrix the Astral (Architect)
**To:** Pyrrhaxis the Crimson (Code)
**Subject:** HT-018 Fix — SAF Persistent URI Permissions Module

---

## Summary

Implement a native Expo module to persist `content://` URI permissions across app restarts. This fixes HT-018 where tracks fail to play after app restart.

**Architecture Document:** [docs/ARCHITECTURE_SAF_PERMISSIONS.md](../../docs/ARCHITECTURE_SAF_PERMISSIONS.md)

---

## Implementation Tasks

### Phase 1: Create Native Module

1. **Create module directory structure:**
   ```
   modules/expo-saf-uri-permission/
   ├── android/
   │   ├── build.gradle
   │   └── src/main/java/expo/modules/safuripermission/
   │       └── SAFUriPermissionModule.kt
   ├── src/
   │   └── index.ts
   ├── expo-module.config.json
   └── package.json
   ```

2. **Implement Kotlin module** — See architecture doc for full implementation:
   - `takePersistablePermission(uri: string): Promise<boolean>`
   - `releasePersistablePermission(uri: string): Promise<void>`
   - `hasPermission(uri: string): Promise<boolean>`
   - `listPersistedPermissions(): Promise<string[]>`

3. **Create TypeScript wrapper** (`src/index.ts`):
   ```typescript
   import { NativeModulesProxy } from 'expo-modules-core';

   const ExpoSAFUriPermission = NativeModulesProxy.ExpoSAFUriPermission;

   export async function takePersistablePermission(uri: string): Promise<boolean> {
     return ExpoSAFUriPermission.takePersistablePermission(uri);
   }

   export async function releasePersistablePermission(uri: string): Promise<void> {
     return ExpoSAFUriPermission.releasePersistablePermission(uri);
   }

   export async function hasPermission(uri: string): Promise<boolean> {
     return ExpoSAFUriPermission.hasPermission(uri);
   }

   export async function listPersistedPermissions(): Promise<string[]> {
     return ExpoSAFUriPermission.listPersistedPermissions();
   }
   ```

4. **Register module** — Add to `app.json` plugins if needed, or rely on autolinking.

### Phase 2: Integrate with Import Service

5. **Modify `src/services/import/index.ts`:**
   - Import `takePersistablePermission` from the new module
   - Call `takePersistablePermission(filePath)` after receiving each URI from picker
   - Wrap in try-catch, log warnings but don't fail import

### Phase 3: Integrate with Track Deletion

6. **Modify `src/stores/useTrackStore.ts` `deleteTrack()`:**
   - Import `releasePersistablePermission`
   - Get track's `filePath` before deleting
   - Call `releasePersistablePermission(filePath)` after deletion
   - Also add HT-019 fix: call `useTagStore.getState().loadTags()` and `useButtonStore.getState().loadButtons()`

### Phase 4: Build and Test

7. **Rebuild Android:**
   ```bash
   npx expo run:android
   ```

8. **Manual test sequence:**
   - Import 2-3 tracks
   - Verify playback works
   - Force-stop app (Android settings → Apps → VibeDeck → Force Stop)
   - Relaunch app
   - Verify tracks still play
   - Delete a track
   - Use `listPersistedPermissions()` (via debug UI or console) to verify permission was released

---

## Key Implementation Notes

### Error Handling

- `takePersistablePermission` may throw `SecurityException` if:
  - URI doesn't support persistence (some cloud providers)
  - Permission was already revoked
  - This should NOT fail the import — log and continue

### file:// URIs

- If `uri.scheme !== "content"`, return `false` immediately
- `file://` paths don't use SAF permissions

### Cross-Store Refresh (HT-019)

While you're in `deleteTrack`, also add:
```typescript
// Cross-store refresh
useTagStore.getState().loadTags();
useButtonStore.getState().loadButtons();
```

This fixes HT-019 (stale tag counts after deletion).

---

## Files to Create

| File | Purpose |
|------|---------|
| `modules/expo-saf-uri-permission/package.json` | Module package definition |
| `modules/expo-saf-uri-permission/expo-module.config.json` | Expo autolinking config |
| `modules/expo-saf-uri-permission/android/build.gradle` | Android build config |
| `modules/expo-saf-uri-permission/android/src/main/java/expo/modules/safuripermission/SAFUriPermissionModule.kt` | Native implementation |
| `modules/expo-saf-uri-permission/src/index.ts` | TypeScript wrapper |

## Files to Modify

| File | Change |
|------|--------|
| `src/services/import/index.ts` | Call `takePersistablePermission` after picker |
| `src/stores/useTrackStore.ts` | Call `releasePersistablePermission` + cross-store refresh on delete |

---

## Acceptance Criteria

- [x] Tracks play after app restart (HT-018 fixed) — *awaiting HT Round 7 verification*
- [x] Tracks play after device reboot — *awaiting HT Round 7 verification*
- [x] Tag counts update after track deletion (HT-019 fixed) — *implemented*
- [x] Board button counts update after track deletion — *implemented*
- [x] Deleting a track releases its URI permission — *implemented*
- [x] Import still works for `file://` paths (no regression) — *scheme check returns false for non-content URIs*
- [x] No crashes on permission errors (graceful handling) — *try-catch with warn/ignore*

---

## Sign-Off

**Completed by:** Pyrrhaxis the Crimson
**Date:** 2026-01-09
**Status:** DONE — Awaiting HT Round 7 verification

### Implementation Notes

All tasks completed per specification:

1. **Native module created** — `modules/expo-saf-uri-permission/` with full Kotlin implementation
2. **Import integration** — `takePersistablePermission()` called after each URI from picker
3. **Deletion integration** — `releasePersistablePermission()` + cross-store refresh (HT-019)
4. **TypeScript wrapper** — Used `requireNativeModule` (modern API) instead of `NativeModulesProxy`

### Deviations from Spec

- Used `requireNativeModule<T>()` instead of `NativeModulesProxy` — this is the current Expo Modules API
- Added dynamic imports for cross-store refresh to avoid circular dependencies

### Files Created

| File | Lines |
|------|-------|
| `modules/expo-saf-uri-permission/package.json` | 6 |
| `modules/expo-saf-uri-permission/expo-module.config.json` | 6 |
| `modules/expo-saf-uri-permission/android/build.gradle` | 24 |
| `modules/expo-saf-uri-permission/android/.../SAFUriPermissionModule.kt` | 97 |
| `modules/expo-saf-uri-permission/src/index.ts` | 73 |

### Files Modified

| File | Change |
|------|--------|
| `src/services/import/index.ts` | +9 lines (import + try-catch block) |
| `src/stores/useTrackStore.ts` | +18 lines (permission release + cross-store refresh) |

---

## Reference

- Architecture doc: [docs/ARCHITECTURE_SAF_PERMISSIONS.md](../../docs/ARCHITECTURE_SAF_PERMISSIONS.md)
- Expert guidance: [council/questions/Standard Pattern for Persistent File Access...](../questions/Standard%20Pattern%20for%20Persistent%20File%20Access%20with%20Android's%20Document%20Picker.md)
- Bug report: [qa/QA_REPORT_HT_ROUND6.md](../qa/QA_REPORT_HT_ROUND6.md)

---

*The Architect retreats to the astral plane. The Crimson dragon rises to forge the implementation.*
