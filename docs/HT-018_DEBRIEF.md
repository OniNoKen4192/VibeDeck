# HT-018 Debrief: Android Content URI Permission Persistence

> Post-implementation analysis — Vaelthrix the Astral, 2026-01-09

---

## The Problem

**Symptom:** Tracks that played successfully after import failed with "An error occurred during playback" after app restart.

**User Impact:** Every time the app was restarted, users would need to delete and re-import all their tracks — a dealbreaker for a game-day audio tool.

**Root Cause:** Android's document picker (`ACTION_OPEN_DOCUMENT`) returns `content://` URIs with temporary read permissions. These permissions are scoped to the app session and expire when the app process dies.

---

## Discovery Timeline

| Date | Event |
|------|-------|
| 2026-01-05 | Import service implemented using `expo-document-picker` |
| 2026-01-08 | HT-014 fixed content:// URI validation issues |
| 2026-01-09 | HT Round 6 discovered playback fails after restart (HT-018) |
| 2026-01-09 | External consultation confirmed SAF persistent permissions pattern |
| 2026-01-09 | Native module implemented, HT-018 resolved |

---

## Decision Tree

### Initial Options Considered

```
HT-018: Content URI Permissions Expire
│
├─► Option 1: Copy files to app storage on import
│   ├─ Pros: Reliable, simple implementation
│   ├─ Cons: Doubles storage if user doesn't delete originals
│   └─ Status: REJECTED (user concern about storage)
│
├─► Option 2: Request persistent URI permissions (takePersistableUriPermission)
│   ├─ Pros: No file duplication, follows Google guidance
│   ├─ Cons: Requires native module, initially thought to be unreliable
│   └─ Status: SELECTED after expert consultation
│
├─► Option 3: Hybrid (try permissions, fallback to copy)
│   ├─ Pros: Best of both when it works
│   ├─ Cons: Complex failure detection, confusing error states
│   └─ Status: REJECTED (over-engineered for MVP)
│
└─► Option 4: Accept limitation, document workaround
    ├─ Pros: No code changes
    ├─ Cons: Unacceptable UX for target users
    └─ Status: REJECTED
```

### Key Decision Point

Initial architectural recommendation was Option 1 (copy files) due to concerns about:
- Inconsistent vendor behavior with persistent permissions
- Complexity of native Android code

**Project Lead raised concern:** Storage duplication is problematic for users who don't clean up Downloads.

**External consultation sought:** Asked Android developers for standard patterns.

### Expert Guidance Received

The consultation revealed a critical misunderstanding:

| What We Thought | What Was Actually True |
|-----------------|------------------------|
| `expo-document-picker` uses `ACTION_GET_CONTENT` | It actually uses `ACTION_OPEN_DOCUMENT` |
| Persistent permissions are unreliable | They're the official Google-recommended pattern |
| Would require complex native Android code | Only needs ~50 lines of Kotlin |

**Key insight:** Expo's picker uses the correct intent but doesn't:
1. Add `FLAG_GRANT_PERSISTABLE_URI_PERMISSION` to the intent
2. Call `takePersistableUriPermission()` after receiving URIs

The fix was to add a companion module that takes the persistent permission after the picker returns.

---

## Solution Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Import Flow                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  expo-document-picker          expo-saf-uri-permission          │
│  ┌─────────────────┐           ┌─────────────────────┐          │
│  │ ACTION_OPEN_    │           │ takePersistable     │          │
│  │ DOCUMENT        │──URI────► │ UriPermission()     │          │
│  │                 │           │                     │          │
│  │ Returns         │           │ Persists read       │          │
│  │ content:// URI  │           │ permission to       │          │
│  │ with temp       │           │ ContentResolver     │          │
│  │ permission      │           │                     │          │
│  └─────────────────┘           └─────────────────────┘          │
│                                          │                       │
│                                          ▼                       │
│                               ┌─────────────────────┐           │
│                               │ Permission survives │           │
│                               │ app restart &       │           │
│                               │ device reboot       │           │
│                               └─────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Module API

