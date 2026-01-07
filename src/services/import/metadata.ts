/**
 * @file services/import/metadata.ts
 * @description Audio file metadata extraction and filename parsing utilities.
 */

import { extractFileName, getFileExtension } from './validation';

/**
 * Extracted metadata from an audio file
 *
 * @remarks For UI (Seraphelle): All fields except fileName may be null.
 * Display null title as fileName without extension for better UX.
 */
export interface AudioMetadata {
  /** Original filename including extension */
  fileName: string;
  /** ID3 title tag, or null if not present */
  title: string | null;
  /** ID3 artist tag, or null if not present */
  artist: string | null;
  /** ID3 album tag, or null if not present */
  album: string | null;
  /** ID3 genre tag, or null if not present */
  genre: string | null;
  /** Duration in milliseconds, or null if unable to determine */
  durationMs: number | null;
}

/**
 * Extracts metadata from an audio file.
 *
 * @param filePath - Path to the audio file
 * @returns Extracted metadata with fallbacks for missing fields
 *
 * @remarks
 * Currently uses filename-based extraction as a baseline.
 * react-native-track-player doesn't expose ID3 reading directly.
 *
 * Future enhancement: Use a native module like react-native-audio-metadata
 * or expo-av's getStatusAsync for duration. For now, duration is fetched
 * when the track is first loaded for playback.
 *
 * For UI (Seraphelle): Consider allowing users to manually edit metadata
 * after import since auto-extraction is limited.
 */
export async function extractMetadata(filePath: string): Promise<AudioMetadata> {
  const fileName = extractFileName(filePath);
  const parsedFromName = parseMetadataFromFileName(fileName);

  return {
    fileName,
    title: parsedFromName.title,
    artist: parsedFromName.artist,
    album: null, // Not extractable from filename
    genre: null, // Not extractable from filename
    durationMs: null, // Set when track is loaded for playback
  };
}

/**
 * Parses title and artist from common filename patterns.
 *
 * Supports patterns:
 * - "Artist - Title.mp3"
 * - "Title.mp3" (no artist)
 * - "01 - Title.mp3" (track number prefix)
 * - "01. Title.mp3" (numbered track)
 *
 * @param fileName - The filename to parse
 * @returns Parsed title and artist (artist may be null)
 *
 * @remarks For UI: Display returned title as primary text, artist as secondary.
 * If title equals fileName (no parsing succeeded), consider showing
 * just the filename without extension.
 */
export function parseMetadataFromFileName(fileName: string): {
  title: string | null;
  artist: string | null;
} {
  // Remove extension
  const ext = getFileExtension(fileName);
  let name = ext ? fileName.slice(0, -ext.length) : fileName;

  // Remove common track number prefixes
  // Matches: "01 - ", "01. ", "1 - ", "01-", "1.", etc.
  name = name.replace(/^\d{1,3}[\s.\-_]*/, '').trim();

  // Try "Artist - Title" pattern
  const dashIndex = name.indexOf(' - ');
  if (dashIndex !== -1) {
    const artist = name.slice(0, dashIndex).trim();
    const title = name.slice(dashIndex + 3).trim();
    if (artist && title) {
      return { title, artist };
    }
  }

  // No pattern matched, use cleaned name as title
  return {
    title: name || null,
    artist: null,
  };
}

/**
 * Generates a display title for a track.
 * Falls back through title -> parsed filename -> raw filename.
 *
 * @param track - Object with optional title and fileName
 * @returns A displayable title string, never empty
 *
 * @remarks For UI (Seraphelle): Use this helper in track list items
 * and now-playing display to ensure you always have something to show.
 *
 * @example
 * ```typescript
 * // In a TrackListItem component:
 * <Text style={styles.title}>{getDisplayTitle(track)}</Text>
 * ```
 */
export function getDisplayTitle(track: { title: string | null; fileName: string }): string {
  if (track.title) {
    return track.title;
  }

  // Parse from filename
  const parsed = parseMetadataFromFileName(track.fileName);
  if (parsed.title) {
    return parsed.title;
  }

  // Last resort: filename without extension
  const ext = getFileExtension(track.fileName);
  return ext ? track.fileName.slice(0, -ext.length) : track.fileName;
}

/**
 * Generates a display subtitle (artist/album) for a track.
 *
 * @param track - Object with optional artist and album
 * @returns Combined artist/album string, or null if neither present
 *
 * @remarks For UI (Seraphelle): Use as secondary text in track lists.
 * If null, you may hide the subtitle line or show "Unknown Artist".
 *
 * @example
 * ```typescript
 * const subtitle = getDisplaySubtitle(track);
 * {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
 * ```
 */
export function getDisplaySubtitle(track: {
  artist: string | null;
  album: string | null;
}): string | null {
  if (track.artist && track.album) {
    return `${track.artist} • ${track.album}`;
  }
  return track.artist || track.album || null;
}
