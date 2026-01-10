# SAF Persistent URI Permissions Module

> Architecture Document — Vaelthrix the Astral, 2026-01-09

---

## Problem Statement

VibeDeck imports audio files via Android's document picker (`expo-document-picker`), which returns `content://` URIs. These URIs work immediately but have temporary permissions that expire when the app restarts.

**Observed Behavior:** Tracks play successfully after import but fail with "An error occurred during playback" after app restart.

**Root Cause:** Android grants temporary read permissions to `content://` URIs from the document picker. These permissions are scoped to the app session and do not persist across process restarts.

**Reference:** [HT-018 Bug Report](../council/qa/QA_REPORT_HT_ROUND6.md)

---

## Solution Overview

Implement a small native Expo module that calls `ContentResolver.takePersistableUriPermission()` on imported URIs. This is the standard Android pattern for long-term file access via the Storage Access Framework (SAF).

### Why Not Copy Files?

| Approach | Pros | Cons |
|----------|------|------|
| Copy to app storage | Simple, reliable | Doubles storage if user doesn't delete originals |
| Persistent URI permissions | No storage duplication, follows Google guidance | Requires native module |

Given user feedback about storage concerns, persistent URI permissions is the correct architectural choice.

### Why a Custom Module?

`expo-document-picker` uses the correct intent (`ACTION_OPEN_DOCUMENT`) but:

1. Does not add `FLAG_GRANT_PERSISTABLE_URI_PERMISSION` to the intent
2. Does not call `takePersistableUriPermission()` after receiving the URI

Rather than forking the Expo package, we add a small companion module that takes the persistent permission after the picker returns.

---

## Module Design

### Module Name

`expo-saf-uri-permission` (local module in `modules/` directory)

### API Surface

```typescript
// TypeScript interface
declare module 'expo-saf-uri-permission' {
  /**
   * Takes persistent read permission for a content:// URI.
   * Call immediately after receiving a URI from document picker.
   *
   * @param uri - The content:// URI from document picker
   * @returns Promise<boolean> - true if permission was granted, false if not applicable
   * @throws Error if permission request fails (e.g., URI doesn't support persistence)
   */
  export function takePersistablePermission(uri: string): Promise<boolean>;

  /**
   * Releases a previously persisted URI permission.
   * Call when a track is deleted from the library.
   *
   * @param uri - The content:// URI to release
   * @returns Promise<void>
   */
  export function releasePersistablePermission(uri: string): Promise<void>;

  /**
   * Checks if the app has persistent permission for a URI.
   * Use for diagnostics or pre-playback validation.
   *
   * @param uri - The content:// URI to check
   * @returns Promise<boolean> - true if permission is held
   */
  export function hasPermission(uri: string): Promise<boolean>;

  /**
   * Lists all URIs for which the app holds persistent permissions.
   * Useful for debugging and cleanup.
   *
   * @returns Promise<string[]> - Array of URI strings
   */
  export function listPersistedPermissions(): Promise<string[]>;
}
```

### Kotlin Implementation

