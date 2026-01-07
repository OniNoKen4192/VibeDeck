/**
 * @file services/index.ts
 * @description Service layer exports for import, tag pool, and player services.
 */

// Track import service
export {
  // Main import functions
  pickAndImportTracks,
  importFromPath,
  // Validation utilities
  validateFilePath,
  extractFileName,
  getFileExtension,
  isSupportedFormat,
  getSupportedFormats,
  // Metadata utilities
  extractMetadata,
  parseMetadataFromFileName,
  getDisplayTitle,
  getDisplaySubtitle,
  // Types
  type ImportResult,
  type BatchImportResult,
  type ImportProgressCallback,
  type AudioMetadata,
} from './import';

// Tag pool selection service
export {
  selectTrackForTag,
  getUnplayedCountForTag,
  resetPoolForTag,
  resetAllPools,
  tagHasTracks,
  getTagCounts,
  type SelectionResult,
} from './tagPool';

// Player service
export {
  // Initialization
  initializePlayer,
  destroyPlayer,
  isReady,
  // Playback control
  playTrack,
  pause,
  resume,
  stop,
  seekTo,
  setVolume,
  applyVolume,
  // State queries
  getPosition,
  getState,
  getCurrentTrack,
  // Event registration
  registerPlaybackStateCallback,
  registerPlaybackErrorCallback,
  // Re-exports from react-native-track-player
  Event as PlayerEvent,
  State as PlayerState,
  // Types
  type PlaybackError,
  type PlaybackErrorCode,
  type PlaybackResult,
  type PlaybackStateCallback,
  type PlaybackErrorCallback,
} from './player';