```typescript
// Take persistent read permission for a content:// URI
takePersistablePermission(uri: string): Promise<boolean>

// Release permission when track is deleted (avoid 512 URI limit)
releasePersistablePermission(uri: string): Promise<void>

// Check if permission is held (diagnostics)
hasPermission(uri: string): Promise<boolean>

// List all persisted URIs (debugging/cleanup)
listPersistedPermissions(): Promise<string[]>
```

### Integration Points

1. **Import Service** — Call `takePersistablePermission()` immediately after receiving URI from picker
2. **Track Deletion** — Call `releasePersistablePermission()` to avoid hitting 512 URI limit
3. **Player Service** — (Optional) Pre-flight permission check for better error messages

---

## Lessons Learned

### 1. Android Storage is Complex

Android's storage model has evolved significantly:
- Pre-Android 10: Direct file paths worked
- Android 10+: Scoped storage requires SAF for external files
- The "simple" approach (copy files) has hidden UX costs

### 2. Expo Abstractions Have Limits

`expo-document-picker` provides a good abstraction but doesn't expose all native capabilities. For platform-specific features like persistent permissions, a custom native module may be necessary.

### 3. External Expertise is Valuable

The initial architectural recommendation (copy files) was wrong. External consultation from Android developers corrected course before implementation began.

### 4. Storage Concerns Are User Concerns

The project lead's pushback on storage duplication was correct. Users shouldn't have to manage duplicate files — the app should handle this transparently.

---

## Android Version Compatibility

| Android Version | API | SAF Behavior |
|-----------------|-----|--------------|
| 7.0 Nougat | 24 | Full SAF support, persistent permissions work |
| 10 Q | 29 | Scoped storage introduced, SAF is primary method |
| 11 R | 30 | Stricter scoped storage, SAF required |
| 13 | 33 | Photo picker added (not relevant for audio) |
| 15 | 35 | No SAF changes, target SDK |

The `takePersistableUriPermission()` API has been stable since API 19. Our minimum SDK 24 is well within support.

---

## URI Limit Considerations

Android allows up to **512 persisted URI permissions** per app (128 on older devices).

For VibeDeck's expected 20-50 tracks, this is not a concern. However:
- We release permissions on track deletion
- A future cleanup routine could release orphaned permissions

---

## Files Created/Modified

### Created
- `modules/expo-saf-uri-permission/` — Native Expo module
- `docs/ARCHITECTURE_SAF_PERMISSIONS.md` — Technical specification
- `docs/HT-018_DEBRIEF.md` — This document

### Modified
- `src/services/import/index.ts` — Added `takePersistablePermission()` call
- `src/stores/useTrackStore.ts` — Added `releasePersistablePermission()` + cross-store refresh

---

## Related Issues

| Issue | Relationship |
|-------|--------------|
| HT-014 | Content URI validation — precursor issue |
| HT-019 | Cross-store refresh — bundled fix in `deleteTrack()` |
| HT-020 | Empty tag button UX — unrelated, still pending |

---

## References