```kotlin
// modules/expo-saf-uri-permission/android/src/main/java/expo/modules/safuripermission/
package expo.modules.safuripermission

import android.content.Context
import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class SAFUriPermissionModule : Module() {
    private val context: Context
        get() = appContext.reactContext ?: throw Exception("React context is null")

    override fun definition() = ModuleDefinition {
        Name("ExpoSAFUriPermission")

        AsyncFunction("takePersistablePermission") { uriString: String, promise: Promise ->
            try {
                val uri = Uri.parse(uriString)

                // Only content:// URIs support persistent permissions
                if (uri.scheme != "content") {
                    promise.resolve(false)
                    return@AsyncFunction
                }

                val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                context.contentResolver.takePersistableUriPermission(uri, takeFlags)
                promise.resolve(true)
            } catch (e: SecurityException) {
                // URI doesn't support persistent permissions or permission denied
                promise.reject("PERMISSION_DENIED", "Cannot persist permission for URI: ${e.message}", e)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }

        AsyncFunction("releasePersistablePermission") { uriString: String, promise: Promise ->
            try {
                val uri = Uri.parse(uriString)
                val releaseFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                context.contentResolver.releasePersistableUriPermission(uri, releaseFlags)
                promise.resolve(null)
            } catch (e: Exception) {
                // Ignore errors on release - URI may already be released
                promise.resolve(null)
            }
        }

        AsyncFunction("hasPermission") { uriString: String, promise: Promise ->
            try {
                val uri = Uri.parse(uriString)
                val persistedUris = context.contentResolver.persistedUriPermissions
                val hasPermission = persistedUris.any {
                    it.uri == uri && it.isReadPermission
                }
                promise.resolve(hasPermission)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }

        AsyncFunction("listPersistedPermissions") { promise: Promise ->
            try {
                val persistedUris = context.contentResolver.persistedUriPermissions
                val uriStrings = persistedUris
                    .filter { it.isReadPermission }
                    .map { it.uri.toString() }
                promise.resolve(uriStrings)
            } catch (e: Exception) {
                promise.resolve(emptyList<String>())
            }
        }
    }
}
```

---

## File Structure

```
VibeDeck/
├── modules/
│   └── expo-saf-uri-permission/
│       ├── android/
│       │   ├── build.gradle
│       │   └── src/main/java/expo/modules/safuripermission/
│       │       └── SAFUriPermissionModule.kt
│       ├── src/
│       │   └── index.ts              # TypeScript wrapper
│       ├── expo-module.config.json   # Expo module config
│       └── package.json
├── src/
│   └── services/
│       └── import/
│           └── index.ts              # Modified to use new module
```

---

## Integration Points

### 1. Import Service (`src/services/import/index.ts`)

Modify `pickAndImportTracks()` to take persistent permission after receiving URIs:

```typescript
import { takePersistablePermission } from '../../modules/expo-saf-uri-permission';

export async function pickAndImportTracks(
  addTrack: (track: Omit<Track, 'id' | 'played' | 'createdAt' | 'updatedAt'>) => Promise<Track>,
  onProgress?: ImportProgressCallback
): Promise<BatchImportResult> {
  // ... existing picker code ...

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = file.uri;

    // NEW: Take persistent permission for this URI
    try {
      await takePersistablePermission(filePath);
    } catch (err) {
      // Log but don't fail - some URIs may not support persistence
      console.warn(`Could not persist permission for ${filePath}:`, err);
    }

    // ... rest of import logic ...
  }
}
```

### 2. Track Deletion (`src/stores/useTrackStore.ts`)

Release permission when track is deleted to avoid hitting the 512 URI limit:

```typescript
import { releasePersistablePermission } from '../../modules/expo-saf-uri-permission';

deleteTrack: async (id) => {
  const track = get().tracks.find(t => t.id === id);

  await trackQueries.deleteTrack(id);
  set((state) => ({
    tracks: state.tracks.filter((t) => t.id !== id),
  }));

  // Release persistent permission
  if (track?.filePath) {
    try {
      await releasePersistablePermission(track.filePath);
    } catch (err) {
      // Ignore - permission may not have been persisted
    }
  }

  // Cross-store refresh (HT-019 fix)
  useTagStore.getState().loadTags();
  useButtonStore.getState().loadButtons();
},
```

### 3. Player Service (Optional Enhancement)

Add pre-playback permission check for better error messages:

```typescript
import { hasPermission } from '../../modules/expo-saf-uri-permission';

export async function playTrack(track: Track): Promise<void> {
  // Check if we still have permission
  if (track.filePath.startsWith('content://')) {
    const canAccess = await hasPermission(track.filePath);
    if (!canAccess) {
      throw new PlayerError(
        'file_permission_lost',
        'Permission to access this file has been lost. Please re-import the track.'
      );
    }
  }

  // ... rest of playback logic ...
}
```

