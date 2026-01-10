/**
 * @file expo-saf-uri-permission/src/index.ts
 * @description TypeScript wrapper for the SAF URI Permission native module.
 *
 * Provides functions to persist and manage content:// URI permissions so that
 * audio files remain accessible after app restart.
 */

import { NativeModule, requireNativeModule } from 'expo-modules-core';

interface ExpoSAFUriPermissionModule extends NativeModule {
  takePersistablePermission(uri: string): Promise<boolean>;
  releasePersistablePermission(uri: string): Promise<void>;
  hasPermission(uri: string): Promise<boolean>;
  listPersistedPermissions(): Promise<string[]>;
}

const ExpoSAFUriPermission =
  requireNativeModule<ExpoSAFUriPermissionModule>('ExpoSAFUriPermission');

/**
 * Takes persistent read permission for a content:// URI.
 * Call immediately after receiving a URI from document picker.
 *
 * @param uri - The content:// URI from document picker
 * @returns true if permission was granted, false if not applicable (e.g., file:// URI)
 * @throws Error if permission request fails (e.g., URI doesn't support persistence)
 *
 * @example
 * ```typescript
 * const result = await DocumentPicker.getDocumentAsync({ ... });
 * if (!result.canceled) {
 *   for (const asset of result.assets) {
 *     await takePersistablePermission(asset.uri);
 *   }
 * }
 * ```
 */
export async function takePersistablePermission(uri: string): Promise<boolean> {
  return ExpoSAFUriPermission.takePersistablePermission(uri);
}

/**
 * Releases a previously persisted URI permission.
 * Call when a track is deleted from the library to avoid hitting the 512 URI limit.
 *
 * @param uri - The content:// URI to release
 *
 * @remarks
 * This function silently succeeds even if the permission wasn't held.
 * Safe to call on any URI without checking first.
 */
export async function releasePersistablePermission(uri: string): Promise<void> {
  return ExpoSAFUriPermission.releasePersistablePermission(uri);
}

/**
 * Checks if the app has persistent permission for a URI.
 * Use for diagnostics or pre-playback validation.
 *
 * @param uri - The content:// URI to check
 * @returns true if permission is held
 */
export async function hasPermission(uri: string): Promise<boolean> {
  return ExpoSAFUriPermission.hasPermission(uri);
}

/**
 * Lists all URIs for which the app holds persistent permissions.
 * Useful for debugging and cleanup.
 *
 * @returns Array of URI strings
 *
 * @remarks
 * Android allows up to 512 persisted URIs per app (128 on older devices).
 * Call this to monitor usage if importing many tracks.
 */
export async function listPersistedPermissions(): Promise<string[]> {
  return ExpoSAFUriPermission.listPersistedPermissions();
}
