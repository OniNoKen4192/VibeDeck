/**
 * @file services/import/index.ts
 * @description Track import service for picking, validating, and importing audio files.
 */

import * as DocumentPicker from 'expo-document-picker';
import { validateFilePath, getSupportedFormats } from './validation';
import { extractMetadata, AudioMetadata } from './metadata';
import type { Track } from '../../types';

// Re-export utilities for external use
export {
  validateFilePath,
  extractFileName,
  getFileExtension,
  isSupportedFormat,
  getSupportedFormats,
} from './validation';
export {
  extractMetadata,
  parseMetadataFromFileName,
  getDisplayTitle,
  getDisplaySubtitle,
} from './metadata';
export type { AudioMetadata } from './metadata';

/**
 * Result of a single track import attempt
 *
 * @remarks For UI: Check `success` to determine outcome.
 * On success, `track` contains the imported track for display.
 * On failure, `error` contains a user-friendly message.
 */
export interface ImportResult {
  /** Whether the import succeeded */
  success: boolean;
  /** The imported track (only present on success) */
  track?: Track;
  /** The original file path that was imported */
  filePath: string;
  /** Error message (only present on failure) */
  error?: string;
}

/**
 * Result of a batch import operation
 *
 * @remarks For UI (Seraphelle): Show summary after batch import completes.
 * - "Imported X of Y tracks"
 * - List failures with their error messages if any
 */
export interface BatchImportResult {
  /** Total number of files attempted */
  total: number;
  /** Number of successful imports */
  succeeded: number;
  /** Number of failed imports */
  failed: number;
  /** Individual results for each file */
  results: ImportResult[];
}

/**
 * Callback for tracking batch import progress
 *
 * @param current - Current file index (1-based)
 * @param total - Total number of files
 * @param fileName - Name of file currently being processed
 *
 * @remarks For UI (Seraphelle): Use to update a progress indicator.
 * @example
 * ```typescript
 * const onProgress = (current, total, fileName) => {
 *   setProgress(`Importing ${current}/${total}: ${fileName}`);
 * };
 * ```
 */
export type ImportProgressCallback = (current: number, total: number, fileName: string) => void;

/**
 * Opens document picker and imports selected audio files.
 * This is the main entry point for file import.
 *
 * @param addTrack - Function to add track to store (from useTrackStore)
 * @param onProgress - Optional callback for progress updates
 * @returns Batch result with all import outcomes
 *
 * @remarks For UI (Seraphelle): Wire this to your "Import Files" button.
 * Pass `useTrackStore.getState().addTrack` as the first argument.
 *
 * @example
 * ```typescript
 * // In your import button handler:
 * const handleImport = async () => {
 *   setImporting(true);
 *   const result = await pickAndImportTracks(
 *     useTrackStore.getState().addTrack,
 *     (current, total, name) => setProgress({ current, total, name })
 *   );
 *   setImporting(false);
 *
 *   if (result.failed > 0) {
 *     showToast(`${result.failed} files failed to import`);
 *   }
 *   if (result.succeeded > 0) {
 *     showToast(`Imported ${result.succeeded} tracks`);
 *   }
 * };
 * ```
 */
export async function pickAndImportTracks(
  addTrack: (track: Omit<Track, 'id' | 'played' | 'createdAt' | 'updatedAt'>) => Promise<Track>,
  onProgress?: ImportProgressCallback
): Promise<BatchImportResult> {
  // Build MIME types from supported formats
  const mimeTypes = getSupportedFormats().map(formatToMimeType);

  const result = await DocumentPicker.getDocumentAsync({
    type: mimeTypes,
    multiple: true,
    copyToCacheDirectory: false, // Reference in place, don't copy
  });

  // User cancelled
  if (result.canceled) {
    return { total: 0, succeeded: 0, failed: 0, results: [] };
  }

  const files = result.assets;
  const results: ImportResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = file.uri;

    if (onProgress) {
      onProgress(i + 1, files.length, file.name || 'Unknown');
    }

    const importResult = await importFromPath(filePath, addTrack);
    results.push(importResult);
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

/**
 * Imports a single track from a file path.
 * Use this when you already have a path (e.g., from a folder scan).
 *
 * @param filePath - The file path or content URI to import
 * @param addTrack - Function to add track to store
 * @returns Import result with success/failure status
 *
 * @remarks For UI: Use this for programmatic imports where you
 * already have file paths (e.g., scanning a folder).
 */
export async function importFromPath(
  filePath: string,
  addTrack: (track: Omit<Track, 'id' | 'played' | 'createdAt' | 'updatedAt'>) => Promise<Track>
): Promise<ImportResult> {
  // Validate the file
  const validation = await validateFilePath(filePath);
  if (!validation.isValid) {
    return {
      success: false,
      filePath,
      error: validation.error,
    };
  }

  // Extract metadata
  const metadata = await extractMetadata(filePath);

  // Add to library
  try {
    const track = await addTrack({
      filePath,
      fileName: metadata.fileName,
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      genre: metadata.genre,
      durationMs: metadata.durationMs,
    });

    return {
      success: true,
      track,
      filePath,
    };
  } catch (err) {
    return {
      success: false,
      filePath,
      error: err instanceof Error ? err.message : 'Failed to add track to library',
    };
  }
}

/**
 * Maps file extension to MIME type for document picker
 */
function formatToMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
  };
  return mimeMap[ext] || 'audio/*';
}
