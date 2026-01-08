/**
 * @file services/import/validation.ts
 * @description File validation utilities for track import including safety checks.
 */

import { File } from 'expo-file-system';
import { Audio } from '../../constants/audio';

/** Maximum allowed path length to prevent memory/UI issues */
const MAX_PATH_LENGTH = 1024;

/**
 * Result of file validation
 *
 * @remarks For UI: Use `isValid` to enable/disable import confirmation.
 * If invalid, display `error` message to user.
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a file path before import.
 * Checks existence, extension, path safety, and length.
 *
 * @param filePath - The file path or content URI to validate
 * @returns ValidationResult indicating if the file can be imported
 *
 * @remarks For UI (Seraphelle): Call this before showing import confirmation.
 * Display `error` in a toast or inline message if validation fails.
 *
 * @example
 * ```typescript
 * const result = await validateFilePath(selectedFile);
 * if (!result.isValid) {
 *   showToast(result.error);
 *   return;
 * }
 * // Proceed with import
 * ```
 */
export async function validateFilePath(filePath: string): Promise<ValidationResult> {
  // Check path length
  if (filePath.length > MAX_PATH_LENGTH) {
    return { isValid: false, error: 'File path is too long' };
  }

  // Check for path traversal attempts (security)
  // Strip URI scheme before checking to allow content:// URIs from Android document picker
  const pathWithoutScheme = filePath.replace(/^[a-z]+:\/\//i, '');
  if (pathWithoutScheme.includes('..') || pathWithoutScheme.includes('//')) {
    return { isValid: false, error: 'Invalid file path format' };
  }

  // Validate file extension against allowed formats
  const ext = getFileExtension(filePath);
  if (!ext || !Audio.supportedFormats.includes(ext)) {
    const supported = Audio.supportedFormats.join(', ');
    return {
      isValid: false,
      error: `Unsupported audio format. Supported: ${supported}`,
    };
  }

  // Check file existence
  // Note: For content URIs, expo-file-system File class handles them transparently
  try {
    const file = new File(filePath);
    if (!file.exists) {
      return { isValid: false, error: 'File not found' };
    }
    // File class .exists returns false for directories, so no separate check needed
  } catch {
    return { isValid: false, error: 'Unable to access file' };
  }

  return { isValid: true };
}

/**
 * Extracts lowercase file extension from a path or URI
 *
 * @param filePath - File path or content URI
 * @returns Extension with dot (e.g., '.mp3') or null if none found
 */
export function getFileExtension(filePath: string): string | null {
  // Handle content URIs which may have display names
  // For standard paths, just get extension
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filePath.length - 1) {
    return null;
  }

  // Extract extension, handle query params in URIs
  let ext = filePath.slice(lastDot).toLowerCase();
  const queryIndex = ext.indexOf('?');
  if (queryIndex !== -1) {
    ext = ext.slice(0, queryIndex);
  }

  return ext;
}

/**
 * Extracts filename from a path or URI
 *
 * @param filePath - File path or content URI
 * @returns The filename portion of the path
 *
 * @remarks For UI: Use this to display a human-readable name
 * in the import preview before user confirms.
 */
export function extractFileName(filePath: string): string {
  // Decode URI-encoded characters first (content:// URIs from Android picker)
  let decoded: string;
  try {
    decoded = decodeURIComponent(filePath);
  } catch {
    // If decoding fails (malformed URI), use as-is
    decoded = filePath;
  }

  // Handle both forward and back slashes
  const segments = decoded.split(/[/\\]/);
  const fileName = segments[segments.length - 1] || 'Unknown';

  // Remove query params if present (content URIs)
  const queryIndex = fileName.indexOf('?');
  if (queryIndex !== -1) {
    return fileName.slice(0, queryIndex);
  }

  return fileName;
}

/**
 * Checks if a file extension is supported for import
 *
 * @param ext - Extension with dot (e.g., '.mp3')
 * @returns true if the format is supported
 *
 * @remarks For UI: Use this to filter file picker results
 * or gray out unsupported files in a list view.
 */
export function isSupportedFormat(ext: string): boolean {
  return Audio.supportedFormats.includes(ext.toLowerCase());
}

/**
 * Gets the list of supported audio formats
 *
 * @returns Array of extensions with dots (e.g., ['.mp3', '.wav'])
 *
 * @remarks For UI: Display this in help text or file picker filters.
 */
export function getSupportedFormats(): string[] {
  return [...Audio.supportedFormats];
}
