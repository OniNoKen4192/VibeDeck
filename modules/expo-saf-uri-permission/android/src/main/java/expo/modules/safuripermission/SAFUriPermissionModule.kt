/**
 * @file SAFUriPermissionModule.kt
 * @description Native Expo module for managing persistent URI permissions via Android's Storage Access Framework.
 *
 * This module enables VibeDeck to maintain read access to content:// URIs (from document picker)
 * across app restarts. Without persistent permissions, URIs become inaccessible after the app
 * process is terminated.
 *
 * @see https://developer.android.com/training/data-storage/shared/documents-files
 */
package expo.modules.safuripermission

import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SAFUriPermissionModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoSAFUriPermission")

        /**
         * Takes persistent read permission for a content:// URI.
         * Call immediately after receiving a URI from document picker.
         *
         * @param uriString - The content:// URI from document picker
         * @return true if permission was granted, false if not applicable (e.g., file:// URI)
         * @throws SecurityException if permission request fails
         */
        AsyncFunction("takePersistablePermission") { uriString: String ->
            val uri = Uri.parse(uriString)

            // Only content:// URIs support persistent permissions
            if (uri.scheme != "content") {
                return@AsyncFunction false
            }

            val context = appContext.reactContext
                ?: throw Exception("React context is null")

            val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
            context.contentResolver.takePersistableUriPermission(uri, takeFlags)
            return@AsyncFunction true
        }

        /**
         * Releases a previously persisted URI permission.
         * Call when a track is deleted from the library to avoid hitting the 512 URI limit.
         *
         * @param uriString - The content:// URI to release
         */
        AsyncFunction("releasePersistablePermission") { uriString: String ->
            try {
                val uri = Uri.parse(uriString)
                val context = appContext.reactContext ?: return@AsyncFunction

                val releaseFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                context.contentResolver.releasePersistableUriPermission(uri, releaseFlags)
            } catch (_: Exception) {
                // Ignore errors on release - URI may already be released or never persisted
            }
        }

        /**
         * Checks if the app has persistent permission for a URI.
         * Use for diagnostics or pre-playback validation.
         *
         * @param uriString - The content:// URI to check
         * @return true if permission is held
         */
        AsyncFunction("hasPermission") { uriString: String ->
            try {
                val uri = Uri.parse(uriString)
                val context = appContext.reactContext
                    ?: return@AsyncFunction false

                val persistedUris = context.contentResolver.persistedUriPermissions
                return@AsyncFunction persistedUris.any {
                    it.uri == uri && it.isReadPermission
                }
            } catch (_: Exception) {
                return@AsyncFunction false
            }
        }

        /**
         * Lists all URIs for which the app holds persistent permissions.
         * Useful for debugging and cleanup.
         *
         * @return Array of URI strings
         */
        AsyncFunction("listPersistedPermissions") {
            try {
                val context = appContext.reactContext
                    ?: return@AsyncFunction emptyList<String>()

                val persistedUris = context.contentResolver.persistedUriPermissions
                return@AsyncFunction persistedUris
                    .filter { it.isReadPermission }
                    .map { it.uri.toString() }
            } catch (_: Exception) {
                return@AsyncFunction emptyList<String>()
            }
        }
    }
}