---

## Expo Module Configuration

### `modules/expo-saf-uri-permission/expo-module.config.json`

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.safuripermission.SAFUriPermissionModule"]
  }
}
```

### `modules/expo-saf-uri-permission/package.json`

```json
{
  "name": "expo-saf-uri-permission",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "private": true
}
```

### `modules/expo-saf-uri-permission/android/build.gradle`

```gradle
apply plugin: 'com.android.library'
apply plugin: 'org.jetbrains.kotlin.android'
apply plugin: 'expo-module-gradle-plugin'

group = 'expo.modules.safuripermission'
version = '1.0.0'

android {
    namespace "expo.modules.safuripermission"
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
    }
}

dependencies {
    implementation project(':expo-modules-core')
}
```

---

## Error Handling

### Expected Failures

| Scenario | Behavior |
|----------|----------|
| `file://` URI passed | Returns `false` (no-op, not a content URI) |
| URI doesn't support persistence | Throws `PERMISSION_DENIED`, import continues |
| URI already released | `releasePersistablePermission` succeeds silently |
| 512 URI limit reached | Throws on `takePersistablePermission`, import fails |

### User-Facing Error Messages

| Error Code | Message |
|------------|---------|
| `PERMISSION_DENIED` | "Could not save access to this file. It may not support offline playback." |
| `file_permission_lost` | "Permission to access this file has been lost. Please re-import the track." |

---

## Testing Plan

### Manual Testing

1. **Fresh Import** — Import tracks, verify playback works
2. **App Restart** — Force-stop app, relaunch, verify tracks still play
3. **Device Reboot** — Reboot device, verify tracks still play
4. **Delete Track** — Delete track, verify no permission leak (check with `listPersistedPermissions`)
5. **Re-import Same Track** — Import previously imported track, verify no duplicate permissions

### Edge Cases

- Import from Downloads folder
- Import from Google Drive (if installed)
- Import from SD card (if present)
- Import 100+ tracks (verify performance)

---

## Android Version Considerations

| Android Version | API Level | Notes |
|-----------------|-----------|-------|
| 7.0 Nougat | 24 | Minimum supported, SAF fully functional |
| 10 Q | 29 | Scoped storage introduced, SAF is primary method |
| 11 R | 30 | Stricter scoped storage, SAF required for external files |
| 13 | 33 | Photo picker introduced (not relevant for audio) |
| 15 | 35 | Target SDK, no SAF changes |

The SAF `takePersistableUriPermission` API has been stable since API 19 (Android 4.4). Our minimum SDK 24 is well within the supported range.

---

## URI Limit Considerations

Android allows up to 512 persisted URI permissions per app (128 on older devices). For VibeDeck's expected 20-50 tracks, this is not a concern.

However, we should:
1. Release permissions when tracks are deleted
2. Consider a cleanup routine that releases permissions for URIs no longer in the database

---

## Migration Path

### Existing Users

Users who imported tracks before this fix will have non-persisted URIs. Options:

1. **Silent re-permission** — On app launch, iterate stored URIs and attempt `takePersistablePermission`. May fail if original picker session expired.

2. **Prompt re-import** — Detect tracks with expired permissions (playback fails), prompt user to re-import affected tracks.

3. **Accept one-time breakage** — Document in release notes that users may need to re-import tracks after update.

**Recommendation:** Option 2 — Detect and prompt. This provides the best UX without silent failures.

---

## References

- [Android Docs: Access documents and other files](https://developer.android.com/training/data-storage/shared/documents-files)
- [Storage Access Framework Guide](https://developer.android.com/guide/topics/providers/document-provider)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [HT-018 Bug Report](../council/qa/QA_REPORT_HT_ROUND6.md)
- [Expert Guidance](../council/questions/Standard%20Pattern%20for%20Persistent%20File%20Access%20with%20Android's%20Document%20Picker.md)

---

*Approved by: [Pending Project Lead approval]*