- [Android Docs: Access documents and other files](https://developer.android.com/training/data-storage/shared/documents-files)
- [Storage Access Framework Guide](https://developer.android.com/guide/topics/providers/document-provider)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Expert Guidance](../council/questions/Standard%20Pattern%20for%20Persistent%20File%20Access%20with%20Android's%20Document%20Picker.md)

---

## Code Patterns

*Implementation notes — Pyrrhaxis the Red, 2026-01-09*

### Pattern 1: Expo Module with Kotlin DSL

The Expo Modules API uses a Kotlin DSL that's cleaner than the old Java-based approach. Key elements:

```kotlin
class SAFUriPermissionModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoSAFUriPermission")  // Must match JS import

        AsyncFunction("takePersistablePermission") { uriString: String ->
            // Return type inferred from lambda
            val uri = Uri.parse(uriString)
            if (uri.scheme != "content") {
                return@AsyncFunction false  // file:// URIs don't need persistence
            }
            context.contentResolver.takePersistableUriPermission(
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION
            )
            return@AsyncFunction true
        }
    }
}
```

**Gotcha:** The module name in `Name("...")` must exactly match what you use in `requireNativeModule<T>("...")` on the TypeScript side.

### Pattern 2: Graceful Failure on Permission APIs

Permission operations can fail for many reasons (URI doesn't support persistence, permission already released, etc.). The pattern is to catch and continue:

```typescript
// In import service — don't fail the import if permission can't be persisted
try {
  await takePersistablePermission(filePath);
} catch (err) {
  console.warn(`Could not persist permission for ${filePath}:`, err);
  // Continue with import — some URIs (cloud, SD card) may not support persistence
}
```

```typescript
// In deleteTrack — ignore release failures
try {
  await releasePersistablePermission(track.filePath);
} catch {
  // Ignore — permission may not have been persisted or already released
}
```

**Principle:** Permission APIs are "best effort" — the app should work even if they fail.

### Pattern 3: Cross-Store Refresh with Dynamic Imports

Zustand stores can call each other, but circular imports are a risk. Use dynamic imports inside the action:

```typescript
deleteTrack: async (id) => {
  // ... delete logic ...

  // Cross-store refresh — dynamic import avoids circular dependency
  const { useTagStore } = await import('./useTagStore');
  const { useButtonStore } = await import('./useButtonStore');
  useTagStore.getState().loadTags();
  useButtonStore.getState().loadButtons();
}
```

**Why not top-level imports?** If `useTrackStore` imports `useTagStore` at the top, and `useTagStore` imports `useTrackStore`, you get a circular dependency. Dynamic imports defer resolution to runtime.

### Pattern 4: Content URI Scheme Detection

Always check the URI scheme before calling SAF APIs:

```kotlin
if (uri.scheme != "content") {
    return@AsyncFunction false  // No-op for file:// paths
}
```

This ensures the module works transparently with both:
- `content://...` URIs from document picker (needs persistence)
- `file://...` paths from direct file access (no SAF involved)

### Pattern 5: Module Directory Structure

Expo local modules follow a specific structure for autolinking:

```
modules/
└── expo-saf-uri-permission/
    ├── android/
    │   ├── build.gradle              # Android build config
    │   └── src/main/java/expo/modules/safuripermission/
    │       └── SAFUriPermissionModule.kt
    ├── src/
    │   └── index.ts                  # TypeScript API
    ├── expo-module.config.json       # Tells Expo where to find the module
    └── package.json                  # Module metadata (main: src/index.ts)
```

**Key file:** `expo-module.config.json` tells Expo's autolinking which Kotlin class to register:

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.safuripermission.SAFUriPermissionModule"]
  }
}
```

### Pattern 6: SDK Version Inheritance

Don't hardcode SDK versions in module `build.gradle`. Inherit from the root project:

```gradle
android {
    compileSdkVersion safeExtGet("compileSdkVersion", 34)
    defaultConfig {
        minSdkVersion safeExtGet("minSdkVersion", 24)
        targetSdkVersion safeExtGet("targetSdkVersion", 34)
    }
}

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}
```

This ensures your module stays in sync with the app's SDK configuration.

### Gotchas & Debugging Tips

1. **"Module not found" after adding module:** Run `npx expo run:android` to rebuild. The module won't appear until the native code is recompiled.

2. **Permission not persisting:** Check that `expo-document-picker` is using `ACTION_OPEN_DOCUMENT` (it does by default). `ACTION_GET_CONTENT` doesn't support persistent permissions.

3. **512 URI limit:** Call `listPersistedPermissions()` during development to monitor usage. Release permissions when tracks are deleted.

4. **Testing persistence:** Force-stop the app via Android Settings, not just backgrounding. Background apps may retain memory and appear to work.

---

*The stars align. A problem understood is a problem solved.*
